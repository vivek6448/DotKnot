import { useMemo } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import PillNav from './components/layout/PillNav'
import { AnnouncementBar } from './components/layout/AnnouncementBar'
import { Footer } from './components/layout/Footer'
import { PromoPopup } from './components/layout/PromoPopup'
import { SocialFloatButtons } from './components/layout/SocialFloatButtons'
import { useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'
import { useIsAdmin } from './hooks/useIsAdmin'
import { Home } from './pages/Home'
import { ProductListing } from './pages/ProductListing'
import { ProductDetail } from './pages/ProductDetail'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { OrderStatus } from './pages/OrderStatus'
import { OrderHistory } from './pages/OrderHistory'
import { Account } from './pages/Account'
import { Addresses } from './pages/Addresses'
import { About } from './pages/About'
import { Contact } from './pages/Contact'
import { Shipping } from './pages/policies/Shipping'
import { Refunds } from './pages/policies/Refunds'
import { Terms } from './pages/policies/Terms'
import { AdminLayout } from './pages/admin/AdminLayout'
import { HomeAdmin } from './pages/admin/HomeAdmin'
import { ProductsAdmin } from './pages/admin/ProductsAdmin'
import { CategoriesAdmin } from './pages/admin/CategoriesAdmin'
import { CouponsAdmin } from './pages/admin/CouponsAdmin'
import { OrdersAdmin } from './pages/admin/OrdersAdmin'

function App() {
  const { user } = useAuth()
  const { itemCount } = useCart()
  const { isAdmin } = useIsAdmin()
  const location = useLocation()

  const navItems = useMemo(
    () => [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Contact', href: '/contact' },
      { label: 'About', href: '/about' },
      { label: `Cart (${itemCount})`, href: '/cart' },
      { label: user ? 'Account' : 'Sign in', href: '/account' },
      ...(isAdmin ? [{ label: 'Admin', href: '/admin/products' }] : []),
    ],
    [itemCount, user, isAdmin],
  )

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />

      <div className="relative h-20">
        <PillNav
          logo="/dotknot-logo.png"
          logoAlt="DotKnot"
          items={navItems}
          activeHref={location.pathname}
          baseColor="#0d0d10"
          pillColor="#151517"
          pillTextColor="#e5e5e5"
          hoveredPillTextColor="#e2452b"
        />
      </div>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/orders/:id" element={<OrderStatus />} />
          <Route path="/account" element={<Account />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policies/shipping" element={<Shipping />} />
          <Route path="/policies/refunds" element={<Refunds />} />
          <Route path="/policies/terms" element={<Terms />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="home" element={<HomeAdmin />} />
            <Route path="products" element={<ProductsAdmin />} />
            <Route path="categories" element={<CategoriesAdmin />} />
            <Route path="coupons" element={<CouponsAdmin />} />
            <Route path="orders" element={<OrdersAdmin />} />
          </Route>
        </Routes>
      </main>

      <Footer />
      <SocialFloatButtons />
      <PromoPopup />
    </div>
  )
}

export default App
