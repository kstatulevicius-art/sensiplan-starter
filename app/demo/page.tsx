'use client'
import { useState } from 'react'
import { runSensiplan, type Day } from '@/lib/engine'

const sample: Day[] = [
  { id: '2025-08-01', bleeding:'none', mucusSensation:'dry', mucusAppearance:'none' },
  { id: '2025-08-02', bleeding:'none', mucusSensation:'moist', mucusAppearance:'creamy', bbt:36.5 },
  { id: '2025-08-03', bleeding:'none', mucusSensation:'slippery', mucusAppearance:'clear', bbt:36.52 },
  { id: '2025-08-04', bleeding:'none', mucusSensation:'slippery', mucusAppearance:'stretchy', bbt:36.55 },
  { id: '2025-08-05', bleeding:'none', mucusSensation:'dry', mucusAppearance:'none', bbt:36.8 },
  { id: '2025-08-06', bleeding:'none', mucusSensation:'dry', mucusAppearance:'none', bbt:36.85 },
  { id: '2025-08-07', bleeding:'none', mucusSensation:'dry', mucusAppearance:'none', bbt:36.9 },
]

export default function Demo() {
  const [out] = useState(() => runSensiplan(sample, { unit:'C', earlyInfertile:'off' }))
  return (
    <div className="card">
      <h1 className="text-xl font-semibold mb-3">Interactive Demo (static data)</h1>
      <pre className="text-xs overflow-auto">{JSON.stringify(out, null, 2)}</pre>
    </div>
  )
}
