import Dexie, { Table } from 'dexie'

export interface CoitusEvent {
  at?: string
  protection?: 'none'|'condom'|'diaphragm'|'withdrawal'|'other'
  ejaculation?: 'vaginal'|'external'|'unknown'
  notes?: string
}

export interface Lifestyle {
  illness?: boolean
  alcohol?: boolean
  travel?: boolean
  stress?: 'none'|'low'|'moderate'|'high'
  sleepQuality?: 'poor'|'ok'|'good'
  exercise?: 'none'|'light'|'moderate'|'intense'
  notes?: string
}

export interface Day {
  id: string
  bleeding: 'none'|'spotting'|'light'|'normal'|'heavy'
  bbt?: number
  bbtTime?: string
  bbtDisturbed?: boolean
  mucusSensation: 'none'|'dry'|'moist'|'slippery'
  mucusAppearance: 'none'|'sticky'|'creamy'|'clear'|'stretchy'
  coitus?: { events: CoitusEvent[] }
  lifestyle?: Lifestyle
  notes?: string
}

export class SensiDB extends Dexie {
  days!: Table<Day, string>;
  meta!: Table<{key:string, value:string}, string>;
  constructor() {
    super('sensiplan-db')
    // v1 -> base; v2 -> coitus; v3 -> lifestyle + notes
    this.version(3).stores({
      days: 'id',
      meta: 'key'
    }).upgrade(async (tx) => {
      const tbl = tx.table('days')
      const all = await tbl.toArray()
      for (const d of all) {
        if (!('coitus' in d)) (d as any).coitus = { events: [] }
        if (!('lifestyle' in d)) (d as any).lifestyle = {}
        if (!('notes' in d)) (d as any).notes = ''
        await tbl.put(d)
      }
    })
  }
}
export const db = new SensiDB()
