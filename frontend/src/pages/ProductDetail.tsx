import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useProduct, useRelatedProducts } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { ProductCard } from '../components/product/ProductCard'
import { ArrowIcon } from '../components/ui/ArrowIcon'
import { ProximityHeading } from '../components/text/ProximityHeading'

const SWIPE_CONFIDENCE_THRESHOLD = 10000
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
}

type ProductVariant = NonNullable<ReturnType<typeof useProduct>['data']>['product_variants'][number]

function sizeOf(variant: ProductVariant): string {
  const entry = variant.variant_attribute_values.find(
    (vav) => vav.attribute_values?.attributes?.name === 'Size',
  )
  return entry?.attribute_values?.value ?? variant.sku
}

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { data: product, isLoading, error } = useProduct(slug)
  const { addToCart } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [buyingNow, setBuyingNow] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [[page, direction], setPage] = useState([0, 0])
  const [lastProductId, setLastProductId] = useState(product?.id)
  const wasDraggedRef = useRef(false)

  const firstCategoryId = product?.product_categories?.[0]?.category_id
  const { data: relatedProducts } = useRelatedProducts(firstCategoryId, product?.id)

  if (product?.id !== lastProductId) {
    setLastProductId(product?.id)
    setPage([0, 0])
  }

  if (isLoading) return <p className="p-8 text-center text-gray-400">Loading…</p>
  if (error || !product) return <p className="p-8 text-center text-red-400">Product not found.</p>

  const images = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)
  const imageIndex = ((page % images.length) + images.length) % images.length
  const activeImage = images[imageIndex]
  const variants = product.product_variants
  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const onSale = product.sale_price != null && product.sale_price < product.base_price

  const handleAddToCart = async () => {
    if (!selectedVariant) return
    await addToCart(selectedVariant.id, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = async () => {
    if (!selectedVariant) return
    setBuyingNow(true)
    await addToCart(selectedVariant.id, quantity)
    navigate('/checkout')
  }

  const paginate = (newDirection: number) => setPage(([prevPage]) => [prevPage + newDirection, newDirection])
  const showPrevImage = () => paginate(-1)
  const showNextImage = () => paginate(1)
  const jumpToImage = (index: number) => {
    const diff = index - imageIndex
    if (diff !== 0) setPage(([prevPage]) => [prevPage + diff, diff > 0 ? 1 : -1])
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = swipePower(info.offset.x, info.velocity.x)
    if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) paginate(1)
    else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) paginate(-1)
  }

  const handleMainImagePointerDown = () => {
    wasDraggedRef.current = false
  }
  const handleMainImageDragStart = () => {
    wasDraggedRef.current = true
  }
  const handleMainImageClick = () => {
    if (!wasDraggedRef.current) setLightboxOpen(true)
  }

  return (
    <>
    <div className="mx-auto max-w-4xl p-4">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface">
            <AnimatePresence initial={false} custom={direction}>
              {activeImage && (
                <motion.img
                  key={page}
                  src={activeImage.url}
                  alt={product.name}
                  draggable={false}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                  drag={images.length > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={1}
                  onPointerDown={handleMainImagePointerDown}
                  onDragStart={handleMainImageDragStart}
                  onDragEnd={handleDragEnd}
                  onClick={handleMainImageClick}
                  className="absolute inset-0 h-full w-full cursor-zoom-in select-none object-cover active:cursor-grabbing"
                />
              )}
            </AnimatePresence>
          </div>
          {images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {images.map((image, index) => (
                <button
                  key={image.url}
                  type="button"
                  onClick={() => jumpToImage(index)}
                  className={`h-16 w-16 overflow-hidden rounded border-2 ${
                    index === imageIndex ? 'border-accent' : 'border-transparent'
                  }`}
                  aria-label={`View angle ${index + 1}`}
                >
                  <img src={image.url} alt={product.name} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <ProximityHeading as="h1" className="text-2xl font-semibold text-white">
            {product.name}
          </ProximityHeading>
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
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-200">Size</p>
              <Link to="/policies/size-guide" className="brutal-btn brutal-btn--compact">
                <span>Size Guide</span>
                <ArrowIcon />
              </Link>
            </div>
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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              className="brutal-btn flex-1"
            >
              <span>{added ? 'Added!' : 'Add to Cart'}</span>
              <ArrowIcon />
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!selectedVariant || buyingNow}
              className="brutal-btn flex-1"
              style={{ ['--brutal-shadow']: 'var(--color-accent)' } as React.CSSProperties}
            >
              <span>{buyingNow ? 'Redirecting…' : 'Buy Now'}</span>
              <ArrowIcon />
            </button>
          </div>
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
                  variants={related.product_variants}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>

    {lightboxOpen && activeImage && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        onClick={() => setLightboxOpen(false)}
      >
        <button
          type="button"
          onClick={() => setLightboxOpen(false)}
          aria-label="Close"
          className="absolute right-4 top-4 text-3xl text-white/80 hover:text-white"
        >
          ✕
        </button>

        {images.length > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              showPrevImage()
            }}
            aria-label="Previous image"
            className="absolute left-2 text-4xl text-white/70 hover:text-white sm:left-6"
          >
            ‹
          </button>
        )}

        <div className="relative h-[85vh] w-full max-w-3xl" onClick={(event) => event.stopPropagation()}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={page}
              src={activeImage.url}
              alt={product.name}
              draggable={false}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              drag={images.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={handleDragEnd}
              className="absolute inset-0 h-full w-full cursor-grab select-none rounded-lg object-contain active:cursor-grabbing"
            />
          </AnimatePresence>
        </div>

        {images.length > 1 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              showNextImage()
            }}
            aria-label="Next image"
            className="absolute right-2 text-4xl text-white/70 hover:text-white sm:right-6"
          >
            ›
          </button>
        )}

        {images.length > 1 && (
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/70"
            onClick={(event) => event.stopPropagation()}
          >
            {imageIndex + 1} / {images.length}
          </div>
        )}
      </div>
    )}
    </>
  )
}
