import React from 'react';
import { IonList } from '@ionic/react';
import { useTodoStore } from '../store/todoStore';
import { TodoItem } from './TodoItem';

export const TodoList: React.FC = () => {
    // Using a selector to optimize re-renders
    const todos = useTodoStore((state) => state.getFilteredTodos());

    return (
        <IonList>
            {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
            ))}
            {todos.length === 0 && (
                <div className="ion-padding ion-text-center">
                    <p style={{ color: 'var(--ion-color-medium)' }}>No tasks found</p>
                </div>
            )}
        </IonList>
    );
};
