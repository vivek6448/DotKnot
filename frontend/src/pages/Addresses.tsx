import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '../lib/supabaseClient'
import { ProximityHeading } from '../components/text/ProximityHeading'
import { useAuth } from '../hooks/useAuth'
import { AddressForm } from '../components/address/AddressForm'
import { AddressList } from '../components/address/AddressList'
import { ArrowIcon } from '../components/ui/ArrowIcon'

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
    toast.success('Address removed')
  }

  if (authLoading) return null

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-300">
        <p>Sign in to manage your addresses.</p>
        <Link to="/account" className="brutal-btn mt-4">
          <span>Sign in</span>
          <ArrowIcon />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl p-4">
      <ProximityHeading as="h1" className="mb-6 text-2xl font-semibold text-white">
        Saved Addresses
      </ProximityHeading>

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
