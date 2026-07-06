import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardTitle, IonCol, IonGrid, IonIcon, IonList, IonNote, IonRow } from '@ionic/react';
import {
    alertCircleOutline,
    calendarOutline,
    checkmarkCircleOutline,
    chevronDownOutline,
    documentTextOutline,
    sunnyOutline,
    timeOutline,
} from 'ionicons/icons';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectFilteredEntries, selectEntryCountByListAndType } from '../../shared/store/doTodoStore';
import { DoTodo, ItemType } from '../../shared/types';
import { TodoItem } from './TodoItem';
import { isOverdue } from './TodoItem.utils';
import { ShoppingItem } from '../../shopping/components/ShoppingItem';
import './TodoList.css';

const COMPLETED_BATCH_SIZE = 30

const groupConfig: Record<string, { icon: string; className: string }> = {
    Overdue: { icon: alertCircleOutline, className: 'group--overdue' },
    Today: { icon: sunnyOutline, className: 'group--today' },
    Tomorrow: { icon: calendarOutline, className: 'group--tomorrow' },
    Upcoming: { icon: calendarOutline, className: 'group--upcoming' },
    Later: { icon: timeOutline, className: 'group--later' },
    Completed: { icon: checkmarkCircleOutline, className: 'group--completed' },
};

interface TodoListProps {
    list: string;
}

const typeLabels: Record<ItemType, string> = {
    todo: 'Task',
    shopping: 'Shopping',
    note: 'Note',
    checklist: 'Checklist',
};

interface TaskGroup {
    title: string;
    entries: DoTodo[];
}

const defaultExpanded = new Set(['Overdue', 'Today']);

export const TodoList: React.FC<TodoListProps> = ({ list }) => {
    const [expanded, setExpanded] = useState<Set<string>>(defaultExpanded);
    const filteredEntries = useDoTodoStore(useShallow(selectFilteredEntries(list)));
    const filter = useDoTodoStore((state) => state.filter);
    const searchTerm = useDoTodoStore((state) => state.searchTerm);
    const typeFilter = useDoTodoStore((state) => state.typeFilter) || 'all';
    const [completedBatch, setCompletedBatch] = useState(1);

    useEffect(() => {
        setCompletedBatch(1);
    }, [filter]);

    const toggleGroup = useCallback((title: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(title)) {
                next.delete(title);
            } else {
                next.add(title);
            }
            return next;
        });
    }, []);

    const groupedEntries = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfTomorrow = new Date(startOfToday);
        startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

        const groups: TaskGroup[] = [
            { title: 'Overdue', entries: [] },
            { title: 'Today', entries: [] },
            { title: 'Tomorrow', entries: [] },
            { title: 'Upcoming', entries: [] },
            { title: 'Later', entries: [] },
            { title: 'Completed', entries: [] },
        ];

        filteredEntries.forEach((entry) => {
            if (entry.isCompleted) {
                groups[5].entries.push(entry);
            } else if (isOverdue(entry)) {
                groups[0].entries.push(entry);
            } else if (entry.dueDate) {
                const dueDay = new Date(entry.dueDate);
                const startOfDue = new Date(dueDay.getFullYear(), dueDay.getMonth(), dueDay.getDate());

                if (startOfDue.getTime() === startOfToday.getTime()) {
                    groups[1].entries.push(entry);
                } else if (startOfDue.getTime() === startOfTomorrow.getTime()) {
                    groups[2].entries.push(entry);
                } else {
                    const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24));
                    if (diffDays >= 2 && diffDays <= 7) {
                        groups[3].entries.push(entry);
                    } else {
                        groups[4].entries.push(entry);
                    }
                }
            } else {
                groups[4].entries.push(entry);
            }
        });

        const filteredGroups = groups.filter((g) => g.entries.length > 0);

        if (filter === 'active') {
            return filteredGroups.filter((g) => g.title !== 'Completed');
        }

        if (filter === 'completed') {
            return filteredGroups.filter((g) => g.title === 'Completed');
        }

        return filteredGroups;
    }, [filteredEntries, filter]);

    const totalInFilteredList = useDoTodoStore(selectEntryCountByListAndType(list));
    const isEmptyList = totalInFilteredList === 0;
    const isSearchActive = searchTerm && searchTerm.trim().length > 0;
    const hasAnyGroup = groupedEntries.length > 0;

    return (
        <IonList className="dotodo-list" lines="none">
            {groupedEntries.map((group) => {
                const cfg = groupConfig[group.title];
                const isExpanded = expanded.has(group.title);
                return (
                    <React.Fragment key={group.title}>
                        <div
                            className={`dotodo-group-header ${cfg?.className ?? ''}`}
                            onClick={() => toggleGroup(group.title)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(group.title); } }}
                            aria-expanded={isExpanded}
                        >
                            {cfg && <IonIcon icon={cfg.icon} className="dotodo-group-icon" />}
                            <h2 className="dotodo-group-title">{group.title}</h2>
                            {group.title !== 'Completed' && <IonBadge className="dotodo-group-badge">{group.entries.length}</IonBadge>}
                            <IonIcon icon={chevronDownOutline} className={`dotodo-group-chevron ${isExpanded ? 'is-expanded' : ''}`} />
                        </div>
                        <div className={`dotodo-group-items ${isExpanded ? 'is-expanded' : ''} ${cfg?.className ?? ''}`}>
                            {isExpanded && (group.title === 'Completed'
                                ? group.entries.slice(0, completedBatch * COMPLETED_BATCH_SIZE)
                                : group.entries
                            ).map((entry) => (
                                typeFilter === 'shopping'
                                    ? <ShoppingItem key={entry.id} item={entry} />
                                    : <TodoItem key={entry.id} todo={entry} />
                            ))}
                            {group.title === 'Completed' && isExpanded && group.entries.length > completedBatch * COMPLETED_BATCH_SIZE && (
                                <div className="dotodo-group-view-all">
                                    <IonButton fill="clear" size="small" onClick={() => setCompletedBatch(prev => prev + 1)}>
                                        Show more
                                    </IonButton>
                                </div>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
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
                                        {isEmptyList ? 'Blank page' : 'No matches'}
                                    </IonCardTitle>
                                    <IonNote className="empty-copy">
                                        {isEmptyList
                                            ? typeFilter === 'all'
                                                ? 'Your notebook is empty — what would you like to write?'
                                                : `Start with a ${typeLabels[typeFilter].toLowerCase()} — what's on your mind?`
                                            : isSearchActive
                                                ? `No results for "${searchTerm}"`
                                                : typeFilter === 'all'
                                                    ? 'Nothing here with that tag. Try another?'
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