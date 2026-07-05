import {
    cartOutline,
    checkmarkDoneOutline,
    documentTextOutline,
    listOutline,
} from 'ionicons/icons';
import { DoTodoPriority } from '../../shared/types';

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

export const priorityLevels: Array<DoTodoPriority | undefined> = [undefined, 'low', 'medium', 'high'];

export const priorityLabels: Record<DoTodoPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
};