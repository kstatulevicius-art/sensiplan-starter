'use client'
import Pill from './Pill'

export type Option = { value: string, label: string }

export default function ChipGroup({ value, onChange, options, ariaLabel }:{ 
  value: string, onChange: (v:string)=>void, options: Option[], ariaLabel?: string 
}){
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map(opt => (
        <Pill key={opt.value} active={opt.value===value} onClick={()=>onChange(opt.value)} ariaLabel={opt.label}>
          {opt.label}
        </Pill>
      ))}
    </div>
  )
}
