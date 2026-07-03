import { get, set, createStore } from 'idb-keyval'
import { AnyItem } from '../features/todos/types'

const STORAGE_KEY = 'entries'
const store = createStore('dotodo', 'entries')

export interface PersistedData {
  entries: AnyItem[]
  customLists: string[]
}

function isStorageAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

export async function loadData(): Promise<PersistedData> {
  if (!isStorageAvailable()) return { entries: [], customLists: [] }
  const data = await get<PersistedData>(STORAGE_KEY, store)
  return data ?? { entries: [], customLists: [] }
}

export async function saveData(data: PersistedData): Promise<void> {
  if (!isStorageAvailable()) return
  await set(STORAGE_KEY, data, store)
}
