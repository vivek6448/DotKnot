import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

const inputClass =
  'w-full rounded border border-white/15 bg-surface px-2 py-1 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none'

export function CategoriesAdmin() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [parentId, setParentId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('id, name, slug, parent_id').order('name')
      if (error) throw error
      return data
    },
  })

  const handleCreate = async () => {
    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required')
      return
    }
    const { error: insertError } = await supabase
      .from('categories')
      .insert({ name: name.trim(), slug: slug.trim(), parent_id: parentId || null })

    if (insertError) {
      setError(insertError.message)
      return
    }

    setName('')
    setSlug('')
    setParentId('')
    setError(null)
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
  }

  const handleDelete = async (id: string) => {
    await supabase.from('categories').delete().eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-medium text-white">Categories</h2>
        <div className="divide-y divide-white/10 border-t border-white/10">
          {categories?.map((category) => (
            <div key={category.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-200">
                {category.parent_id && <span className="text-gray-500">↳ </span>}
                {category.name} <span className="text-gray-500">/{category.slug}</span>
              </span>
              <button type="button" onClick={() => handleDelete(category.id)} className="text-red-400">
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-medium text-white">New category</h2>
        <div className="space-y-2">
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          <input placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
          <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputClass}>
            <option value="">No parent (top-level)</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={handleCreate}
            className="rounded bg-accent px-4 py-2 text-sm text-white hover:bg-accent-soft"
          >
            Create category
          </button>
        </div>
      </div>
    </div>
  )
}
