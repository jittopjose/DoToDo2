import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../../../services/storage.service';
import { Todo, TodoFilter } from '../types';

interface TodoState {
    todos: Todo[];
    filter: TodoFilter;
    searchTerm: string;

    // Actions
    addTodo: (title: string, dueDate?: number, priority?: 'low' | 'medium' | 'high') => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    updateTodo: (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'dueDate' | 'priority'>>) => void;
    setFilter: (filter: TodoFilter) => void;
    setSearchTerm: (term: string) => void;
    clearCompleted: () => void;

    // Computed (helper)
    getFilteredTodos: () => Todo[];
}

const getFilteredTodos = (todos: Todo[], filter: TodoFilter, searchTerm: string): Todo[] => {
    let filtered = todos;
    
    // Apply search filter first
    if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = todos.filter((t) =>
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
            searchTerm: '',

            addTodo: (title, dueDate, priority) => set((state) => ({
                todos: [
                    {
                        id: uuidv4(),
                        title,
                        isCompleted: false,
                        createdAt: Date.now(),
                        ...(dueDate !== undefined && { dueDate }),
                        ...(priority !== undefined && { priority }),
                    },
                    ...state.todos,
                ],
            })),

            toggleTodo: (id) => set((state) => ({
                todos: state.todos.map((todo) =>
                    todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
                ),
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

            setSearchTerm: (term) => set({ searchTerm: term }),

            clearCompleted: () => set((state) => ({
                todos: state.todos.filter((todo) => !todo.isCompleted),
            })),

            getFilteredTodos: () => {
                const { todos, filter, searchTerm } = get();
                return getFilteredTodos(todos, filter, searchTerm);
            },
        }),
        {
            name: 'todo-storage',
            storage: createJSONStorage(() => ({
                getItem: async (key) => {
                    return await storageService.get(key);
                },
                setItem: async (key, value) => {
                    await storageService.set(key, value);
                },
                removeItem: async (key) => {
                    await storageService.remove(key);
                }
            })),
        }
    )
);