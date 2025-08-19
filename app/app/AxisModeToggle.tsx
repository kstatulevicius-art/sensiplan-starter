'use client'
export default function AxisModeToggle({ mode, setMode }:{ mode:'calendar'|'cycle', setMode:(m:'calendar'|'cycle')=>void }){
  return (
    <div className="inline-flex rounded-2xl bg-white/70 border border-black/5 overflow-hidden">
      <button onClick={()=>setMode('calendar')} className={`px-3 py-1.5 text-sm ${mode==='calendar'?'bg-blue-600 text-white':'text-slate-700'}`}>Calendar</button>
      <button onClick={()=>setMode('cycle')} className={`px-3 py-1.5 text-sm ${mode==='cycle'?'bg-blue-600 text-white':'text-slate-700'}`}>Cycle</button>
    </div>
  )
}
