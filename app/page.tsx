import Link from 'next/link'
import { GlassCard, Section } from '@/components/Glass'

export default function Page() {
  return (
    <>
      <Section className="pt-8 md:pt-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/70 border border-black/5 text-xs text-slate-600">
            <span>Symptothermal • Sensiplan</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            A beautiful, private way to track fertility
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Glass-smooth UI, offline-first, and evidence-based rules. Your data stays with you.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/app" className="btn">Open Tracker</Link>
            <Link href="/how-it-works" className="btn secondary">Learn More</Link>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid md:grid-cols-3 gap-5">
          <GlassCard>
            <h3 className="font-semibold text-lg">Glass UI</h3>
            <p className="mt-2 text-slate-600">Modern liquid-glass cards and soft shadows, readable in daylight.</p>
          </GlassCard>
          <GlassCard>
            <h3 className="font-semibold text-lg">Offline-first</h3>
            <p className="mt-2 text-slate-600">Works without internet; your entries are stored locally on your device.</p>
          </GlassCard>
          <GlassCard>
            <h3 className="font-semibold text-lg">Explainable</h3>
            <p className="mt-2 text-slate-600">Every day’s status includes the reasoning per Sensiplan rules.</p>
          </GlassCard>
        </div>
      </Section>
    </>
  )
}
