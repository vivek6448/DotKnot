import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export function OrderStatus() {
  const { id } = useParams<{ id: string }>()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id!).single()
      if (error) throw error
      return data
    },
    enabled: !!id,
    refetchInterval: (query) => (query.state.data?.status === 'pending_payment' ? 3000 : false),
  })

  const { data: items } = useQuery({
    queryKey: ['order-items', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('order_items').select('*').eq('order_id', id!)
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  if (isLoading || !order) return <p className="p-8 text-center text-gray-400">Loading order…</p>

  return (
    <div className="mx-auto max-w-md p-8">
      <div className="text-center">
        <h1 className="mb-2 text-2xl font-semibold text-white">
          {order.status === 'paid' ? 'Order Confirmed' : 'Order Received'}
        </h1>
        <p className="text-gray-400">Status: {order.status}</p>
        {order.status === 'pending_payment' && (
          <p className="mt-2 text-sm text-gray-500">Waiting for payment confirmation…</p>
        )}
      </div>

      <div className="mt-6 divide-y divide-white/10 border-t border-white/10">
        {items?.map((item) => (
          <div key={item.id} className="flex justify-between py-3 text-sm text-gray-200">
            <div>
              <p className="font-medium text-white">{item.product_name_snapshot}</p>
              <p className="text-gray-500">
                {item.variant_label_snapshot} × {item.quantity}
              </p>
            </div>
            <p>₹{item.unit_price * item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 border-t border-white/10 pt-4 text-sm text-gray-200">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>₹{order.subtotal}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-400">
            <span>Discount</span>
            <span>-₹{order.discount}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>₹{order.shipping_fee}</span>
        </div>
        <div className="flex justify-between text-base font-medium text-white">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
      </div>

      <Link to="/orders" className="mt-6 block text-center text-sm text-accent-soft underline">
        View all orders
      </Link>
    </div>
  )
}
