import { Link } from 'react-router-dom'
import { AuthForm } from '../components/auth/AuthForm'
import { useAuth } from '../hooks/useAuth'

export function Account() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-sm p-4">
      <h1 className="mb-4 text-2xl font-semibold text-white">Account</h1>
      <AuthForm />
      {user && (
        <div className="mt-4 flex flex-col gap-2 text-center text-sm">
          <Link to="/orders" className="text-accent-soft underline">
            View order history
          </Link>
          <Link to="/addresses" className="text-accent-soft underline">
            Manage saved addresses
          </Link>
        </div>
      )}
    </div>
  )
}
