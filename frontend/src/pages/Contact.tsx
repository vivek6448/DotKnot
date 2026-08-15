import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { WHATSAPP_URL, INSTAGRAM_URL } from '../components/layout/SocialFloatButtons'
import { EmailIcon, WhatsAppIcon, InstagramIcon, SendIcon } from '../components/ui/icons'

const CONTACT_EMAIL = 'hello@dotknot.in'

const inputClass =
  'w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-accent focus:outline-none'

export function Contact() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const subject = encodeURIComponent(`Message from ${name || 'website visitor'}`)
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    toast.success('Opening your email app…')
  }

  return (
    <div className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-[1000px]">
        <div className="flex justify-center">
          <div className="inline-block rounded-full border border-white/10 bg-black px-8 py-3 shadow-lg sm:px-10 sm:py-4">
            <h1 className="text-center text-2xl font-bold sm:text-3xl">
              <span className="text-white">Get in Touch with </span>
              <span className="text-accent">DotKnot</span>
            </h1>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 rounded-[20px] border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl sm:grid-cols-2 sm:gap-12 sm:p-10">
          <div>
            <h2 className="text-xl font-bold text-white">Contact Info</h2>
            <p className="mt-1 text-sm text-gray-400">Reach out and we&apos;ll get back to you within a day.</p>

            <ul className="mt-6 space-y-5">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 text-accent">
                  <EmailIcon />
                </span>
                <p>
                  <span className="font-bold text-accent">Email: </span>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-gray-300 hover:text-white">
                    {CONTACT_EMAIL}
                  </a>
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 text-accent">
                  <WhatsAppIcon />
                </span>
                <p>
                  <span className="font-bold text-accent">WhatsApp: </span>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white">
                    +91 84375 26383
                  </a>
                </p>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 text-accent">
                  <InstagramIcon />
                </span>
                <p>
                  <span className="font-bold text-accent">Instagram: </span>
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-gray-300 hover:text-white">
                    @dotknot.rckkon
                  </a>
                </p>
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-200">Your Name</span>
              <input
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="John Doe"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-200">Email Address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-gray-200">Your Message</span>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Tell us what's up..."
                className={`${inputClass} resize-none`}
              />
            </label>

            <button
              type="submit"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 font-bold text-white transition hover:bg-accent-soft"
            >
              Send Message
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
