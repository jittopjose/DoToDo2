import React from 'react';
import {
    IonItem,
    IonLabel,
    IonCheckbox,
    IonButton,
    IonIcon
} from '@ionic/react';
import { trashOutline } from 'ionicons/icons';
import { Todo } from '../types';
import { useTodoStore } from '../store/todoStore';

interface Props {
    todo: Todo;
}

const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const datePart = d.toLocaleDateString();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timePart = `${hour12}:${minutes} ${ampm}`;
    return `${datePart}, ${timePart}`;
};

export const TodoItem: React.FC<Props> = ({ todo }) => {
    const toggleTodo = useTodoStore((state) => state.toggleTodo);
    const deleteTodo = useTodoStore((state) => state.deleteTodo);

    return (
        <IonItem>
            <IonCheckbox
                slot="start"
                checked={todo.isCompleted}
                onIonChange={() => toggleTodo(todo.id)}
            />
            <IonLabel className={todo.isCompleted ? 'ion-text-wrap line-through' : 'ion-text-wrap'} style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none' }}>
                {todo.title}
                {todo.dueDate && (
                    <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', marginTop: '4px' }}>
                        Due: {formatDate(todo.dueDate)}
                    </div>
                )}
            </IonLabel>
            <IonButton fill="clear" color="danger" slot="end" onClick={() => deleteTodo(todo.id)}>
                <IonIcon icon={trashOutline} />
            </IonButton>
        </IonItem>
    );
};
