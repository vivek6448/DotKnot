import { lazy, Suspense, useMemo } from 'react'
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

const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })))
const ProductListing = lazy(() => import('./pages/ProductListing').then((m) => ({ default: m.ProductListing })))
const ProductDetail = lazy(() => import('./pages/ProductDetail').then((m) => ({ default: m.ProductDetail })))
const Cart = lazy(() => import('./pages/Cart').then((m) => ({ default: m.Cart })))
const Checkout = lazy(() => import('./pages/Checkout').then((m) => ({ default: m.Checkout })))
const OrderStatus = lazy(() => import('./pages/OrderStatus').then((m) => ({ default: m.OrderStatus })))
const OrderHistory = lazy(() => import('./pages/OrderHistory').then((m) => ({ default: m.OrderHistory })))
const Account = lazy(() => import('./pages/Account').then((m) => ({ default: m.Account })))
const Addresses = lazy(() => import('./pages/Addresses').then((m) => ({ default: m.Addresses })))
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })))
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })))
const Shipping = lazy(() => import('./pages/policies/Shipping').then((m) => ({ default: m.Shipping })))
const Refunds = lazy(() => import('./pages/policies/Refunds').then((m) => ({ default: m.Refunds })))
const Terms = lazy(() => import('./pages/policies/Terms').then((m) => ({ default: m.Terms })))
const SizeGuide = lazy(() => import('./pages/policies/SizeGuide').then((m) => ({ default: m.SizeGuide })))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })))
const HomeAdmin = lazy(() => import('./pages/admin/HomeAdmin').then((m) => ({ default: m.HomeAdmin })))
const ProductsAdmin = lazy(() => import('./pages/admin/ProductsAdmin').then((m) => ({ default: m.ProductsAdmin })))
const CategoriesAdmin = lazy(() =>
  import('./pages/admin/CategoriesAdmin').then((m) => ({ default: m.CategoriesAdmin })),
)
const CouponsAdmin = lazy(() => import('./pages/admin/CouponsAdmin').then((m) => ({ default: m.CouponsAdmin })))
const OrdersAdmin = lazy(() => import('./pages/admin/OrdersAdmin').then((m) => ({ default: m.OrdersAdmin })))

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
          logo="/dotknot-logo.webp"
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
          logoUrl="/dotknot-logo.webp"
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
        <Suspense fallback={<p className="p-8 text-center text-gray-400">Loading…</p>}>
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
        </Suspense>
      </main>

      <Footer />
      <SocialFloatButtons />
      <PromoPopup />
    </div>
  )
}

export default App
