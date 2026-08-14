import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-surface px-4 py-8 text-sm text-gray-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:justify-between">
        <div>
          <p className="font-semibold text-white">DotKnot</p>
          <p className="mt-1">Everyday apparel, shipped across India.</p>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-white">Policies</p>
          <Link to="/policies/shipping" className="hover:text-accent-soft hover:underline">
            Shipping
          </Link>
          <Link to="/policies/refunds" className="hover:text-accent-soft hover:underline">
            Refunds &amp; Cancellations
          </Link>
          <Link to="/policies/terms" className="hover:text-accent-soft hover:underline">
            Terms &amp; Conditions
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-white">Company</p>
          <Link to="/about" className="hover:text-accent-soft hover:underline">
            About
          </Link>
          <Link to="/contact" className="hover:text-accent-soft hover:underline">
            Contact
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          <p className="font-medium text-white">Follow us</p>
          <a
            href="https://wa.me/918437526383"
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent-soft hover:underline"
          >
            WhatsApp
          </a>
          <a
            href="https://www.instagram.com/dotknot.rckkon/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-accent-soft hover:underline"
          >
            Instagram
          </a>
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-6xl border-t border-white/10 pt-4 text-xs text-gray-500">
        © {new Date().getFullYear()} DotKnot. All rights reserved.
      </p>
    </footer>
  )
}
