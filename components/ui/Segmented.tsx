'use client'

type Opt = { value: string, label: string }

export default function Segmented({ value, onChange, options }:{ 
  value: string, onChange: (v:string)=>void, options: Opt[] 
}){
  return (
    <div className="flex items-center gap-1 bg-white/70 ring-1 ring-slate-200 rounded-full p-1">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={()=>onChange(o.value)}
          className={`px-3 py-1.5 rounded-full text-sm transition ${
            o.value===value ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
