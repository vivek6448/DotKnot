alter table public.products
  add column is_featured boolean not null default false;

insert into public.settings (key, value)
values (
  'home_hero',
  '{"title": "DotKnot", "subtitle": "Everyday apparel — t-shirts, shirts, hoodies, sweatshirts, and more.", "images": []}'
)
on conflict (key) do nothing;
