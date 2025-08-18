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
}

export type EngineConfig = { unit: 'C'|'F', earlyInfertile: 'off'|'fixedDay'|'history' }

export type DerivedMarkers = {
  state: 'INFERTILE'|'FERTILE'|'USE_CAUTION'
  flags?: Record<string, boolean>
  explanations?: string[]
  refWindowMax?: number
  postovulSafeFromEvening?: boolean
}

export type EngineOutput = {
  markers: Record<string, DerivedMarkers>
}

function isValidBBT(d: Day){ return typeof d.bbt === 'number' && !d.bbtDisturbed }
function isFQM(d: Day){ return d.mucusSensation === 'slippery' || d.mucusAppearance === 'clear' || d.mucusAppearance === 'stretchy' }
function noFQM(d: Day){ return !isFQM(d) }

function toCelsius(v:number, unit:'C'|'F'){ return unit==='C'? v : ((v-32)*5/9) }

export function runSensiplan(days: Day[], cfg: EngineConfig): EngineOutput {
  // sort by id (yyyy-mm-dd)
  const ds = [...days].sort((a,b)=> a.id.localeCompare(b.id))
  const exps: Record<string, string[]> = {}
  const markers: Record<string, DerivedMarkers> = {}

  // Detect temp shift using 3-over-6 with +0.2°C safeguard (or +0.4°F equivalent)
  const idxById = new Map(ds.map((d,i)=>[d.id,i]))
  const validBBT = (i:number)=> isValidBBT(ds[i]) ? (cfg.unit==='C' ? ds[i].bbt! : toCelsius(ds[i].bbt!, 'F')) : undefined
  function lastSixValidBefore(i:number){
    const arr:number[] = []
    for(let k=i-1; k>=0 && arr.length<6; k--){
      const v = validBBT(k)
      if(v!==undefined) arr.unshift(v)
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
      const threshold = maxRW + 0.2 // °C
      if(H[2]! >= threshold){
        tempShiftIdx = i+2
        tempShiftRefMax = maxRW
        break
      } else {
        // search H4
        for(let k=i+3; k<ds.length; k++){
          const v = validBBT(k)
          if(v!==undefined && v >= threshold){
            tempShiftIdx = k
            tempShiftRefMax = maxRW
            i = ds.length // exit outer
            break
          }
        }
      }
    }
  }

  // Detect mucus Peak (last FQM before 3 non-FQM days)
  let peakIdx: number | null = null
  let pPlus3Idx: number | null = null

  let lastFqmIndex: number | null = null
  for(let i=0;i<ds.length;i++){
    if(isFQM(ds[i])) lastFqmIndex = i
    else {
      if(lastFqmIndex!==null && peakIdx===null){
        if( (i+2)<ds.length && noFQM(ds[i]) && noFQM(ds[i+1]) && noFQM(ds[i+2]) ){
          peakIdx = lastFqmIndex
          pPlus3Idx = i+2
        }
      }
    }
  }

  // Determine end of fertile phase (evening of later of tempShift and P+3)
  let endFertileIdx: number | null = null
  if(tempShiftIdx!==null && pPlus3Idx!==null){
    endFertileIdx = Math.max(tempShiftIdx, pPlus3Idx)
  }

  // Assign states
  let seenAnyMucus = false
  for(let i=0;i<ds.length;i++){
    const d = ds[i]
    const id = d.id
    if(d.mucusSensation!=='dry' || d.mucusAppearance!=='none') seenAnyMucus = true

    const flags: Record<string, boolean> = {}
    if(tempShiftIdx!==null && i===tempShiftIdx) { flags['tempShiftConfirmed'] = true }
    if(peakIdx!==null && i===peakIdx) { flags['peak'] = true }
    if(pPlus3Idx!==null && i===pPlus3Idx) { flags['pPlus3'] = true }

    const explanations: string[] = []
    if(i===tempShiftIdx && tempShiftRefMax!==null){
      explanations.push(`Temperature shift confirmed vs RW max ${tempShiftRefMax.toFixed(2)}°C`)
    }
    if(i===peakIdx) explanations.push('Peak mucus day (last fertile-quality mucus)')
    if(i===pPlus3Idx) explanations.push('Third non-fertile mucus day after Peak (P+3)')

    let state: 'INFERTILE'|'FERTILE'|'USE_CAUTION' = 'USE_CAUTION'
    let postovulSafeFromEvening = false

    if(endFertileIdx!==null){
      if(i < endFertileIdx){
        state = seenAnyMucus ? 'FERTILE' : 'USE_CAUTION'
      } else if(i === endFertileIdx){
        state = 'FERTILE'
        postovulSafeFromEvening = true
      } else {
        state = 'INFERTILE'
      }
    } else {
      // before double-check is met
      state = seenAnyMucus ? 'FERTILE' : 'USE_CAUTION'
    }

    markers[id] = {
      state,
      flags,
      explanations,
      refWindowMax: tempShiftRefMax ?? undefined,
      postovulSafeFromEvening
    }
  }

  return { markers }
}
