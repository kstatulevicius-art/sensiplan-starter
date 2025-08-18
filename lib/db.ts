import Dexie, { Table } from 'dexie'

export interface CoitusEvent {
  at?: string
  protection?: 'none'|'condom'|'diaphragm'|'withdrawal'|'other'
  ejaculation?: 'vaginal'|'external'|'unknown'
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
}

export class SensiDB extends Dexie {
  days!: Table<Day, string>;
  meta!: Table<{key:string, value:string}, string>;
  constructor() {
    super('sensiplan-db')
    this.version(2).stores({
      days: 'id',
      meta: 'key'
    }).upgrade(async (tx) => {
      const tbl = tx.table('days')
      // Ensure coitus field exists
      const all = await tbl.toArray()
      for (const d of all) {
        if (!('coitus' in d)) {
          (d as any).coitus = { events: [] }
          await tbl.put(d)
        }
      }
    })
  }
}
export const db = new SensiDB()
