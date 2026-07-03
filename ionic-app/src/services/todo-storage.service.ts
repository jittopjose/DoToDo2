import { get, set } from 'idb-keyval'
import { Todo } from '../features/todos/types'

const STORAGE_KEY = 'todo-data'

export interface PersistedData {
  todos: Todo[]
  customLists: string[]
}

function isStorageAvailable(): boolean {
  return typeof indexedDB !== 'undefined'
}

export async function loadData(): Promise<PersistedData> {
  if (!isStorageAvailable()) return { todos: [], customLists: [] }
  const data = await get<PersistedData>(STORAGE_KEY)
  return data ?? { todos: [], customLists: [] }
}

export async function saveData(data: PersistedData): Promise<void> {
  if (!isStorageAvailable()) return
  await set(STORAGE_KEY, data)
}
