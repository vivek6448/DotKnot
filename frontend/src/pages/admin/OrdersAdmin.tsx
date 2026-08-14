import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabaseClient'

const STATUS_OPTIONS = ['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

const inputClass = 'rounded border border-white/15 bg-surface px-2 py-1 text-sm text-white focus:border-accent focus:outline-none'

export function OrdersAdmin() {
  const queryClient = useQueryClient()

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, status, total, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const handleUpdateStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
  }

  const paidOrders = orders?.filter((o) => o.status !== 'pending_payment' && o.status !== 'cancelled') ?? []
  const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0)

  return (
    <div>
      <div className="mb-6 flex gap-8 text-sm text-gray-300">
        <div>
          <p className="text-2xl font-semibold text-white">{orders?.length ?? 0}</p>
          <p className="text-gray-500">Total orders</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">₹{revenue}</p>
          <p className="text-gray-500">Revenue (excl. pending/cancelled)</p>
        </div>
      </div>

      <div className="divide-y divide-white/10 border-t border-white/10">
        {orders?.map((order) => (
          <div key={order.id} className="flex items-center justify-between py-3 text-sm">
            <div>
              <p className="font-medium text-white">Order #{order.id.slice(0, 8)}</p>
              <p className="text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-300">₹{order.total}</span>
              <select
                value={order.status}
                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                className={inputClass}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
