import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'

export function useSetting<T>(key: string) {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('value').eq('key', key).maybeSingle()
      if (error) throw error
      return (data?.value as T) ?? null
    },
  })
}
