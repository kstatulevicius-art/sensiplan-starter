'use client'
import { useEffect, useState } from 'react'
import { seedDemoCycle, clearDemo } from '@/lib/demo'
import { db } from '@/lib/db'

export default function SettingsDemo({ onAfterChange }:{ onAfterChange: ()=>void }){
  const [mode, setMode] = useState<'textbook'|'messy'|''>('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    (async () => {
      const rec = await db.meta.get('demo_enabled')
      const val = rec?.value ?? ''
      setMode(val as any)
    })()
  }, [])

  async function enable(selected:'textbook'|'messy'){
    if (busy) return
    setBusy(true)
    try {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 27)
      await seedDemoCycle({ y:start.getFullYear(), m:start.getMonth()+1, d:start.getDate() }, selected)
      setMode(selected)
      onAfterChange()
    } finally {
      setBusy(false)
    }
  }

  async function disable(){
    if (busy) return
    setBusy(true)
    try {
      await clearDemo()
      setMode('')
      onAfterChange()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="font-medium">Demo data</div>
        <div className="text-sm text-slate-600">Insert a 28‑day example cycle for testing. Choose a style, or disable.</div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={()=>enable('textbook')} disabled={busy} className={`btn ${mode==='textbook'?'':'secondary'}`}>Enable textbook</button>
        <button onClick={()=>enable('messy')} disabled={busy} className={`btn ${mode==='messy'?'':'secondary'}`}>Enable messy</button>
        <button onClick={disable} disabled={busy || !mode} className="btn secondary">Disable demo</button>
      </div>
      <div className="text-xs text-slate-500">Current: {mode || 'none'}</div>
    </div>
  )
}
