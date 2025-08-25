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
import DailyModal from './DailyModal'
import '../_calendar.css'

const ChartSensiplan = dynamic(() => import('./ChartSensiplanSVG'), { ssr: false })

type Entry = EngineDay

function todayId(){
  const d = new Date()
  const p = (n:number) => String(n).padStart(2,'0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
}

function bgForState(state?: 'FERTILE'|'INFERTILE'|'USE_CAUTION') {
  if (state === 'FERTILE') return 'bg-fertile'
  if (state === 'INFERTILE') return 'bg-infertile'
  return 'bg-caution'
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

  const [modalOpen, setModalOpen] = useState(false)

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
      filled: !!(d.bbt || d.bleeding!=='none' || d.mucusSensation!=='dry' || d.mucusAppearance!=='none' || d.coitus?.events?.length || d.notes),
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
  const pageBgClass = bgForState(selectedMarker?.state as any)

  // Explanations: show rule-oriented tips when present
  const decisionList: string[] = (out.markers[selectedId]?.explanations && out.markers[selectedId].explanations.length>0)
    ? out.markers[selectedId].explanations
    : [
      selectedMarker?.state==='INFERTILE' ? 'No fertile-type mucus observed and temperature pattern indicates infertile phase.' :
      selectedMarker?.state==='FERTILE' ? 'Fertile-type mucus or temperature pattern indicates fertile phase.' :
      'Not enough information yet; consider today as fertile to stay safe.'
    ]

  const selectedEntry = entries.find(e=>e.id===selectedId)

  return (
    <div className={`pageBg ${pageBgClass} min-h-screen`}>
      <div className="p-4 md:p-6 space-y-6">

        {/* Hero header */}
        <div className="hero p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600">Selected</div>
              <div className="text-2xl font-semibold">{new Date(selectedId).toLocaleDateString(undefined, { weekday:'long', month:'short', day:'numeric' })}</div>
            </div>
            <StatusPill state={selectedMarker?.state as any} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-sm" onClick={()=>setModalOpen(true)}>Log Today</button>
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
            {decisionList.map((e,i)=> <div key={i}>• {e}</div>)}
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

      {/* Daily Modal */}
      <DailyModal
        open={modalOpen}
        onClose={()=>setModalOpen(false)}
        initial={{
          id: selectedId,
          bbt: selectedEntry?.bbt,
          bleeding: selectedEntry?.bleeding,
          mucusSensation: selectedEntry?.mucusSensation,
          mucusAppearance: selectedEntry?.mucusAppearance,
          notes: selectedEntry?.notes
        }}
        onSave={async (patch)=>{
          const merged = {
            ...(selectedEntry || { id: selectedId }),
            ...patch
          }
          await db.days.put(merged as DbDay)
          const ds = await db.days.toArray()
          setEntries(ds.sort((a,b)=> a.id.localeCompare(b.id)) as Entry[])
        }}
      />
    </div>
  )
}
