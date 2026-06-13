import { Todo, TodoPriority } from '../types';

export const parseOptionalNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const normalizeToEndOfDay = (timestamp: number) => {
    const date = new Date(timestamp);
    date.setHours(23, 59, 59, 999);
    return date.getTime();
};

export const getDueTimestampFromInput = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    if (![year, month, day].every(Number.isFinite)) return undefined;
    const dueDate = new Date(year, month - 1, day);
    return normalizeToEndOfDay(dueDate.getTime());
};

export const getDueDateInputValue = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
};

export const getDueTimestampFromDays = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return normalizeToEndOfDay(date.getTime());
};

export const isDueQuickSelected = (todo: Todo, daysFromNow: number) => {
    if (!todo.dueDate) return false;
    const dueDay = startOfDay(new Date(todo.dueDate));
    const targetDay = startOfDay(new Date());
    targetDay.setDate(targetDay.getDate() + daysFromNow);
    return dueDay.getTime() === targetDay.getTime();
};

export const truncateText = (value: string, maxLength = 110) => {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

export const getSubtaskProgress = (todo: Todo) => {
    const total = todo.subtasks?.length ?? 0;
    const completed = todo.subtasks?.filter((subtask) => subtask.isCompleted).length ?? 0;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
};

export const isOverdue = (todo: Todo): boolean => {
    return todo.dueDate !== undefined && todo.dueDate < Date.now() && !todo.isCompleted;
};