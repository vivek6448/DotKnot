insert into public.settings (key, value)
values ('announcement', '{"text": "Shipping across India — free processing in 2–5 business days"}')
on conflict (key) do nothing;
