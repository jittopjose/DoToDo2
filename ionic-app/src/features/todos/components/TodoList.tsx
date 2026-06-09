import React from 'react';
import { IonList, IonIcon } from '@ionic/react';
import { documentTextOutline } from 'ionicons/icons';
import { useTodoStore } from '../store/todoStore';
import { TodoItem } from './TodoItem';

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
        <IonList>
            {filteredTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
            ))}
            {filteredTodos.length === 0 && (
                <div className="ion-padding ion-text-center" style={{ padding: '48px 16px' }}>
                    <IonIcon icon={documentTextOutline} style={{ fontSize: '48px', color: 'var(--ion-color-medium)', marginBottom: '16px' }} />
                    {isEmptyList ? (
                        <>
                            <h2 style={{ margin: '0 0 8px 0', color: 'var(--ion-color-dark)' }}>No tasks yet</h2>
                            <p style={{ margin: 0, color: 'var(--ion-color-medium)' }}>
                                Tap the input above to add your first task
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 style={{ margin: '0 0 8px 0', color: 'var(--ion-color-dark)' }}>No matching tasks</h2>
                            <p style={{ margin: 0, color: 'var(--ion-color-medium)' }}>
                                {isSearchActive ? `No results for "${searchTerm}"` : 'Try changing the filter'}
                            </p>
                        </>
                    )}
                </div>
            )}
        </IonList>
    );
};