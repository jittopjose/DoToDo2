export type TodoPriority = 'low' | 'medium' | 'high';

export interface Recurrence {
  frequency: 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  interval: number
  dayOfMonth?: number
  weekdays?: number[]
  endType: 'never' | 'until'
  endDate?: number
  originDate: number
}

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
    completedAt?: number;
    priority?: TodoPriority;
    recurrence?: Recurrence;
}

export interface TodoSubtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';
export type TodoTypeFilter = Todo['itemType'] | 'all';
