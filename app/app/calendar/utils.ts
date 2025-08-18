export function toId(d: Date){
  const pad = (n:number)=> String(n).padStart(2,'0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}

export function fromId(id: string){
  const [y,m,dd] = id.split('-').map(Number)
  return new Date(y, m-1, dd)
}

export function startOfMonth(d: Date){ return new Date(d.getFullYear(), d.getMonth(), 1) }
export function endOfMonth(d: Date){ return new Date(d.getFullYear(), d.getMonth()+1, 0) }
export function addDays(d: Date, n: number){ const x = new Date(d); x.setDate(x.getDate()+n); return x }
export function addMonths(d: Date, n: number){ const x = new Date(d); x.setMonth(x.getMonth()+n); return x }

export function getMonthGridCells(current: Date, firstDayOfWeek: 0|1 = 1){
  const start = startOfMonth(current)
  const end = endOfMonth(current)
  const startWeekday = (start.getDay() + 7 - firstDayOfWeek) % 7
  const totalDays = end.getDate()
  const cells: Date[] = []
  // Fill leading
  for(let i=0;i<startWeekday;i++) cells.push(addDays(start, i - startWeekday))
  // Fill current month
  for(let d=1; d<=totalDays; d++) cells.push(new Date(start.getFullYear(), start.getMonth(), d))
  // Fill trailing to 42
  while(cells.length % 7 !== 0 || cells.length < 42){
    const last = cells[cells.length-1]
    cells.push(addDays(last, 1))
  }
  return cells
}
