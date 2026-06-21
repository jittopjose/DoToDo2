import React, { useMemo } from 'react';
import { IonBadge, IonCard, IonCardContent, IonCardTitle, IonCol, IonGrid, IonIcon, IonList, IonNote, IonRow } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import { useTodoStore } from '../store/todoStore';
import { TodoTypeFilter, Todo } from '../types';
import { TodoItem } from './TodoItem';
import { isOverdue } from './TodoItem.utils';
import './TodoList.css';

interface TodoListProps {
    list: string;
}

const typeLabels: Record<Exclude<TodoTypeFilter, 'all'>, string> = {
    todo: 'Task',
    shopping: 'Shopping',
    note: 'Note',
    checklist: 'Checklist',
};

interface TaskGroup {
    title: string;
    todos: Todo[];
}

export const TodoList: React.FC<TodoListProps> = ({ list }) => {
    const todos = useTodoStore((state) => state.todos);
    const typeFilter = useTodoStore((state) => state.typeFilter) || 'all';
    const searchTerm = useTodoStore((state) => state.searchTerm);
    const filter = useTodoStore((state) => state.filter);

    const filteredTodos = useMemo(() => {
        let filtered = todos.filter((t) => t.list === list);

        if (typeFilter && typeFilter !== 'all') {
            filtered = filtered.filter((t) => t.itemType === typeFilter);
        }

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((t) =>
                t.title.toLowerCase().includes(term) ||
                (t.description && t.description.toLowerCase().includes(term))
            );
        }

        switch (filter) {
            case 'active':
                return filtered.filter((t) => !t.isCompleted);
            case 'completed':
                return filtered.filter((t) => t.isCompleted);
            default:
                return filtered;
        }
    }, [todos, list, typeFilter, searchTerm, filter]);

    const groupedTodos = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        const groups: TaskGroup[] = [
            { title: 'Overdue', todos: [] },
            { title: 'Today', todos: [] },
            { title: 'Tomorrow', todos: [] },
            { title: 'Upcoming', todos: [] },
            { title: 'Later', todos: [] },
            { title: 'Completed', todos: [] },
        ];

        filteredTodos.forEach((todo) => {
            if (todo.isCompleted) {
                groups[5].todos.push(todo);
            } else if (isOverdue(todo)) {
                groups[0].todos.push(todo);
            } else if (todo.dueDate) {
                const dueDay = new Date(todo.dueDate);
                const startOfDue = new Date(dueDay.getFullYear(), dueDay.getMonth(), dueDay.getDate());

                if (startOfDue.getTime() === startOfToday.getTime()) {
                    groups[1].todos.push(todo);
                } else if (startOfDue.getTime() === startOfTomorrow.getTime()) {
                    groups[2].todos.push(todo);
                } else {
                    const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays >= 2 && diffDays <= 7) {
                        groups[3].todos.push(todo);
                    } else {
                        groups[4].todos.push(todo);
                    }
                }
            } else {
                groups[4].todos.push(todo);
            }
        });

        const filteredGroups = groups.filter((g) => g.todos.length > 0);

        if (filter === 'active') {
            return filteredGroups.filter((g) => g.title !== 'Completed');
        }

        if (filter === 'completed') {
            return filteredGroups.filter((g) => g.title === 'Completed');
        }

        return filteredGroups;
    }, [filteredTodos, filter]);

    const totalInFilteredList = todos.filter((todo) =>
        todo.list === list && (typeFilter === 'all' || todo.itemType === typeFilter)
    ).length;
    const isEmptyList = totalInFilteredList === 0;
    const isSearchActive = searchTerm && searchTerm.trim().length > 0;
    const hasAnyGroup = groupedTodos.length > 0;

    return (
        <IonList className="todo-list" lines="none">
            {groupedTodos.map((group) => (
                <React.Fragment key={group.title}>
                    <div className="todo-group-header">
                        <h2 className="todo-group-title">{group.title}</h2>
                        <IonBadge color="medium" className="todo-group-badge">{group.todos.length}</IonBadge>
                    </div>
                    {group.todos.map((todo) => (
                        <TodoItem key={todo.id} todo={todo} />
                    ))}
                </React.Fragment>
            ))}
            {!hasAnyGroup && (
                <IonCard className={`empty-card ${isSearchActive ? 'is-searching' : ''}`}>
                    <IonCardContent className="ion-padding empty-content">
                        <IonGrid className="empty-grid">
                            <IonRow className="ion-justify-content-center">
                                <IonCol size="auto" className="empty-illustration">
                                    <IonIcon icon={documentTextOutline} />
                                </IonCol>
                            </IonRow>
                            <IonRow className="ion-justify-content-center">
                                <IonCol size="12">
                                    <IonCardTitle className="empty-title">
                                        {isEmptyList ? 'No tasks yet' : 'No matching tasks'}
                                    </IonCardTitle>
                                    <IonNote className="empty-copy">
                                        {isEmptyList
                                            ? typeFilter === 'all'
                                                ? 'Add your first task above and give today a clear shape.'
                                                : `Add your first ${typeLabels[typeFilter].toLowerCase()} item above.`
                                            : isSearchActive
                                                ? `No results for "${searchTerm}"`
                                                : typeFilter === 'all'
                                                    ? 'Try changing the filter'
                                                    : 'Try another category'
                                        }
                                    </IonNote>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonCardContent>
                </IonCard>
            )}
        </IonList>
    );
};