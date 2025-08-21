export function toId(d: Date){
  const p = (n:number)=> String(n).padStart(2,'0')
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`
}
export function fromId(id: string){
  const [y,m,d] = id.split('-').map(Number)
  return new Date(y, m-1, d)
}
export function addDays(d: Date, n: number){ const x = new Date(d); x.setDate(x.getDate()+n); return x }
export function addMonths(d: Date, n: number){ const x = new Date(d); x.setMonth(x.getMonth()+n); return x }

export function getMonthGridCells(current: Date, startMonday=1){
  const first = new Date(current.getFullYear(), current.getMonth(), 1)
  const firstDay = (first.getDay()+6)%7 // 0=Mon
  const start = new Date(first); start.setDate(1 - (firstDay - (startMonday?0:0)))
  const cells: Date[] = []
  for (let i=0;i<42;i++){ cells.push(addDays(start, i)) }
  return cells
}
