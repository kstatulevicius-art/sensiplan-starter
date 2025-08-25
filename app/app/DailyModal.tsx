'use client'
import React, { useEffect, useState } from 'react'
import ChipGroup from '@/components/ui/ChipGroup'

type CoitusEvent = { protection?: 'none'|'condom'|'withdrawal'; ejaculation?: 'vaginal'|'external'|'none' }

export default function DailyModal({ open, onClose, initial, onSave }:{
  open: boolean,
  onClose: ()=>void,
  initial: {
    id: string,
    bbt?: number,
    bleeding?: 'none'|'spotting'|'light'|'normal'|'heavy',
    mucusSensation?: 'none'|'dry'|'moist'|'slippery',
    mucusAppearance?: 'none'|'sticky'|'creamy'|'clear'|'stretchy',
    notes?: string,
    coitus?: { events: CoitusEvent[] }
  },
  onSave: (data:any)=>Promise<void>|void
}){
  const [temp, setTemp] = useState<string>('')
  const [bleeding, setBleeding] = useState<any>('none')
  const [ms, setMS] = useState<any>('dry')
  const [ma, setMA] = useState<any>('none')
  const [notes, setNotes] = useState<string>('')
  const [coitus, setCoitus] = useState<CoitusEvent[]>([])

  useEffect(()=>{
    setTemp(initial?.bbt?.toString() ?? '')
    setBleeding(initial?.bleeding ?? 'none')
    setMS(initial?.mucusSensation ?? 'dry')
    setMA(initial?.mucusAppearance ?? 'none')
    setNotes(initial?.notes ?? '')
    setCoitus(initial?.coitus?.events ?? [])
  }, [open, initial])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-end md:items-center md:justify-center">
      <div className="w-full md:max-w-xl bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-4 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Log {new Date(initial.id).toLocaleDateString()}</div>
          <button className="text-slate-500 hover:text-slate-700" onClick={onClose}>Close</button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-sm text-slate-600 mb-2">Temperature (°C)</div>
            <div className="flex gap-2">
              <input id="modalTemp" className="flex-1 rounded-xl ring-1 ring-slate-200 px-3 py-2" inputMode="decimal" placeholder="36.55" value={temp} onChange={e=>setTemp(e.target.value)} />
              <div className="flex gap-1">
                <button className="px-3 py-2 rounded-lg ring-1 ring-slate-200" onClick={()=>setTemp(t=> (t? (Number(t)+0.05).toFixed(2):'36.50'))}>+0.05</button>
                <button className="px-3 py-2 rounded-lg ring-1 ring-slate-200" onClick={()=>setTemp(t=> (t? (Number(t)-0.05).toFixed(2):'36.50'))}>-0.05</button>
              </div>
            </div>
          </div>

          <div>
            <div className="text-sm text-slate-600 mb-2">Bleeding</div>
            <ChipGroup value={bleeding} onChange={setBleeding} options={[
              {value:'none', label:'None'},
              {value:'spotting', label:'Spot'},
              {value:'light', label:'Light'},
              {value:'normal', label:'Normal'},
              {value:'heavy', label:'Heavy'},
            ]} />
          </div>

          <div>
            <div className="text-sm text-slate-600 mb-2">Mucus Sensation</div>
            <ChipGroup value={ms} onChange={setMS} options={[
              {value:'none', label:'None'},
              {value:'dry', label:'Dry'},
              {value:'moist', label:'Moist'},
              {value:'slippery', label:'Slippery'},
            ]} />
          </div>

          <div>
            <div className="text-sm text-slate-600 mb-2">Mucus Appearance</div>
            <ChipGroup value={ma} onChange={setMA} options={[
              {value:'none', label:'None'},
              {value:'sticky', label:'Sticky'},
              {value:'creamy', label:'Creamy'},
              {value:'clear', label:'Clear'},
              {value:'stretchy', label:'Stretchy'},
            ]} />
          </div>

          <div>
            <div className="text-sm text-slate-600 mb-2">Intercourse</div>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm" onClick={()=>setCoitus(prev => [...prev, { protection:'none', ejaculation:'vaginal' }])}>Unprotected</button>
              <button className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm" onClick={()=>setCoitus(prev => [...prev, { protection:'condom', ejaculation:'external' }])}>Condom</button>
              <button className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm" onClick={()=>setCoitus(prev => [...prev, { protection:'withdrawal', ejaculation:'external' }])}>Withdrawal</button>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {coitus.map((ev, i) => (
                <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 ring-1 ring-slate-200">
                  <span>{ev.protection} {ev.ejaculation ? `• ${ev.ejaculation}` : ''}</span>
                  <button className="text-red-600 underline" onClick={()=>setCoitus(prev => prev.filter((_,k)=>k!==i))}>Delete</button>
                </li>
              ))}
              {coitus.length===0 && <li className="text-slate-500">No events logged for this day.</li>}
            </ul>
          </div>

          <div>
            <div className="text-sm text-slate-600 mb-2">Notes</div>
            <textarea className="w-full rounded-xl ring-1 ring-slate-200 px-3 py-2 min-h-[88px]" placeholder="ill, travel, alcohol..." value={notes} onChange={e=>setNotes(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-full bg-white ring-1 ring-slate-200" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded-full bg-emerald-600 text-white" onClick={async()=>{
            await onSave({
              bbt: temp? Number(temp): undefined,
              bleeding: bleeding==='none'? undefined: bleeding,
              mucusSensation: ms,
              mucusAppearance: ma,
              coitus: { events: coitus },
              notes
            })
            onClose()
          }}>Save</button>
        </div>
      </div>
    </div>
  )
}
