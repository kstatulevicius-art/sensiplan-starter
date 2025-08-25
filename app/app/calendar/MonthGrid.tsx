'use client'
import React from 'react'
import { IconDroplet, IconSparkle, IconDot, IconHeart } from '@/components/ui/Icon'
import '../../_calendar.css'
import { toId } from './utils'

type Status = {
  filled: boolean
  bleeding?: 'spotting'|'light'|'normal'|'heavy'|'none'
  state: 'FERTILE'|'INFERTILE'|'USE_CAUTION'
  hasCoitus: boolean
  hasFertileMucus: boolean
}
export default function MonthGrid({ current, selectedId, onSelect, statusMap }:{ 
  current: Date, selectedId: string, onSelect: (id:string)=>void,
  statusMap: Record<string, Status>
}){
  const first = new Date(current.getFullYear(), current.getMonth(), 1)
  const last  = new Date(current.getFullYear(), current.getMonth()+1, 0)
  const start = new Date(first)
  start.setDate(first.getDate() - ((first.getDay()+6)%7)) // start Monday
  const end = new Date(last)
  end.setDate(last.getDate() + (6-((last.getDay()+6)%7)))

  const days: Date[] = []
  const d = new Date(start)
  while (d <= end) { days.push(new Date(d)); d.setDate(d.getDate()+1) }

  return (
    <div className="cal-grid">
      {days.map(dt => {
        const id = toId(dt)
        const st = statusMap[id]
        const isSelected = id===selectedId
        const inMonth = dt.getMonth()===current.getMonth()
        const bleeding = st?.bleeding && st.bleeding!=='none'
        const mucus = st?.hasFertileMucus
        const coitus = st?.hasCoitus
        const filled = st?.filled

        return (
          <button
            key={id}
            onClick={()=>onSelect(id)}
            className={`cal-tile ${isSelected?'selected':''}`}
            style={{opacity: inMonth?1:0.5}}
          >
            <div className="daynum">{dt.getDate()}</div>
            <div className="cal-icons">
              {bleeding && <IconDroplet aria-label="bleeding"/>}
              {mucus && <IconSparkle aria-label="fertile mucus"/>}
              {coitus && <IconHeart aria-label="intercourse"/>}
              {filled && !bleeding && !mucus && !coitus && <IconDot aria-label="logged"/>}
            </div>
          </button>
        )
      })}
    </div>
  )
}
