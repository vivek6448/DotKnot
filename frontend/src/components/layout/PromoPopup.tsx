import { useEffect, useState } from 'react'
import { useActiveCoupons } from '../../hooks/useActiveCoupons'

const SHOW_DELAY_MS = 2000
const VISIBLE_DURATION_MS = 10000

export function PromoPopup() {
  const [visible, setVisible] = useState(false)
  const { data: coupons } = useActiveCoupons()
  const activeCoupon = coupons?.[0]

  // Only ever pops up when the admin actually has a live coupon, and the
  // copy always reflects that coupon's real code/discount — nothing here is
  // hand-typed, so it can never go stale when the coupon changes.
  useEffect(() => {
    if (!activeCoupon) return
    const showTimer = setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => clearTimeout(showTimer)
  }, [activeCoupon])

  useEffect(() => {
    if (!visible) return
    const hideTimer = setTimeout(() => setVisible(false), VISIBLE_DURATION_MS)
    return () => clearTimeout(hideTimer)
  }, [visible])

  const dismiss = () => setVisible(false)

  if (!visible || !activeCoupon) return null

  const discountText =
    activeCoupon.discount_type === 'percent'
      ? `${activeCoupon.discount_value}% off`
      : `₹${activeCoupon.discount_value} off`

  return (
    <div className="fixed bottom-36 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-surface p-4 text-center shadow-xl">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close"
        className="absolute right-3 top-2 text-gray-500 hover:text-white"
      >
        ✕
      </button>
      <h2 className="text-lg font-semibold text-white">Get {discountText}</h2>
      <p className="mt-2 text-sm text-gray-400">
        {activeCoupon.description || (
          <>
            Use code {activeCoupon.code} at checkout
            {activeCoupon.min_order_value ? ` on orders above ₹${activeCoupon.min_order_value}` : ''}.
          </>
        )}
      </p>
    </div>
  )
}
