'use client';
export default function Pill({label,active,onClick}:{label:string,active?:boolean,onClick?:()=>void}) {
  return (
    <button onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm font-medium transition ${
        active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}>
      {label}
    </button>
  )
}