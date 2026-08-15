import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'
import { PasswordInput } from '../ui/PasswordInput'
import { ArrowIcon } from '../ui/ArrowIcon'

export function AuthForm() {
  const { user, loading, signUpWithEmail, signInWithEmail, signOut } = useAuth()
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return null
  }

  if (user) {
    return (
      <button
        type="button"
        onClick={async () => {
          await signOut()
          toast.success('Signed out')
        }}
        className="brutal-btn w-full"
      >
        <span>Sign out</span>
        <ArrowIcon />
      </button>
    )
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setInfo(null)

    if (mode === 'sign-up') {
      const { data, error } = await signUpWithEmail(email, password, name)
      if (error) {
        setError(error.message)
        toast.error(error.message)
      } else if (!data.session) {
        const message = 'Check your email to confirm your account before signing in.'
        setInfo(message)
        toast.success(message)
      } else {
        toast.success('Account created')
      }
    } else {
      const { error } = await signInWithEmail(email, password)
      if (error) {
        setError(error.message)
        toast.error(error.message)
      } else {
        toast.success('Signed in')
      }
    }

    setSubmitting(false)
  }

  const inputClass =
    'w-full rounded border border-white/15 bg-surface px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-accent focus:outline-none'

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      {mode === 'sign-up' && (
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className={inputClass}
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        className={inputClass}
      />
      <PasswordInput
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={6}
        required
        className={inputClass}
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      {info && <p className="text-sm text-green-400">{info}</p>}
      <button type="submit" disabled={submitting} className="brutal-btn w-full">
        <span>{mode === 'sign-up' ? 'Sign up' : 'Sign in'}</span>
        <ArrowIcon />
      </button>
      <button
        type="button"
        onClick={() => setMode(mode === 'sign-up' ? 'sign-in' : 'sign-up')}
        className="w-full text-center text-sm text-accent-soft underline"
      >
        {mode === 'sign-up' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
    </form>
  )
}
