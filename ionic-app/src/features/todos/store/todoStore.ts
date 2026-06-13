import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Todo, TodoFilter, TodoTypeFilter } from '../types';

const defaultLists = ['All Lists'];

interface TodoState {
    todos: Todo[];
    filter: TodoFilter;
    typeFilter: TodoTypeFilter;
    searchTerm: string;
    customLists: string[];

    // Actions
    addTodo: (title: string, itemType: Todo['itemType'], description?: string, dueDate?: number, priority?: 'low' | 'medium' | 'high', quantity?: number, price?: number, subtasks?: Todo['subtasks'], list?: string) => void;
    addSubtask: (todoId: string, title: string) => void;
    toggleTodo: (id: string) => void;
    toggleSubtask: (todoId: string, subtaskId: string) => void;
    deleteTodo: (id: string) => void;
    updateTodo: (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'dueDate' | 'priority' | 'list' | 'itemType' | 'quantity' | 'price' | 'subtasks'>>) => void;
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

            addTodo: (title, itemType, description, dueDate, priority, quantity, price, subtasks, list = 'All Lists') => {
                const typeFilterOrDefault = get().typeFilter || 'all';
                set((state) => ({
                    todos: [
                        {
                            id: uuidv4(),
                            title,
                            isCompleted: false,
                            createdAt: Date.now(),
                            list,
                            itemType: typeFilterOrDefault === 'all' ? itemType : typeFilterOrDefault,
                            ...(description !== undefined && { description }),
                            ...(dueDate !== undefined && { dueDate }),
                            ...(priority !== undefined && { priority }),
                            ...(quantity !== undefined && { quantity }),
                            ...(price !== undefined && { price }),
                            ...(subtasks !== undefined && { subtasks }),
                        },
                        ...state.todos,
                    ],
                }));
            },

            toggleTodo: (id) => set((state) => ({
                todos: state.todos.map((todo) =>
                    todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
                ),
            })),

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
            version: 1,
            merge: (persisted, current) => {
                const p = persisted as any;
                const c = current as any;
                return {
                    ...c,
                    ...p,
                    typeFilter: p.typeFilter || c.typeFilter || 'all',
                    todos: Array.isArray(p.todos) ? p.todos.map((t: any) => ({
                        ...t,
                        list: t.list || 'All Lists',
                        itemType: t.itemType || 'todo',
                    })) : c.todos,
                };
            },
            migrate: (persistedState: unknown, version: number) => {
                const state = persistedState as any;
                if (!state) return { todos: [], filter: 'all', typeFilter: 'all', searchTerm: '', customLists: [] };
                return {
                    ...state,
                    typeFilter: state.typeFilter || 'all',
                    todos: Array.isArray(state.todos) ? state.todos.map((t: any) => ({
                        ...t,
                        list: t.list || 'All Lists',
                        itemType: t.itemType || 'todo',
                    })) : [],
                };
            },
            storage: typeof window !== 'undefined'
                ? createJSONStorage(() => localStorage)
                : undefined,
        }
    )
);
