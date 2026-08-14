-- Atomic stock decrement, called from the razorpay-webhook Edge Function
-- after a payment is captured. Floors at 0 rather than going negative.

create function public.decrement_variant_stock(p_variant_id uuid, p_quantity integer)
returns void
language sql
as $$
  update public.product_variants
  set stock_qty = greatest(stock_qty - p_quantity, 0)
  where id = p_variant_id;
$$;
