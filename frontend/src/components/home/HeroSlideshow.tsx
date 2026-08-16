import { useEffect, useRef, useState } from 'react'

interface HeroSlideshowProps {
  images: string[]
  pxPerSecond?: number
}

export function HeroSlideshow({ images, pxPerSecond = 70 }: HeroSlideshowProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [duration, setDuration] = useState(40)

  // The track renders two back-to-back copies of `images`, so translating by
  // exactly half its width (-50%) is one full loop and lines back up seamlessly.
  // Images finish downloading asynchronously (slowest on a cold cache), which
  // grows the track's width over time — a ResizeObserver keeps the duration in
  // sync so the marquee doesn't briefly race through a not-yet-loaded, too-narrow
  // track at first paint.
  useEffect(() => {
    const el = trackRef.current
    if (!el) return

    const updateDuration = () => {
      const loopWidth = el.scrollWidth / 2
      if (loopWidth > 0) setDuration(loopWidth / pxPerSecond)
    }

    updateDuration()
    const observer = new ResizeObserver(updateDuration)
    observer.observe(el)
    return () => observer.disconnect()
  }, [images, pxPerSecond])

  if (images.length === 0) return null

  const track = [...images, ...images]

  return (
    <div className="absolute inset-0 overflow-hidden bg-gray-900">
      <div
        ref={trackRef}
        className="animate-marquee flex h-full w-max"
        style={{ animationDuration: `${duration}s` }}
      >
        {track.map((url, i) => (
          <img
            key={`${url}-${i}`}
            src={url}
            alt=""
            className="h-full w-auto shrink-0 border-r border-black/40 object-cover"
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-black/45" />
    </div>
  )
}
