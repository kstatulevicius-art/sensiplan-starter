'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { runSensiplan, type Day as EngineDay } from '@/lib/engine'
import { db, type Day as DbDay, type CoitusEvent } from '@/lib/db'
import { Section, GlassCard } from '@/components/Glass'
import CalendarToggle from './CalendarToggle'
import ChartModeToggle from './ChartModeToggle'
import AxisModeToggle from './AxisModeToggle'
import ChartErrorBoundary from './ChartErrorBoundary'
import MonthGrid from './calendar/MonthGrid'
import WeekStrip from './calendar/WeekStrip'
import { fromId, toId, addMonths } from './calendar/utils'
import SettingsDemo from './SettingsDemo'

const ChartSensiplan = dynamic(() => import('./ChartSensiplanSVG'), { ssr: false })

type Entry = EngineDay

function todayId(){
  const d = new Date()
  const p = (n:number) => String(n).padStart(2,'0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
}

export default function Tracker(){
  const [entries, setEntries] = useState<Entry[]>([])
  const [calendarMode, setCalendarMode] = useState<'month'|'week'>(() => (typeof window!=='undefined' && (localStorage.getItem('calMode') as 'month'|'week')) || 'month')
  const [chartMode, setChartMode] = useState<'classic'|'enhanced'>(() => (typeof window!=='undefined' && (localStorage.getItem('chartMode') as 'classic'|'enhanced')) || 'classic')
  const [axisMode, setAxisMode] = useState<'calendar'|'cycle'>(() => (typeof window!=='undefined' && (localStorage.getItem('axisMode') as 'calendar'|'cycle')) || 'calendar')

  const [selectedId, setSelectedId] = useState<string>(() => todayId())
  const [monthCursor, setMonthCursor] = useState<Date>(() => fromId(todayId()))

  const [temp, setTemp] = useState<string>('')
  const [mucusSensation, setMS] = useState<'none'|'dry'|'moist'|'slippery'>('dry')
  const [mucusAppearance, setMA] = useState<'none'|'sticky'|'creamy'|'clear'|'stretchy'>('none')
  const [bleeding, setBleeding] = useState<'none'|'spotting'|'light'|'normal'|'heavy'>('none')
  const [coitusEvents, setCoitusEvents] = useState<CoitusEvent[]>([])
  const [notes, setNotes] = useState<string>('')
  const [lifestyle, setLifestyle] = useState<any>({})

  useEffect(() => {
    db.days.toArray().then(ds => setEntries(ds.sort((a,b)=> a.id.localeCompare(b.id)) as Entry[]))
  }, [])

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
  const status = selectedMarker?.state ?? 'USE_CAUTION'

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

  function addCoitus(preset: CoitusEvent){ setCoitusEvents(prev => [...prev, preset]) }
  function removeCoitus(index: number){ setCoitusEvents(prev => prev.filter((_,i)=> i!==index)) }

  const monthTitle = monthCursor.toLocaleDateString(undefined, { month:'long', year:'numeric' })

  const marker = out.markers[selectedId]
  const insufficient = marker?.insufficientData
  const bgClass = insufficient ? 'bg-orange-50' : (marker?.state==='INFERTILE' ? 'bg-blue-50' : (marker?.state==='FERTILE' ? 'bg-emerald-50' : (bleeding!=='none' ? 'bg-red-50' : 'bg-orange-50')))

  return (
    <div className={bgClass + ' transition-colors duration-300 min-h-[40vh]'}>
      <Section className="pt-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tracker</h1>
          <p className="text-slate-600 mt-2">Select any day to edit. Status updates instantly.</p>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <CalendarToggle mode={calendarMode} setMode={setCalendarMode} />
            {calendarMode==='month' && (
              <div className="flex items-center gap-2">
                <button className="btn secondary" onClick={()=> setMonthCursor(addMonths(monthCursor,-1))}>Prev</button>
                <div className="text-sm text-slate-600">{monthTitle}</div>
                <button className="btn secondary" onClick={()=> setMonthCursor(addMonths(monthCursor,1))}>Next</button>
              </div>
            )}
          </div>
          <div className="text-sm text-slate-600">Selected: <span className="font-medium">{selectedId}</span> • Status: <span className="badge">{status}</span></div>
        </div>

        <GlassCard>
          {calendarMode==='month' ?
            <MonthGrid current={monthCursor} selectedId={selectedId} onSelect={(id)=>{ setSelectedId(id); setMonthCursor(fromId(id)) }} statusMap={statusMap} />
            :
            <WeekStrip selectedId={selectedId} onSelect={setSelectedId} statusMap={statusMap} />
          }
        </GlassCard>
      </Section>

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-3">Daily Entry</h2>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(e)=>{e.preventDefault(); saveSelected();}}>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">BBT (°C)</span>
                <input className="glass px-3 py-2" inputMode="decimal" placeholder="36.55" value={temp} onChange={e=>setTemp(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">Bleeding</span>
                <select className="glass px-3 py-2" value={bleeding} onChange={e=>setBleeding(e.target.value as any)}>
                  <option value="none">none</option><option value="spotting">spotting</option><option value="light">light</option><option value="normal">normal</option><option value="heavy">heavy</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">Mucus sensation</span>
                <select className="glass px-3 py-2" value={mucusSensation} onChange={e=>setMS(e.target.value as any)}>
                  <option value="none">none</option><option value="dry">dry</option><option value="moist">moist</option><option value="slippery">slippery</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm text-slate-600">Mucus appearance</span>
                <select className="glass px-3 py-2" value={mucusAppearance} onChange={e=>setMA(e.target.value as any)}>
                  <option value="none">none</option><option value="sticky">sticky</option><option value="creamy">creamy</option><option value="clear">clear</option><option value="stretchy">stretchy</option>
                </select>
              </label>

              <button className="btn md:col-span-2" type="submit">Save</button>
            </form>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="glass p-3 rounded-xl">
                <div className="text-sm font-medium mb-2">Notes</div>
                <textarea className="w-full glass p-2 rounded-lg min-h-[72px]" placeholder="ill, travel, alcohol..." value={notes} onChange={e=>setNotes(e.target.value)} />
              </div>
              <div className="glass p-3 rounded-xl">
                <div className="text-sm font-medium mb-2">Lifestyle & Health</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!lifestyle.illness} onChange={e=>setLifestyle({...lifestyle, illness:e.target.checked})}/>Illness</label>
                  <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!lifestyle.alcohol} onChange={e=>setLifestyle({...lifestyle, alcohol:e.target.checked})}/>Alcohol</label>
                  <label className="inline-flex items-center gap-2"><input type="checkbox" checked={!!lifestyle.travel} onChange={e=>setLifestyle({...lifestyle, travel:e.target.checked})}/>Travel</label>
                  <label className="inline-flex items-center gap-2">Stress<select className="glass ml-2 px-2 py-1" value={lifestyle.stress ?? 'none'} onChange={e=>setLifestyle({...lifestyle, stress:e.target.value})}><option>none</option><option>low</option><option>moderate</option><option>high</option></select></label>
                  <label className="inline-flex items-center gap-2">Sleep<select className="glass ml-2 px-2 py-1" value={lifestyle.sleepQuality ?? 'ok'} onChange={e=>setLifestyle({...lifestyle, sleepQuality:e.target.value})}><option>poor</option><option>ok</option><option>good</option></select></label>
                  <label className="inline-flex items-center gap-2">Exercise<select className="glass ml-2 px-2 py-1" value={lifestyle.exercise ?? 'none'} onChange={e=>setLifestyle({...lifestyle, exercise:e.target.value})}><option>none</option><option>light</option><option>moderate</option><option>intense</option></select></label>
                </div>
                <div className="text-xs text-slate-500 mt-2">Temps auto-marked disturbed if illness, alcohol, travel, poor sleep, or intense exercise.</div>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold mb-3">Intercourse</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              <button className="btn secondary" onClick={()=>addCoitus({ protection:'none', ejaculation:'vaginal' })}>Unprotected</button>
              <button className="btn secondary" onClick={()=>addCoitus({ protection:'condom', ejaculation:'external' })}>Condom</button>
              <button className="btn secondary" onClick={()=>addCoitus({ protection:'withdrawal', ejaculation:'external' })}>Withdrawal</button>
              <button className="btn secondary" onClick={()=>addCoitus({ protection:'other', ejaculation:'unknown' })}>Other</button>
            </div>
            <ul className="space-y-2">
              {coitusEvents.map((ev, i) => (
                <li key={i} className="glass px-3 py-2 flex items-center justify-between rounded-xl">
                  <div className="text-sm">
                    <span className="font-medium">{ev.protection ?? 'n/a'}</span>
                    <span className="opacity-60">{ev.ejaculation ? ` • ${ev.ejaculation}` : ''}</span>
                    {ev.at && <span className="opacity-60"> • {ev.at}</span>}
                  </div>
                  <button className="text-red-600 text-sm underline" onClick={()=>removeCoitus(i)}>Delete</button>
                </li>
              ))}
              {coitusEvents.length===0 && <li className="text-sm text-slate-500">No events logged for this day.</li>}
            </ul>
            <div className="mt-3">
              <button className="btn" onClick={saveSelected}>Save Intercourse</button>
            </div>
          </GlassCard>
        </div>
      </Section>

      <Section>
        <GlassCard>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Chart</h2>
            <div className="flex gap-2">
              <AxisModeToggle mode={axisMode} setMode={setAxisMode} />
              <ChartModeToggle mode={chartMode} setMode={setChartMode} />
            </div>
          </div>
          <ChartErrorBoundary>
            <ChartSensiplan days={entries} markers={out.markers} axisMode={axisMode} />
          </ChartErrorBoundary>
          <div className="text-xs text-slate-500 mt-3">
            Red line = BBT • Blue bars = mucus quality • Green band = fertile window • Dashed lines = Peak / Temp shift
          </div>
        </GlassCard>
      </Section>

      <Section>
        <GlassCard>
          <h2 className="text-xl font-semibold mb-2">Decision details for {selectedId}</h2>
          <div className="text-sm text-slate-700 space-y-1">
            {(out.markers[selectedId]?.explanations ?? ['No specific markers for this day.']).map((e,i)=> <div key={i}>• {e}</div>)}
          </div>
        </GlassCard>
      </Section>

      <Section>
        <GlassCard>
          <h2 className="text-xl font-semibold mb-3">Settings</h2>
          <SettingsDemo onAfterChange={()=>{ setAxisMode('calendar'); refreshEntries() }} />
        </GlassCard>
      </Section>
    </div>
  )
}
