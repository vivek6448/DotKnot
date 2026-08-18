import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'
import { getGuestCart, setGuestCart } from '../lib/guestCart'

export interface CartLine {
  variant_id: string
  quantity: number
  sku: string
  price: number
  product_name: string
  product_slug: string
  image_url: string | null
}

interface RawCartVariant {
  id: string
  sku: string
  price: number
  products: {
    name: string
    slug: string
    product_images: { url: string; sort_order: number }[]
  } | null
}

function toCartLine(quantity: number, variant: RawCartVariant): CartLine {
  const images = [...(variant.products?.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  )
  return {
    variant_id: variant.id,
    quantity,
    sku: variant.sku,
    price: variant.price,
    product_name: variant.products?.name ?? '',
    product_slug: variant.products?.slug ?? '',
    image_url: images[0]?.url ?? null,
  }
}

async function fetchUserCartId(userId: string): Promise<string | null> {
  const { data } = await supabase.from('carts').select('id').eq('user_id', userId).maybeSingle()
  return data?.id ?? null
}

async function fetchOrCreateUserCartId(userId: string): Promise<string> {
  const existing = await fetchUserCartId(userId)
  if (existing) return existing
  const { data, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single()
  if (error || !data) throw error ?? new Error('Failed to create cart')
  return data.id
}

export function useCart() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const queryKey = ['cart', user?.id ?? 'guest']

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<CartLine[]> => {
      if (user) {
        const cartId = await fetchUserCartId(user.id)
        if (!cartId) return []

        const { data, error } = await supabase
          .from('cart_items')
          .select('quantity, product_variants(id, sku, price, products(name, slug, product_images(url, sort_order)))')
          .eq('cart_id', cartId)

        if (error) throw error
        return (data ?? []).map((row) => toCartLine(row.quantity, row.product_variants as RawCartVariant))
      }

      const items = getGuestCart()
      if (items.length === 0) return []

      const { data, error } = await supabase
        .from('product_variants')
        .select('id, sku, price, products(name, slug, product_images(url, sort_order))')
        .in(
          'id',
          items.map((i) => i.variant_id),
        )

      if (error) throw error
      return items
        .map((item) => {
          const variant = data?.find((v) => v.id === item.variant_id)
          return variant ? toCartLine(item.quantity, variant) : null
        })
        .filter((line): line is CartLine => line !== null)
    },
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const addToCart = async (variantId: string, quantity: number) => {
    if (user) {
      const cartId = await fetchOrCreateUserCartId(user.id)
      const { data: existing } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('variant_id', variantId)
        .maybeSingle()

      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id)
      } else {
        await supabase.from('cart_items').insert({ cart_id: cartId, variant_id: variantId, quantity })
      }
    } else {
      const items = getGuestCart()
      const existing = items.find((i) => i.variant_id === variantId)
      if (existing) {
        existing.quantity += quantity
      } else {
        items.push({ variant_id: variantId, quantity })
      }
      setGuestCart(items)
    }

    invalidate()
    toast.success('Added to cart')
  }

  const updateQuantity = async (variantId: string, quantity: number) => {
    if (user) {
      const cartId = await fetchUserCartId(user.id)
      if (!cartId) return
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('cart_id', cartId)
        .eq('variant_id', variantId)
    } else {
      const items = getGuestCart()
      const existing = items.find((i) => i.variant_id === variantId)
      if (existing) existing.quantity = quantity
      setGuestCart(items)
    }

    invalidate()
    toast.success('Cart updated')
  }

  const removeFromCart = async (variantId: string) => {
    if (user) {
      const cartId = await fetchUserCartId(user.id)
      if (!cartId) return
      await supabase.from('cart_items').delete().eq('cart_id', cartId).eq('variant_id', variantId)
    } else {
      setGuestCart(getGuestCart().filter((i) => i.variant_id !== variantId))
    }

    invalidate()
    toast.success('Removed from cart')
  }

  const lines = query.data ?? []
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0)

  return {
    lines,
    itemCount,
    subtotal,
    isLoading: query.isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
  }
}
