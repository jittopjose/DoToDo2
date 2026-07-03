import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Recurrence, Todo, TodoFilter, TodoPriority, TodoTypeFilter } from '../types';
import { getDefaultDueTimestamp } from '../components/TodoItem.utils';
import { getNextDueDate } from '../utils/recurrence';
import { loadData, saveData } from '../../../services/todo-storage.service';

const defaultLists = ['All Lists'];

interface TodoState {
    todos: Todo[];
    filter: TodoFilter;
    typeFilter: TodoTypeFilter;
    searchTerm: string;
    customLists: string[];
    isHydrated: boolean;

    // Actions
    hydrate: () => Promise<void>;
    addTodo: (title: string, itemType: Todo['itemType'], description?: string, dueDate?: number, priority?: TodoPriority, quantity?: number, price?: number, subtasks?: Todo['subtasks'], list?: string, recurrence?: Recurrence) => void;
    addSubtask: (todoId: string, title: string) => void;
    updateSubtask: (todoId: string, subtaskId: string, title: string) => void;
    deleteSubtask: (todoId: string, subtaskId: string) => void;
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
    (set, get) => ({
        todos: [],
        filter: 'all',
        typeFilter: 'all',
        searchTerm: '',
        customLists: [],
        isHydrated: false,

        hydrate: async () => {
            const data = await loadData()
            set({
                todos: data.todos,
                customLists: data.customLists,
                isHydrated: true,
            })
        },

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
                                    t.id === id ? { ...t, isCompleted: true, completedAt: Date.now(), recurrence: undefined } : t
                                ),
                            ],
                        };
                }
            }

            return {
                todos: state.todos.map(t =>
                    t.id === id
                        ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? Date.now() : undefined }
                        : t
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

        updateSubtask: (todoId, subtaskId, title) => set((state) => ({
            todos: state.todos.map((todo) => {
                if (todo.id !== todoId) return todo;
                if (!todo.subtasks) return todo;
                return {
                    ...todo,
                    subtasks: todo.subtasks.map((subtask) =>
                        subtask.id === subtaskId ? { ...subtask, title } : subtask
                    )
                };
            }),
        })),

        deleteSubtask: (todoId, subtaskId) => set((state) => ({
            todos: state.todos.map((todo) => {
                if (todo.id !== todoId) return todo;
                if (!todo.subtasks) return todo;
                return {
                    ...todo,
                    subtasks: todo.subtasks.filter((subtask) => subtask.id !== subtaskId)
                };
            }),
        })),

        deleteTodo: (id) => set((state) => ({
            todos: state.todos.filter((todo) => todo.id !== id),
        })),

        updateTodo: (id, updates) => set((state) => ({
            todos: state.todos.map((todo) => {
                if (todo.id !== id) return todo;
                const merged = { ...todo, ...updates };
                if ('isCompleted' in updates) {
                    merged.completedAt = updates.isCompleted ? Date.now() : undefined;
                }
                return merged;
            }),
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
    })
);

let prevTodos: Todo[] | undefined
let prevCustomLists: string[] | undefined

useTodoStore.subscribe((state) => {
    if (!state.isHydrated) return
    if (state.todos === prevTodos && state.customLists === prevCustomLists) return
    prevTodos = state.todos
    prevCustomLists = state.customLists
    saveData({ todos: state.todos, customLists: state.customLists }).catch(() => {})
})
