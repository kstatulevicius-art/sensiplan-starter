'use client'
import React, { useMemo, useRef, useState } from 'react'
import type { Day } from '@/lib/engine'

type Props = {
  days: Day[]
  markers: Record<string, any>
  axisMode: 'calendar'|'cycle'
  mode?: 'classic'|'enhanced'
}

/**
 * Enhanced SVG chart:
 * - Draws BBT line with **gaps** (no interpolation over missing temps)
 * - Shows mucus bars and includes mucus in tooltip
 * - Aligns hover line to the nearest visible point
 * - Adds simple axis labels
 */
export default function ChartSensiplan({ days, markers, axisMode, mode='enhanced' }: Props){
  const series = useMemo(()=>{
    let cycle = 1
    const out = days.map((d, i) => {
      const mucusLabelParts: string[] = []
      if (d.mucusSensation && d.mucusSensation !== 'none') mucusLabelParts.push(d.mucusSensation)
      if (d.mucusAppearance && d.mucusAppearance !== 'none') mucusLabelParts.push(d.mucusAppearance)
      const mucusLabel = mucusLabelParts.length ? mucusLabelParts.join(' / ') : null
      // try to read cycle day from markers if present
      const m = markers?.[d.id]
      if (m?.cycleDay) cycle = m.cycleDay
      const point = {
        id: d.id,
        x: i+1,
        cd: typeof m?.cycleDay === 'number' ? m.cycleDay : i+1,
        label: d.id.slice(5),
        bbt: typeof d.bbt === 'number' ? d.bbt : null,
        mucus: (d.mucusSensation === 'slippery') || (d.mucusAppearance === 'clear') || (d.mucusAppearance === 'stretchy'),
        mucusLabel,
      }
      return point
    })
    return out
  }, [days, markers])

  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<{x:number,y:number, idx:number}|null>(null)

  const width = 820, height = 260, padL = 40, padR = 20, padT = 18, padB = 30

  // x positions
  const xIsCalendar = axisMode==='calendar'
  const ticks = series.length
  const xStep = ticks > 1 ? (width - padL - padR) / (ticks - 1) : (width - padL - padR)
  const xAt = (i:number) => padL + i * xStep

  // y positions (BBT)
  const temps = series.map(s => s.bbt).filter((v): v is number => typeof v === 'number')
  const ymin = temps.length ? Math.min(...temps, 35.5) : 36.0
  const ymax = temps.length ? Math.max(...temps, 37.8) : 37.5
  const yrng = (ymax - ymin) || 1
  const yAt = (t:number) => padT + (height - padT - padB) * (1 - ((t - ymin) / yrng))

  // Build **segmented** path: break on nulls
  const pathD = (() => {
    let d = ''
    let penDown = false
    series.forEach((s, i) => {
      if (s.bbt == null) { penDown = false; return }
      const cmd = penDown ? 'L' : 'M'
      d += `${cmd}${xAt(i)},${yAt(s.bbt)} `
      penDown = true
    })
    return d.trim()
  })()

  function onMouseMove(e: React.MouseEvent<SVGSVGElement, MouseEvent>){
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const relX = e.clientX - rect.left - padL
    const idx = Math.max(0, Math.min(series.length-1, Math.round(relX / xStep)))
    const s = series[idx]
    if (!s) return
    const y = s.bbt!=null ? yAt(s.bbt) : (height - padB) - 10
    setHover({ x: xAt(idx), y, idx })
  }

  if (series.length === 0){
    return <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">No data</div>
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseMove={onMouseMove}
        onMouseLeave={()=>setHover(null)}
      >
        {/* axes */}
        <line x1={padL} y1={height-padB} x2={width-padR} y2={height-padB} stroke="#CBD5E1"/>
        <line x1={padL} y1={padT} x2={padL} y2={height-padB} stroke="#CBD5E1"/>

        {/* axis labels */}
        <text x={(width)/2} y={height-6} fontSize="12" fill="#64748B" textAnchor="middle">
          {xIsCalendar ? 'Date' : 'Cycle day'}
        </text>
        <text x={14} y={padT+10} fontSize="12" fill="#64748B" transform={`rotate(-90, 14, ${padT+10})`}>
          BBT °C
        </text>

        {/* temperature path (with gaps) */}
        <path d={pathD} stroke="#0EA5E9" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />

        {/* points */}
        {series.map((s, i) => s.bbt!=null ? (
          <circle key={`p-${i}`} cx={xAt(i)} cy={yAt(s.bbt!)} r={3} fill="#0EA5E9" />
        ) : null)}

        {/* mucus bars (enhanced only) */}
        {mode==='enhanced' && series.map((s,i)=>(
          s.mucus
            ? <rect key={`m-${i}`} x={xAt(i)-4} y={height-padB-18} width={8} height={18} fill="#6366F1" opacity="0.5" />
            : null
        ))}

        {/* hover marker & tooltip */}
        {hover && (
          <g>
            <line x1={hover.x} y1={padT} x2={hover.x} y2={height-padB} stroke="#94A3B8" strokeDasharray="2 3"/>
            <circle cx={hover.x} cy={hover.y} r="4" fill="#0EA5E9" />
            {(() => {
              const s = series[hover.idx]
              const ttW = 176, ttH = 64
              const ttX = Math.max(padL, Math.min(hover.x + 10, width - padR - ttW))
              const ttY = padT + 6
              return (
                <g>
                  <rect x={ttX} y={ttY} width={ttW} height={ttH} rx={8} fill="#FFFFFF" stroke="#E5E7EB" />
                  <text x={ttX+10} y={ttY+18} fontSize="12" fill="#334155">
                    {xIsCalendar ? s.label : `CD ${s.cd}`}
                  </text>
                  <text x={ttX+10} y={ttY+34} fontSize="12" fill="#334155">
                    {s.bbt!=null ? `${s.bbt.toFixed(2)} °C` : '— °C'}
                  </text>
                  <text x={ttX+10} y={ttY+50} fontSize="12" fill="#334155">
                    {s.mucusLabel ? `mucus: ${s.mucusLabel}` : 'mucus: none'}
                  </text>
                </g>
              )
            })()}
          </g>
        )}
      </svg>
    </div>
  )
}
