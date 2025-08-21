'use client';
import { useState } from 'react';
export default function ChipGroup({options,onChange}:{options:string[],onChange?:(val:string)=>void}) {
  const [selected,setSelected] = useState<string|null>(null);
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt=>(
        <button key={opt} onClick={()=>{setSelected(opt);onChange&&onChange(opt)}}
          className={`px-3 py-1 rounded-full text-sm font-medium transition ${
            selected===opt ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
          {opt}
        </button>
      ))}
    </div>
  )
}