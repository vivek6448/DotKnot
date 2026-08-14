import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

interface MergeGuestCartBody {
  guest_cart_id: string;
}

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const userId = ctx.userClaims!.id;
    const { guest_cart_id } = (await req.json()) as MergeGuestCartBody;

    if (!guest_cart_id) {
      return Response.json({ message: "guest_cart_id is required" }, { status: 400 });
    }

    // A guest cart has user_id = NULL, which the owner-only RLS policy on
    // `carts`/`cart_items` can never match — admin client is required here.
    const { data: guestItems } = await ctx.supabaseAdmin
      .from("cart_items")
      .select("variant_id, quantity")
      .eq("cart_id", guest_cart_id);

    if (!guestItems || guestItems.length === 0) {
      return Response.json({ message: "Nothing to merge" });
    }

    let { data: userCart } = await ctx.supabaseAdmin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (!userCart) {
      const { data: newCart } = await ctx.supabaseAdmin
        .from("carts")
        .insert({ user_id: userId })
        .select("id")
        .single();
      userCart = newCart;
    }

    if (!userCart) {
      return Response.json({ message: "Failed to prepare cart" }, { status: 500 });
    }

    for (const guestItem of guestItems) {
      const { data: existing } = await ctx.supabaseAdmin
        .from("cart_items")
        .select("id, quantity")
        .eq("cart_id", userCart.id)
        .eq("variant_id", guestItem.variant_id)
        .maybeSingle();

      if (existing) {
        await ctx.supabaseAdmin
          .from("cart_items")
          .update({ quantity: existing.quantity + guestItem.quantity })
          .eq("id", existing.id);
      } else {
        await ctx.supabaseAdmin.from("cart_items").insert({
          cart_id: userCart.id,
          variant_id: guestItem.variant_id,
          quantity: guestItem.quantity,
        });
      }
    }

    // Cascade deletes the guest's cart_items along with it.
    await ctx.supabaseAdmin.from("carts").delete().eq("id", guest_cart_id);

    return Response.json({ cart_id: userCart.id });
  }),
};
