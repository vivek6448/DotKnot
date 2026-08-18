import { Link } from 'react-router-dom'
import { useProducts, useTrendingProducts, useFeaturedProducts } from '../hooks/useProducts'
import { useSetting } from '../hooks/useSetting'
import { ProductCard } from '../components/product/ProductCard'
import { HeroSlideshow } from '../components/home/HeroSlideshow'
import { ArrowIcon } from '../components/ui/ArrowIcon'
import { ProximityHeading } from '../components/text/ProximityHeading'

interface HomeHeroSettings {
  title?: string
  subtitle?: string
  images?: string[]
}

export function Home() {
  const { data: products, isLoading } = useProducts()
  const { data: trendingProducts } = useTrendingProducts()
  const { data: featuredProducts } = useFeaturedProducts()
  const { data: hero } = useSetting<HomeHeroSettings>('home_hero')

  const trending =
    trendingProducts && trendingProducts.length > 0
      ? trendingProducts
      : (products ?? []).slice(0, 4).map((p) => ({ ...p, trending_image_url: null as string | null }))
  const featured = featuredProducts ?? []

  const featuredImages = featured
    .map((product) => product.featured_image_url ?? [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url)
    .filter((url): url is string => !!url)

  const heroImages =
    hero?.images && hero.images.length > 0
      ? hero.images
      : featuredImages.length > 0
        ? featuredImages
        : (products ?? [])
            .map((product) => [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url)
            .filter((url): url is string => !!url)
            .slice(0, 5)

  return (
    <div>
      <div className="relative flex min-h-[85vh] items-end justify-center overflow-hidden px-4 text-center sm:min-h-[75vh] lg:min-h-[70vh]">
        {heroImages.length > 0 && <HeroSlideshow images={heroImages} />}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="relative z-10 max-w-3xl pb-12 sm:pb-16">
          <ProximityHeading as="h1" className="text-4xl font-semibold text-white" radius={140}>
            {hero?.title ?? 'DotKnot'}
          </ProximityHeading>
          <p className="mt-4 text-gray-200">
            {hero?.subtitle ?? 'Everyday apparel — t-shirts, shirts, hoodies, sweatshirts, and more.'}
          </p>
          <Link to="/products" className="brutal-btn mt-8">
            <span>Shop Products</span>
            <ArrowIcon />
          </Link>
        </div>
      </div>

      {!isLoading && trending.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 py-16">
          <ProximityHeading as="h2" className="mb-4 text-lg font-semibold text-white" radius={100}>
            Trending Now
          </ProximityHeading>
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
                  imageUrl={product.trending_image_url ?? images[0]?.url ?? null}
                  variants={product.product_variants}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
