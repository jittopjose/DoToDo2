export type TodoPriority = 'low' | 'medium' | 'high';

export interface Todo {
    id: string;
    title: string;
    isCompleted: boolean;
    createdAt: number;
    list: string;
    itemType: 'todo' | 'shopping' | 'note' | 'checklist';
    description?: string;
    quantity?: number;
    price?: number;
    subtasks?: TodoSubtask[];
    dueDate?: number;
    priority?: TodoPriority;
}

export interface TodoSubtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';
export type TodoTypeFilter = Todo['itemType'] | 'all';
