import { useEffect, useState } from 'react'
import { useSetting } from '../../hooks/useSetting'

const DISMISSED_KEY = 'dotknot_promo_dismissed'

interface PromoSettings {
  enabled?: boolean
  title?: string
  text?: string
}

export function PromoPopup() {
  const [visible, setVisible] = useState(false)
  const { data } = useSetting<PromoSettings>('promo_popup')

  useEffect(() => {
    if (!data?.enabled) return
    if (sessionStorage.getItem(DISMISSED_KEY)) return
    const timer = setTimeout(() => setVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [data])

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem(DISMISSED_KEY, '1')
  }

  if (!visible || !data?.enabled) return null

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-white/10 bg-surface p-4 text-center shadow-xl">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close"
        className="absolute right-3 top-2 text-gray-500 hover:text-white"
      >
        ✕
      </button>
      <h2 className="text-lg font-semibold text-white">{data.title ?? 'Special offer'}</h2>
      <p className="mt-2 text-sm text-gray-400">{data.text}</p>
    </div>
  )
}
