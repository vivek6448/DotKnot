import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import { getGuestCart, clearGuestCart } from '../lib/guestCart'

async function mergeGuestCartIntoAccount(userId: string) {
  const guestItems = getGuestCart()
  if (guestItems.length === 0) return

  let { data: cart } = await supabase.from('carts').select('id').eq('user_id', userId).maybeSingle()

  if (!cart) {
    const { data: newCart } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select('id')
      .single()
    cart = newCart
  }
  if (!cart) return

  for (const item of guestItems) {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('variant_id', item.variant_id)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + item.quantity })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('cart_items')
        .insert({ cart_id: cart.id, variant_id: item.variant_id, quantity: item.quantity })
    }
  }

  clearGuestCart()
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)

      if (event === 'SIGNED_IN' && newSession) {
        mergeGuestCartIntoAccount(newSession.user.id)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signUpWithEmail = (email: string, password: string, name: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

  const signInWithEmail = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password })

  const signOut = () => supabase.auth.signOut()

  return {
    user: session?.user ?? null,
    session,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signOut,
  }
}
