'use client'
import React, { useMemo, useRef, useState } from 'react'
import type { Day } from '@/lib/engine'

type Props = {
  days: Day[]
  markers: Record<string, any>
  axisMode: 'calendar'|'cycle'
  mode?: 'classic'|'enhanced'
}

export default function ChartSensiplan({ days, markers, axisMode, mode='enhanced' }: Props){
  const series = useMemo(()=>{
    return days.map((d, i) => {
      const mucusLabelParts: string[] = []
      if (d.mucusSensation && d.mucusSensation !== 'none') mucusLabelParts.push(d.mucusSensation)
      if (d.mucusAppearance && d.mucusAppearance !== 'none') mucusLabelParts.push(d.mucusAppearance)
      return {
        id: d.id,
        x: i+1,
        cd: i+1,
        label: d.id.slice(5),
        bbt: typeof d.bbt === 'number' ? d.bbt : null,
        mucus: (d.mucusSensation === 'slippery') || (d.mucusAppearance === 'clear') || (d.mucusAppearance === 'stretchy'),
        mucusLabel: mucusLabelParts.length ? mucusLabelParts.join(' / ') : null,
      }
    })
  }, [days, markers])

  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<{x:number,y:number, idx:number}|null>(null)

  const width = 820, height = 260, padL = 40, padR = 20, padT = 18, padB = 30

  const ticks = series.length
  const xStep = ticks > 1 ? (width - padL - padR) / (ticks - 1) : (width - padL - padR)
  const xAt = (i:number) => padL + i * xStep

  const temps = series.map(s => s.bbt).filter((v): v is number => typeof v === 'number')
  const ymin = temps.length ? Math.min(...temps, 35.5) : 36.0
  const ymax = temps.length ? Math.max(...temps, 37.8) : 37.5
  const yrng = (ymax - ymin) || 1
  const yAt = (t:number) => padT + (height - padT - padB) * (1 - ((t - ymin) / yrng))

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
        <line x1={padL} y1={height-padB} x2={width-padR} y2={height-padB} stroke="#CBD5E1"/>
        <line x1={padL} y1={padT} x2={padL} y2={height-padB} stroke="#CBD5E1"/>

        {/* Draw solid and dashed segments */}
        {series.map((s, i) => {
          const prev = series[i-1]
          if (!prev) return null
          if (prev.bbt!=null && s.bbt!=null){
            return <line key={i} x1={xAt(i-1)} y1={yAt(prev.bbt)} x2={xAt(i)} y2={yAt(s.bbt)} stroke="#0EA5E9" strokeWidth="2"/>
          }
          if (prev.bbt!=null && s.bbt==null){
            return <line key={i} x1={xAt(i-1)} y1={yAt(prev.bbt)} x2={xAt(i)} y2={height-padB-10} stroke="#0EA5E9" strokeWidth="2" strokeDasharray="4 4"/>
          }
          if (prev.bbt==null && s.bbt!=null){
            return <line key={i} x1={xAt(i-1)} y1={height-padB-10} x2={xAt(i)} y2={yAt(s.bbt)} stroke="#0EA5E9" strokeWidth="2" strokeDasharray="4 4"/>
          }
          return null
        })}

        {series.map((s, i) => s.bbt!=null ? (
          <circle key={`p-${i}`} cx={xAt(i)} cy={yAt(s.bbt!)} r={3} fill="#0EA5E9" />
        ) : null)}

        {mode==='enhanced' && series.map((s,i)=>(
          s.mucus
            ? <rect key={`m-${i}`} x={xAt(i)-4} y={height-padB-18} width={8} height={18} fill="#6366F1" opacity="0.5" />
            : null
        ))}

        {hover && (
          <g>
            <line x1={hover.x} y1={padT} x2={hover.x} y2={height-padB} stroke="#94A3B8" strokeDasharray="2 3"/>
            <circle cx={hover.x} cy={hover.y} r="4" fill="#0EA5E9" />
          </g>
        )}
      </svg>
    </div>
  )
}
