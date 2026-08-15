import { ArrowIcon } from '../ui/ArrowIcon'

interface Address {
  id: string
  line1: string
  line2: string | null
  city: string
  state: string
  pincode: string
  phone: string
}

interface AddressListProps {
  addresses: Address[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
}

export function AddressList({ addresses, selectedId, onSelect, onDelete }: AddressListProps) {
  return (
    <div className="space-y-2">
      {addresses.map((address) => (
        <div key={address.id} className="flex items-start gap-2 rounded border border-white/15 p-3">
          {onSelect && (
            <input
              type="radio"
              name="address"
              checked={selectedId === address.id}
              onChange={() => onSelect(address.id)}
              className="accent-accent"
            />
          )}
          <span className="flex-1 text-sm text-gray-300">
            {address.line1}, {address.line2 ? `${address.line2}, ` : ''}
            {address.city}, {address.state} {address.pincode} · {address.phone}
          </span>
          {onDelete && (
            <button type="button" onClick={() => onDelete(address.id)} className="brutal-btn">
              <span>Delete</span>
              <ArrowIcon />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
