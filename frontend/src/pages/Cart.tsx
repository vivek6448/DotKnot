import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { ArrowIcon } from '../components/ui/ArrowIcon'
import { ProximityHeading } from '../components/text/ProximityHeading'

export function Cart() {
  const { lines, subtotal, isLoading, updateQuantity, removeFromCart } = useCart()

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

  return (
    <div className="mx-auto max-w-2xl p-4">
      <ProximityHeading as="h1" className="mb-6 text-2xl font-semibold text-white">
        Your Cart
      </ProximityHeading>

      <div className="divide-y divide-white/10">
        {lines.map((line) => (
          <div key={line.variant_id} className="flex items-center gap-4 py-4">
            <Link
              to={line.product_slug ? `/products/${line.product_slug}` : '#'}
              className="flex flex-1 items-center gap-4"
            >
              {line.image_url && (
                <img src={line.image_url} alt={line.product_name} className="h-20 w-16 rounded object-cover" />
              )}
              <div className="flex-1">
                <p className="font-medium text-white hover:text-accent-soft">{line.product_name}</p>
                <p className="text-sm text-gray-500">{line.sku}</p>
                <p className="text-sm text-gray-300">₹{line.price}</p>
              </div>
            </Link>
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
        <p className="text-lg font-medium text-white">Total: ₹{subtotal}</p>
        <Link to="/checkout" className="brutal-btn">
          <span>Checkout</span>
          <ArrowIcon />
        </Link>
      </div>
    </div>
  )
}
