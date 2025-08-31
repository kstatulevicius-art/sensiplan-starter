'use client'
import React from 'react'
import { IconDroplet, IconSparkle, IconDot, IconHeart } from '@/components/ui/Icon'
import '../../_calendar.css'
import { fromId, toId } from './utils'

type Status = {
  filled: boolean
  bleeding?: 'spotting'|'light'|'normal'|'heavy'|'none'
  state: 'FERTILE'|'INFERTILE'|'USE_CAUTION'
  hasCoitus: boolean
  hasFertileMucus: boolean
}

export default function WeekStrip({ selectedId, onSelect, statusMap }:{ 
  selectedId: string, onSelect:(id:string)=>void, statusMap: Record<string, Status>
}){
  const sel = fromId(selectedId)
  const day = sel.getDay()
  const mondayIndex = (day+6)%7
  const start = new Date(sel); start.setDate(sel.getDate()-mondayIndex)
  const days: Date[] = []
  const d = new Date(start)
  for (let i=0;i<7;i++){ days.push(new Date(d)); d.setDate(d.getDate()+1) }

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map(dt => {
        const id = toId(dt)
        const st = statusMap[id]
        const isSelected = id===selectedId
        const bleeding = st?.bleeding && st.bleeding!=='none'
        const mucus = st?.hasFertileMucus
        const coitus = st?.hasCoitus
        const filled = st?.filled

        return (
          <button
            key={id}
            onClick={()=>onSelect(id)}
            className={`rounded-xl p-2 h-28 flex flex-col items-center justify-between ring-1 ring-slate-200 bg-white hover:bg-slate-50 transition ${
              isSelected ? 'ring-emerald-500 ring-2' : ''
            }`}
          >
            <div className="text-xs text-slate-500">{dt.toLocaleDateString(undefined,{weekday:'short'})}</div>
            <div className="text-lg font-semibold">{dt.getDate()}</div>
            <div className="flex items-center gap-1">
              {bleeding && <IconDroplet size={16} />}
              {mucus && <IconSparkle size={16} />}
              {coitus && <IconHeart size={16} />}
              {filled && !bleeding && !mucus && !coitus && <IconDot size={8} />}
            </div>
          </button>
        )
      })}
    </div>
  )
}
