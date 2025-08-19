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

type Marker = { flags?: Record<string, boolean>, refWindowMax?: number, cycleDay?: number, cycleId?: string }

export default function ChartSensiplan({ days, markers, axisMode }:{ days: Day[], markers: Record<string, Marker>, axisMode:'calendar'|'cycle' }){
  // Build base rows with metadata from markers
  let rows = days.map(d => ({
    id: d.id,
    cycleId: markers[d.id]?.cycleId ?? null,
    cd: markers[d.id]?.cycleDay ?? null,
    bbt: typeof d.bbt === 'number' ? d.bbt : null,
    mucus: mucusLevel(d),
    peak: markers[d.id]?.flags?.peak ?? false,
    p3: markers[d.id]?.flags?.pPlus3 ?? false,
    shift: markers[d.id]?.flags?.tempShiftConfirmed ?? false,
  }))

  // In cycle mode: filter to last cycle that has a cycleId
  if (axisMode === 'cycle') {
    const lastWithCycle = [...rows].reverse().find(r => r.cycleId)
    if (lastWithCycle && lastWithCycle.cycleId) {
      rows = rows.filter(r => r.cycleId === lastWithCycle.cycleId)
    } else {
      // No cycle info, fallback to calendar mode
      // (render recent 35 days max for performance)
      rows = rows.slice(-35)
    }
  } else {
    // Calendar mode: optionally limit to recent window for readability
    rows = rows.slice(-60)
  }

  // Build a safe, categorical xLabel
  const data = rows.map(r => ({
    ...r,
    xLabel: axisMode==='cycle' && r.cd ? `CD${r.cd}` : r.id
  }))

  if (data.length === 0) {
    return <div style={{height:360}} className="flex items-center justify-center text-sm text-slate-500">No data</div>
  }

  // Fertile window indices within this view
  const fertileStartIndex = data.findIndex(d => d.mucus > 0)
  const p3Index = data.findIndex(d => d.p3)
  const shiftIndex = data.findIndex(d => d.shift)
  const fertileEndIndex = Math.max(p3Index, shiftIndex)

  const domain = new Set(data.map(d => d.xLabel))
  const hasArea = fertileStartIndex !== -1 && fertileEndIndex !== -1 && fertileEndIndex > fertileStartIndex
  const x1 = hasArea ? data[fertileStartIndex].xLabel : null
  const x2 = hasArea ? data[fertileEndIndex].xLabel : null
  const showArea = !!(x1 && x2 && x1 !== x2 && domain.has(x1) && domain.has(x2))

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
          {showArea && (<ReferenceArea x1={x1 as any} x2={x2 as any} y1={0} y2={1} ifOverflow="extendDomain" />)}
          <Bar yAxisId="mucus" dataKey="mucus" barSize={10} />
          <Line yAxisId="temp" type="monotone" dataKey="bbt" dot={false} connectNulls />
          {data.map((d, i) => d.peak && domain.has(d.xLabel) ? <ReferenceLine key={`peak-${i}`} x={d.xLabel as any} strokeDasharray="4 4" /> : null)}
          {data.map((d, i) => d.shift && domain.has(d.xLabel) ? <ReferenceLine key={`shift-${i}`} x={d.xLabel as any} strokeDasharray="4 4" /> : null)}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}