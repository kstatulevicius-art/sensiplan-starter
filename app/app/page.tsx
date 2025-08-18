'use client'
import { useEffect, useMemo, useState } from 'react'
import { runSensiplan, type Day } from '@/lib/engine'
import { db, type Day as DbDay } from '@/lib/db'
import ChartBBT from './ChartBBT'
import { Section, GlassCard } from '@/components/Glass'

function todayId() {
  const d = new Date(); 
  const pad = (n:number)=> String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

type Entry = Day

export default function Tracker() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [temp, setTemp] = useState<string>('')
  const [mucusSensation, setMS] = useState<'none'|'dry'|'moist'|'slippery'>('dry')
  const [mucusAppearance, setMA] = useState<'none'|'sticky'|'creamy'|'clear'|'stretchy'>('none')
  const [bleeding, setBleeding] = useState<'none'|'spotting'|'light'|'normal'|'heavy'>('none')

  useEffect(() => {
    db.days.toArray().then(ds => {
      const sorted = ds.sort((a,b)=> a.id.localeCompare(b.id))
      setEntries(sorted as Entry[])
    })
  }, [])

  const out = useMemo(() => runSensiplan(entries, { unit:'C', earlyInfertile:'off' }), [entries])
  const today = entries.find(e => e.id === todayId())
  const status = today ? (out.markers[today.id]?.state ?? 'USE_CAUTION') : 'USE_CAUTION'
  const refMax = today ? out.markers[today.id]?.refWindowMax : undefined

  async function saveToday() {
    const id = todayId()
    const entry: Entry = { id, bleeding, mucusSensation, mucusAppearance, bbt: temp ? parseFloat(temp) : undefined }
    await db.days.put(entry as DbDay)
    const ds = await db.days.toArray()
    setEntries(ds.sort((a,b)=> a.id.localeCompare(b.id)) as Entry[])
    setTemp('')
  }

  return (
    <>
      <Section className="pt-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tracker</h1>
          <p className="text-slate-600 mt-2">Private, offline-first. Status updates as you log entries.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-3">Today</h2>
            <div className="text-sm mb-4">Status: <span className="badge">{status}</span></div>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(e)=>{e.preventDefault(); saveToday();}}>
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
              <button className="btn md:col-span-2" type="submit">Save Today</button>
            </form>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold mb-3">BBT Chart</h2>
            <ChartBBT days={entries} refMax={refMax} />
          </GlassCard>
        </div>
      </Section>

      <Section>
        <GlassCard>
          <h2 className="text-xl font-semibold mb-3">Derived Markers</h2>
          <div className="text-xs overflow-auto max-h-[300px]">
            <pre>{JSON.stringify(out, null, 2)}</pre>
          </div>
        </GlassCard>
      </Section>
    </>
  )
}
