'use client'
import Pill from './Pill'

export default function Segmented<T extends string>({ value, onChange, options }:{ 
  value: T, onChange: (v:T)=>void, options: { value: T, label: string }[] 
}){
  return (
    <div className="flex items-center gap-1 bg-white/70 ring-1 ring-slate-200 rounded-full p-1">
      {options.map(o => (
        <Pill key={o.value as string} active={o.value===value} onClick={()=>onChange(o.value)}>
          {o.label}
        </Pill>
      ))}
    </div>
  )
}
