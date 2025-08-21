'use client'
import { useEffect, useState } from 'react'

type Density = 'compact'|'cozy'|'comfy'

export default function SettingsDensity(){
  const [density, setDensity] = useState<Density>('cozy')

  useEffect(()=>{
    const v = (localStorage.getItem('density') as Density) || 'cozy'
    setDensity(v)
  }, [])

  function apply(v: Density){
    setDensity(v)
    localStorage.setItem('density', v)
    window.dispatchEvent(new CustomEvent('density-change', { detail: v }))
  }

  return (
    <div className="space-y-2">
      <div className="font-medium">UI density</div>
      <div className="text-sm text-slate-600">Choose how tight the layout should be.</div>
      <div className="flex gap-2">
        <button className={`btn ${density==='compact'?'':'secondary'}`} onClick={()=>apply('compact')}>Compact</button>
        <button className={`btn ${density==='cozy'?'':'secondary'}`} onClick={()=>apply('cozy')}>Cozy</button>
        <button className={`btn ${density==='comfy'?'':'secondary'}`} onClick={()=>apply('comfy')}>Comfy</button>
      </div>
      <div className="text-xs text-slate-500">Current: {density}</div>
    </div>
  )
}
