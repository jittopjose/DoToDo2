export type TodoPriority = 'low' | 'medium' | 'high';

export type ItemType = 'todo' | 'shopping' | 'note' | 'checklist';

export interface Recurrence {
  frequency: 'daily' | 'weekdays' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'
  interval: number
  dayOfMonth?: number
  weekdays?: number[]
  endType: 'never' | 'until'
  endDate?: number
  originDate: number
}

export interface BaseItem {
    id: string;
    title: string;
    isCompleted: boolean;
    createdAt: number;
    list: string;
    itemType: ItemType;
    completedAt?: number;
}

export interface Todo extends BaseItem {
    description?: string;
    quantity?: number;
    price?: number;
    subtasks?: TodoSubtask[];
    dueDate?: number;
    priority?: TodoPriority;
    recurrence?: Recurrence;
}

export type AnyItem = Todo;

export interface TodoSubtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export type TodoFilter = 'all' | 'active' | 'completed';
export type TodoTypeFilter = ItemType | 'all';
