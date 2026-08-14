import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { AddressForm } from '../components/address/AddressForm'
import { AddressList } from '../components/address/AddressList'

export function Addresses() {
  const { user, loading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('addresses').select('*').eq('user_id', user!.id)
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  const handleDelete = async (id: string) => {
    await supabase.from('addresses').delete().eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['addresses', user?.id] })
  }

  if (authLoading) return null

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-300">
        <p>Sign in to manage your addresses.</p>
        <Link to="/account" className="mt-2 inline-block text-accent-soft underline">
          Sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl p-4">
      <h1 className="mb-6 text-2xl font-semibold text-white">Saved Addresses</h1>

      {isLoading && <p className="text-gray-400">Loading…</p>}

      {addresses && addresses.length > 0 && (
        <div className="mb-6">
          <AddressList addresses={addresses} onDelete={handleDelete} />
        </div>
      )}

      <AddressForm onSaved={() => queryClient.invalidateQueries({ queryKey: ['addresses', user.id] })} />
    </div>
  )
}
