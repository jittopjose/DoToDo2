import React from 'react';
import { IonList, IonIcon } from '@ionic/react';
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
                <div className={`empty-state ${isSearchActive ? 'is-searching' : ''}`}>
                    <div className="empty-illustration">
                        <IonIcon icon={documentTextOutline} />
                    </div>
                    {isEmptyList ? (
                        <>
                            <h2>No tasks yet</h2>
                            <p>
                                Add your first task above and give today a clear shape.
                            </p>
                        </>
                    ) : (
                        <>
                            <h2>No matching tasks</h2>
                            <p>
                                {isSearchActive ? `No results for "${searchTerm}"` : 'Try changing the filter'}
                            </p>
                        </>
                    )}
                </div>
            )}
        </IonList>
    );
};
