import { useRef } from 'react'
import { WHATSAPP_URL, INSTAGRAM_URL } from '../components/layout/SocialFloatButtons'
import { EmailIcon, WhatsAppIcon, InstagramIcon } from '../components/ui/icons'
import VariableProximity from '../components/text/VariableProximity'

const CONTACT_EMAIL = 'dotknothelp@gmail.com'

export function Contact() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  return (
    <div className="relative overflow-hidden px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-[600px]">
        <div className="flex justify-center">
          <div className="inline-block rounded-full border border-white/10 bg-black px-8 py-3 shadow-lg sm:px-10 sm:py-4">
            <h1 ref={headingRef} className="text-center text-2xl font-bold sm:text-3xl">
              <VariableProximity
                label="Get in Touch with "
                className="text-white"
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 900, 'opsz' 40"
                containerRef={headingRef}
                radius={140}
                falloff="linear"
              />
              <VariableProximity
                label="Us"
                className="text-accent"
                fromFontVariationSettings="'wght' 400, 'opsz' 9"
                toFontVariationSettings="'wght' 900, 'opsz' 40"
                containerRef={headingRef}
                radius={140}
                falloff="linear"
              />
            </h1>
          </div>
        </div>

        <div className="mt-10 rounded-[20px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10">
          <p className="text-sm text-gray-400">Reach out and we&apos;ll get back to you within a day.</p>

          <ul className="mt-6 space-y-5 text-left">
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
      </div>
    </div>
  )
}
