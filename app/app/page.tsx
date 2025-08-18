'use client'
import { useEffect, useMemo, useState } from 'react'
import { runSensiplan, type Day } from '@/lib/engine'
import { db, type Day as DbDay } from '@/lib/db'
import ChartBBT from './ChartBBT'

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

  // Load from IndexedDB
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
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-semibold mb-2">Today</h1>
        <div className="text-sm opacity-80 mb-4">Status: <span className="badge bg-white/10">{status}</span></div>
        <form className="grid gap-3 md:grid-cols-4" onSubmit={(e)=>{e.preventDefault(); saveToday();}}>
          <label className="flex flex-col gap-1">
            <span>BBT (°C)</span>
            <input className="card bg-white/10 border-white/20" inputMode="decimal" placeholder="36.55" value={temp} onChange={e=>setTemp(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1">
            <span>Mucus sensation</span>
            <select className="card bg-white/10 border-white/20" value={mucusSensation} onChange={e=>setMS(e.target.value as any)}>
              <option value="none">none</option><option value="dry">dry</option><option value="moist">moist</option><option value="slippery">slippery</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span>Mucus appearance</span>
            <select className="card bg-white/10 border-white/20" value={mucusAppearance} onChange={e=>setMA(e.target.value as any)}>
              <option value="none">none</option><option value="sticky">sticky</option><option value="creamy">creamy</option><option value="clear">clear</option><option value="stretchy">stretchy</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span>Bleeding</span>
            <select className="card bg-white/10 border-white/20" value={bleeding} onChange={e=>setBleeding(e.target.value as any)}>
              <option value="none">none</option><option value="spotting">spotting</option><option value="light">light</option><option value="normal">normal</option><option value="heavy">heavy</option>
            </select>
          </label>
          <button className="btn mt-2 md:col-span-4" type="submit">Save Today</button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-3">BBT Chart</h2>
        <ChartBBT days={entries} refMax={refMax} />
      </div>

      <div className="card">
        <h2 className="font-semibold mb-2">Derived Markers</h2>
        <div className="text-xs overflow-auto">
          <pre>{JSON.stringify(out, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
