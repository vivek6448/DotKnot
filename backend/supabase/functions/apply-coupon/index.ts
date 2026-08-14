import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

interface ApplyCouponBody {
  code: string;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const userId = ctx.userClaims!.id;
    const { code } = (await req.json()) as ApplyCouponBody;

    if (!code) {
      return Response.json({ message: "code is required" }, { status: 400 });
    }

    // coupons has no public RLS read policy — only this admin-scoped lookup
    // can see codes, so a client can't fish for valid codes.
    const { data: coupon } = await ctx.supabaseAdmin
      .from("coupons")
      .select("code, discount_type, discount_value, min_order_value, expires_at, active")
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (!coupon || !coupon.active) {
      return Response.json({ message: "Invalid coupon" }, { status: 404 });
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return Response.json({ message: "Coupon has expired" }, { status: 400 });
    }

    const { data: cart } = await ctx.supabase
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!cart) {
      return Response.json({ message: "Cart is empty" }, { status: 400 });
    }

    const { data: items } = await ctx.supabase
      .from("cart_items")
      .select("quantity, product_variants(price)")
      .eq("cart_id", cart.id);

    const subtotal = (items ?? []).reduce(
      (sum: number, item: any) => sum + (item.product_variants?.price ?? 0) * item.quantity,
      0,
    );

    if (subtotal === 0) {
      return Response.json({ message: "Cart is empty" }, { status: 400 });
    }

    if (coupon.min_order_value && subtotal < coupon.min_order_value) {
      return Response.json(
        { message: `Minimum order value is ₹${coupon.min_order_value}` },
        { status: 400 },
      );
    }

    let discountAmount =
      coupon.discount_type === "percent"
        ? Math.round((subtotal * coupon.discount_value) / 100)
        : coupon.discount_value;
    discountAmount = Math.min(discountAmount, subtotal);

    await ctx.supabase.from("carts").update({ coupon_code: coupon.code }).eq("id", cart.id);

    return Response.json({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discountAmount,
      subtotal,
    });
  }),
};
