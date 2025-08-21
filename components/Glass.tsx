export function Section({ children, className='' }: { children: React.ReactNode, className?: string }){
  return <section className={`my-6 ${className}`}>{children}</section>
}

export function GlassCard({ children, className='' }: { children: React.ReactNode, className?: string }){
  return <div className={`glass bg-white/70 border border-black/5 shadow-sm p-4 ${className}`}>{children}</div>
}
