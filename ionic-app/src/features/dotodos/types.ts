export type DoTodoPriority = 'low' | 'medium' | 'high';

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

export interface DoTodo extends BaseItem {
    description?: string;
    quantity?: number;
    price?: number;
    subtasks?: DoTodoSubtask[];
    dueDate?: number;
    priority?: DoTodoPriority;
    recurrence?: Recurrence;
}

export type AnyItem = DoTodo;

export interface DoTodoSubtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

export type DoTodoFilter = 'all' | 'active' | 'completed';
export type DoTodoTypeFilter = ItemType | 'all';
