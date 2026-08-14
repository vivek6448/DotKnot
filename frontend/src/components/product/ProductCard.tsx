import { Link } from 'react-router-dom'

interface ProductCardProps {
  slug: string
  name: string
  basePrice: number
  salePrice?: number | null
  imageUrl: string | null
}

export function ProductCard({ slug, name, basePrice, salePrice, imageUrl }: ProductCardProps) {
  const onSale = salePrice != null && salePrice < basePrice

  return (
    <Link to={`/products/${slug}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-surface">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        )}
      </div>
      <h3 className="mt-2 text-sm font-medium text-white">{name}</h3>
      {onSale ? (
        <p className="text-sm">
          <span className="mr-2 text-gray-500 line-through">₹{basePrice}</span>
          <span className="font-medium text-accent-soft">₹{salePrice}</span>
        </p>
      ) : (
        <p className="text-sm text-gray-400">₹{basePrice}</p>
      )}
    </Link>
  )
}
