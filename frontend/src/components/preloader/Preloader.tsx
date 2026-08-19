import { useEffect, useLayoutEffect, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'

interface PreloaderProps {
  onDone: () => void
}

function getPrefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

export function Preloader({ onDone }: PreloaderProps) {
  const [prefersReducedMotion] = useState(getPrefersReducedMotion)
  const [visible, setVisible] = useState(true)
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))
  const dividerColor = useTransform(count, [0, 100], ['#6b7280', '#e2452b'])

  // Checked synchronously (before paint) so a reduced-motion user never sees
  // the overlay flash in before it's dismissed.
  useLayoutEffect(() => {
    if (prefersReducedMotion) onDone()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    document.body.style.overflow = 'hidden'
    let cancelled = false

    const finish = () => {
      animate(count, 100, { duration: 1, ease: 'easeOut' }).then(() => {
        if (cancelled) return
        setTimeout(() => {
          if (cancelled) return
          // The AnimatePresence child unmounts on exit, but this component
          // itself stays mounted — its effect cleanup won't fire, so the
          // overflow lock has to be released here explicitly.
          document.body.style.overflow = ''
          setVisible(false)
        }, 900)
      })
    }

    const alreadyLoaded = document.readyState === 'complete'
    const rampTarget = alreadyLoaded ? 96 : 90
    const rampDuration = alreadyLoaded ? 1.2 : 4.2
    const rampControls = animate(count, rampTarget, { duration: rampDuration, ease: 'easeOut' })

    if (alreadyLoaded) {
      rampControls.then(finish)
      return () => {
        cancelled = true
        document.body.style.overflow = ''
      }
    }

    const handleLoad = () => {
      rampControls.stop()
      finish()
    }
    window.addEventListener('load', handleLoad)

    return () => {
      cancelled = true
      window.removeEventListener('load', handleLoad)
      document.body.style.overflow = ''
    }
  }, [prefersReducedMotion, count])

  if (prefersReducedMotion) return null

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img src="/dotknot-logo-full.webp" alt="DotKnot" className="mb-0 w-72 sm:w-96 md:w-[32rem]" />
          <motion.span className="-mt-20 text-6xl font-bold tabular-nums text-white sm:-mt-28 sm:text-7xl md:-mt-36 md:text-8xl">
            {rounded}
          </motion.span>
          <motion.div className="mt-6 h-px w-40 sm:w-56" style={{ backgroundColor: dividerColor }} />
          <div aria-hidden="true" className="h-20 sm:h-28 md:h-36" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
