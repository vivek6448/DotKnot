import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";

async function verifySignature(rawBody: string, signature: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const digest = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return timingSafeEqual(digest, signature);
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export default {
  // No user JWT here — Razorpay calls this directly. Trust is established by
  // the HMAC signature check below, not by Supabase auth.
  fetch: withSupabase({ auth: "none" }, async (req, ctx) => {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    if (!RAZORPAY_WEBHOOK_SECRET || !signature) {
      return Response.json({ message: "Missing signature" }, { status: 400 });
    }

    const valid = await verifySignature(rawBody, signature, RAZORPAY_WEBHOOK_SECRET);
    if (!valid) {
      return Response.json({ message: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const payment = event.payload?.payment?.entity;

    if (!payment) {
      return Response.json({ message: "Ignored: no payment entity" });
    }

    const { data: order } = await ctx.supabaseAdmin
      .from("orders")
      .select("id, status")
      .eq("razorpay_order_id", payment.order_id)
      .maybeSingle();

    if (!order) {
      return Response.json({ message: "Order not found" });
    }

    // Idempotency: Razorpay retries webhook delivery, don't reprocess.
    if (order.status === "paid" || order.status === "cancelled") {
      return Response.json({ message: "Already processed" });
    }

    if (event.event === "payment.captured") {
      await ctx.supabaseAdmin
        .from("orders")
        .update({ status: "paid", razorpay_payment_id: payment.id })
        .eq("id", order.id);

      await ctx.supabaseAdmin.from("payments").insert({
        order_id: order.id,
        provider: "razorpay",
        provider_payment_id: payment.id,
        amount: payment.amount / 100,
        status: "success",
        raw_webhook_payload: event,
      });

      const { data: orderItems } = await ctx.supabaseAdmin
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", order.id);

      for (const item of orderItems ?? []) {
        await ctx.supabaseAdmin.rpc("decrement_variant_stock", {
          p_variant_id: item.variant_id,
          p_quantity: item.quantity,
        });
      }
    } else if (event.event === "payment.failed") {
      await ctx.supabaseAdmin
        .from("orders")
        .update({ status: "cancelled", razorpay_payment_id: payment.id })
        .eq("id", order.id);

      await ctx.supabaseAdmin.from("payments").insert({
        order_id: order.id,
        provider: "razorpay",
        provider_payment_id: payment.id,
        amount: payment.amount / 100,
        status: "failed",
        raw_webhook_payload: event,
      });
    }

    return Response.json({ received: true });
  }),
};
