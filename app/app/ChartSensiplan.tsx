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

type Marker = { flags?: Record<string, boolean>, refWindowMax?: number, cycleDay?: number }

export default function ChartSensiplan({ days, markers, axisMode }:{ days: Day[], markers: Record<string, Marker>, axisMode:'calendar'|'cycle' }){
  // Build rows with a string xLabel to keep XAxis categorical && stable
  const data = days.map(d => {
    const cd = markers[d.id]?.cycleDay
    const xLabel = axisMode === 'calendar' || !cd ? d.id : `CD${cd}`
    return {
      id: d.id,
      xLabel,
      bbt: d.bbt ?? null,
      mucus: mucusLevel(d),
      peak: markers[d.id]?.flags?.peak ?? false,
      p3: markers[d.id]?.flags?.pPlus3 ?? false,
      shift: markers[d.id]?.flags?.tempShiftConfirmed ?? false,
      cd,
    }
  })

  // Fertile window indices
  const fertileStartIndex = data.findIndex(d => d.mucus > 0)
  const p3Index = data.findIndex(d => d.p3)
  const shiftIndex = data.findIndex(d => d.shift)
  const fertileEndIndex = Math.max(p3Index, shiftIndex)

  const refAreaRaw = (fertileStartIndex !== -1 && fertileEndIndex !== -1 && fertileEndIndex > fertileStartIndex)
    ? { x1: data[fertileStartIndex].xLabel, x2: data[fertileEndIndex].xLabel }
    : null

  const domain = new Set(data.map(d => d.xLabel))
  const refArea = (refAreaRaw && domain.has(refAreaRaw.x1) && domain.has(refAreaRaw.x2)) ? refAreaRaw : null

  if (data.length === 0) {
    return <div style={{height:360}} className="flex items-center justify-center text-sm text-slate-500">No data</div>
  }

  return (
    <div style={{ width: '100%', height: 360 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ left: 12, right: 12, top: 10, bottom: 10 }}>
          <XAxis dataKey="xLabel" tick={{ fontSize: 10 }} />
          <YAxis yAxisId="temp" domain={['dataMin - 0.2', 'dataMax + 0.2']} tick={{ fontSize: 10 }} />
          <YAxis yAxisId="mucus" hide domain={[0,3]} />
          <Tooltip formatter={(value, name)=>{
            if (name==='bbt') return [value, 'BBT (°C)']
            if (name==='mucus') return [value, 'Mucus (0–3)']
            return [value, name]
          }} labelFormatter={(lab, payload:any)=>{
            const p = Array.isArray(payload) && payload[0] ? payload[0].payload : null
            const extra = p?.cd ? ` • ${p.id}` : ''
            return `${lab}${extra}`
          }} />
          {refArea && (<ReferenceArea x1={refArea.x1 as any} x2={refArea.x2 as any} y1={0} y2={1} ifOverflow="extendDomain" />)}
          <Bar yAxisId="mucus" dataKey="mucus" barSize={10} />
          <Line yAxisId="temp" type="monotone" dataKey="bbt" dot={false} />
          {data.map((d, i) => d.peak && domain.has(d.xLabel) ? <ReferenceLine key={`peak-${i}`} x={d.xLabel as any} strokeDasharray="4 4" /> : null)}
          {data.map((d, i) => d.shift && domain.has(d.xLabel) ? <ReferenceLine key={`shift-${i}`} x={d.xLabel as any} strokeDasharray="4 4" /> : null)}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}