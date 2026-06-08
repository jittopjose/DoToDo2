import React from 'react';
import { IonList } from '@ionic/react';
import { useTodoStore } from '../store/todoStore';
import { TodoItem } from './TodoItem';

export const TodoList: React.FC = () => {
    const todos = useTodoStore((state) => state.todos);
    const filter = useTodoStore((state) => state.filter);
    const searchTerm = useTodoStore((state) => state.searchTerm);

    const filteredTodos = React.useMemo(() => {
        if (!todos) return [];
        let result = todos;
        
        // Apply search filter first
        if (searchTerm && searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = todos.filter((t) =>
                t.title.toLowerCase().includes(term) ||
                (t.description && t.description.toLowerCase().includes(term))
            );
        }
        
        // Apply status filter
        switch (filter) {
            case 'active':
                return result.filter((t) => !t.isCompleted);
            case 'completed':
                return result.filter((t) => t.isCompleted);
            default:
                return result;
        }
    }, [todos, filter, searchTerm]);

    return (
        <IonList>
            {filteredTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
            ))}
            {filteredTodos.length === 0 && (
                <div className="ion-padding ion-text-center">
                    <p style={{ color: 'var(--ion-color-medium)' }}>No tasks found</p>
                </div>
            )}
        </IonList>
    );
};