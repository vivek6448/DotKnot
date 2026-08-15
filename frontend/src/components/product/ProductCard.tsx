import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { ArrowIcon } from '../ui/ArrowIcon'

interface ProductCardVariant {
  id: string
  stock_qty: number
}

interface ProductCardProps {
  slug: string
  name: string
  basePrice: number
  salePrice?: number | null
  imageUrl: string | null
  variants?: ProductCardVariant[]
}

export function ProductCard({ slug, name, basePrice, salePrice, imageUrl, variants }: ProductCardProps) {
  const { addToCart } = useCart()
  const onSale = salePrice != null && salePrice < basePrice
  const defaultVariant = variants?.find((v) => v.stock_qty > 0)
  const inStock = !variants || defaultVariant

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault()
    if (defaultVariant) addToCart(defaultVariant.id, 1)
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
      <Link to={`/products/${slug}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-surface">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background: 'radial-gradient(ellipse at 50% 30%, rgba(var(--color-accent-rgb), 0.15), transparent 70%)',
            }}
          />
          {imageUrl && (
            <img
              src={imageUrl}
              alt={name}
              className="relative h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/products/${slug}`}>
          <h3 className="font-bold text-white">{name}</h3>
        </Link>
        {onSale ? (
          <p className="mt-1">
            <span className="mr-2 text-sm text-gray-500 line-through">₹{basePrice}</span>
            <span className="font-bold text-accent-soft">₹{salePrice}</span>
          </p>
        ) : (
          <p className="mt-1 font-bold text-accent-soft">₹{basePrice}</p>
        )}

        <button type="button" onClick={handleAddToCart} disabled={!inStock} className="brutal-btn mt-4 w-full">
          <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
          <ArrowIcon />
        </button>
      </div>
    </div>
  )
}
