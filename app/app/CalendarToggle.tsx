'use client'
export default function CalendarToggle({ mode, setMode }:{ mode:'month'|'week', setMode:(m:'month'|'week')=>void }){
  return (
    <div className="inline-flex rounded-2xl bg-white/70 border border-black/5 overflow-hidden">
      <button onClick={()=>setMode('month')} className={`px-3 py-1.5 text-sm ${mode==='month'?'bg-blue-600 text-white':'text-slate-700'}`}>Month</button>
      <button onClick={()=>setMode('week')} className={`px-3 py-1.5 text-sm ${mode==='week'?'bg-blue-600 text-white':'text-slate-700'}`}>Week</button>
    </div>
  )
}
