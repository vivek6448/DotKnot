import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { ProximityHeading } from '../components/text/ProximityHeading'
import { ArrowIcon } from '../components/ui/ArrowIcon'

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Pending payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export function OrderHistory() {
  const { user, loading: authLoading } = useAuth()

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  if (authLoading) return null

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-300">
        <p>Sign in to see your order history.</p>
        <Link to="/account" className="brutal-btn mt-4">
          <span>Sign in</span>
          <ArrowIcon />
        </Link>
      </div>
    )
  }

  if (isLoading) return <p className="p-8 text-center text-gray-400">Loading orders…</p>

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center text-gray-300">
        <p>You haven't placed any orders yet.</p>
        <Link to="/products" className="brutal-btn mt-4">
          <span>Browse products</span>
          <ArrowIcon />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <ProximityHeading as="h1" className="mb-6 text-2xl font-semibold text-white">
        Order History
      </ProximityHeading>
      <div className="divide-y divide-white/10 border-t border-white/10">
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="flex items-center justify-between py-4 text-sm text-gray-200 hover:bg-white/5"
          >
            <div>
              <p className="font-medium text-white">Order #{order.id.slice(0, 8)}</p>
              <p className="text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p>{STATUS_LABEL[order.status] ?? order.status}</p>
              <p className="text-gray-500">₹{order.total}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
