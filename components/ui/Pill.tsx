'use client'
import { ReactNode } from 'react'

export default function Pill({ active, children, onClick, ariaLabel, className='' }:{ 
  active?: boolean, children: ReactNode, onClick?: ()=>void, ariaLabel?: string, className?: string 
}){
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition-all select-none
        ${active ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'}
        ${className}`}
    >
      {children}
    </button>
  )
}
