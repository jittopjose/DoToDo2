import React from 'react';
import { IonCard, IonCardContent, IonCardTitle, IonCol, IonGrid, IonIcon, IonList, IonNote, IonRow } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import { useTodoStore } from '../store/todoStore';
import { TodoTypeFilter } from '../types';
import { TodoItem } from './TodoItem';
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

export const TodoList: React.FC<TodoListProps> = ({ list }) => {
    const todos = useTodoStore((state) => state.todos);
    const typeFilter = useTodoStore((state) => state.typeFilter) || 'all';
    const searchTerm = useTodoStore((state) => state.searchTerm);
    const getFilteredTodos = useTodoStore((state) => state.getFilteredTodos);

    const filteredTodos = getFilteredTodos(list);

    const totalInFilteredList = todos.filter((todo) =>
        todo.list === list && (typeFilter === 'all' || todo.itemType === typeFilter)
    ).length;
    const isEmptyList = totalInFilteredList === 0;
    const isSearchActive = searchTerm && searchTerm.trim().length > 0;

    return (
        <IonList className="todo-list" lines="none">
            {filteredTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
            ))}
            {filteredTodos.length === 0 && (
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
