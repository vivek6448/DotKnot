import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuth()

  const query = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data.is_admin
    },
    enabled: !!user,
  })

  return {
    isAdmin: query.data ?? false,
    loading: authLoading || (!!user && query.isLoading),
  }
}
