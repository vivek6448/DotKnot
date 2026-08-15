import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { ArrowIcon } from '../../components/ui/ArrowIcon'

const STATUS_OPTIONS = ['draft', 'active', 'archived']
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const emptyForm = {
  id: null as string | null,
  name: '',
  slug: '',
  description: '',
  base_price: '',
  sale_price: '',
  status: 'draft',
  processing_days: '',
  category_id: '',
  is_trending: false,
  trending_image_url: null as string | null,
  is_featured: false,
  featured_image_url: null as string | null,
}

const inputClass =
  'w-full rounded border border-white/15 bg-surface px-2 py-1 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none'

export function ProductsAdmin() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newVariantSize, setNewVariantSize] = useState('S')
  const [newVariantPrice, setNewVariantPrice] = useState('')
  const [newVariantStock, setNewVariantStock] = useState('0')
  const [uploading, setUploading] = useState(false)
  const [uploadingTrending, setUploadingTrending] = useState(false)
  const [uploadingFeatured, setUploadingFeatured] = useState(false)

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, status, base_price, is_trending, is_featured')
        .order('name')
      if (error) throw error
      return data
    },
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('id, name').order('name')
      if (error) throw error
      return data
    },
  })

  const { data: sizeValues } = useQuery({
    queryKey: ['size-attribute-values'],
    queryFn: async () => {
      const { data: attribute } = await supabase
        .from('attributes')
        .select('id')
        .eq('name', 'Size')
        .single()
      if (!attribute) return []
      const { data, error } = await supabase
        .from('attribute_values')
        .select('id, value')
        .eq('attribute_id', attribute.id)
      if (error) throw error
      return data
    },
  })

  const { data: images, refetch: refetchImages } = useQuery({
    queryKey: ['admin-product-images', form.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('id, url, sort_order')
        .eq('product_id', form.id!)
        .order('sort_order')
      if (error) throw error
      return data
    },
    enabled: !!form.id,
  })

  const { data: variants, refetch: refetchVariants } = useQuery({
    queryKey: ['admin-product-variants', form.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_variants')
        .select('id, sku, price, stock_qty, variant_attribute_values(attribute_values(value))')
        .eq('product_id', form.id!)
      if (error) throw error
      return data
    },
    enabled: !!form.id,
  })

  const loadProduct = async (id: string) => {
    const { data } = await supabase.from('products').select('*').eq('id', id).single()
    if (!data) return
    const { data: link } = await supabase
      .from('product_categories')
      .select('category_id')
      .eq('product_id', id)
      .maybeSingle()
    setForm({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description ?? '',
      base_price: String(data.base_price),
      sale_price: data.sale_price != null ? String(data.sale_price) : '',
      status: data.status,
      processing_days: data.processing_days != null ? String(data.processing_days) : '',
      category_id: link?.category_id ?? '',
      is_trending: data.is_trending,
      trending_image_url: data.trending_image_url,
      is_featured: data.is_featured,
      featured_image_url: data.featured_image_url,
    })
    setError(null)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim() || !form.base_price) {
      setError('Name, slug, and base price are required')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      base_price: Number(form.base_price),
      sale_price: form.sale_price ? Number(form.sale_price) : null,
      status: form.status,
      processing_days: form.processing_days ? Number(form.processing_days) : null,
      is_trending: form.is_trending,
      trending_image_url: form.trending_image_url,
      is_featured: form.is_featured,
      featured_image_url: form.featured_image_url,
    }

    let productId = form.id

    const isUpdate = !!productId

    if (productId) {
      const { error: updateError } = await supabase.from('products').update(payload).eq('id', productId)
      if (updateError) {
        setError(updateError.message)
        toast.error(updateError.message)
        setSaving(false)
        return
      }
    } else {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert(payload)
        .select('id')
        .single()
      if (insertError || !data) {
        const message = insertError?.message ?? 'Failed to create product'
        setError(message)
        toast.error(message)
        setSaving(false)
        return
      }
      productId = data.id
    }

    if (form.category_id) {
      await supabase.from('product_categories').delete().eq('product_id', productId)
      await supabase
        .from('product_categories')
        .insert({ product_id: productId, category_id: form.category_id })
    }

    setForm((f) => ({ ...f, id: productId }))
    setSaving(false)
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    toast.success(isUpdate ? 'Product updated' : 'Product created')
  }

  const handleDelete = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    if (form.id === id) setForm(emptyForm)
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    toast.success('Product deleted')
  }

  const handleUploadImages = async (files: FileList) => {
    if (!form.id) return
    const productId = form.id
    setUploading(true)
    let nextSortOrder = images?.length ?? 0
    let failures = 0

    for (const [i, file] of Array.from(files).entries()) {
      const path = `${productId}/${Date.now()}-${i}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file)
      if (uploadError) {
        failures += 1
        continue
      }
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      await supabase.from('product_images').insert({
        product_id: productId,
        url: data.publicUrl,
        sort_order: nextSortOrder++,
      })
    }

    refetchImages()
    setUploading(false)

    if (failures === 0) {
      toast.success(files.length > 1 ? `${files.length} images uploaded` : 'Image uploaded')
    } else if (failures < files.length) {
      toast.error(`${failures} of ${files.length} images failed to upload`)
    } else {
      toast.error('Failed to upload images')
    }
  }

  const handleDeleteImage = async (id: string) => {
    await supabase.from('product_images').delete().eq('id', id)
    refetchImages()
    toast.success('Image removed')
  }

  const handleUploadTrendingImage = async (file: File) => {
    if (!form.id) return
    const productId = form.id
    setUploadingTrending(true)

    const path = `${productId}/trending-${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file)
    if (uploadError) {
      toast.error('Failed to upload trending image')
      setUploadingTrending(false)
      return
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    const { error: updateError } = await supabase
      .from('products')
      .update({ trending_image_url: data.publicUrl })
      .eq('id', productId)

    setUploadingTrending(false)

    if (updateError) {
      toast.error('Failed to save trending image')
      return
    }

    setForm((f) => ({ ...f, trending_image_url: data.publicUrl }))
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    toast.success('Trending image updated')
  }

  const handleRemoveTrendingImage = async () => {
    if (!form.id) return
    await supabase.from('products').update({ trending_image_url: null }).eq('id', form.id)
    setForm((f) => ({ ...f, trending_image_url: null }))
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    toast.success('Trending image removed')
  }

  const handleUploadFeaturedImage = async (file: File) => {
    if (!form.id) return
    const productId = form.id
    setUploadingFeatured(true)

    const path = `${productId}/featured-${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, file)
    if (uploadError) {
      toast.error('Failed to upload featured image')
      setUploadingFeatured(false)
      return
    }
    const { data } = supabase.storage.from('product-images').getPublicUrl(path)
    const { error: updateError } = await supabase
      .from('products')
      .update({ featured_image_url: data.publicUrl, is_featured: true })
      .eq('id', productId)

    setUploadingFeatured(false)

    if (updateError) {
      toast.error('Failed to save featured image')
      return
    }

    setForm((f) => ({ ...f, featured_image_url: data.publicUrl, is_featured: true }))
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    toast.success('Added to Featured Products')
  }

  const handleRemoveFeaturedImage = async () => {
    if (!form.id) return
    await supabase.from('products').update({ featured_image_url: null, is_featured: false }).eq('id', form.id)
    setForm((f) => ({ ...f, featured_image_url: null, is_featured: false }))
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
    toast.success('Removed from Featured Products')
  }

  const handleAddVariant = async () => {
    if (!form.id || !newVariantPrice) return
    const sizeAttr = sizeValues?.find((s) => s.value === newVariantSize)
    if (!sizeAttr) return

    const sku = `${form.slug.toUpperCase()}-${newVariantSize}`
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .insert({
        product_id: form.id,
        sku,
        price: Number(newVariantPrice),
        stock_qty: Number(newVariantStock),
      })
      .select('id')
      .single()

    if (!variantError && variant) {
      await supabase
        .from('variant_attribute_values')
        .insert({ variant_id: variant.id, attribute_value_id: sizeAttr.id })
      refetchVariants()
      setNewVariantPrice('')
      setNewVariantStock('0')
      toast.success('Variant added')
    } else {
      toast.error('Failed to add variant')
    }
  }

  const handleUpdateVariant = async (id: string, field: 'price' | 'stock_qty', value: string) => {
    const update = field === 'price' ? { price: Number(value) } : { stock_qty: Number(value) }
    await supabase.from('product_variants').update(update).eq('id', id)
    refetchVariants()
    toast.success('Variant updated')
  }

  const handleDeleteVariant = async (id: string) => {
    await supabase.from('product_variants').delete().eq('id', id)
    refetchVariants()
    toast.success('Variant deleted')
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-medium text-white">Products</h2>
        <div className="divide-y divide-white/10 border-t border-white/10">
          {products?.map((product) => (
            <div key={product.id} className="flex items-center justify-between py-2 text-sm">
              <button
                type="button"
                onClick={() => loadProduct(product.id)}
                className="text-left text-gray-200 hover:text-accent-soft"
              >
                {product.is_trending && (
                  <span className="text-accent-soft" title="Trending">
                    ★{' '}
                  </span>
                )}
                {product.is_featured && (
                  <span className="text-accent-soft" title="Featured">
                    ✦{' '}
                  </span>
                )}
                {product.name} <span className="text-gray-500">({product.status})</span>
              </button>
              <button type="button" onClick={() => handleDelete(product.id)} className="brutal-btn">
                <span>Delete</span>
                <ArrowIcon />
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setForm(emptyForm)} className="brutal-btn mt-4">
          <span>+ New product</span>
          <ArrowIcon />
        </button>
      </div>

      <div>
        <h2 className="mb-3 font-medium text-white">{form.id ? 'Edit product' : 'New product'}</h2>
        <div className="space-y-2">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClass}
          />
          <input
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            className={inputClass}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={inputClass}
            rows={2}
          />
          <div className="flex gap-2">
            <input
              placeholder="Base price"
              type="number"
              value={form.base_price}
              onChange={(e) => setForm((f) => ({ ...f, base_price: e.target.value }))}
              className={inputClass}
            />
            <input
              placeholder="Sale price (optional)"
              type="number"
              value={form.sale_price}
              onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              className={inputClass}
            >
              <option value="">No category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={form.is_trending}
              onChange={(e) => setForm((f) => ({ ...f, is_trending: e.target.checked }))}
              className="accent-accent"
            />
            Show in "Trending Now" on home page
          </label>

          {form.is_trending && form.id && (
            <div className="rounded border border-white/10 p-3">
              <p className="mb-2 text-xs text-gray-400">
                Trending image (optional) — shown instead of the cover photo in the Trending Now section. Falls
                back to the cover photo above if not set.
              </p>
              {form.trending_image_url ? (
                <div className="relative inline-block h-20 w-20 overflow-hidden rounded bg-surface">
                  <img src={form.trending_image_url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveTrendingImage}
                    className="absolute right-0 top-0 bg-black/60 px-1 text-xs text-white"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingTrending}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUploadTrendingImage(e.target.files[0])
                    e.target.value = ''
                  }}
                  className="text-sm text-gray-300"
                />
              )}
              {uploadingTrending && <p className="mt-1 text-xs text-gray-400">Uploading…</p>}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="button" onClick={handleSave} disabled={saving} className="brutal-btn">
            <span>{saving ? 'Saving…' : 'Save product'}</span>
            <ArrowIcon />
          </button>
        </div>

        {form.id && (
          <>
            <div className="mt-6 rounded border border-white/10 p-3">
              <h3 className="mb-2 text-sm font-medium text-gray-200">Images</h3>
              <p className="mb-2 text-xs text-gray-500">
                Upload photos from multiple angles (front, back, side, close-up) — shoppers can click through them
                on the product page. The first image is the cover shown in listings.
              </p>
              <div className="flex flex-wrap gap-2">
                {images?.map((image, index) => (
                  <div key={image.id} className="relative h-16 w-16 overflow-hidden rounded bg-surface">
                    <img src={image.url} alt="" className="h-full w-full object-cover" />
                    {index === 0 && (
                      <span className="absolute bottom-0 left-0 bg-accent/90 px-1 text-[10px] text-white">
                        Cover
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute right-0 top-0 bg-black/60 px-1 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) handleUploadImages(e.target.files)
                  e.target.value = ''
                }}
                className="mt-2 text-sm text-gray-300"
              />
              {uploading && <p className="mt-1 text-xs text-gray-400">Uploading…</p>}
            </div>

            <div className="mt-6 rounded border border-white/10 p-3">
              <h3 className="mb-1 text-sm font-medium text-gray-200">
                Featured Products {form.is_featured && <span className="text-accent-soft">(active)</span>}
              </h3>
              <p className="mb-2 text-xs text-gray-500">
                Upload a photo here to feature this product in the home page's Featured Products section. Remove
                the photo to take it out of Featured.
              </p>
              {form.featured_image_url ? (
                <div className="relative inline-block h-20 w-20 overflow-hidden rounded bg-surface">
                  <img src={form.featured_image_url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveFeaturedImage}
                    className="absolute right-0 top-0 bg-black/60 px-1 text-xs text-white"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingFeatured}
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleUploadFeaturedImage(e.target.files[0])
                    e.target.value = ''
                  }}
                  className="text-sm text-gray-300"
                />
              )}
              {uploadingFeatured && <p className="mt-1 text-xs text-gray-400">Uploading…</p>}
            </div>

            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium text-gray-200">Variants</h3>
              <div className="space-y-1">
                {variants?.map((variant: any) => (
                  <div key={variant.id} className="flex items-center gap-2 text-sm">
                    <span className="w-32 shrink-0 truncate text-gray-400" title={variant.sku}>
                      {variant.sku}
                    </span>
                    <input
                      type="number"
                      defaultValue={variant.price}
                      onBlur={(e) => handleUpdateVariant(variant.id, 'price', e.target.value)}
                      className={`${inputClass} w-24`}
                    />
                    <input
                      type="number"
                      defaultValue={variant.stock_qty}
                      onBlur={(e) => handleUpdateVariant(variant.id, 'stock_qty', e.target.value)}
                      className={`${inputClass} w-20`}
                    />
                    <button type="button" onClick={() => handleDeleteVariant(variant.id)} className="brutal-btn">
                      <span>Delete</span>
                      <ArrowIcon />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={newVariantSize}
                  onChange={(e) => setNewVariantSize(e.target.value)}
                  className={`${inputClass} w-20`}
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Price"
                  type="number"
                  value={newVariantPrice}
                  onChange={(e) => setNewVariantPrice(e.target.value)}
                  className={`${inputClass} w-24`}
                />
                <input
                  placeholder="Stock"
                  type="number"
                  value={newVariantStock}
                  onChange={(e) => setNewVariantStock(e.target.value)}
                  className={`${inputClass} w-20`}
                />
                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="rounded border border-white/15 px-2 py-1 text-sm text-gray-200 hover:border-accent"
                >
                  Add
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
