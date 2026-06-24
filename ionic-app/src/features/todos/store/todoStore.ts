import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Recurrence, Todo, TodoFilter, TodoPriority, TodoSubtask, TodoTypeFilter } from '../types';
import { getDefaultDueTimestamp } from '../components/TodoItem.utils';
import { getNextDueDate } from '../utils/recurrence';

const defaultLists = ['All Lists'];

type PersistedTodo = {
    id?: string;
    title?: string;
    isCompleted?: boolean;
    createdAt?: number;
    list?: string;
    itemType?: Todo['itemType'];
    description?: string;
    quantity?: number;
    price?: number;
    subtasks?: Array<Partial<TodoSubtask> & { id?: string; title?: string; isCompleted?: boolean }>;
    dueDate?: number;
    priority?: unknown;
    recurrence?: unknown;
};

type PersistedState = Partial<TodoState> & {
    todos?: unknown;
    typeFilter?: unknown;
};

const isTodoFilter = (filter: unknown): filter is TodoFilter => filter === 'all' || filter === 'active' || filter === 'completed';
const isTodoTypeFilter = (filter: unknown): filter is TodoTypeFilter => filter === 'all' || filter === 'todo' || filter === 'shopping' || filter === 'note' || filter === 'checklist';
const isTodoPriority = (priority: unknown): priority is TodoPriority => priority === 'low' || priority === 'medium' || priority === 'high';

const isValidFrequency = (f: unknown): f is Recurrence['frequency'] =>
  f === 'daily' || f === 'weekdays' || f === 'weekly' || f === 'biweekly' || f === 'monthly' || f === 'yearly';

const isRecurrence = (r: unknown): r is Recurrence => {
  if (!r || typeof r !== 'object') return false;
  const obj = r as Record<string, unknown>;
  return (
    isValidFrequency(obj.frequency) &&
    typeof obj.interval === 'number' && Number.isFinite(obj.interval) &&
    typeof obj.originDate === 'number'
  );
};

const normalizePersistedSubtasks = (subtasks: unknown): TodoSubtask[] | undefined => {
    if (!Array.isArray(subtasks)) return undefined;

    return subtasks.map((subtask) => {
        const item = subtask as Partial<TodoSubtask> & { id?: string; title?: string; isCompleted?: boolean };
        return {
            id: typeof item.id === 'string' ? item.id : uuidv4(),
            title: typeof item.title === 'string' && item.title.trim() ? item.title : 'Subtask',
            isCompleted: typeof item.isCompleted === 'boolean' ? item.isCompleted : false,
        };
    });
};

const normalizePersistedTodo = (todo: unknown): Todo => {
    const item = todo as PersistedTodo;
    const subtasks = normalizePersistedSubtasks(item.subtasks);

    return {
        id: typeof item.id === 'string' ? item.id : uuidv4(),
        title: typeof item.title === 'string' && item.title.trim() ? item.title : 'Untitled task',
        isCompleted: typeof item.isCompleted === 'boolean' ? item.isCompleted : false,
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
        list: typeof item.list === 'string' && item.list.trim() ? item.list : 'All Lists',
        itemType: item.itemType || 'todo',
        ...(typeof item.description === 'string' && item.description.trim() && { description: item.description.trim() }),
        ...(typeof item.quantity === 'number' && Number.isFinite(item.quantity) && { quantity: item.quantity }),
        ...(typeof item.price === 'number' && Number.isFinite(item.price) && { price: item.price }),
        ...(subtasks && { subtasks }),
        ...(typeof item.dueDate === 'number' && { dueDate: item.dueDate }),
        ...(isTodoPriority(item.priority) && { priority: item.priority }),
    ...(isRecurrence(item.recurrence) && { recurrence: item.recurrence }),
    };
};

const normalizePersistedState = (state: unknown): Partial<TodoState> => {
    if (!state || typeof state !== 'object') return {};

    const persisted = state as PersistedState;
    const customLists = Array.isArray(persisted.customLists)
        ? persisted.customLists.filter((list): list is string => typeof list === 'string' && Boolean(list.trim()))
        : [];

    return {
        ...(Array.isArray(persisted.todos) ? { todos: persisted.todos.map(normalizePersistedTodo) } : { todos: [] }),
        filter: isTodoFilter(persisted.filter) ? persisted.filter : 'all',
        typeFilter: isTodoTypeFilter(persisted.typeFilter) ? persisted.typeFilter : 'all',
        searchTerm: typeof persisted.searchTerm === 'string' ? persisted.searchTerm : '',
        customLists,
    };
};

interface TodoState {
    todos: Todo[];
    filter: TodoFilter;
    typeFilter: TodoTypeFilter;
    searchTerm: string;
    customLists: string[];

    // Actions
    addTodo: (title: string, itemType: Todo['itemType'], description?: string, dueDate?: number, priority?: TodoPriority, quantity?: number, price?: number, subtasks?: Todo['subtasks'], list?: string, recurrence?: Recurrence) => void;
    addSubtask: (todoId: string, title: string) => void;
    toggleTodo: (id: string) => void;
    toggleSubtask: (todoId: string, subtaskId: string) => void;
    deleteTodo: (id: string) => void;
    updateTodo: (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'dueDate' | 'priority' | 'list' | 'itemType' | 'quantity' | 'price' | 'subtasks' | 'recurrence'>>) => void;
    setFilter: (filter: TodoFilter) => void;
    setTypeFilter: (typeFilter: TodoTypeFilter) => void;
    setSearchTerm: (term: string) => void;
    clearCompleted: () => void;
    addList: (list: string) => void;

    // Computed (helper)
    getFilteredTodos: (list: string) => Todo[];
    getActiveCount: () => number;
    getCompletedCount: () => number;
}

const getFilteredTodos = (todos: Todo[], list: string, filter: TodoFilter, typeFilter: TodoTypeFilter, searchTerm: string): Todo[] => {
    let filtered = todos;

    if (list && list.trim()) {
        filtered = filtered.filter((t) => t.list === list);
    }

    if (typeFilter && typeFilter !== 'all') {
        filtered = filtered.filter((t) => t.itemType === typeFilter);
    }

    // Apply search filter next
    if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((t) =>
            t.title.toLowerCase().includes(term) ||
            (t.description && t.description.toLowerCase().includes(term))
        );
    }

    // Apply status filter
    switch (filter) {
        case 'active':
            return filtered.filter((t) => !t.isCompleted);
        case 'completed':
            return filtered.filter((t) => t.isCompleted);
        default:
            return filtered;
    }
};

export const useTodoStore = create<TodoState>()(
    persist(
        (set, get) => ({
            todos: [],
            filter: 'all',
            typeFilter: 'all',
            searchTerm: '',
            customLists: [],

            addTodo: (title, itemType, description, dueDate, priority, quantity, price, subtasks, list = 'All Lists', recurrence) => {
                const typeFilterOrDefault = get().typeFilter || 'all';
                const defaultDueDate = getDefaultDueTimestamp();
                set((state) => ({
                    todos: [
                        {
                            id: uuidv4(),
                            title,
                            isCompleted: false,
                            createdAt: Date.now(),
                            list,
                            itemType: typeFilterOrDefault === 'all' ? itemType : typeFilterOrDefault,
                            dueDate: dueDate ?? defaultDueDate,
                            ...(description !== undefined && { description }),
                            ...(priority !== undefined && { priority }),
                            ...(quantity !== undefined && { quantity }),
                            ...(price !== undefined && { price }),
                            ...(subtasks !== undefined && { subtasks }),
                            ...(recurrence !== undefined && { recurrence }),
                        },
                        ...state.todos,
                    ],
                }));
            },

            toggleTodo: (id) => set((state) => {
                const todo = state.todos.find(t => t.id === id);
                if (!todo) return state;

                if (!todo.isCompleted && todo.recurrence) {
                    const nextDue = getNextDueDate(todo);
                    if (nextDue) {
                        const isPastEnd = todo.recurrence.endType === 'until' &&
                                          todo.recurrence.endDate !== undefined &&
                                          nextDue > todo.recurrence.endDate;

                        const clone: Todo = {
                            ...todo,
                            id: uuidv4(),
                            isCompleted: false,
                            createdAt: Date.now(),
                            dueDate: nextDue,
                            subtasks: todo.subtasks?.map(s => ({ ...s, isCompleted: false })),
                            recurrence: isPastEnd ? undefined : { ...todo.recurrence },
                        };

                        return {
                            todos: [
                                clone,
                                ...state.todos.map(t =>
                                    t.id === id ? { ...t, isCompleted: true, recurrence: undefined } : t
                                ),
                            ],
                        };
                    }
                }

                return {
                    todos: state.todos.map(t =>
                        t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
                    ),
                };
            }),

            toggleSubtask: (todoId, subtaskId) => set((state) => ({
                todos: state.todos.map((todo) => {
                    if (todo.id !== todoId) return todo;
                    if (!todo.subtasks) return todo;
                    return {
                        ...todo,
                        subtasks: todo.subtasks.map((subtask) =>
                            subtask.id === subtaskId ? { ...subtask, isCompleted: !subtask.isCompleted } : subtask
                        )
                    };
                }),
            })),

            addSubtask: (todoId, title) => set((state) => ({
                todos: state.todos.map((todo) => {
                    if (todo.id !== todoId) return todo;
                    const newSubtask = { id: uuidv4(), title, isCompleted: false };
                    return {
                        ...todo,
                        subtasks: [...(todo.subtasks || []), newSubtask]
                    };
                })
            })),

            deleteTodo: (id) => set((state) => ({
                todos: state.todos.filter((todo) => todo.id !== id),
            })),

            updateTodo: (id, updates) => set((state) => ({
                todos: state.todos.map((todo) =>
                    todo.id === id ? { ...todo, ...updates } : todo
                ),
            })),

            setFilter: (filter) => set({ filter }),

            setTypeFilter: (typeFilter) => set({ typeFilter }),

            setSearchTerm: (term) => set({ searchTerm: term }),

            clearCompleted: () => set((state) => ({
                todos: state.todos.filter((todo) => !todo.isCompleted),
            })),

            addList: (list) => set((state) => {
                const normalized = list.trim();
                if (!normalized) return state;
                if (defaultLists.includes(normalized) || state.customLists.includes(normalized)) return state;
                return { customLists: [...state.customLists, normalized] };
            }),

            getFilteredTodos: (list) => {
                const { todos, filter, typeFilter, searchTerm } = get();
                return getFilteredTodos(todos, list, filter, typeFilter || 'all', searchTerm);
            },

            getActiveCount: () => {
                const { todos } = get();
                return todos.filter((t) => !t.isCompleted).length;
            },

            getCompletedCount: () => {
                const { todos } = get();
                return todos.filter((t) => t.isCompleted).length;
            },
        }),
        {
            name: 'todo-storage',
            version: 2,
            merge: (persisted, current) => ({
                ...current,
                ...normalizePersistedState(persisted),
            }),
            migrate: (persistedState: unknown) => normalizePersistedState(persistedState),
            storage: typeof window !== 'undefined'
                ? createJSONStorage(() => localStorage)
                : undefined,
        }
    )
);
