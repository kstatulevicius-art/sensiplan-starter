import { Section, GlassCard } from '@/components/Glass'

export default function Algo() {
  return (
    <Section>
      <GlassCard>
        <article className="prose max-w-none">
          <h1>Algorithm (Starter)</h1>
          <ul>
            <li><b>Temperature shift:</b> 3 consecutive higher temps over the previous 6 valid values; if the 3rd isn’t +0.2°C above, look for a later 4th that is.</li>
            <li><b>Mucus Peak:</b> Last day of fertile-quality mucus before three consecutive non-fertile days.</li>
            <li><b>Post-ovulatory infertility:</b> Begins the evening of the later of (temperature shift confirmation) or (Peak+3).</li>
          </ul>
          <p>This page will be expanded with full rule proofs and examples.</p>
        </article>
      </GlassCard>
    </Section>
  )
}
