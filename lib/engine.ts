export type Day = {
  id: string
  bleeding: 'none'|'spotting'|'light'|'normal'|'heavy'
  bbt?: number
  bbtTime?: string
  bbtDisturbed?: boolean
  mucusSensation: 'none'|'dry'|'moist'|'slippery'
  mucusAppearance: 'none'|'sticky'|'creamy'|'clear'|'stretchy'
}

export type EngineConfig = { unit: 'C'|'F', earlyInfertile: 'off'|'fixedDay'|'history' }

export type DerivedMarkers = {
  state: 'INFERTILE'|'FERTILE'|'USE_CAUTION'
  flags?: Record<string, boolean>
  explanations?: string[]
}

export type EngineOutput = {
  markers: Record<string, DerivedMarkers>
}

function isFQM(d: Day) {
  return d.mucusSensation === 'slippery' || d.mucusAppearance === 'clear' || d.mucusAppearance === 'stretchy'
}

// VERY SIMPLE placeholder: marks days as FERTILE if any FQM; otherwise USE_CAUTION.
// This is just to prove plumbing; we'll replace with full Sensiplan rules next.
export function runSensiplan(days: Day[], _cfg: EngineConfig): EngineOutput {
  const markers: Record<string, DerivedMarkers> = {}
  for (const d of days) {
    const fertile = isFQM(d)
    markers[d.id] = {
      state: fertile ? 'FERTILE' : 'USE_CAUTION',
      explanations: fertile ? ['Fertile-quality mucus observed'] : ['No fertile-quality mucus recorded; placeholder logic']
    }
  }
  return { markers }
}
