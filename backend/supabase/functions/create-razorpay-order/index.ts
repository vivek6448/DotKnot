import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

interface CheckoutBody {
  address_id: string;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const userId = ctx.userClaims!.id;
    const { address_id } = (await req.json()) as CheckoutBody;

    if (!address_id) {
      return Response.json({ message: "address_id is required" }, { status: 400 });
    }

    const { data: address } = await ctx.supabase
      .from("addresses")
      .select("id")
      .eq("id", address_id)
      .maybeSingle();

    if (!address) {
      return Response.json({ message: "Address not found" }, { status: 404 });
    }

    const { data: cart } = await ctx.supabase
      .from("carts")
      .select("id, coupon_code")
      .eq("user_id", userId)
      .maybeSingle();

    if (!cart) {
      return Response.json({ message: "Cart is empty" }, { status: 400 });
    }

    const { data: items } = await ctx.supabase
      .from("cart_items")
      .select("quantity, product_variants(id, sku, price, stock_qty, products(name))")
      .eq("cart_id", cart.id);

    if (!items || items.length === 0) {
      return Response.json({ message: "Cart is empty" }, { status: 400 });
    }

    for (const item of items) {
      const variant = item.product_variants;
      if (!variant || variant.stock_qty < item.quantity) {
        return Response.json(
          { message: `Insufficient stock for ${variant?.sku ?? "an item"}` },
          { status: 409 },
        );
      }
    }

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.product_variants.price * item.quantity,
      0,
    );

    // Coupons are never client-readable (see RLS on `coupons`) — re-validate
    // server-side against the code stashed on the cart by apply-coupon.
    let discount = 0;
    if (cart.coupon_code) {
      const { data: coupon } = await ctx.supabaseAdmin
        .from("coupons")
        .select("discount_type, discount_value, min_order_value, active, expires_at")
        .eq("code", cart.coupon_code)
        .maybeSingle();

      if (
        coupon &&
        coupon.active &&
        (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
        (!coupon.min_order_value || subtotal >= coupon.min_order_value)
      ) {
        discount =
          coupon.discount_type === "percent"
            ? Math.round((subtotal * coupon.discount_value) / 100)
            : coupon.discount_value;
        discount = Math.min(discount, subtotal);
      }
    }

    const { data: shippingSetting } = await ctx.supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "shipping_fee")
      .maybeSingle();

    const shippingFee = typeof shippingSetting?.value === "number" ? shippingSetting.value : 0;
    const total = subtotal - discount + shippingFee;

    const { data: order, error: orderError } = await ctx.supabase
      .from("orders")
      .insert({
        user_id: userId,
        address_id,
        subtotal,
        discount,
        shipping_fee: shippingFee,
        total,
        coupon_code: cart.coupon_code,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return Response.json({ message: "Failed to create order" }, { status: 500 });
    }

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      variant_id: item.product_variants.id,
      product_name_snapshot: item.product_variants.products?.name ?? "",
      variant_label_snapshot: item.product_variants.sku,
      unit_price: item.product_variants.price,
      quantity: item.quantity,
    }));

    await ctx.supabase.from("order_items").insert(orderItems);

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return Response.json({ message: "Razorpay is not configured" }, { status: 500 });
    }

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`,
      },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        currency: "INR",
        receipt: order.id,
      }),
    });

    if (!razorpayResponse.ok) {
      return Response.json({ message: "Failed to create Razorpay order" }, { status: 502 });
    }

    const razorpayOrder = await razorpayResponse.json();

    await ctx.supabaseAdmin
      .from("orders")
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order.id);

    await ctx.supabase.from("cart_items").delete().eq("cart_id", cart.id);

    return Response.json({
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      key_id: RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  }),
};
