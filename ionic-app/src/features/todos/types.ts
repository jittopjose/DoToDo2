export interface Todo {
    id: string;
    title: string;
    isCompleted: boolean;
    createdAt: number;
    list: string;
    description?: string;
    dueDate?: number;
    priority?: 'low' | 'medium' | 'high';
}

export type TodoFilter = 'all' | 'active' | 'completed';
