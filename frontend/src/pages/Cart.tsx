import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabaseClient'
import { ArrowIcon } from '../components/ui/ArrowIcon'
import { ProximityHeading } from '../components/text/ProximityHeading'

interface CouponResult {
  code: string
  discount_amount: number
}

export function Cart() {
  const { user } = useAuth()
  const { lines, subtotal, isLoading, updateQuantity, removeFromCart } = useCart()
  const [couponInput, setCouponInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null)

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    setApplying(true)
    setCouponError(null)

    const { data, error } = await supabase.functions.invoke('apply-coupon', {
      body: { code: couponInput.trim() },
    })

    if (error || !data) {
      setCouponError('Invalid or expired coupon')
      setAppliedCoupon(null)
      toast.error('Invalid or expired coupon')
    } else {
      setAppliedCoupon({ code: data.code, discount_amount: data.discount_amount })
      toast.success(`Coupon ${data.code} applied`)
    }

    setApplying(false)
  }

  if (isLoading) return <p className="p-8 text-center text-gray-400">Loading cart…</p>

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center p-8 text-center text-gray-300">
        <img src="/empty-cart.png" alt="" className="w-48 sm:w-56" />
        <p className="mt-4">Your cart is empty.</p>
        <Link to="/" className="brutal-btn mt-4">
          <span>Continue shopping</span>
          <ArrowIcon />
        </Link>
      </div>
    )
  }

  const total = subtotal - (appliedCoupon?.discount_amount ?? 0)

  return (
    <div className="mx-auto max-w-2xl p-4">
      <ProximityHeading as="h1" className="mb-6 text-2xl font-semibold text-white">
        Your Cart
      </ProximityHeading>

      <div className="divide-y divide-white/10">
        {lines.map((line) => (
          <div key={line.variant_id} className="flex items-center gap-4 py-4">
            {line.image_url && (
              <img src={line.image_url} alt={line.product_name} className="h-20 w-16 rounded object-cover" />
            )}
            <div className="flex-1">
              <p className="font-medium text-white">{line.product_name}</p>
              <p className="text-sm text-gray-500">{line.sku}</p>
              <p className="text-sm text-gray-300">₹{line.price}</p>
            </div>
            <input
              type="number"
              min={1}
              value={line.quantity}
              onChange={(event) => updateQuantity(line.variant_id, Number(event.target.value))}
              className="w-16 rounded border border-white/15 bg-surface px-2 py-1 text-center text-white focus:border-accent focus:outline-none"
            />
            <button type="button" onClick={() => removeFromCart(line.variant_id)} className="brutal-btn">
              <span>Remove</span>
              <ArrowIcon />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
        <p className="text-lg font-medium text-white">Total: ₹{total}</p>
        <Link to="/checkout" className="brutal-btn">
          <span>Checkout</span>
          <ArrowIcon />
        </Link>
      </div>

      <div className="fixed bottom-4 left-4 z-40 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-white/15 bg-surface p-4 shadow-lg">
        <p className="mb-2 text-sm font-medium text-white">Have a coupon?</p>
        {user ? (
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
              onClick={handleApplyCoupon}
              disabled={applying}
              className="rounded border border-white/15 px-4 py-2 text-sm text-gray-200 hover:border-accent hover:text-white disabled:opacity-40"
            >
              {applying ? 'Applying…' : 'Apply'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            <Link to="/account" className="text-accent-soft underline">
              Sign in
            </Link>{' '}
            to apply a coupon.
          </p>
        )}
        {couponError && <p className="mt-1 text-sm text-red-400">{couponError}</p>}
        {appliedCoupon && (
          <p className="mt-1 text-sm text-green-400">
            Coupon {appliedCoupon.code} applied — -₹{appliedCoupon.discount_amount}
          </p>
        )}
      </div>
    </div>
  )
}
