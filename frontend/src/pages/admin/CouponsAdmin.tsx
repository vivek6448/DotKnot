import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { ArrowIcon } from '../../components/ui/ArrowIcon'

const emptyForm = {
  id: null as string | null,
  code: '',
  discount_type: 'percent' as 'percent' | 'fixed',
  discount_value: '',
  min_order_value: '',
  expires_at: '',
  active: true,
  description: '',
}

const inputClass =
  'w-full rounded border border-white/15 bg-surface px-2 py-1 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none'

export function CouponsAdmin() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: coupons } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coupons')
        .select('id, code, discount_type, discount_value, min_order_value, active')
        .order('code')
      if (error) throw error
      return data
    },
  })

  const loadCoupon = async (id: string) => {
    const { data } = await supabase.from('coupons').select('*').eq('id', id).single()
    if (!data) return
    setForm({
      id: data.id,
      code: data.code,
      discount_type: data.discount_type as 'percent' | 'fixed',
      discount_value: String(data.discount_value),
      min_order_value: data.min_order_value != null ? String(data.min_order_value) : '',
      expires_at: data.expires_at ? data.expires_at.slice(0, 10) : '',
      active: data.active,
      description: data.description ?? '',
    })
    setError(null)
  }

  const handleSave = async () => {
    if (!form.code.trim() || !form.discount_value) {
      setError('Code and discount value are required')
      return
    }
    setSaving(true)
    setError(null)

    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_value: form.min_order_value ? Number(form.min_order_value) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      active: form.active,
      description: form.description.trim() || null,
    }

    const { error: saveError } = form.id
      ? await supabase.from('coupons').update(payload).eq('id', form.id)
      : await supabase.from('coupons').insert(payload)

    if (saveError) {
      setError(saveError.message)
      toast.error(saveError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setForm(emptyForm)
    queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    queryClient.invalidateQueries({ queryKey: ['active-coupons'] })
    toast.success(form.id ? 'Coupon updated' : 'Coupon created')
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    await supabase.from('coupons').update({ active: !active }).eq('id', id)
    if (form.id === id) setForm((f) => ({ ...f, active: !active }))
    queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    queryClient.invalidateQueries({ queryKey: ['active-coupons'] })
    toast.success(active ? 'Coupon deactivated' : 'Coupon activated')
  }

  const handleDelete = async (id: string) => {
    await supabase.from('coupons').delete().eq('id', id)
    if (form.id === id) setForm(emptyForm)
    queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    queryClient.invalidateQueries({ queryKey: ['active-coupons'] })
    toast.success('Coupon deleted')
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-medium text-white">Coupons</h2>
        <div className="divide-y divide-white/10 border-t border-white/10">
          {coupons?.map((coupon) => (
            <div key={coupon.id} className="flex items-center justify-between py-2 text-sm">
              <button
                type="button"
                onClick={() => loadCoupon(coupon.id)}
                className="text-left text-gray-200 hover:text-accent-soft"
              >
                {coupon.code} —{' '}
                {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                {coupon.min_order_value ? ` (min ₹${coupon.min_order_value})` : ''}
              </button>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => handleToggleActive(coupon.id, coupon.active)} className="brutal-btn">
                  <span>{coupon.active ? 'Deactivate' : 'Activate'}</span>
                  <ArrowIcon />
                </button>
                <button type="button" onClick={() => handleDelete(coupon.id)} className="brutal-btn">
                  <span>Delete</span>
                  <ArrowIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setForm(emptyForm)} className="brutal-btn mt-4">
          <span>+ New coupon</span>
          <ArrowIcon />
        </button>
      </div>

      <div>
        <h2 className="mb-3 font-medium text-white">{form.id ? 'Edit coupon' : 'New coupon'}</h2>
        <div className="space-y-2">
          <input
            placeholder="Code"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            className={`${inputClass} uppercase`}
          />
          <div className="flex gap-2">
            <select
              value={form.discount_type}
              onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value as 'percent' | 'fixed' }))}
              className={inputClass}
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
            <input
              placeholder="Value"
              type="number"
              value={form.discount_value}
              onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
              className={inputClass}
            />
          </div>
          <input
            placeholder="Minimum order value (optional)"
            type="number"
            value={form.min_order_value}
            onChange={(e) => setForm((f) => ({ ...f, min_order_value: e.target.value }))}
            className={inputClass}
          />
          <label className="block text-xs text-gray-400">
            Promo message (optional)
            <textarea
              placeholder="Shown on the homepage popup instead of the auto-generated text, e.g. “Get 20% off your first order!”"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className={`${inputClass} mt-1 resize-none`}
            />
          </label>
          <label className="block text-xs text-gray-400">
            Expires on (optional)
            <input
              type="date"
              value={form.expires_at}
              onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
              className={`${inputClass} mt-1`}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="accent-accent"
            />
            Active
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="button" onClick={handleSave} disabled={saving} className="brutal-btn">
            <span>{saving ? 'Saving…' : form.id ? 'Save changes' : 'Create coupon'}</span>
            <ArrowIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
