import { useEffect, useState } from 'react'

interface HeroSlideshowProps {
  images: string[]
  intervalMs?: number
}

export function HeroSlideshow({ images, intervalMs = 4000 }: HeroSlideshowProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [images.length, intervalMs])

  return (
    <div className="absolute inset-0 overflow-hidden bg-gray-900">
      {images.map((url, i) => (
        <img
          key={url}
          src={url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-black/50" />
    </div>
  )
}
