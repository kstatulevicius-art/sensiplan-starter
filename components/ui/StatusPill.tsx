'use client';
export default function StatusPill({status}:{status:string}) {
  const map:any = {
    fertile:'bg-green-100 text-green-700',
    infertile:'bg-gray-100 text-gray-700',
    'use protection':'bg-red-100 text-red-700'
  }
  return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${map[status.toLowerCase()]||'bg-gray-100'}`}>{status}</span>
}