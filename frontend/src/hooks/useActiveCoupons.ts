import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export interface ActiveCoupon {
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  min_order_value: number | null
  expires_at: string | null
  description: string | null
}

export function useActiveCoupons() {
  return useQuery({
    queryKey: ['active-coupons'],
    queryFn: async (): Promise<ActiveCoupon[]> => {
      const { data, error } = await supabase.functions.invoke('active-coupons')
      if (error) throw error
      return data?.coupons ?? []
    },
  })
}
