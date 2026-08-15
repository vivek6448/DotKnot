import { useRef } from 'react'
import VariableProximity from './VariableProximity'

interface ProximityHeadingProps {
  as: 'h1' | 'h2'
  className?: string
  radius?: number
  children: string
}

export function ProximityHeading({ as: Tag, className = '', radius = 120, children }: ProximityHeadingProps) {
  const containerRef = useRef<HTMLHeadingElement>(null)

  const proximity = (
    <VariableProximity
      label={children}
      fromFontVariationSettings="'wght' 400, 'opsz' 9"
      toFontVariationSettings="'wght' 900, 'opsz' 40"
      containerRef={containerRef}
      radius={radius}
      falloff="linear"
    />
  )

  if (Tag === 'h1') {
    return (
      <h1 ref={containerRef} className={className}>
        {proximity}
      </h1>
    )
  }

  return (
    <h2 ref={containerRef} className={className}>
      {proximity}
    </h2>
  )
}
