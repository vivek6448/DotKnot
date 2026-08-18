import { useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { ArrowIcon } from '../ui/ArrowIcon'
import { useActiveCoupons } from '../../hooks/useActiveCoupons'

export interface AppliedCoupon {
  code: string
  discount_amount: number
}

interface CouponFormProps {
  applied: AppliedCoupon | null
  onApplied: (result: AppliedCoupon | null) => void
}

async function extractErrorMessage(error: unknown): Promise<string> {
  try {
    const context = (error as { context?: Response })?.context
    if (context && typeof context.json === 'function') {
      const body = await context.json()
      if (body?.message) return body.message as string
    }
  } catch {
    // fall through to generic message
  }
  return 'Invalid or expired coupon'
}

export function CouponForm({ applied, onApplied }: CouponFormProps) {
  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: availableCoupons } = useActiveCoupons()

  const applyCode = async (code: string) => {
    if (!code.trim()) return
    setCouponInput(code)
    setApplying(true)
    setError(null)

    const { data, error: fnError } = await supabase.functions.invoke('apply-coupon', {
      body: { code: code.trim() },
    })

    if (fnError || !data) {
      const message = await extractErrorMessage(fnError)
      setError(message)
      onApplied(null)
      toast.error(message)
    } else {
      const result = { code: data.code, discount_amount: data.discount_amount }
      onApplied(result)
      toast.success(`Coupon ${result.code} applied`)
    }

    setApplying(false)
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-white">Have a coupon?</p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Coupon code"
          value={couponInput}
          onChange={(event) => setCouponInput(event.target.value)}
          className="flex-1 rounded border border-white/15 bg-surface px-3 py-2 text-sm uppercase text-white placeholder:text-gray-500 focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={() => applyCode(couponInput)}
          disabled={applying}
          className="brutal-btn brutal-btn--compact"
        >
          <span>{applying ? 'Applying…' : 'Apply'}</span>
          <ArrowIcon />
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-white">{error}</p>}
      {applied && (
        <p className="mt-1 text-sm text-green-400">
          Coupon {applied.code} applied — -₹{applied.discount_amount}
        </p>
      )}

      {availableCoupons && availableCoupons.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Available coupons</p>
          <div className="space-y-2">
            {availableCoupons.map((coupon) => (
              <button
                key={coupon.code}
                type="button"
                onClick={() => applyCode(coupon.code)}
                disabled={applying || applied?.code === coupon.code}
                className="flex w-full items-center justify-between rounded border border-white/15 bg-surface px-3 py-2 text-left text-sm text-gray-200 hover:border-accent hover:text-white disabled:opacity-40"
              >
                <span className="font-medium">{coupon.code}</span>
                <span className="text-gray-400">
                  {coupon.discount_type === 'percent' ? `${coupon.discount_value}% off` : `₹${coupon.discount_value} off`}
                  {coupon.min_order_value ? ` · min ₹${coupon.min_order_value}` : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
