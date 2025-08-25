'use client'
import React from 'react'

export default function StatusBanner({ state }:{ state?: 'FERTILE'|'INFERTILE'|'USE_CAUTION' }){
  const map = {
    FERTILE: { bg:'bg-emerald-50', text:'text-emerald-700', label:'Fertile today' },
    INFERTILE: { bg:'bg-sky-50', text:'text-sky-700', label:'Infertile today' },
    USE_CAUTION: { bg:'bg-amber-50', text:'text-amber-700', label:'Play it safe today' }
  } as const
  const s = state ? map[state] : map.USE_CAUTION
  return (
    <div className={`${s.bg} ${s.text} rounded-xl px-3 py-2 text-sm ring-1 ring-black/5`}>
      {s.label}
    </div>
  )
}
