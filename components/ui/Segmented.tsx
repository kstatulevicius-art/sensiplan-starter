'use client';
export default function Segmented({options,value,onChange}:{options:string[],value:string,onChange:(val:string)=>void}) {
  return (
    <div className="flex bg-gray-100 rounded-lg overflow-hidden">
      {options.map(opt=>(
        <button key={opt} onClick={()=>onChange(opt)}
          className={`flex-1 px-3 py-1 text-sm font-medium transition ${
            value===opt ? 'bg-white shadow text-blue-600' : 'text-gray-600'
          }`}>
          {opt}
        </button>
      ))}
    </div>
  )
}