import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useSetting } from '../../hooks/useSetting'
import type { Json } from '../../types/database.types'
import { ArrowIcon } from '../../components/ui/ArrowIcon'

interface HomeHeroSettings {
  title?: string
  subtitle?: string
  images?: string[]
}

const inputClass =
  'w-full rounded border border-white/15 bg-surface px-2 py-1 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none'

export function HomeAdmin() {
  const queryClient = useQueryClient()
  const { data: hero } = useSetting<HomeHeroSettings>('home_hero')
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Only sync fetched settings into local state once — otherwise a
  // background refetch (window focus, our own invalidateQueries after
  // save/upload) would silently overwrite whatever the admin is typing.
  useEffect(() => {
    if (!hero || initialized) return
    setTitle(hero.title ?? '')
    setSubtitle(hero.subtitle ?? '')
    setImages(hero.images ?? [])
    setInitialized(true)
  }, [hero, initialized])

  const persist = async (next: HomeHeroSettings) => {
    await supabase
      .from('settings')
      .update({ value: next as unknown as Json })
      .eq('key', 'home_hero')
    queryClient.invalidateQueries({ queryKey: ['settings', 'home_hero'] })
  }

  const handleSaveText = async () => {
    setSaving(true)
    await persist({ title, subtitle, images })
    setSaving(false)
    toast.success('Home page text saved')
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    const path = `hero/${Date.now()}-${file.name}`
    const { error } = await supabase.storage.from('product-images').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('product-images').getPublicUrl(path)
      const next = [...images, data.publicUrl]
      setImages(next)
      await persist({ title, subtitle, images: next })
      toast.success('Poster image uploaded')
    } else {
      toast.error('Failed to upload image')
    }
    setUploading(false)
  }

  const handleRemoveImage = async (url: string) => {
    const next = images.filter((i) => i !== url)
    setImages(next)
    await persist({ title, subtitle, images: next })
    toast.success('Poster image removed')
  }

  return (
    <div className="max-w-xl">
      <h2 className="mb-3 font-medium text-white">Home page poster</h2>

      <div className="space-y-2">
        <label className="block text-sm text-gray-400">
          Headline
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm text-gray-400">
          Subheading
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>
        <button type="button" onClick={handleSaveText} disabled={saving} className="brutal-btn">
          <span>{saving ? 'Saving…' : 'Save text'}</span>
          <ArrowIcon />
        </button>
      </div>

      <div className="mt-6 rounded border border-white/10 p-3">
        <h3 className="mb-2 text-sm font-medium text-gray-200">Poster images</h3>
        <p className="mb-2 text-xs text-gray-500">
          Cross-fades through these on the home page. Falls back to product photos if empty.
        </p>
        <div className="flex flex-wrap gap-2">
          {images.map((url) => (
            <div key={url} className="relative h-16 w-16 overflow-hidden rounded bg-surface">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemoveImage(url)}
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
          disabled={uploading}
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          className="mt-2 text-sm text-gray-300"
        />
      </div>
    </div>
  )
}
