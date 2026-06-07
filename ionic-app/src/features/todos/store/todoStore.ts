import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '../../../services/storage.service';
import { Todo, TodoFilter } from '../types';

interface TodoState {
    todos: Todo[];
    filter: TodoFilter;

    // Actions
    addTodo: (title: string, dueDate?: number) => void;
    toggleTodo: (id: string) => void;
    deleteTodo: (id: string) => void;
    updateTodo: (id: string, updates: Partial<Pick<Todo, 'title' | 'description'>>) => void;
    setFilter: (filter: TodoFilter) => void;

    // Computed (helper)
    getFilteredTodos: () => Todo[];
}

export const useTodoStore = create<TodoState>()(
    persist(
        (set, get) => ({
            todos: [],
            filter: 'all',

            addTodo: (title, dueDate) => set((state) => ({
                todos: [
                    {
                        id: uuidv4(),
                        title,
                        isCompleted: false,
                        createdAt: Date.now(),
                        ...(dueDate !== undefined && { dueDate }),
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

            getFilteredTodos: () => {
                const { todos, filter } = get();
                switch (filter) {
                    case 'active':
                        return todos.filter((t) => !t.isCompleted);
                    case 'completed':
                        return todos.filter((t) => t.isCompleted);
                    default:
                        return todos;
                }
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
