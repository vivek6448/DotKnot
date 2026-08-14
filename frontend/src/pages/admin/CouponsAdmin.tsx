import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

const inputClass =
  'w-full rounded border border-white/15 bg-surface px-2 py-1 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none'

export function CouponsAdmin() {
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [minOrderValue, setMinOrderValue] = useState('')
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

  const handleCreate = async () => {
    if (!code.trim() || !discountValue) {
      setError('Code and discount value are required')
      return
    }
    const { error: insertError } = await supabase.from('coupons').insert({
      code: code.trim().toUpperCase(),
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_order_value: minOrderValue ? Number(minOrderValue) : null,
    })

    if (insertError) {
      setError(insertError.message)
      return
    }

    setCode('')
    setDiscountValue('')
    setMinOrderValue('')
    setError(null)
    queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    await supabase.from('coupons').update({ active: !active }).eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
  }

  const handleDelete = async (id: string) => {
    await supabase.from('coupons').delete().eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div>
        <h2 className="mb-3 font-medium text-white">Coupons</h2>
        <div className="divide-y divide-white/10 border-t border-white/10">
          {coupons?.map((coupon) => (
            <div key={coupon.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-200">
                {coupon.code} —{' '}
                {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                {coupon.min_order_value ? ` (min ₹${coupon.min_order_value})` : ''}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleActive(coupon.id, coupon.active)}
                  className={coupon.active ? 'text-green-400' : 'text-gray-500'}
                >
                  {coupon.active ? 'Active' : 'Inactive'}
                </button>
                <button type="button" onClick={() => handleDelete(coupon.id)} className="text-red-400">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-medium text-white">New coupon</h2>
        <div className="space-y-2">
          <input
            placeholder="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className={`${inputClass} uppercase`}
          />
          <div className="flex gap-2">
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
              className={inputClass}
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
            <input
              placeholder="Value"
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className={inputClass}
            />
          </div>
          <input
            placeholder="Minimum order value (optional)"
            type="number"
            value={minOrderValue}
            onChange={(e) => setMinOrderValue(e.target.value)}
            className={inputClass}
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="button"
            onClick={handleCreate}
            className="rounded bg-accent px-4 py-2 text-sm text-white hover:bg-accent-soft"
          >
            Create coupon
          </button>
        </div>
      </div>
    </div>
  )
}
