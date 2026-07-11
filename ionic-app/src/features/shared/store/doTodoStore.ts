import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DoTodo, ShoppingItem, Recurrence, DoTodoFilter, DoTodoPriority } from '../types';
import { getNextDueDate } from '../utils/recurrence';
import { loadData, saveData } from '../../../services/do-todo-storage.service';

const normalizeToEndOfDay = (timestamp: number) => {
    const date = new Date(timestamp);
    date.setHours(23, 59, 59, 999);
    return date.getTime();
};

const getDefaultDueTimestamp = (now = new Date()) => {
    const date = new Date(now);
    if (date.getHours() >= 18) {
        date.setDate(date.getDate() + 1);
    }
    return normalizeToEndOfDay(date.getTime());
};

const defaultLists = ['all-lists'];

interface EntryState {
  entries: Record<string, DoTodo>;
  entryIds: string[];
  filter: DoTodoFilter;
  typeFilter: DoTodo['itemType'] | 'all';
  searchTerm: string;
  customLists: string[];
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  addEntry: (title: string, itemType: DoTodo['itemType'], description?: string, dueDate?: number, priority?: DoTodoPriority, quantity?: number, price?: number, subtasks?: DoTodo['subtasks'], list?: string, recurrence?: Recurrence) => void;
  addSubtask: (entryId: string, title: string) => void;
  updateSubtask: (entryId: string, subtaskId: string, title: string) => void;
  deleteSubtask: (entryId: string, subtaskId: string) => void;
  toggleEntry: (id: string) => void;
  toggleSubtask: (entryId: string, subtaskId: string) => void;
  deleteEntry: (id: string) => void;
  updateEntry: (id: string, updates: Partial<Pick<DoTodo, 'title' | 'description' | 'dueDate' | 'priority' | 'list' | 'itemType' | 'quantity' | 'price' | 'subtasks' | 'shoppingItems' | 'recurrence' | 'isCompleted' | 'isArchived'>>) => void;
  addShoppingList: (title: string) => void;
  addShoppingItem: (listId: string, title: string, quantity?: number, price?: number) => void;
  toggleShoppingItem: (listId: string, itemId: string) => void;
  updateShoppingItem: (listId: string, itemId: string, updates: Partial<Pick<ShoppingItem, 'title' | 'quantity' | 'price'>>) => void;
  removeShoppingItem: (listId: string, itemId: string) => void;
  reorderShoppingItems: (listId: string, itemIds: string[]) => void;
  archiveShoppingList: (listId: string) => void;
  setFilter: (filter: DoTodoFilter) => void;
  setTypeFilter: (typeFilter: DoTodo['itemType'] | 'all') => void;
  setSearchTerm: (term: string) => void;
  clearCompleted: () => void;
  addList: (list: string) => void;
}

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

export const useDoTodoStore = create<EntryState>()(
  (set, get) => ({
    entries: {},
    entryIds: [],
    filter: 'all',
    typeFilter: 'all',
    searchTerm: '',
    customLists: [],
    isHydrated: false,

    hydrate: async () => {
      const data = await loadData()
      const entries: Record<string, DoTodo> = {}
      const entryIds: string[] = []
      for (const item of data.entries) {
        entries[item.id] = item
        entryIds.push(item.id)
      }
      set({
        entries,
        entryIds,
        customLists: data.customLists,
        isHydrated: true,
      })
    },

    addEntry: (title, itemType, description, dueDate, priority, quantity, price, subtasks, list = 'all-lists', recurrence) => {
      const defaultDueDate = getDefaultDueTimestamp();
      const id = uuidv4();
      const entry: DoTodo = {
        id,
        title,
        isCompleted: false,
        createdAt: Date.now(),
        list,
        itemType,
        dueDate: dueDate ?? (itemType === 'todo' ? defaultDueDate : undefined),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(quantity !== undefined && { quantity }),
        ...(price !== undefined && { price }),
        ...(subtasks !== undefined && { subtasks }),
        ...(recurrence !== undefined && { recurrence }),
      };
      set((state) => ({
        entries: { ...state.entries, [id]: entry },
        entryIds: [id, ...state.entryIds],
      }));
    },

    toggleEntry: (id) => set((state) => {
      const entry = state.entries[id];
      if (!entry) return state;

      if (!entry.isCompleted && entry.recurrence) {
        const nextDue = getNextDueDate(entry);
        if (nextDue) {
          const isPastEnd = entry.recurrence.endType === 'until' &&
                            entry.recurrence.endDate !== undefined &&
                            nextDue > entry.recurrence.endDate;

          const cloneId = uuidv4();
          const clone: DoTodo = {
            ...entry,
            id: cloneId,
            isCompleted: false,
            createdAt: Date.now(),
            dueDate: nextDue,
            subtasks: entry.subtasks?.map(s => ({ ...s, isCompleted: false })),
            recurrence: isPastEnd ? undefined : { ...entry.recurrence },
          };

          return {
            entries: {
              ...state.entries,
              [id]: { ...entry, isCompleted: true, completedAt: Date.now(), recurrence: undefined },
              [cloneId]: clone,
            },
            entryIds: [cloneId, ...state.entryIds],
          };
        }
      }

      return {
        entries: {
          ...state.entries,
          [id]: { ...entry, isCompleted: !entry.isCompleted, completedAt: !entry.isCompleted ? Date.now() : undefined },
        },
      };
    }),

    toggleSubtask: (entryId, subtaskId) => set((state) => {
      const entry = state.entries[entryId];
      if (!entry || !entry.subtasks) return state;
      return {
        entries: {
          ...state.entries,
          [entryId]: {
            ...entry,
            subtasks: entry.subtasks.map((subtask) =>
              subtask.id === subtaskId ? { ...subtask, isCompleted: !subtask.isCompleted } : subtask
            ),
          },
        },
      };
    }),

    addSubtask: (entryId, title) => set((state) => {
      const entry = state.entries[entryId];
      if (!entry) return state;
      const newSubtask = { id: uuidv4(), title, isCompleted: false };
      return {
        entries: {
          ...state.entries,
          [entryId]: { ...entry, subtasks: [...(entry.subtasks || []), newSubtask] },
        },
      };
    }),

    updateSubtask: (entryId, subtaskId, title) => set((state) => {
      const entry = state.entries[entryId];
      if (!entry || !entry.subtasks) return state;
      return {
        entries: {
          ...state.entries,
          [entryId]: {
            ...entry,
            subtasks: entry.subtasks.map((subtask) =>
              subtask.id === subtaskId ? { ...subtask, title } : subtask
            ),
          },
        },
      };
    }),

    deleteSubtask: (entryId, subtaskId) => set((state) => {
      const entry = state.entries[entryId];
      if (!entry || !entry.subtasks) return state;
      return {
        entries: {
          ...state.entries,
          [entryId]: { ...entry, subtasks: entry.subtasks.filter((subtask) => subtask.id !== subtaskId) },
        },
      };
    }),

    deleteEntry: (id) => set((state) => {
      const rest = { ...state.entries };
      delete rest[id];
      return {
        entries: rest,
        entryIds: state.entryIds.filter((eid) => eid !== id),
      };
    }),

    updateEntry: (id, updates) => set((state) => {
      const entry = state.entries[id];
      if (!entry) return state;
      const merged = { ...entry, ...updates };
      if ('isCompleted' in updates) {
        merged.completedAt = updates.isCompleted ? Date.now() : undefined;
      }
      return {
        entries: { ...state.entries, [id]: merged },
      };
    }),

    setFilter: (filter) => set({ filter }),

    setTypeFilter: (typeFilter) => set({ typeFilter }),

    setSearchTerm: (term) => set({ searchTerm: term }),

    clearCompleted: () => set((state) => {
      const newEntries = { ...state.entries };
      const completedIds: string[] = [];
      for (const id of state.entryIds) {
        if (state.entries[id].isCompleted) {
          delete newEntries[id];
          completedIds.push(id);
        }
      }
      return {
        entries: newEntries,
        entryIds: state.entryIds.filter((id) => !state.entries[id].isCompleted),
      };
    }),

    addList: (list) => set((state) => {
      const normalized = list.trim();
      if (!normalized) return state;
      if (defaultLists.includes(normalized) || state.customLists.includes(normalized)) return state;
      return { customLists: [...state.customLists, normalized] };
    }),

    addShoppingList: (title) => {
      const id = uuidv4();
      const entry: DoTodo = {
        id,
        title,
        isCompleted: false,
        createdAt: Date.now(),
        list: 'all-lists',
        itemType: 'shopping',
        shoppingItems: [],
      };
      set((state) => ({
        entries: { ...state.entries, [id]: entry },
        entryIds: [id, ...state.entryIds],
      }));
    },

    addShoppingItem: (listId, title, quantity, price) => set((state) => {
      const entry = state.entries[listId];
      if (!entry || !entry.shoppingItems) return state;
      const newItem: ShoppingItem = {
        id: uuidv4(),
        title,
        isCompleted: false,
        ...(quantity !== undefined && { quantity }),
        ...(price !== undefined && { price }),
      };
      return {
        entries: {
          ...state.entries,
          [listId]: {
            ...entry,
            shoppingItems: [...entry.shoppingItems, newItem],
          },
        },
      };
    }),

    toggleShoppingItem: (listId, itemId) => set((state) => {
      const entry = state.entries[listId];
      if (!entry || !entry.shoppingItems) return state;
      return {
        entries: {
          ...state.entries,
          [listId]: {
            ...entry,
            shoppingItems: entry.shoppingItems.map((item) =>
              item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
            ),
          },
        },
      };
    }),

    updateShoppingItem: (listId, itemId, updates) => set((state) => {
      const entry = state.entries[listId];
      if (!entry || !entry.shoppingItems) return state;
      return {
        entries: {
          ...state.entries,
          [listId]: {
            ...entry,
            shoppingItems: entry.shoppingItems.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
          },
        },
      };
    }),

    removeShoppingItem: (listId, itemId) => set((state) => {
      const entry = state.entries[listId];
      if (!entry || !entry.shoppingItems) return state;
      return {
        entries: {
          ...state.entries,
          [listId]: {
            ...entry,
            shoppingItems: entry.shoppingItems.filter((item) => item.id !== itemId),
          },
        },
      };
    }),

    reorderShoppingItems: (listId, itemIds) => set((state) => {
      const entry = state.entries[listId];
      if (!entry || !entry.shoppingItems) return state;
      const items = entry.shoppingItems;
      const reordered = itemIds
        .map((id) => items.find((item) => item.id === id))
        .filter((x): x is ShoppingItem => x !== undefined);
      return {
        entries: {
          ...state.entries,
          [listId]: { ...entry, shoppingItems: reordered },
        },
      };
    }),

    archiveShoppingList: (listId) => set((state) => {
      const entry = state.entries[listId];
      if (!entry) return state;
      return {
        entries: {
          ...state.entries,
          [listId]: { ...entry, isArchived: !entry.isArchived },
        },
      };
    }),
  })
);

const schedulePersist = debounce(() => {
  const { entries, entryIds, customLists, isHydrated } = useDoTodoStore.getState();
  if (!isHydrated) return;
  saveData({ entries: entryIds.map((id) => entries[id]), customLists }).catch(() => {});
}, 500);

useDoTodoStore.subscribe((state, prevState) => {
  if (state.entries === prevState.entries && state.customLists === prevState.customLists) return;
  if (!state.isHydrated) return;
  schedulePersist();
});

export const selectEntryById = (id: string) => (state: EntryState): DoTodo | undefined =>
  state.entries[id];

export const selectFilteredEntries = (list: string) => (state: EntryState): DoTodo[] => {
  let ids = state.entryIds;

  if (list && list.trim()) {
    ids = ids.filter((id) => state.entries[id].list === list);
  }

  const typeFilter = state.typeFilter;
  if (typeFilter && typeFilter !== 'all') {
    ids = ids.filter((id) => state.entries[id].itemType === typeFilter);
  }

  const searchTerm = state.searchTerm;
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase();
    ids = ids.filter((id) => {
      const entry = state.entries[id];
      return entry.title.toLowerCase().includes(term) ||
        (entry.description && entry.description.toLowerCase().includes(term));
    });
  }

  switch (state.filter) {
    case 'active':
      ids = ids.filter((id) => !state.entries[id].isCompleted);
      break;
    case 'completed':
      ids = ids.filter((id) => state.entries[id].isCompleted);
      break;
  }

  return ids.map((id) => state.entries[id]);
};

export const selectEntriesByDateRange = (start: number, end: number) => (state: EntryState): DoTodo[] => {
  const result: DoTodo[] = [];
  for (const id of state.entryIds) {
    const entry = state.entries[id];
    if (entry.dueDate !== undefined && entry.dueDate >= start && entry.dueDate <= end) {
      result.push(entry);
    }
  }
  return result;
};

export const selectActiveCount = (state: EntryState): number =>
  state.entryIds.reduce((count, id) => state.entries[id].isCompleted ? count : count + 1, 0);

export const selectCompletedCount = (state: EntryState): number =>
  state.entryIds.reduce((count, id) => state.entries[id].isCompleted ? count + 1 : count, 0);

export const selectEntryCountByListAndType = (list: string) => (state: EntryState): number =>
  state.entryIds.filter((id) => {
    const entry = state.entries[id];
    if (entry.list !== list) return false;
    if (state.typeFilter !== 'all' && entry.itemType !== state.typeFilter) return false;
    return true;
  }).length;

const isShoppingList = (entry: DoTodo): boolean =>
  entry.itemType === 'shopping' && entry.shoppingItems !== undefined;

export const selectActiveShoppingLists = (state: EntryState): DoTodo[] =>
  state.entryIds
    .map((id) => state.entries[id])
    .filter((entry) => isShoppingList(entry) && !entry.isArchived);

export const selectArchivedShoppingLists = (state: EntryState): DoTodo[] =>
  state.entryIds
    .map((id) => state.entries[id])
    .filter((entry) => isShoppingList(entry) && entry.isArchived);

export const selectShoppingListItems = (listId: string) => (state: EntryState): ShoppingItem[] => {
  const entry = state.entries[listId];
  return entry?.shoppingItems ?? [];
};

export const selectShoppingListSummary = (listId: string) => (state: EntryState): { count: number; total: number; completedCount: number } => {
  const entry = state.entries[listId];
  const items = entry?.shoppingItems ?? [];
  let total = 0;
  let completedCount = 0;
  for (const item of items) {
    if (item.price) {
      total += item.price * (item.quantity || 1);
    }
    if (item.isCompleted) {
      completedCount++;
    }
  }
  return { count: items.length, total, completedCount };
};
