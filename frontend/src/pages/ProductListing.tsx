import { useEffect, useState, type FormEvent } from 'react'
import { useProducts } from '../hooks/useProducts'
import { useCategories } from '../hooks/useCategories'
import { ProductCard } from '../components/product/ProductCard'
import { ProximityHeading } from '../components/text/ProximityHeading'
import { SearchIcon } from '../components/ui/icons'
import { ArrowIcon } from '../components/ui/ArrowIcon'

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

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault()
    setDebouncedSearch(searchInput)
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <ProximityHeading as="h1" className="mb-4 text-2xl font-semibold text-white">
        All Products
      </ProximityHeading>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setCategorySlug(undefined)}
          className="brutal-btn brutal-btn--compact"
          style={!categorySlug ? ({ ['--brutal-shadow']: 'var(--color-accent)' } as React.CSSProperties) : undefined}
        >
          <span>All</span>
          <ArrowIcon />
        </button>
        {categories?.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setCategorySlug(category.slug)}
            className="brutal-btn brutal-btn--compact"
            style={
              categorySlug === category.slug
                ? ({ ['--brutal-shadow']: 'var(--color-accent)' } as React.CSSProperties)
                : undefined
            }
          >
            <span>{category.name}</span>
            <ArrowIcon />
          </button>
        ))}

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="search"
            placeholder="Search products…"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="w-40 rounded border border-white/15 bg-surface px-3 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-white focus:outline-none"
          />
          <button type="submit" aria-label="Search" className="brutal-btn brutal-btn--compact shrink-0">
            <SearchIcon />
          </button>
        </form>
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
              variants={product.product_variants}
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
