import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { ArrowIcon } from '../ui/ArrowIcon'

const addressSchema = z.object({
  line1: z.string().min(1, 'Required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'Required'),
  state: z.string().min(1, 'Required'),
  pincode: z.string().min(4, 'Required'),
  phone: z.string().min(7, 'Required'),
})

type AddressFormValues = z.infer<typeof addressSchema>

interface AddressFormProps {
  onSaved: (addressId: string) => void
}

const inputClass =
  'w-full rounded border border-white/15 bg-surface px-2 py-1 text-white placeholder:text-gray-500 focus:border-accent focus:outline-none'

export function AddressForm({ onSaved }: AddressFormProps) {
  const { user } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({ resolver: zodResolver(addressSchema) })

  const onSubmit = async (form: AddressFormValues) => {
    if (!user) return
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...form, user_id: user.id })
      .select('id')
      .single()

    if (!error && data) {
      reset()
      onSaved(data.id)
      toast.success('Address saved')
    } else {
      toast.error('Failed to save address')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 rounded border border-white/10 p-3">
      <p className="text-sm font-medium text-gray-200">Add a new address</p>
      <input {...register('line1')} placeholder="Address line 1" className={inputClass} />
      {errors.line1 && <p className="text-xs text-red-400">{errors.line1.message}</p>}
      <input {...register('line2')} placeholder="Address line 2 (optional)" className={inputClass} />
      <div className="flex gap-2">
        <input {...register('city')} placeholder="City" className={inputClass} />
        <input {...register('state')} placeholder="State" className={inputClass} />
      </div>
      <div className="flex gap-2">
        <input {...register('pincode')} placeholder="Pincode" inputMode="numeric" className={inputClass} />
        <input {...register('phone')} placeholder="Phone" type="tel" inputMode="tel" className={inputClass} />
      </div>
      <button type="submit" disabled={isSubmitting} className="brutal-btn">
        <span>Save address</span>
        <ArrowIcon />
      </button>
    </form>
  )
}
