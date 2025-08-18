import { ReactNode } from 'react'

export function GlassCard({ children, className='' }: { children: ReactNode, className?: string }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function Section({ children, className='' }: { children: ReactNode, className?: string }) {
  return <section className={`container my-10 md:my-14 ${className}`}>{children}</section>
}
