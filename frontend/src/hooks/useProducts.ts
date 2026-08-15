import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

async function productIdsInCategory(categoryId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('product_categories')
    .select('product_id')
    .eq('category_id', categoryId)
  if (error) throw error
  return (data ?? []).map((row) => row.product_id)
}

export function useProducts(categorySlug?: string, searchQuery?: string) {
  return useQuery({
    queryKey: ['products', categorySlug ?? 'all', searchQuery ?? ''],
    queryFn: async () => {
      let productIds: string[] | null = null

      if (categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single()
        if (!category) return []

        productIds = await productIdsInCategory(category.id)
        if (productIds.length === 0) return []
      }

      let query = supabase
        .from('products')
        .select(
          'id, slug, name, base_price, sale_price, product_images(url, sort_order), product_variants(id, stock_qty)',
        )
        .eq('status', 'active')
        .order('name')

      if (productIds) {
        query = query.in('id', productIds)
      }

      if (searchQuery?.trim()) {
        query = query.ilike('name', `%${searchQuery.trim()}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useTrendingProducts() {
  return useQuery({
    queryKey: ['products', 'trending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, slug, name, base_price, sale_price, trending_image_url, product_images(url, sort_order), product_variants(id, stock_qty)',
        )
        .eq('status', 'active')
        .eq('is_trending', true)
        .order('name')

      if (error) throw error
      return data
    },
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(
          'id, slug, name, base_price, sale_price, featured_image_url, product_images(url, sort_order), product_variants(id, stock_qty)',
        )
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('name')

      if (error) throw error
      return data
    },
  })
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(
          `id, slug, name, description, base_price, sale_price,
           product_images(url, sort_order),
           product_categories(category_id),
           product_variants(id, sku, price, stock_qty,
             variant_attribute_values(attribute_values(value, attributes(name))))`,
        )
        .eq('slug', slug!)
        .eq('status', 'active')
        .single()

      if (error) throw error
      return data
    },
    enabled: !!slug,
  })
}

export function useRelatedProducts(categoryId: string | undefined, excludeProductId: string | undefined) {
  return useQuery({
    queryKey: ['related-products', categoryId, excludeProductId],
    queryFn: async () => {
      const productIds = (await productIdsInCategory(categoryId!)).filter((id) => id !== excludeProductId)
      if (productIds.length === 0) return []

      const { data, error } = await supabase
        .from('products')
        .select(
          'id, slug, name, base_price, sale_price, product_images(url, sort_order), product_variants(id, stock_qty)',
        )
        .eq('status', 'active')
        .in('id', productIds)
        .limit(4)

      if (error) throw error
      return data
    },
    enabled: !!categoryId && !!excludeProductId,
  })
}
