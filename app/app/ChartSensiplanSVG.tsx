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
  const series = useMemo(()=>{
    return days.map((d, i) => ({
      id: d.id,
      x: i+1,
      label: d.id.slice(5), // MM-DD
      bbt: d.bbt ?? null,
      fertileMucus: (d.mucusAppearance==='clear'||d.mucusAppearance==='stretchy'||d.mucusSensation==='slippery')
    }))
  }, [days])

  const svgRef = useRef<SVGSVGElement>(null)
  const [hover, setHover] = useState<{x:number,y:number, idx:number}|null>(null)

  const width = 760, height = 260, pad = 34
  const xCount = series.length
  const xStep = (width - pad*2) / Math.max(1, xCount-1)

  function xPos(i:number){ return pad + i*xStep }

  const temps = series.map(s => s.bbt).filter((v): v is number => v!=null)
  const min = Math.min( ...(temps.length? temps: [36.0]), 35.7 )
  const max = Math.max( ...(temps.length? temps: [37.2]), 37.8 )
  const rng = (max-min)||1
  function yPosTemp(t:number){ return pad + (height - pad*2) * (1 - ((t - min)/rng)) }

  function onMouseMove(e: React.MouseEvent<SVGSVGElement, MouseEvent>){
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const relX = e.clientX - rect.left - pad
    const idx = Math.max(0, Math.min(xCount-1, Math.round(relX / xStep)))
    const s = series[idx]
    if (!s) return
    setHover({ x: xPos(idx), y: s.bbt? yPosTemp(s.bbt): height/2, idx })
  }

  // Fertile window shading (if markers carry fertileStart/End per day, use a simple heuristic: any day state === 'FERTILE')
  const fertileIndices = series.map((s,i)=> (markers[s.id]?.state==='FERTILE'? i: null)).filter((v): v is number => v!==null)
  const bands: Array<{x1:number,x2:number}> = []
  if (fertileIndices.length) {
    let start = fertileIndices[0], prev = start
    for (let k=1; k<fertileIndices.length; k++){
      const idx = fertileIndices[k]
      if (idx === prev+1){ prev = idx } else { bands.push({x1:start, x2:prev}); start = prev = idx }
    }
    bands.push({x1:start, x2:prev})
  }

  // X ticks labels
  const every = Math.ceil(xCount/14) || 1

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} width={width} height={height} onMouseMove={onMouseMove} onMouseLeave={()=>setHover(null)}>
        {/* axes */}
        <line x1={pad} y1={height-pad} x2={width-pad} y2={height-pad} stroke="#CBD5E1"/>
        <line x1={pad} y1={pad} x2={pad} y2={height-pad} stroke="#CBD5E1"/>

        {/* y ticks */}
        {Array.from({length:5}).map((_,i)=>{
          const v = min + (rng*(i/4))
          const y = yPosTemp(v)
          return (
            <g key={i}>
              <line x1={pad-4} y1={y} x2={width-pad} y2={y} stroke="#E5E7EB" strokeDasharray="2 3"/>
              <text x={8} y={y+4} fontSize="11" fill="#64748B">{v.toFixed(1)}</text>
            </g>
          )
        })}

        {/* x ticks */}
        {series.map((s,i)=> (i%every===0) ? (
          <text key={i} x={xPos(i)} y={height-pad+16} fontSize="11" fill="#64748B" textAnchor="middle">
            {axisMode==='calendar' ? s.label : `CD${s.x}`}
          </text>
        ) : null)}

        {/* axis labels */}
        <text x={8} y={18} fontSize="12" fill="#334155">Temperature (°C)</text>
        <text x={width/2} y={height-6} fontSize="12" fill="#334155" textAnchor="middle">
          {axisMode==='calendar' ? 'Calendar days' : 'Cycle days'}
        </text>

        {/* fertile shading */}
        {mode==='enhanced' && bands.map((b,ix)=> (
          <rect key={ix} x={xPos(b.x1)-xStep/2} y={pad} width={(b.x2-b.x1+1)*xStep} height={height-pad*2} fill="#10B981" opacity="0.08"/>
        ))}

        {/* temp line */}
        <path d={(() => {
          const pts = series.filter(s=>s.bbt!=null).map((s,i) => `${i===0?'M':'L'} ${xPos(i)} ${yPosTemp(s.bbt as number)}`)
          return pts.join(' ')
        })()} fill="none" stroke="#10B981" strokeWidth="2"/>

        {/* mucus markers (enhanced) */}
        {mode==='enhanced' && series.map((s,i)=>(
          s.fertileMucus ? <circle key={i} cx={xPos(i)} cy={height-pad-18} r="3" fill="#6366F1" /> : null
        ))}

        {/* hover indicator */}
        {hover && (
          <>
            <line x1={hover.x} y1={pad} x2={hover.x} y2={height-pad} stroke="#94A3B8" strokeDasharray="2 3"/>
            <circle cx={hover.x} cy={hover.y} r="4" fill="#10B981" />
            <rect x={Math.max(pad, Math.min(hover.x+8, width-168))} y={pad} width="160" height="50" rx="8" fill="white" stroke="#E5E7EB"/>
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
