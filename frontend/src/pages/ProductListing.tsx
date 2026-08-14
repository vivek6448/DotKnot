import { useEffect, useState } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { ProductCard } from '../components/product/ProductCard'

export function ProductListing() {
  const [categorySlug, setCategorySlug] = useState<string | undefined>(undefined)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const { data: categories } = useCategories()
  const { data: products, isLoading, error } = useProducts(categorySlug, debouncedSearch)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-white">All Products</h1>
        <input
          type="search"
          placeholder="Search products…"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          className="w-full max-w-xs rounded border border-white/15 bg-surface px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategorySlug(undefined)}
          className={`rounded-full border px-3 py-1 text-sm ${
            !categorySlug ? 'border-accent bg-accent text-white' : 'border-white/15 text-gray-300'
          }`}
        >
          All
        </button>
        {categories?.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategorySlug(category.slug)}
            className={`rounded-full border px-3 py-1 text-sm ${
              categorySlug === category.slug
                ? 'border-accent bg-accent text-white'
                : 'border-white/15 text-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-center text-gray-400">Loading products…</p>}
      {error && <p className="text-center text-red-400">Failed to load products.</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products?.map((product) => {
          const images = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)
          return (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              basePrice={product.base_price}
              salePrice={product.sale_price}
              imageUrl={images[0]?.url ?? null}
            />
          )
        })}
      </div>

      {!isLoading && products?.length === 0 && (
        <p className="text-center text-gray-500">No products found.</p>
      )}
    </div>
  )
}
