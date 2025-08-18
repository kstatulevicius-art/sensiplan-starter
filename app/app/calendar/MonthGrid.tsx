'use client'
import { getMonthGridCells, toId } from './utils'
import { BleedTiny, HeartTiny, FertileTiny, InfertileTiny, CautionTiny } from '@/components/Icons'

export type DayStatus = {
  filled: boolean
  bleeding: 'none'|'spotting'|'light'|'normal'|'heavy'
  state: 'FERTILE'|'INFERTILE'|'USE_CAUTION'
  hasCoitus: boolean
}

export default function MonthGrid({ current, selectedId, onSelect, statusMap }:{ 
  current: Date, selectedId: string, onSelect:(id:string)=>void, statusMap: Record<string, DayStatus>
}){
  const cells = getMonthGridCells(current, 1)
  const month = current.getMonth()
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 text-xs text-slate-500 mb-2">
        {dayNames.map(d => <div key={d} className="text-center">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, idx) => {
          const id = toId(d)
          const st = statusMap[id]
          const isToday = id === toId(new Date())
          const isSelected = id === selectedId
          const isOtherMonth = d.getMonth() !== month
          const stateIcon = st?.state==='FERTILE' ? <FertileTiny/> : st?.state==='INFERTILE' ? <InfertileTiny/> : st ? <CautionTiny/> : null
          return (
            <button key={idx} onClick={()=>onSelect(id)} aria-label={id}
              className={`relative aspect-square rounded-xl text-sm flex flex-col items-center justify-center
                ${isSelected?'ring-2 ring-blue-500':''}
                ${isOtherMonth?'opacity-40':''}
                glass`}>
              <div className="absolute top-1 right-1 text-[10px]">{st?.hasCoitus && <HeartTiny/>}</div>
              <div className="text-[11px]">{d.getDate()}</div>
              <div className="flex gap-1 mt-1 items-center">
                {st?.filled && <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                {st?.bleeding && st.bleeding!=='none' && <BleedTiny/>}
                {stateIcon}
              </div>
              {isToday && <div className="absolute inset-0 rounded-xl ring-1 ring-blue-400/60 pointer-events-none" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
