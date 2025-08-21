'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { runSensiplan, type Day as EngineDay } from '@/lib/engine'
import { db, type Day as DbDay, type CoitusEvent } from '@/lib/db'
import { Section as Card, Header } from '@/components/ui/Section'
import ChipGroup from '@/components/ui/ChipGroup'
import Segmented from '@/components/ui/Segmented'
import StatusPill from '@/components/ui/StatusPill'
import MonthGrid from './calendar/MonthGrid'
import WeekStrip from './calendar/WeekStrip'
import { fromId, toId, addMonths } from './calendar/utils'
import SettingsDemo from './SettingsDemo'
import SettingsDensity from './SettingsDensity'
import '../_globals_calm.css'

const ChartSensiplan = dynamic(() => import('./ChartSensiplanSVG'), { ssr: false })

type Entry = EngineDay

function todayId(){
  const d = new Date()
  const p = (n:number) => String(n).padStart(2,'0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
}

export default function Tracker(){
  const [entries, setEntries] = useState<Entry[]>([])
  const [calendarMode, setCalendarMode] = useState<'month'|'week'>(() => (typeof window!=='undefined' && (localStorage.getItem('calMode') as any)) || 'month')
  const [chartMode, setChartMode] = useState<'classic'|'enhanced'>(() => (typeof window!=='undefined' && (localStorage.getItem('chartMode') as any)) || 'classic')
  const [axisMode, setAxisMode] = useState<'calendar'|'cycle'>(() => (typeof window!=='undefined' && (localStorage.getItem('axisMode') as any)) || 'calendar')

  const [selectedId, setSelectedId] = useState<string>(() => todayId())
  const [monthCursor, setMonthCursor] = useState<Date>(() => fromId(todayId()))

  const [temp, setTemp] = useState<string>('')
  const [mucusSensation, setMS] = useState<'none'|'dry'|'moist'|'slippery'>('dry')
  const [mucusAppearance, setMA] = useState<'none'|'sticky'|'creamy'|'clear'|'stretchy'>('none')
  const [bleeding, setBleeding] = useState<'none'|'spotting'|'light'|'normal'|'heavy'>('none')
  const [coitusEvents, setCoitusEvents] = useState<CoitusEvent[]>([])
  const [notes, setNotes] = useState<string>('')
  const [lifestyle, setLifestyle] = useState<any>({})

  useEffect(() => { db.days.toArray().then(ds => setEntries(ds.sort((a,b)=> a.id.localeCompare(b.id)) as Entry[])) }, [])

  useEffect(() => { if (typeof window!=='undefined') localStorage.setItem('calMode', calendarMode) }, [calendarMode])
  useEffect(() => { if (typeof window!=='undefined') localStorage.setItem('chartMode', chartMode) }, [chartMode])
  useEffect(() => { if (typeof window!=='undefined') localStorage.setItem('axisMode', axisMode) }, [axisMode])

  useEffect(() => {
    const found = entries.find(e => e.id === selectedId)
    setTemp(found?.bbt?.toString() ?? '')
    setMS(found?.mucusSensation ?? 'dry')
    setMA(found?.mucusAppearance ?? 'none')
    setBleeding(found?.bleeding ?? 'none')
    setCoitusEvents(found?.coitus?.events ?? [])
    setNotes(found?.notes ?? '')
    setLifestyle(found?.lifestyle ?? {})
  }, [selectedId, entries])

  const out = useMemo(() => runSensiplan(entries, { unit:'C', earlyInfertile:'off' }), [entries])
  const selectedMarker = out.markers[selectedId]

  const statusMap: Record<string, { filled:boolean, bleeding:any, state:'FERTILE'|'INFERTILE'|'USE_CAUTION', hasCoitus:boolean, hasFertileMucus:boolean, hasLifestyle:boolean }> = {}
  for (const d of entries) {
    statusMap[d.id] = {
      filled: true,
      bleeding: d.bleeding,
      state: (out.markers[d.id]?.state as any) ?? 'USE_CAUTION',
      hasCoitus: !!(d.coitus?.events?.length),
      hasFertileMucus: (d.mucusSensation==='slippery' || d.mucusAppearance==='clear' || d.mucusAppearance==='stretchy'),
      hasLifestyle: !!(d.lifestyle && Object.keys(d.lifestyle).length)
    }
  }

  async function refreshEntries(){
    const ds = await db.days.toArray()
    setEntries(ds.sort((a,b)=> a.id.localeCompare(b.id)) as Entry[])
  }

  async function saveSelected() {
    const id = selectedId
    const entry: Entry = {
      id,
      bleeding,
      mucusSensation,
      mucusAppearance,
      bbt: temp ? parseFloat(temp) : undefined,
      coitus: { events: coitusEvents },
      notes,
      lifestyle,
      bbtDisturbed: !!(lifestyle?.illness || lifestyle?.alcohol || lifestyle?.travel || lifestyle?.sleepQuality==='poor' || lifestyle?.exercise==='intense')
    }
    await db.days.put(entry as DbDay)
    await refreshEntries()
  }

  const monthTitle = monthCursor.toLocaleDateString(undefined, { month:'long', year:'numeric' })

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="hero p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600">Today</div>
            <div className="text-2xl font-semibold">{new Date().toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' })}</div>
          </div>
          <StatusPill state={selectedMarker?.state as any} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-sm" onClick={()=>document.getElementById('tempInput')?.focus()}>Add Temp</button>
          <button className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm" onClick={()=>{}}>Add Mucus</button>
          <button className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm" onClick={()=>{}}>Add Note</button>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Calendar</div>
          <div className="flex items-center gap-2">
            {calendarMode==='month' && (
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm" onClick={()=> setMonthCursor(addMonths(monthCursor,-1))}>Prev</button>
                <div className="text-sm text-slate-600">{monthTitle}</div>
                <button className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm" onClick={()=> setMonthCursor(addMonths(monthCursor,1))}>Next</button>
              </div>
            )}
            <Segmented
              value={calendarMode}
              onChange={(v)=>setCalendarMode(v as 'month'|'week')}
              options={[{value:'month', label:'Month'},{value:'week', label:'Week'}]}
            />
          </div>
        </div>
        {calendarMode==='month' ?
          <MonthGrid current={monthCursor} selectedId={selectedId} onSelect={(id)=>{ setSelectedId(id); setMonthCursor(fromId(id)) }} statusMap={statusMap} />
          :
          <WeekStrip selectedId={selectedId} onSelect={setSelectedId} statusMap={statusMap} />
        }
      </Card>

      {/* Daily Entry */}
      <Card>
        <Header title="Daily Entry" subtitle="Log basal temperature, bleeding, and cervical mucus." />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-600 mb-2">Temperature (°C)</div>
              <input id="tempInput" className="w-full rounded-xl ring-1 ring-slate-200 px-3 py-2" inputMode="decimal" placeholder="36.55" value={temp} onChange={e=>setTemp(e.target.value)} />
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Bleeding</div>
              <ChipGroup
                ariaLabel="Bleeding"
                value={bleeding}
                onChange={v=>setBleeding(v as any)}
                options={[
                  { value:'none', label:'None' },
                  { value:'spotting', label:'Spot' },
                  { value:'light', label:'Light' },
                  { value:'normal', label:'Normal' },
                  { value:'heavy', label:'Heavy' },
                ]}
              />
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Mucus Sensation</div>
              <ChipGroup
                ariaLabel="Mucus Sensation"
                value={mucusSensation}
                onChange={v=>setMS(v as any)}
                options={[
                  { value:'none', label:'None' },
                  { value:'dry', label:'Dry' },
                  { value:'moist', label:'Moist' },
                  { value:'slippery', label:'Slippery' },
                ]}
              />
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Mucus Appearance</div>
              <ChipGroup
                ariaLabel="Mucus Appearance"
                value={mucusAppearance}
                onChange={v=>setMA(v as any)}
                options={[
                  { value:'none', label:'None' },
                  { value:'sticky', label:'Sticky' },
                  { value:'creamy', label:'Creamy' },
                  { value:'clear', label:'Clear' },
                  { value:'stretchy', label:'Stretchy' },
                ]}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-slate-600 mb-2">Intercourse</div>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm" onClick={()=>setCoitusEvents(prev => [...prev, { protection:'none', ejaculation:'vaginal' }])}>Unprotected</button>
                <button className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm" onClick={()=>setCoitusEvents(prev => [...prev, { protection:'condom', ejaculation:'external' }])}>Condom</button>
                <button className="px-3 py-1.5 rounded-full bg-white ring-1 ring-slate-200 text-sm" onClick={()=>setCoitusEvents(prev => [...prev, { protection:'withdrawal', ejaculation:'external' }])}>Withdrawal</button>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {coitusEvents.map((ev, i) => (
                  <li key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 ring-1 ring-slate-200">
                    <span>{ev.protection} {ev.ejaculation ? `• ${ev.ejaculation}` : ''}</span>
                    <button className="text-red-600 underline" onClick={()=>setCoitusEvents(prev => prev.filter((_,k)=>k!==i))}>Delete</button>
                  </li>
                ))}
                {coitusEvents.length===0 && <li className="text-slate-500">No events logged for this day.</li>}
              </ul>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-2">Notes</div>
              <textarea className="w-full rounded-xl ring-1 ring-slate-200 px-3 py-2 min-h-[88px]" placeholder="ill, travel, alcohol..." value={notes} onChange={e=>setNotes(e.target.value)} />
            </div>
            <button className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm" onClick={async()=>{ await saveSelected() }}>Save day</button>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Chart</div>
          <div className="flex gap-2">
            <Segmented
              value={axisMode}
              onChange={(v)=>setAxisMode(v as 'calendar'|'cycle')}
              options={[{value:'calendar', label:'Calendar'},{value:'cycle', label:'Cycle'}]}
            />
            <Segmented
              value={chartMode}
              onChange={(v)=>setChartMode(v as 'classic'|'enhanced')}
              options={[{value:'classic', label:'Classic'},{value:'enhanced', label:'Enhanced'}]}
            />
          </div>
        </div>
        <ChartSensiplan days={entries} markers={out.markers} axisMode={axisMode} mode={chartMode} />
      </Card>

      {/* Decision details */}
      <Card>
        <Header title={`Decision details for ${selectedId}`} />
        <div className="text-sm text-slate-700 space-y-1">
          {(out.markers[selectedId]?.explanations ?? ['No specific markers for this day.']).map((e,i)=> <div key={i}>• {e}</div>)}
        </div>
      </Card>

      {/* Settings */}
      <Card>
        <Header title="Settings" />
        <div className="grid gap-4 md:grid-cols-2">
          <SettingsDemo onAfterChange={async()=>{ const ds = await db.days.toArray(); setEntries(ds.sort((a,b)=> a.id.localeCompare(b.id)) as Entry[]) }} />
          <SettingsDensity />
        </div>
      </Card>
    </div>
  )
}
