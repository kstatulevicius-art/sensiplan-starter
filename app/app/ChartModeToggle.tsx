'use client'
export default function ChartModeToggle({ mode, setMode }:{ mode:'classic'|'enhanced', setMode:(m:'classic'|'enhanced')=>void }){
  return (
    <div className="inline-flex rounded-2xl bg-white/70 border border-black/5 overflow-hidden">
      <button onClick={()=>setMode('classic')} className={`px-3 py-1.5 text-sm ${mode==='classic'?'bg-blue-600 text-white':'text-slate-700'}`}>Classic</button>
      <button onClick={()=>setMode('enhanced')} className={`px-3 py-1.5 text-sm ${mode==='enhanced'?'bg-blue-600 text-white':'text-slate-700'}`}>Enhanced</button>
    </div>
  )
}
