import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useIsAdmin } from '../../hooks/useIsAdmin'
import { ArrowIcon } from '../../components/ui/ArrowIcon'

const TABS = [
  { label: 'Home', href: '/admin/home' },
  { label: 'Products', href: '/admin/products' },
  { label: 'Categories', href: '/admin/categories' },
  { label: 'Coupons', href: '/admin/coupons' },
  { label: 'Orders', href: '/admin/orders' },
]

export function AdminLayout() {
  const { user, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useIsAdmin()
  const location = useLocation()

  if (authLoading || adminLoading) return null

  if (!user || !isAdmin) {
    return <p className="p-8 text-center text-gray-400">You don't have access to this page.</p>
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <h1 className="mb-6 text-2xl font-semibold text-white">Admin</h1>
      <nav className="mb-6 flex flex-wrap gap-3 border-b border-white/10 pb-6">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            to={tab.href}
            className="brutal-btn brutal-btn--compact"
            style={
              location.pathname.startsWith(tab.href)
                ? ({ ['--brutal-shadow']: 'var(--color-accent)' } as React.CSSProperties)
                : undefined
            }
          >
            <span>{tab.label}</span>
            <ArrowIcon />
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
