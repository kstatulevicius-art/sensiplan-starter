'use client'
import { getMonthGridCells, toId } from './utils'
import { BleedTiny, HeartTiny, FertileTiny, InfertileTiny, CautionTiny, LifestyleTiny } from '@/components/Icons'

export type DayStatus = {
  filled: boolean
  bleeding: 'none'|'spotting'|'light'|'normal'|'heavy'
  state: 'FERTILE'|'INFERTILE'|'USE_CAUTION'
  hasCoitus: boolean
  hasFertileMucus: boolean
  hasLifestyle: boolean
}

export default function MonthGrid({ current, selectedId, onSelect, statusMap }:{ 
  current: Date, selectedId: string, onSelect:(id:string)=>void, statusMap: Record<string, DayStatus>
}){
  const cells = getMonthGridCells(current, 1)
  const month = current.getMonth()
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 text-[10px] text-slate-500 mb-1">
        {dayNames.map(d => <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((d, idx) => {
          const id = toId(d)
          const st = statusMap[id]
          const isToday = id === toId(new Date())
          const isSelected = id === selectedId
          const isOtherMonth = d.getMonth() !== month
          const stateIcon = st?.state==='FERTILE' ? <CautionTiny/> : st?.state==='INFERTILE' ? <InfertileTiny/> : st ? <CautionTiny/> : null
          return (
            <button key={idx} onClick={()=>onSelect(id)} aria-label={id}
              className={`relative aspect-square rounded-lg text-[11px] flex flex-col items-center justify-center glass p-1.5
                ${isSelected?'ring-2 ring-emerald-500 bg-emerald-50/40':''}
                ${isOtherMonth?'opacity-40':''}`}>
              <div className="absolute top-1 right-1 text-[9px] flex gap-0.5">
                {st?.hasCoitus && <HeartTiny/>}
                {st?.hasLifestyle && <LifestyleTiny/>}
              </div>
              <div className="text-[10px] leading-none">{d.getDate()}</div>
              <div className="flex gap-0.5 mt-1 items-center text-[11px]">
                {st?.filled && <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                {st?.bleeding && st.bleeding!=='none' && <BleedTiny/>}
                {st?.hasFertileMucus && <FertileTiny/>}
                {stateIcon}
              </div>
              {isToday && <div className="absolute inset-0 rounded-lg ring-1 ring-blue-400/60 pointer-events-none" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}