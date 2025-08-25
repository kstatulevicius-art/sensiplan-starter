import React from 'react'

type Props = React.SVGProps<SVGSVGElement> & { size?: number }

export function IconDroplet({ size=14, ...p }: Props){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2s7 8 7 13a7 7 0 1 1-14 0c0-5 7-13 7-13z" />
    </svg>
  )
}

export function IconSparkle({ size=14, ...p }: Props){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
    </svg>
  )
}

export function IconDot({ size=6, ...p }: Props){
  return (
    <svg width={size} height={size} viewBox="0 0 8 8" fill="currentColor" {...p}>
      <circle cx="4" cy="4" r="3"/>
    </svg>
  )
}

export function IconHeart({ size=14, ...p }: Props){
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 21s-7.5-4.35-10-8.5C.38 9.69 2.22 6 6 6c2.03 0 3.5 1.22 4 2 0.5-.78 1.97-2 4-2 3.78 0 5.62 3.69 4 6.5C19.5 16.65 12 21 12 21z"/>
    </svg>
  )
}
