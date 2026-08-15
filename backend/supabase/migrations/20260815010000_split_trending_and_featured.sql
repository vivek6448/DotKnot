-- The old `is_featured` / `featured_image_url` columns actually drove the
-- "Trending Now" home section, conflating "trending" with "featured" as one
-- flag. Rename them to what they really are, then add genuinely separate
-- featured columns so admins can curate the two independently.
alter table public.products rename column is_featured to is_trending;
alter table public.products rename column featured_image_url to trending_image_url;

alter table public.products
  add column is_featured boolean not null default false,
  add column featured_image_url text;
