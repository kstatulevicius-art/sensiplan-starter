'use client'
import { useMemo, useRef, useState } from 'react'
import type { Day } from '@/lib/engine'

type Marker = { flags?: Record<string, boolean>, cycleDay?: number, cycleId?: string, refWindowMax?: number }

type Props = {
  days: Day[]
  markers: Record<string, Marker>
  axisMode: 'calendar'|'cycle'
  mode?: 'classic'|'enhanced'
}

type Row = {
  id: string
  cd?: number | null
  bbt?: number | null
  mucus: number
  peak?: boolean
  shift?: boolean
  p3?: boolean
  xLabel: string
  hasCoitus: boolean
}

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

export default function ChartSensiplanSVG({ days, markers, axisMode, mode='classic' }: Props){
  let rows: Row[] = days.map(d => ({
    id: d.id,
    cd: (markers as any)[d.id]?.cycleDay ?? null,
    bbt: typeof d.bbt === 'number' ? d.bbt : null,
    mucus: mucusLevel(d),
    peak: (markers as any)[d.id]?.flags?.peak ?? false,
    p3: (markers as any)[d.id]?.flags?.pPlus3 ?? false,
    shift: (markers as any)[d.id]?.flags?.tempShiftConfirmed ?? false,
    xLabel: d.id,
    hasCoitus: !!(d.coitus?.events?.length)
  }))

  if (axisMode === 'cycle'){
    const lastWithCycle = [...rows].reverse().find(r => !!r.cd)
    const lastCycleId = lastWithCycle ? (markers as any)[lastWithCycle.id]?.cycleId : undefined
    if (lastCycleId){
      rows = rows.filter(r => (markers as any)[r.id]?.cycleId === lastCycleId)
    } else {
      rows = rows.slice(-35)
    }
  } else {
    rows = rows.slice(-60)
  }

  rows = rows.map(r => ({ ...r, xLabel: (axisMode==='cycle' && r.cd) ? `CD${r.cd}` : r.id }))

  const n = rows.length
  if (n === 0){
    return <div className="h-[320px] flex items-center justify-center text-sm text-slate-500">No data</div>
  }

  const dims = { w: 800, h: 320, padL: 40, padR: 10, padT: 10, padB: 36 }
  const innerW = dims.w - dims.padL - dims.padR
  const innerH = dims.h - dims.padT - dims.padB
  const x = (i: number) => dims.padL + (n<=1 ? innerW/2 : (i * innerW / (n-1)))

  const bbtVals = rows.map(r => r.bbt).filter((v): v is number => typeof v === 'number')
  const bbtMin = bbtVals.length ? Math.min(...bbtVals) : 36.0
  const bbtMax = bbtVals.length ? Math.max(...bbtVals) : 37.0
  const yScaleMin = bbtMin - 0.2
  const yScaleMax = bbtMax + 0.2
  const y = (v: number) => dims.padT + innerH * (1 - (v - yScaleMin)/(yScaleMax - yScaleMin))

  const mucusY = (lvl:number)=> dims.padT + innerH * (1 - (lvl/3))
  const mucusBaseY = dims.padT + innerH

  const fertileStartIndex = rows.findIndex(r => r.mucus > 0)
  const pIndex = rows.findIndex(r => !!r.peak)
  const p3Index = rows.findIndex(r => !!r.p3)
  const shiftIndex = rows.findIndex(r => !!r.shift)
  const fertileEndIndex = Math.max(p3Index, shiftIndex)
  const hasFertileArea = fertileStartIndex !== -1 && fertileEndIndex !== -1 && fertileEndIndex > fertileStartIndex

  const refWindowMax = (() => {
    const k = rows.findIndex(r => (markers as any)[r.id]?.flags?.tempShiftConfirmed)
    if (k>=0) return (markers as any)[rows[k].id]?.refWindowMax
    return undefined
  })()

  const bbtPath = useMemo(() => {
    let d = ''
    let started = false
    rows.forEach((r, i) => {
      if (typeof r.bbt === 'number'){
        const cx = x(i), cy = y(r.bbt)
        if (!started){ d += `M ${cx} ${cy}`; started = true }
        else { d += ` L ${cx} ${cy}` }
      } else {
        started = false
      }
    })
    return d
  }, [rows])

  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hover, setHover] = useState<{i:number,x:number,y:number}|null>(null)

  function onMove(e: React.MouseEvent<SVGSVGElement>){
    if (!svgRef.current) return
    const pt = svgRef.current.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    const ctm = svgRef.current.getScreenCTM()
    if (!ctm) return
    const inv = ctm.inverse()
    const { x: vx } = pt.matrixTransform(inv) // viewBox-space X
    // find nearest index by viewBox x
    let nearest = 0
    let best = Infinity
    for (let i=0;i<n;i++){
      const dx = Math.abs(x(i) - vx)
      if (dx < best){ best = dx; nearest = i }
    }
    const r = rows[nearest]
    const cy = typeof r.bbt === 'number' ? y(r.bbt) : mucusY(r.mucus)
    setHover({ i: nearest, x: x(nearest), y: cy })
  }
  function onLeave(){ setHover(null) }

  const tickEvery = Math.ceil(n / 10)

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        className="w-full h-auto"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        {/* Axes */}
        <line x1={dims.padL} y1={dims.padT} x2={dims.padL} y2={dims.padT+innerH} stroke="#e5e7eb" />
        <line x1={dims.padL} y1={dims.padT+innerH} x2={dims.padL+innerW} y2={dims.padT+innerH} stroke="#e5e7eb" />

        {/* Fertile area */}
        {hasFertileArea && (
          <rect
            x={x(fertileStartIndex)}
            y={dims.padT}
            width={x(fertileEndIndex) - x(fertileStartIndex)}
            height={innerH}
            fill="rgba(16,185,129,0.12)"
          />
        )}

        {/* Enhanced overlays */}
        {mode==='enhanced' && (
          <g>
            {/* Reference-window max line if available */}
            {typeof refWindowMax === 'number' && (
              <g>
                <line x1={dims.padL} x2={dims.padL+innerW} y1={y(refWindowMax)} y2={y(refWindowMax)} stroke="#0ea5e9" strokeDasharray="4 4" />
                <text x={dims.padL+4} y={y(refWindowMax)-4} fontSize="10" fill="#0ea5e9">RW Max</text>
              </g>
            )}
            {/* Shade P+1..P+3 if peak known */}
            {(pIndex>=0 && p3Index>pIndex) && (
              <rect x={x(pIndex+1)} y={dims.padT} width={x(p3Index) - x(pIndex+1)} height={innerH} fill="rgba(234,179,8,0.12)" />
            )}
          </g>
        )}

        {/* Mucus bars */}
        {rows.map((r, i) => {
          const barW = Math.max(3, innerW / Math.max(20, n) * 0.7)
          return (
            <rect key={'m'+i}
              x={x(i) - barW/2}
              y={mucusY(r.mucus)}
              width={barW}
              height={mucusBaseY - mucusY(r.mucus)}
              fill="rgba(59,130,246,0.45)"
            />
          )
        })}

        {/* BBT path */}
        <path d={bbtPath} stroke="#ef4444" strokeWidth="2" fill="none" />

        {/* Peak / Shift markers */}
        {rows.map((r, i) => r.peak ? <line key={'p'+i} x1={x(i)} x2={x(i)} y1={dims.padT} y2={dims.padT+innerH} stroke="#6b7280" strokeDasharray="4 4" /> : null)}
        {rows.map((r, i) => r.shift ? <line key={'s'+i} x1={x(i)} x2={x(i)} y1={dims.padT} y2={dims.padT+innerH} stroke="#9ca3af" strokeDasharray="4 4" /> : null)}

        {/* Coitus markers on baseline (enhanced) */}
        {mode==='enhanced' && rows.map((r,i) => r.hasCoitus ? (
          <polygon key={'c'+i} points={`${x(i)},${mucusBaseY} ${x(i)-4},${mucusBaseY-7} ${x(i)+4},${mucusBaseY-7}`} fill="#8b5cf6" />
        ) : null)}

        {/* X ticks */}
        {rows.map((r, i) => (i % tickEvery === 0) ? (
          <text key={'t'+i} x={x(i)} y={dims.padT+innerH+14} textAnchor="middle" fontSize="10" fill="#334155">
            {r.xLabel}
          </text>
        ) : null)}

        {/* Y ticks (bbt) */}
        {[0,1,2,3,4].map(k => {
          const val = yScaleMin + k*(yScaleMax - yScaleMin)/4
          const yy = y(val)
          return (
            <g key={k}>
              <line x1={dims.padL-4} x2={dims.padL} y1={yy} y2={yy} stroke="#94a3b8" />
              <text x={dims.padL-6} y={yy+3} textAnchor="end" fontSize="10" fill="#334155">{val.toFixed(1)}</text>
            </g>
          )
        })}

        {/* Hover */}
        {hover && (
          <g>
            <line x1={hover.x} x2={hover.x} y1={dims.padT} y2={dims.padT+innerH} stroke="rgba(0,0,0,0.15)" />
            <circle cx={hover.x} cy={hover.y} r="3" fill="#ef4444" />
          </g>
        )}
      </svg>

      {hover && (() => {
        const r = rows[hover.i]
        return (
          <div className="mt-2 text-xs text-slate-700">
            <div><span className="font-medium">{r.xLabel}</span>{r.cd ? ` • CD${r.cd}` : ''}</div>
            <div>BBT: {typeof r.bbt==='number' ? r.bbt.toFixed(2)+' °C' : '—'}</div>
            <div>Mucus: {r.mucus}</div>
            <div>{r.peak ? 'Peak' : ''}{r.p3 ? (r.peak ? ' + P+3' : 'P+3') : ''}{r.shift ? (r.peak||r.p3? ' + ' : '')+'Shift' : ''}</div>
          </div>
        )
      })()}
    </div>
  )
}
