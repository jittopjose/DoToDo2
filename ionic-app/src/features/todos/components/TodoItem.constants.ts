import {
    addOutline,
    calendarOutline,
    cartOutline,
    checkmarkDoneOutline,
    documentTextOutline,
    ellipse,
    flagOutline,
    listOutline,
} from 'ionicons/icons';
import { TodoPriority } from '../types';

export type EditorSection = 'details' | 'due' | 'priority' | 'subtasks' | 'shopping';

export const sectionTitles: Record<EditorSection, string> = {
    details: 'Task details',
    due: 'Due date',
    priority: 'Priority',
    subtasks: 'Subtasks',
    shopping: 'Shopping details',
};

export const typeIcons = {
    todo: listOutline,
    shopping: cartOutline,
    note: documentTextOutline,
    checklist: checkmarkDoneOutline,
};

export const typeLabels = {
    todo: 'Task',
    shopping: 'Shopping',
    note: 'Note',
    checklist: 'Checklist',
};

export const priorityLevels: Array<TodoPriority | undefined> = [undefined, 'low', 'medium', 'high'];

export const priorityLabels: Record<TodoPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
};