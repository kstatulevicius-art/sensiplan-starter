'use client'
import React from 'react'
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
    <div className="cal-grid">
      {days.map(dt => {
        const id = toId(dt)
        const st = statusMap[id]
        const isSelected = id===selectedId
        const bleeding = st?.bleeding && st.bleeding!=='none'
        const mucus = st?.hasFertileMucus
        const coitus = st?.hasCoitus
        const filled = st?.filled

        return (
          <button key={id} onClick={()=>onSelect(id)} className={`cal-tile tall ${isSelected?'selected':''}`}>
            <div className="daynum">{dt.getDate()} <span className="text-xs text-slate-400">{dt.toLocaleDateString(undefined,{weekday:'short'})}</span></div>
            <div className="cal-icons">
              {bleeding && <span title="bleeding">💧</span>}
              {mucus && <span title="fertile mucus">✨</span>}
              {coitus && <span title="intercourse">❤</span>}
              {filled && !bleeding && !mucus && !coitus && <span title="logged">•</span>}
            </div>
          </button>
        )
      })}
    </div>
  )
}
