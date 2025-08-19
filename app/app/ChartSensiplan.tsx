'use client'
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'
import type { Day } from '@/lib/engine'

function mucusLevel(d: Day){
  if (d.mucusSensation === 'slippery') return 3
  switch(d.mucusAppearance){
    case 'clear':
    case 'stretchy': return 3
    case 'creamy': return 2
    case 'sticky': return 1
    default: return (d.mucusSensation==='moist') ? 2 : 0
  }
}

type Marker = { flags?: Record<string, boolean>, refWindowMax?: number }

export default function ChartSensiplan({ days, markers }:{ days: Day[], markers: Record<string, Marker> }){
  const data = days.map(d => ({
    id: d.id,
    bbt: d.bbt ?? null,
    mucus: mucusLevel(d),
    peak: markers[d.id]?.flags?.peak ?? false,
    p3: markers[d.id]?.flags?.pPlus3 ?? false,
    shift: markers[d.id]?.flags?.tempShiftConfirmed ?? false,
  }))

  // Fertile window start: first day with mucus > 0 in this range
  const fertileStartIndex = data.findIndex(d => d.mucus > 0)
  // Fertile window end: later of p3 or shift
  const p3Index = data.findIndex(d => d.p3)
  const shiftIndex = data.findIndex(d => d.shift)
  const fertileEndIndex = Math.max(p3Index, shiftIndex)

  // Prepare x positions for shading
  const refArea = (fertileStartIndex !== -1 && fertileEndIndex !== -1 && fertileEndIndex > fertileStartIndex)
    ? { x1: data[fertileStartIndex].id, x2: data[fertileEndIndex].id }
    : null

  return (
    <div style={{ width: '100%', height: 360 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
          {/* X & Y axes */}
          <XAxis dataKey="id" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="temp" domain={['dataMin - 0.2', 'dataMax + 0.2']} tick={{ fontSize: 10 }} />
          <YAxis yAxisId="mucus" hide domain={[0,3]} />
          <Tooltip />
          {/* Fertile window shading (green) */}
          {refArea && (
            <ReferenceArea x1={refArea.x1} x2={refArea.x2} y1={0} y2={1} ifOverflow="extendDomain" />
          )}
          {/* Mucus quality bars (blue) */}
          <Bar yAxisId="mucus" dataKey="mucus" barSize={10} />
          {/* Temperature line (red) */}
          <Line yAxisId="temp" type="monotone" dataKey="bbt" dot={false} />
          {/* Markers: Peak (blue dashed), Temp shift (orange dashed) */}
          {data.map((d, i) => d.peak ? <ReferenceLine key={`peak-${i}`} x={d.id} strokeDasharray="4 4" /> : null)}
          {data.map((d, i) => d.shift ? <ReferenceLine key={`shift-${i}`} x={d.id} strokeDasharray="4 4" /> : null)}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
