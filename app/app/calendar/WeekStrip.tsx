'use client'
import { addDays, toId, fromId } from './utils'
import { BleedTiny, HeartTiny, FertileTiny, InfertileTiny, CautionTiny, LifestyleTiny } from '@/components/Icons'

export type DayStatus = {
  filled: boolean
  bleeding: 'none'|'spotting'|'light'|'normal'|'heavy'
  state: 'FERTILE'|'INFERTILE'|'USE_CAUTION'
  hasCoitus: boolean
  hasFertileMucus: boolean
  hasLifestyle: boolean
}

export default function WeekStrip({ selectedId, onSelect, statusMap }:{ 
  selectedId: string, onSelect:(id:string)=>void, statusMap: Record<string, DayStatus>
}){
  const center = fromId(selectedId)
  const days = Array.from({length: 7}, (_,i)=> addDays(center, i-3))
  return (
    <div className="flex gap-1.5 overflow-x-auto py-1 px-1">
      {days.map((d, i) => {
        const id = toId(d)
        const st = statusMap[id]
        const isToday = id === toId(new Date())
        const isSelected = id === selectedId
        const stateIcon = st?.state==='FERTILE' ? <CautionTiny/> : st?.state==='INFERTILE' ? <InfertileTiny/> : st ? <CautionTiny/> : null
        return (
          <button key={i} onClick={()=>onSelect(id)} className={`min-w-[48px] rounded-xl px-2 py-1.5 glass text-center ${isSelected?'ring-2 ring-emerald-500 bg-emerald-50/40':''}`}>
            <div className="text-[9px]">{d.toLocaleDateString(undefined, { weekday:'short' })}</div>
            <div className="text-[12px] font-medium leading-tight">{d.getDate()}</div>
            <div className="flex items-center justify-center gap-0.5 mt-1 text-[11px]">
              {st?.filled && <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
              {st?.bleeding && st.bleeding!=='none' && <span><BleedTiny/></span>}
              {st?.hasFertileMucus && <span><FertileTiny/></span>}
              {stateIcon}
              {st?.hasCoitus && <span><HeartTiny/></span>}
              {st?.hasLifestyle && <span><LifestyleTiny/></span>}
            </div>
            {isToday && <div className="mt-0.5 text-[9px] text-blue-600">Today</div>}
          </button>
        )
      })}
    </div>
  )
}