'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Bar } from 'recharts'
import type { Day } from '@/lib/engine'

function mucusLevel(d: Day){
  // Map mucus to numeric levels for a stacked bar lane (0..3)
  // 0 none/dry, 1 sticky, 2 creamy/moist, 3 clear/stretchy/slippery
  if (d.mucusSensation === 'slippery') return 3
  switch(d.mucusAppearance){
    case 'clear':
    case 'stretchy': return 3
    case 'creamy': return 2
    case 'sticky': return 1
    default: return (d.mucusSensation==='moist') ? 2 : 0
  }
}

export default function ChartBBT({ days, markers }:{ days: Day[], markers: Record<string, { flags?: Record<string, boolean>, refWindowMax?: number }> }){
  const data = days.map(d => ({
    id: d.id,
    bbt: d.bbt ?? null,
    mucus: mucusLevel(d),
    peak: markers[d.id]?.flags?.peak ?? false,
    p3: markers[d.id]?.flags?.pPlus3 ?? false,
    shift: markers[d.id]?.flags?.tempShiftConfirmed ?? false,
    refMax: markers[d.id]?.refWindowMax
  }))

  // Find first non-undefined refMax to draw reference line
  const refMax = data.find(d=> d.refMax !== undefined)?.refMax

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
          <XAxis dataKey="id" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="temp" domain={['dataMin - 0.2', 'dataMax + 0.2']} tick={{ fontSize: 10 }} />
          <YAxis yAxisId="mucus" hide domain={[0,3]} />
          <Tooltip />
          {/* Mucus lane (stacked bars at bottom) */}
          <Bar yAxisId="mucus" dataKey="mucus" barSize={8} />
          {/* Temperature line */}
          <Line yAxisId="temp" type="monotone" dataKey="bbt" dot={false} />
          {/* Reference line for RW max if known */}
          {refMax !== undefined && <ReferenceLine yAxisId="temp" y={refMax} strokeDasharray="4 4" />}
          {/* Markers as vertical reference lines */}
          {data.map((d, i) => d.peak ? <ReferenceLine key={`peak-${i}`} x={d.id} strokeDasharray="2 2" /> : null)}
          {data.map((d, i) => d.p3 ? <ReferenceLine key={`p3-${i}`} x={d.id} strokeDasharray="2 6" /> : null)}
          {data.map((d, i) => d.shift ? <ReferenceLine key={`shift-${i}`} x={d.id} strokeDasharray="6 2" /> : null)}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
