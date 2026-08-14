insert into public.coupons (code, discount_type, discount_value, active)
values ('WELCOME10', 'percent', 10, true)
on conflict (code) do nothing;

insert into public.settings (key, value)
values (
  'promo_popup',
  '{"enabled": true, "title": "Get 10% off", "text": "Use code WELCOME10 at checkout for 10% off your first order."}'
)
on conflict (key) do nothing;
