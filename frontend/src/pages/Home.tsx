import { Link } from 'react-router-dom'
import { useProducts, useFeaturedProducts } from '../hooks/useProducts'
import { useSetting } from '../hooks/useSetting'
import { ProductCard } from '../components/product/ProductCard'
import { HeroSlideshow } from '../components/home/HeroSlideshow'

interface HomeHeroSettings {
  title?: string
  subtitle?: string
  images?: string[]
}

export function Home() {
  const { data: products, isLoading } = useProducts()
  const { data: featuredProducts } = useFeaturedProducts()
  const { data: hero } = useSetting<HomeHeroSettings>('home_hero')

  const trending = featuredProducts && featuredProducts.length > 0 ? featuredProducts : (products ?? []).slice(0, 4)

  const heroImages =
    hero?.images && hero.images.length > 0
      ? hero.images
      : (products ?? [])
          .map((product) => [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url)
          .filter((url): url is string => !!url)
          .slice(0, 5)

  return (
    <div>
      <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 text-center">
        {heroImages.length > 0 && <HeroSlideshow images={heroImages} />}
        <div className="relative z-10 max-w-3xl py-24">
          <h1 className="text-4xl font-semibold text-white">{hero?.title ?? 'DotKnot'}</h1>
          <p className="mt-4 text-gray-200">
            {hero?.subtitle ?? 'Everyday apparel — t-shirts, shirts, hoodies, sweatshirts, and more.'}
          </p>
          <Link to="/products" className="mt-8 inline-block rounded bg-accent px-6 py-2 text-white hover:bg-accent-soft">
            Shop Products
          </Link>
        </div>
      </div>

      {!isLoading && trending.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="mb-4 text-lg font-semibold text-white">Trending Now</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {trending.map((product) => {
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
        </div>
      )}
    </div>
  )
}
