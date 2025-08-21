export default function StatusPill({ state }:{ state?: 'FERTILE'|'INFERTILE'|'USE_CAUTION' }){
  const label = state==='FERTILE' ? 'Fertile' : state==='INFERTILE' ? 'Infertile' : 'Use caution'
  const cls = state==='FERTILE'
    ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
    : state==='INFERTILE'
      ? 'bg-sky-100 text-sky-700 ring-sky-200'
      : 'bg-orange-100 text-orange-700 ring-orange-200'
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ring-1 ${cls}`}>{label}</span>
}
