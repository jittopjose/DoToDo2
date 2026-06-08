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
    priority?: 'low' | 'medium' | 'high';
}

export interface TodoSubtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';
