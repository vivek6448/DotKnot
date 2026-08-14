-- Placeholder catalog: 2 products per category, S/M/L/XL variants each, one
-- placeholder image per product. Swap for the real client catalog (photos,
-- prices, variant options) once it's ready — see Section 14 of the build plan.

create temporary table tmp_products (
  id uuid,
  slug text,
  name text,
  description text,
  base_price numeric,
  category_slug text
);

insert into tmp_products (id, slug, name, description, base_price, category_slug) values
  (gen_random_uuid(), 'classic-crew-tee', 'Classic Crew Tee', 'Soft 100% cotton crew-neck t-shirt in a relaxed everyday fit.', 599, 't-shirts'),
  (gen_random_uuid(), 'graphic-print-tee', 'Graphic Print Tee', 'Screen-printed graphic t-shirt, regular fit, breathable cotton.', 699, 't-shirts'),
  (gen_random_uuid(), 'oxford-casual-shirt', 'Oxford Casual Shirt', 'Button-down oxford shirt, smart-casual everyday wear.', 999, 'shirts'),
  (gen_random_uuid(), 'linen-summer-shirt', 'Linen Summer Shirt', 'Breathable linen-blend shirt, ideal for warm weather.', 1099, 'shirts'),
  (gen_random_uuid(), 'pullover-fleece-hoodie', 'Pullover Fleece Hoodie', 'Heavyweight fleece hoodie with a kangaroo pocket.', 1399, 'hoodies'),
  (gen_random_uuid(), 'zip-up-hoodie', 'Zip-Up Hoodie', 'Full-zip hoodie with ribbed cuffs and hem.', 1499, 'hoodies'),
  (gen_random_uuid(), 'crewneck-sweatshirt', 'Crewneck Sweatshirt', 'Classic crewneck sweatshirt with a brushed fleece interior.', 1199, 'sweatshirts'),
  (gen_random_uuid(), 'embroidered-sweatshirt', 'Embroidered Sweatshirt', 'Sweatshirt with an embroidered chest logo.', 1299, 'sweatshirts'),
  (gen_random_uuid(), 'jogger-pants', 'Jogger Pants', 'Tapered joggers with an elastic waistband and cuffs.', 999, 'lower'),
  (gen_random_uuid(), 'cargo-pants', 'Cargo Pants', 'Utility cargo pants with multiple pockets.', 1199, 'lower');

insert into public.products (id, slug, name, description, base_price, status, processing_days)
select id, slug, name, description, base_price, 'active', 4
from tmp_products;

insert into public.product_categories (product_id, category_id)
select tp.id, c.id
from tmp_products tp
join public.categories c on c.slug = tp.category_slug;

insert into public.product_images (product_id, url, sort_order)
select id, 'https://placehold.co/800x1000?text=' || replace(name, ' ', '+'), 0
from tmp_products;

create temporary table tmp_variants (
  id uuid,
  product_id uuid,
  attribute_value_id uuid,
  size_value text,
  product_slug text,
  base_price numeric
);

insert into tmp_variants (id, product_id, attribute_value_id, size_value, product_slug, base_price)
select gen_random_uuid(), tp.id, sv.id, sv.value, tp.slug, tp.base_price
from tmp_products tp
cross join (
  select av.id, av.value
  from public.attribute_values av
  join public.attributes a on a.id = av.attribute_id
  where a.name = 'Size' and av.value in ('S', 'M', 'L', 'XL')
) sv;

insert into public.product_variants (id, product_id, sku, price, stock_qty)
select id, product_id, upper(product_slug) || '-' || size_value, base_price, 25
from tmp_variants;

insert into public.variant_attribute_values (variant_id, attribute_value_id)
select id, attribute_value_id
from tmp_variants;

drop table tmp_variants;
drop table tmp_products;
