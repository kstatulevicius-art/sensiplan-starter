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
      const mucusLabel = mucusLabelParts.length ? mucusLabelParts.join(' / ') : null
      const fertileMucus = !!(d.mucusSensation === 'slippery' || d.mucusAppearance === 'clear' || d.mucusAppearance === 'stretchy')
      return {
        id: d.id,
        x: i+1,
        label: d.id.slice(5),
        bbt: typeof d.bbt === 'number' ? d.bbt : null,
        mucus: fertileMucus ? 1 : 0,
        mucusLabel,
      }
    })
  }, [days])

  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<{x:number,y:number, idx:number}|null>(null)

  const width = 720, height = 240, pad = 28
  const xKey = axisMode==='calendar' ? 'label' : 'x'
  const xs = series.map((d)=> d[xKey as 'x'|'label'] as any)
  const xCount = xs.length
  const xStep = (width - pad*2) / Math.max(1, xCount-1)

  function xPos(i:number){ return pad + i*xStep }

  function yPosTemp(t:number){
    const temps = series.map(s => s.bbt).filter((v): v is number => typeof v === 'number')
    const min = temps.length ? Math.min(...temps, 35.5) : 36.0
    const max = temps.length ? Math.max(...temps, 37.8) : 37.0
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
    setHover({ x: xPos(idx), y: s.bbt!=null ? yPosTemp(s.bbt) : height/2, idx })
  }

  if (series.length === 0){
    return <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">No data</div>
  }

  const tempPath = (() => {
    let d = ''
    series.forEach((s, i) => {
      if (s.bbt!=null){
        const cmd = (d ? 'L' : 'M')
        d += `${cmd} ${xPos(i)} ${yPosTemp(s.bbt)} `
      }
    })
    return d.trim()
  })()

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
        <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#CBD5E1"/>
        <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#CBD5E1"/>

        {/* temperature path */}
        <path d={tempPath} stroke="#0EA5E9" strokeWidth="2" fill="none" />

        {/* mucus bars (enhanced only) */}
        {mode==='enhanced' && series.map((s,i)=>(
          s.mucus
            ? <rect key={i} x={xPos(i)-4} y={height-pad-20} width={8} height={20} fill="#6366F1" opacity="0.5" />
            : null
        ))}

        {/* hover marker & tooltip */}
        {hover && (
          <g>
            <line x1={hover.x} y1={pad} x2={hover.x} y2={height-pad} stroke="#94A3B8" strokeDasharray="2 3"/>
            <circle cx={hover.x} cy={hover.y} r="4" fill="#0EA5E9" />
            {(() => {
              const s = series[hover.idx]
              const ttX = Math.max(pad, Math.min(hover.x + 8, width - 170))
              const ttY = pad + 4
              return (
                <g>
                  <rect x={ttX} y={ttY} width={160} height={60} rx={8} fill="#FFFFFF" stroke="#E5E7EB" />
                  <text x={ttX+10} y={ttY+18} fontSize="12" fill="#334155">
                    {axisMode==='calendar' ? s.label : `CD ${s.x}`}
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
