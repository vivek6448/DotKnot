import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { AuthForm } from '../components/auth/AuthForm'
import { AddressForm } from '../components/address/AddressForm'
import { AddressList } from '../components/address/AddressList'
import { loadRazorpayScript } from '../lib/razorpay'
import { ArrowIcon } from '../components/ui/ArrowIcon'
import { ProximityHeading } from '../components/text/ProximityHeading'

export function Checkout() {
  const { user } = useAuth()
  const { lines, subtotal } = useCart()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [discount, setDiscount] = useState(0)

  // A coupon may already be attached to the cart from the Cart page — reapply
  // it (idempotent) so the total shown here matches what create-razorpay-order
  // will actually charge.
  useEffect(() => {
    if (!user) return
    supabase
      .from('carts')
      .select('coupon_code')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data: cart }) => {
        if (!cart?.coupon_code) return
        supabase.functions
          .invoke('apply-coupon', { body: { code: cart.coupon_code } })
          .then(({ data }) => {
            if (data) setDiscount(data.discount_amount)
          })
      })
  }, [user])

  const { data: addresses } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('addresses').select('*').eq('user_id', user!.id)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const handleAddressSaved = (addressId: string) => {
    setSelectedAddressId(addressId)
    queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] })
  }

  const handlePay = async () => {
    if (!selectedAddressId) {
      setError('Select or add an address first')
      toast.error('Select or add an address first')
      return
    }
    setPaying(true)
    setError(null)

    const { data, error: fnError } = await supabase.functions.invoke('create-razorpay-order', {
      body: { address_id: selectedAddressId },
    })

    if (fnError || !data) {
      setError('Failed to start checkout')
      toast.error('Failed to start checkout')
      setPaying(false)
      return
    }

    await loadRazorpayScript()

    const razorpay = new window.Razorpay({
      key: data.key_id,
      amount: data.amount,
      currency: data.currency,
      order_id: data.razorpay_order_id,
      name: 'DotKnot',
      handler: () => {
        toast.success('Payment successful')
        navigate(`/orders/${data.order_id}`)
      },
      modal: { ondismiss: () => setPaying(false) },
    })

    razorpay.open()
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-sm p-4">
        <p className="mb-4 text-center text-gray-300">Sign in to checkout.</p>
        <AuthForm />
      </div>
    )
  }

  if (lines.length === 0) {
    return <p className="p-8 text-center text-gray-400">Your cart is empty.</p>
  }

  return (
    <div className="mx-auto max-w-xl p-4">
      <ProximityHeading as="h1" className="mb-6 text-2xl font-semibold text-white">
        Checkout
      </ProximityHeading>

      <section className="mb-6">
        <h2 className="mb-2 font-medium text-gray-200">Shipping address</h2>
        {addresses && addresses.length > 0 && (
          <div className="mb-4">
            <AddressList
              addresses={addresses}
              selectedId={selectedAddressId}
              onSelect={setSelectedAddressId}
            />
          </div>
        )}
        <AddressForm onSaved={handleAddressSaved} />
      </section>

      {discount > 0 && <p className="mb-1 text-sm text-green-400">Coupon discount: -₹{discount}</p>}
      <p className="mb-4 text-lg font-medium text-white">Total: ₹{subtotal - discount}</p>

      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handlePay}
        disabled={paying || !selectedAddressId}
        className="brutal-btn w-full"
      >
        <span>{paying ? 'Processing…' : 'Pay with Razorpay'}</span>
        <ArrowIcon />
      </button>
    </div>
  )
}
