import { db, type Day } from '@/lib/db'

function id(y:number,m:number,d:number){
  const pad=(n:number)=>String(n).padStart(2,'0')
  return `${y}-${pad(m)}-${pad(d)}`
}

export async function seedDemoCycle(start: {y:number,m:number,d:number}, mode:'textbook'|'messy'='textbook'){
  const y = start.y, m = start.m
  const days: Day[] = []
  const len = 28
  const demoIds: string[] = []

  // Base curves
  const baseTemps = [36.4,36.4,36.5,36.5,36.4,36.5,36.5,36.5,36.6,36.6,36.5,36.5,36.6,36.7,36.8,36.8,36.9,36.9,36.9,36.8,36.9,36.8,36.8,36.7,36.6,36.6,36.5,36.5]
  const mucusS = ['none','none','none','none','none','none','none','moist','slippery','moist','moist','dry','dry','dry','dry','dry','dry','dry','dry','dry','dry','dry','dry','dry','dry','dry','dry','dry'] as Day['mucusSensation'][]
  const mucusA = ['none','none','sticky','sticky','creamy','creamy','stretchy','stretchy','stretchy','creamy','creamy','sticky','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none'] as Day['mucusAppearance'][]

  for(let i=0;i<len;i++){
    const date = new Date(y, m-1, start.d + i)
    const did = id(date.getFullYear(), date.getMonth()+1, date.getDate())
    demoIds.push(did)

    let bbt = baseTemps[i]
    let lifestyle: Day['lifestyle'] = {}
    let bbtDisturbed = false
    if (mode==='messy'){
      if (i in {2:1, 6:1, 11:1, 17:1}) { // sprinkle missing/shifted temps
        if (i===11) { bbt = undefined as any } // missing
        else { bbt = (bbt ?? 36.5) + 0.3; lifestyle.alcohol = true; bbtDisturbed = true }
      }
      if (i===4) lifestyle.illness = true
      if (i===15) lifestyle.travel = true
      if (i===8) lifestyle.stress = 'high'
    }

    const d: Day = {
      id: did,
      bleeding: i<5 ? (i<2?'heavy':'normal') : 'none',
      bbt: typeof bbt==='number' ? bbt : undefined,
      bbtDisturbed,
      mucusSensation: mucusS[i] ?? 'none',
      mucusAppearance: mucusA[i] ?? 'none',
      coitus: (i===8 || i===13) ? { events: [{ protection: i===13 ? 'none' : 'condom', ejaculation: i===13 ? 'vaginal' : 'external' }] } : undefined,
      lifestyle,
      notes: mode==='messy' && i in {15:1, 20:1} ? (i===15?'jet lag':'poor sleep') : ''
    }
    days.push(d)
  }
  await db.days.bulkPut(days as any)
  await db.meta.put({ key:'demo_ids', value: JSON.stringify(demoIds) })
  await db.meta.put({ key:'demo_enabled', value: mode })
}

export async function clearDemo(){
  const rec = await db.meta.get('demo_ids')
  const ids: string[] = rec ? JSON.parse(rec.value) : []
  if (ids.length){
    await db.days.bulkDelete(ids)
  }
  await db.meta.put({ key:'demo_ids', value: JSON.stringify([]) })
  await db.meta.put({ key:'demo_enabled', value: '' })
}
