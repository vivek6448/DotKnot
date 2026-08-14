// Before login, cart items live here instead of the `carts` table — RLS
// scopes cart rows to auth.uid(), which an anonymous request never has, so a
// guest can't own a DB row. Merged into the user's real cart on sign-in.
export interface GuestCartItem {
  variant_id: string
  quantity: number
}

const KEY = 'dotknot_guest_cart'

export function getGuestCart(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as GuestCartItem[]) : []
  } catch {
    return []
  }
}

export function setGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function clearGuestCart() {
  localStorage.removeItem(KEY)
}
