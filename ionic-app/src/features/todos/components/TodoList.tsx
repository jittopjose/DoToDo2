import React from 'react';
import { IonList } from '@ionic/react';
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