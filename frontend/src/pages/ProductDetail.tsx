import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useProduct, useRelatedProducts } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { ProductCard } from '../components/product/ProductCard'

function sizeOf(variant: any): string {
  const entry = variant.variant_attribute_values.find(
    (vav: any) => vav.attribute_values?.attributes?.name === 'Size',
  )
  return entry?.attribute_values?.value ?? variant.sku
}

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: product, isLoading, error } = useProduct(slug)
  const { addToCart } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const firstCategoryId = product?.product_categories?.[0]?.category_id
  const { data: relatedProducts } = useRelatedProducts(firstCategoryId, product?.id)

  if (isLoading) return <p className="p-8 text-center text-gray-400">Loading…</p>
  if (error || !product) return <p className="p-8 text-center text-red-400">Product not found.</p>

  const images = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)
  const variants = product.product_variants
  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const onSale = product.sale_price != null && product.sale_price < product.base_price

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    await addToCart(selectedVariant.id, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-surface">
            {images[0] && (
              <img src={images[0].url} alt={product.name} className="h-full w-full object-cover" />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.slice(1).map((image) => (
                <div key={image.url} className="h-16 w-16 overflow-hidden rounded bg-surface">
                  <img src={image.url} alt={product.name} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-white">{product.name}</h1>
          {onSale ? (
            <p className="mt-1 text-lg">
              <span className="mr-2 text-gray-500 line-through">₹{product.base_price}</span>
              <span className="font-medium text-accent-soft">₹{product.sale_price}</span>
            </p>
          ) : (
            <p className="mt-1 text-lg text-gray-300">₹{product.base_price}</p>
          )}
          {product.description && <p className="mt-4 text-sm text-gray-400">{product.description}</p>}

          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-gray-200">Size</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariantId(variant.id)}
                  disabled={variant.stock_qty === 0}
                  className={`rounded border px-3 py-1 text-sm ${
                    selectedVariantId === variant.id
                      ? 'border-accent bg-accent text-white'
                      : 'border-white/15 text-gray-300'
                  } ${variant.stock_qty === 0 ? 'cursor-not-allowed opacity-40' : ''}`}
                >
                  {sizeOf(variant)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-gray-200">Quantity</p>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
              className="w-20 rounded border border-white/15 bg-surface px-2 py-1 text-center text-white focus:border-accent focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedVariant}
            className="mt-6 w-full rounded bg-accent py-2 text-white hover:bg-accent-soft disabled:opacity-40"
          >
            {added ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-4 text-lg font-semibold text-white">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedProducts.map((related) => {
              const relatedImages = [...related.product_images].sort((a, b) => a.sort_order - b.sort_order)
              return (
                <ProductCard
                  key={related.id}
                  slug={related.slug}
                  name={related.name}
                  basePrice={related.base_price}
                  salePrice={related.sale_price}
                  imageUrl={relatedImages[0]?.url ?? null}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
