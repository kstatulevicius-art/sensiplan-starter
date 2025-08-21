export type CoitusEvent = {
  at?: string
  protection?: 'none'|'condom'|'diaphragm'|'withdrawal'|'other'
  ejaculation?: 'vaginal'|'external'|'unknown'
  notes?: string
}

export type Day = {
  id: string
  bleeding: 'none'|'spotting'|'light'|'normal'|'heavy'
  bbt?: number
  bbtTime?: string
  bbtDisturbed?: boolean
  mucusSensation: 'none'|'dry'|'moist'|'slippery'
  mucusAppearance: 'none'|'sticky'|'creamy'|'clear'|'stretchy'
  coitus?: { events: CoitusEvent[] }
  lifestyle?: {
    illness?: boolean
    alcohol?: boolean
    travel?: boolean
    stress?: 'none'|'low'|'moderate'|'high'
    sleepQuality?: 'poor'|'ok'|'good'
    exercise?: 'none'|'light'|'moderate'|'intense'
    notes?: string
  }
  notes?: string
}

export type EngineConfig = { unit: 'C'|'F', earlyInfertile: 'off'|'fixedDay'|'history' }

export type DerivedMarkers = {
  state: 'INFERTILE'|'FERTILE'|'USE_CAUTION'
  flags?: Record<string, boolean>
  explanations?: string[]
  refWindowMax?: number
  postovulSafeFromEvening?: boolean
  insufficientData?: boolean
  confidenceScore?: number
  cycleId?: string
  cycleDay?: number
}

export type EngineOutput = {
  markers: Record<string, DerivedMarkers>
  cycles: Array<{ id: string, startId: string, endId?: string, length?: number }>
}

function toCelsius(v:number, unit:'C'|'F'){ return unit==='C'? v : ((v-32)*5/9) }
function isValidBBT(d: Day){ return typeof d.bbt === 'number' && !d.bbtDisturbed }
function isFQM(d: Day){ return d.mucusSensation === 'slippery' || d.mucusAppearance === 'clear' || d.mucusAppearance === 'stretchy' }
function noFQM(d: Day){ return !isFQM(d) }

export function runSensiplan(days: Day[], cfg: EngineConfig): EngineOutput {
  const ds = [...days].sort((a,b)=> a.id.localeCompare(b.id))
  const markers: Record<string, DerivedMarkers> = {}

  // Cycle grouping
  const cycles: Array<{ id: string, startId: string, endId?: string, length?: number }> = []
  let currentCycleStart: string | null = null
  let lastWasHeavy = false
  for (let i=0;i<ds.length;i++){
    const d = ds[i]
    const heavyToday = (d.bleeding==='heavy' || d.bleeding==='normal')
    if (heavyToday && !lastWasHeavy){
      if (currentCycleStart){
        const prev = cycles[cycles.length-1]
        prev.endId = ds[i-1]?.id
        prev.length = prev.endId ? (dateDiff(prev.startId, prev.endId)+1) : undefined
      }
      currentCycleStart = d.id
      cycles.push({ id: d.id, startId: d.id })
    }
    lastWasHeavy = heavyToday
    const cycleId = currentCycleStart ?? (ds[0]?.id ?? 'unknown')
    const cycleDay = currentCycleStart ? (dateDiff(currentCycleStart, d.id)+1) : (i+1)
    markers[d.id] = { state: 'USE_CAUTION', cycleId, cycleDay }
  }
  if (cycles.length){
    const last = cycles[cycles.length-1]
    last.endId = ds[ds.length-1]?.id
    last.length = last.endId ? (dateDiff(last.startId, last.endId)+1) : undefined
  }

  // Temperature shift (3-over-6 with 0.2°C safeguard)
  const validBBT = (i:number)=> isValidBBT(ds[i]) ? (cfg.unit==='C' ? ds[i].bbt! : toCelsius(ds[i].bbt!, 'F')) : undefined
  function lastSixValidBefore(i:number){
    const arr:number[] = []
    for(let k=i-1; k>=0 && arr.length<6; k--){
      const v = validBBT(k); if(v!==undefined) arr.unshift(v)
    }
    return arr
  }
  let tempShiftIdx: number | null = null
  let tempShiftRefMax: number | null = null
  for(let i=0; i<=ds.length-3; i++){
    const RW = lastSixValidBefore(i)
    if(RW.length<6) continue
    const maxRW = Math.max(...RW)
    const H = [i, i+1, i+2].map(j=> validBBT(j))
    if(H.every(v => v!==undefined && v! > maxRW)){
      const threshold = maxRW + 0.2
      if(H[2]! >= threshold){
        tempShiftIdx = i+2; tempShiftRefMax = maxRW; break
      } else {
        for(let k=i+3; k<ds.length; k++){
          const v = validBBT(k)
          if(v!==undefined && v >= threshold){ tempShiftIdx = k; tempShiftRefMax = maxRW; i = ds.length; break }
        }
      }
    }
  }

  // Mucus Peak and P+3
  let peakIdx: number | null = null
  let pPlus3Idx: number | null = null
  let lastFqmIndex: number | null = null
  for(let i=0;i<ds.length;i++){
    if(isFQM(ds[i])) lastFqmIndex = i
    else if(lastFqmIndex!==null && peakIdx===null){
      if( (i+2)<ds.length && noFQM(ds[i]) && noFQM(ds[i+1]) && noFQM(ds[i+2]) ){
        peakIdx = lastFqmIndex; pPlus3Idx = i+2
      }
    }
  }

  let endFertileIdx: number | null = null
  if(tempShiftIdx!==null && pPlus3Idx!==null){
    endFertileIdx = Math.max(tempShiftIdx, pPlus3Idx)
  }

  const tempCount = ds.filter(d=> typeof d.bbt==='number').length
  const mucusCount = ds.filter(d=> d.mucusSensation!=='none' || d.mucusAppearance!=='none').length
  const insufficient = (tempCount < 6) || (mucusCount === 0)
  for(let i=0;i<ds.length;i++){
    const d = ds[i]
    const m = markers[d.id]
    const flags: Record<string, boolean> = {}
    const explanations: string[] = []
    if(tempShiftIdx!==null && i===tempShiftIdx) { flags['tempShiftConfirmed'] = true; if(tempShiftRefMax!==null) explanations.push(`Temperature shift confirmed vs RW max ${tempShiftRefMax.toFixed(2)}°C`) }
    if(peakIdx!==null && i===peakIdx) { flags['peak'] = true; explanations.push('Peak mucus day (last fertile-quality mucus)') }
    if(pPlus3Idx!==null && i===pPlus3Idx) { flags['pPlus3'] = true; explanations.push('Third non-fertile mucus day after Peak (P+3)') }

    let state: 'INFERTILE'|'FERTILE'|'USE_CAUTION' = 'USE_CAUTION'
    let seenAnyMucus = mucusCount > 0

    if(endFertileIdx!==null){
      if(i < endFertileIdx){ state = seenAnyMucus ? 'FERTILE' : 'USE_CAUTION' }
      else if(i === endFertileIdx){ state = 'FERTILE' }
      else { state = 'INFERTILE' }
    } else {
      state = seenAnyMucus ? 'FERTILE' : 'USE_CAUTION'
    }

    let conf = 1.0
    if(d.bbtDisturbed) conf -= 0.2
    if(typeof d.bbt!=='number') conf -= 0.1
    if(d.mucusSensation==='none' && d.mucusAppearance==='none') conf -= 0.1
    conf = Math.max(0, Math.min(1, conf))

    m.flags = flags
    m.explanations = explanations
    m.postovulSafeFromEvening = false
    m.confidenceScore = conf
    m.insufficientData = insufficient
    m.state = insufficient ? 'USE_CAUTION' : state
  }

  return { markers, cycles }
}

function dateDiff(aId: string, bId: string){
  const [ay,am,ad] = aId.split('-').map(Number)
  const [by,bm,bd] = bId.split('-').map(Number)
  const a = new Date(ay, am-1, ad)
  const b = new Date(by, bm-1, bd)
  return Math.round((b.getTime()-a.getTime())/86400000)
}
