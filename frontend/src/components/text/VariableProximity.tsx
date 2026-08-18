import {
  forwardRef,
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  type CSSProperties,
  type MouseEventHandler,
  type RefObject,
} from 'react'
import { motion } from 'framer-motion'
import './VariableProximity.css'

// Proximity tracking only makes sense with a real, hovering mouse — touch
// devices have no cursor to track, so running the loop there is pure wasted
// battery/CPU on every mobile visitor. Also respects prefers-reduced-motion.
function useProximityEnabled() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return (
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  })

  useEffect(() => {
    const hoverQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setEnabled(hoverQuery.matches && !motionQuery.matches)
    update()
    hoverQuery.addEventListener('change', update)
    motionQuery.addEventListener('change', update)
    return () => {
      hoverQuery.removeEventListener('change', update)
      motionQuery.removeEventListener('change', update)
    }
  }, [])

  return enabled
}

function useAnimationFrame(callback: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    let frameId: number
    const loop = () => {
      callback()
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [callback, enabled])
}

function useMousePositionRef(enabled: boolean, containerRef?: RefObject<HTMLElement | null>) {
  const positionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!enabled) return

    const updatePosition = (x: number, y: number) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect()
        positionRef.current = { x: x - rect.left, y: y - rect.top }
      } else {
        positionRef.current = { x, y }
      }
    }

    const handleMouseMove = (ev: MouseEvent) => updatePosition(ev.clientX, ev.clientY)

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [enabled, containerRef])

  return positionRef
}

type Falloff = 'linear' | 'exponential' | 'gaussian'

interface VariableProximityProps {
  label: string
  fromFontVariationSettings: string
  toFontVariationSettings: string
  containerRef: RefObject<HTMLElement | null>
  radius?: number
  falloff?: Falloff
  className?: string
  onClick?: MouseEventHandler<HTMLSpanElement>
  style?: CSSProperties
}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>((props, ref) => {
  const {
    label,
    fromFontVariationSettings,
    toFontVariationSettings,
    containerRef,
    radius = 50,
    falloff = 'linear',
    className = '',
    onClick,
    style,
    ...restProps
  } = props

  const enabled = useProximityEnabled()
  const letterRefs = useRef<Array<HTMLSpanElement | null>>([])
  const mousePositionRef = useMousePositionRef(enabled, containerRef)
  const lastPositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })

  const parsedSettings = useMemo(() => {
    const parseSettings = (settingsStr: string) =>
      new Map(
        settingsStr
          .split(',')
          .map((s) => s.trim())
          .map((s) => {
            const [name, value] = s.split(' ')
            return [name.replace(/['"]/g, ''), parseFloat(value)] as const
          }),
      )

    const fromSettings = parseSettings(fromFontVariationSettings)
    const toSettings = parseSettings(toFontVariationSettings)

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue,
    }))
  }, [fromFontVariationSettings, toFontVariationSettings])

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

  const calculateFalloff = (distance: number) => {
    const norm = Math.min(Math.max(1 - distance / radius, 0), 1)
    switch (falloff) {
      case 'exponential':
        return norm ** 2
      case 'gaussian':
        return Math.exp(-((distance / (radius / 2)) ** 2) / 2)
      case 'linear':
      default:
        return norm
    }
  }

  const tick = useCallback(() => {
    if (!containerRef?.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    const { x, y } = mousePositionRef.current
    if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) {
      return
    }
    lastPositionRef.current = { x, y }

    letterRefs.current.forEach((letterRef) => {
      if (!letterRef) return

      const rect = letterRef.getBoundingClientRect()
      const letterCenterX = rect.left + rect.width / 2 - containerRect.left
      const letterCenterY = rect.top + rect.height / 2 - containerRect.top

      const distance = calculateDistance(
        mousePositionRef.current.x,
        mousePositionRef.current.y,
        letterCenterX,
        letterCenterY,
      )

      if (distance >= radius) {
        letterRef.style.fontVariationSettings = fromFontVariationSettings
        return
      }

      const falloffValue = calculateFalloff(distance)
      const newSettings = parsedSettings
        .map(({ axis, fromValue, toValue }) => {
          const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue
          return `'${axis}' ${interpolatedValue}`
        })
        .join(', ')

      letterRef.style.fontVariationSettings = newSettings
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, radius, falloff, fromFontVariationSettings, parsedSettings])

  useAnimationFrame(tick, enabled)

  const words = label.split(' ')
  let letterIndex = 0

  return (
    <span
      ref={ref}
      className={`${className} variable-proximity`}
      onClick={onClick}
      style={{ display: 'inline', ...style }}
      {...restProps}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {word.split('').map((letter) => {
            const currentLetterIndex = letterIndex++
            return (
              <motion.span
                key={currentLetterIndex}
                ref={(el) => {
                  letterRefs.current[currentLetterIndex] = el
                }}
                style={{ display: 'inline-block', fontVariationSettings: fromFontVariationSettings }}
                aria-hidden="true"
              >
                {letter}
              </motion.span>
            )
          })}
          {wordIndex < words.length - 1 && <span style={{ display: 'inline-block' }}>&nbsp;</span>}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  )
})

VariableProximity.displayName = 'VariableProximity'
export default VariableProximity
