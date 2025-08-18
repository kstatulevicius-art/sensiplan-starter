import Dexie, { Table } from 'dexie'

export interface Day {
  id: string
  bleeding: 'none'|'spotting'|'light'|'normal'|'heavy'
  bbt?: number
  bbtTime?: string
  bbtDisturbed?: boolean
  mucusSensation: 'none'|'dry'|'moist'|'slippery'
  mucusAppearance: 'none'|'sticky'|'creamy'|'clear'|'stretchy'
}

export class SensiDB extends Dexie {
  days!: Table<Day, string>;
  meta!: Table<{key:string, value:string}, string>;
  constructor() {
    super('sensiplan-db')
    this.version(1).stores({
      days: 'id',
      meta: 'key'
    })
  }
}
export const db = new SensiDB()
