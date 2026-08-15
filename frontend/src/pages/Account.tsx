import { Link } from 'react-router-dom'
import { AuthForm } from '../components/auth/AuthForm'
import { useAuth } from '../hooks/useAuth'
import { ProximityHeading } from '../components/text/ProximityHeading'
import { ArrowIcon } from '../components/ui/ArrowIcon'

export function Account() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-sm p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <ProximityHeading as="h1" className="text-2xl font-semibold text-white">
          Account
        </ProximityHeading>
        {user && (
          <span className="rounded-full border border-white/10 bg-black px-4 py-1.5 text-xs text-gray-300">
            Signed in as {user.user_metadata.full_name ?? user.email}
          </span>
        )}
      </div>
      <AuthForm />
      {user && (
        <div className="mt-4 flex flex-col gap-3">
          <Link to="/orders" className="brutal-btn w-full">
            <span>View order history</span>
            <ArrowIcon />
          </Link>
          <Link to="/addresses" className="brutal-btn w-full">
            <span>Manage saved addresses</span>
            <ArrowIcon />
          </Link>
        </div>
      )}
    </div>
  )
}
