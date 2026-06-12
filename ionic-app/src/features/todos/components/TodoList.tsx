import React from 'react';
import { IonCard, IonCardContent, IonCardTitle, IonCol, IonGrid, IonIcon, IonList, IonNote, IonRow } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import { useTodoStore } from '../store/todoStore';
import { TodoItem } from './TodoItem';
import './TodoList.css';

interface TodoListProps {
    list: string;
}

export const TodoList: React.FC<TodoListProps> = ({ list }) => {
    const todos = useTodoStore((state) => state.todos);
    const filter = useTodoStore((state) => state.filter);
    const searchTerm = useTodoStore((state) => state.searchTerm);

    const filteredTodos = React.useMemo(() => {
        let result = todos.filter((todo) => todo.list === list);

        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter((t) =>
                t.title.toLowerCase().includes(term) ||
                (t.description && t.description.toLowerCase().includes(term))
            );
        }

        switch (filter) {
            case 'active':
                return result.filter((t) => !t.isCompleted);
            case 'completed':
                return result.filter((t) => t.isCompleted);
            default:
                return result;
        }
    }, [todos, filter, searchTerm, list]);

    const totalInFilteredList = todos.filter((t) => t.list === list).length;
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
                                            ? 'Add your first task above and give today a clear shape.'
                                            : isSearchActive
                                                ? `No results for "${searchTerm}"`
                                                : 'Try changing the filter'}
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
