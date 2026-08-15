import { WhatsAppIcon, InstagramIcon } from '../ui/icons'

export const WHATSAPP_URL = 'https://wa.me/918437526383'
export const INSTAGRAM_URL = 'https://www.instagram.com/dotknot.rckkon/'

export function SocialFloatButtons() {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-3">
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600"
      >
        <WhatsAppIcon className="h-6 w-6" />
      </a>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Follow on Instagram"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white shadow-lg"
      >
        <InstagramIcon className="h-6 w-6" />
      </a>
    </div>
  )
}
