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
  useEffect(() => {
    if (!trackRef.current) return
    const loopWidth = trackRef.current.scrollWidth / 2
    if (loopWidth > 0) setDuration(loopWidth / pxPerSecond)
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
