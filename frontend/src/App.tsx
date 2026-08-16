import { useMemo } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Toaster } from 'sonner'
import PillNav from './components/layout/PillNav'
import { StaggeredMenu } from './components/layout/StaggeredMenu'
import { AnnouncementBar } from './components/layout/AnnouncementBar'
import { ScrollToTop } from './components/layout/ScrollToTop'
import { Footer } from './components/layout/Footer'
import { PromoPopup } from './components/layout/PromoPopup'
import { SocialFloatButtons, WHATSAPP_URL, INSTAGRAM_URL } from './components/layout/SocialFloatButtons'
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
import { SizeGuide } from './pages/policies/SizeGuide'
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
      <ScrollToTop />
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#151517',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#e5e5e5',
          },
        }}
      />
      <AnnouncementBar />

      <div className="sticky top-0 z-40 hidden h-20 md:block">
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

      <div className="sticky top-0 z-40 md:hidden">
        <StaggeredMenu
          position="right"
          items={navItems.filter((item) => item.href !== '/cart').map((item) => ({ label: item.label, link: item.href }))}
          socialItems={[
            { label: 'WhatsApp', link: WHATSAPP_URL },
            { label: 'Instagram', link: INSTAGRAM_URL },
          ]}
          displaySocials
          displayItemNumbering
          logoUrl="/dotknot-logo.png"
          logoAlt="DotKnot"
          menuButtonColor="#fff"
          openMenuButtonColor="#fff"
          accentColor="#e2452b"
          colors={['#ff7a5c', '#e2452b']}
          cartHref="/cart"
          cartCount={itemCount}
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
          <Route path="/policies/size-guide" element={<SizeGuide />} />
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
