import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

export default {
  // Public and unauthenticated on purpose: these are promotional codes meant
  // to be advertised (promo popup, checkout "available offers"), unlike
  // arbitrary coupon lookups which stay admin-scoped in apply-coupon.
  fetch: withSupabase({ auth: "none" }, async (_req, ctx) => {
    const { data: coupons, error } = await ctx.supabaseAdmin
      .from("coupons")
      .select("code, discount_type, discount_value, min_order_value, expires_at, description")
      .eq("active", true)
      .order("code");

    if (error) {
      return Response.json({ message: error.message }, { status: 500 });
    }

    const now = new Date();
    const active = (coupons ?? []).filter(
      (coupon) => !coupon.expires_at || new Date(coupon.expires_at) > now,
    );

    return Response.json({ coupons: active });
  }),
};
