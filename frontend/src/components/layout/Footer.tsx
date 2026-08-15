import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { WHATSAPP_URL, INSTAGRAM_URL } from './SocialFloatButtons'
import { WhatsAppIcon, InstagramIcon } from '../ui/icons'

const CONTACT_EMAIL = 'hello@dotknot.in'

const CUSTOMER_SERVICE_LINKS = [
  { label: 'Contact Us', to: '/contact' },
  { label: 'Shipping', to: '/policies/shipping' },
  { label: 'Refunds & Cancellations', to: '/policies/refunds' },
  { label: 'Terms & Conditions', to: '/policies/terms' },
  { label: 'Size Guide', to: '/policies/size-guide' },
]

const SOCIAL_LINKS = [
  { label: 'WhatsApp', href: WHATSAPP_URL, Icon: WhatsAppIcon },
  { label: 'Instagram', href: INSTAGRAM_URL, Icon: InstagramIcon },
]

export function Footer() {
  const [subscribeEmail, setSubscribeEmail] = useState('')

  const handleSubscribe = (event: FormEvent) => {
    event.preventDefault()
    toast.success('Subscribed! Watch your inbox for drops and offers.')
    setSubscribeEmail('')
  }

  return (
    <footer className="mt-16 border-t border-white/10 px-4 py-12 text-sm text-gray-400">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-[2fr_1fr_1fr_1.3fr]">
        <div>
          <p className="text-xl font-bold text-accent">DotKnot</p>
          <p className="mt-1 text-gray-300">Embroidered basics, done properly.</p>
          <p className="mt-4 text-xs text-gray-500">{CONTACT_EMAIL}</p>
        </div>

        <div>
          <p className="font-bold text-white">Customer Service</p>
          <ul className="mt-3 space-y-2">
            {CUSTOMER_SERVICE_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-gray-400 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-bold text-white">Follow Us</p>
          <div className="mt-3 flex gap-3">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-gray-200"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <p className="font-bold text-white">Stay in the Loop</p>
          <p className="mt-1 text-xs text-gray-400">Get first access to new drops and offers.</p>
          <form onSubmit={handleSubscribe} className="mt-3 flex">
            <input
              type="email"
              required
              value={subscribeEmail}
              onChange={(event) => setSubscribeEmail(event.target.value)}
              placeholder="Your email"
              className="min-w-0 flex-1 rounded-l-full bg-white px-4 py-2 text-sm text-black placeholder:text-gray-500 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-r-full bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-soft"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} <span className="font-bold text-accent">DotKnot</span>. All rights reserved.
      </div>
    </footer>
  )
}
