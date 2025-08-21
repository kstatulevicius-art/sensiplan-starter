import { ReactNode } from 'react'

export function Section({ children, className = '' }: { children: ReactNode, className?: string }){
  return (
    <section className={`rounded-2xl bg-white/90 shadow-[0_6px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5 ${className}`}>
      <div className="p-4 md:p-6">{children}</div>
    </section>
  )
}

export function Header({ title, subtitle }: { title: string, subtitle?: string }){
  return (
    <div className="mb-3">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
    </div>
  )
}
