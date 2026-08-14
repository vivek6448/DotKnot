-- Admins need to see and update orders across all customers, not just their
-- own. These are additional permissive policies alongside the existing
-- owner-only ones (Postgres ORs permissive policies for the same command).

create policy "Admins can view all orders" on public.orders
  for select using (public.is_admin());

create policy "Admins can update orders" on public.orders
  for update using (public.is_admin());

create policy "Admins can view all order items" on public.order_items
  for select using (public.is_admin());
