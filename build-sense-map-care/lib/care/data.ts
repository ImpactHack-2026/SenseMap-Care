import { DEMO_FACILITIES } from './demo-data'
import type { DataMode, Facility } from './types'

/**
 * Data adapter for SenseMap Care. No live healthcare data source is connected,
 * so every call resolves from the clearly labeled demo dataset. A live adapter
 * can replace these functions without changing any consumer.
 */
export const CURRENT_DATA_MODE: DataMode = 'demo'

export async function listFacilities(): Promise<Facility[]> {
  return DEMO_FACILITIES
}

export async function getFacility(id: string): Promise<Facility | null> {
  return DEMO_FACILITIES.find((facility) => facility.id === id) ?? null
}
