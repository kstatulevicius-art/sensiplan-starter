'use client'
import React, { useMemo, useRef, useState } from 'react'
import type { Day } from '@/lib/engine'

type Props = {
  days: Day[]
  markers: Record<string, any>
  axisMode: 'calendar'|'cycle'
  mode: 'classic'|'enhanced'
}

export default function ChartSensiplan({ days, markers, axisMode, mode }: Props){
  // Basic computed series
  const series = useMemo(()=>{
    return days.map((d, i) => ({
      id: d.id,
      x: i+1, // fallback; your real impl may map to cycle day
      label: d.id.slice(5), // MM-DD
      bbt: d.bbt ?? null,
      mucus: (d.mucusAppearance==='clear'||d.mucusAppearance==='stretchy'||d.mucusSensation==='slippery') ? 1 : 0
    }))
  }, [days])

  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<{x:number,y:number, idx:number}|null>(null)

  const width = 720, height = 220, pad = 28
  const xKey = axisMode==='calendar' ? 'label' : 'x'
  const xs = series.map((d)=> d[xKey as 'x'|'label'] as any)
  const xCount = xs.length
  const xStep = (width - pad*2) / Math.max(1, xCount-1)

  function xPos(i:number){
    return pad + i*xStep
  }
  function yPosTemp(t:number){
    // quick min/max for chart scale
    const temps = series.map(s => s.bbt).filter(Boolean) as number[]
    const min = Math.min(...temps, 35.5)
    const max = Math.max(...temps, 37.8)
    const rng = (max-min)||1
    return pad + (height - pad*2) * (1 - ((t - min)/rng))
  }

  function onMouseMove(e: React.MouseEvent<SVGSVGElement, MouseEvent>){
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const relX = e.clientX - rect.left - pad
    const idx = Math.max(0, Math.min(xCount-1, Math.round(relX / xStep)))
    const s = series[idx]
    if (!s) return
    setHover({ x: xPos(idx), y: s.bbt? yPosTemp(s.bbt): height/2, idx })
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} width={width} height={height} onMouseMove={onMouseMove} onMouseLeave={()=>setHover(null)}>
        {/* axes */}
        <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#CBD5E1"/>
        <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#CBD5E1"/>

        {/* temp line */}
        <path d={(() => {
          const pts = series.filter(s=>s.bbt!=null).map((s,i) => `${i===0?'M':'L'} ${xPos(i)} ${yPosTemp(s.bbt as number)}`)
          return pts.join(' ')
        })()} fill="none" stroke="#10B981" strokeWidth="2"/>

        {/* mucus bars (enhanced only) */}
        {mode==='enhanced' && series.map((s,i)=>(
          s.mucus ? <rect key={i} x={xPos(i)-3} y={height-pad-18} width={6} height={18} fill="#6366F1" opacity="0.6" /> : null
        ))}

        {/* hover indicator */}
        {hover && (
          <>
            <line x1={hover.x} y1={pad} x2={hover.x} y2={height-pad} stroke="#94A3B8" strokeDasharray="2 3"/>
            <circle cx={hover.x} cy={hover.y} r="4" fill="#10B981" />
            <rect x={Math.max(pad, Math.min(hover.x+8, width-160))} y={pad} width="150" height="46" rx="8" fill="white" stroke="#E5E7EB"/>
            <text x={Math.max(pad+10, Math.min(hover.x+18, width-150))} y={pad+20} fontSize="12" fill="#334155">
              {axisMode==='calendar' ? series[hover.idx].label : `CD ${series[hover.idx].x}`}
            </text>
            <text x={Math.max(pad+10, Math.min(hover.x+18, width-150))} y={pad+36} fontSize="12" fill="#334155">
              {series[hover.idx].bbt ? `${series[hover.idx].bbt.toFixed(2)} °C` : '—'}
            </text>
          </>
        )}
      </svg>
    </div>
  )
}
