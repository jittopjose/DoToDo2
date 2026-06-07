import React, { useState, useRef, useEffect } from 'react';
import {
    IonItem,
    IonLabel,
    IonCheckbox,
    IonButton,
    IonIcon,
    IonInput,
    IonPopover,
    IonDatetime
} from '@ionic/react';
import { trashOutline, calendarOutline } from 'ionicons/icons';
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
    const updateTodo = useTodoStore((state) => state.updateTodo);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.title);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const inputRef = useRef<HTMLIonInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.setFocus();
        }
    }, [isEditing]);

    const handleEdit = () => {
        if (todo.isCompleted) return;
        setIsEditing(true);
        setEditText(todo.title);
    };

    const handleSave = () => {
        const trimmed = editText.trim();
        if (trimmed && trimmed !== todo.title) {
            updateTodo(todo.id, { title: trimmed });
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditText(todo.title);
        setIsEditing(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    const handleDueDateChange = (e: CustomEvent) => {
        const value = e.detail.value as string | undefined;
        const newDueDate = value ? new Date(value).getTime() : undefined;
        updateTodo(todo.id, { dueDate: newDueDate });
        setShowDueDatePicker(false);
    };

    return (
        <IonItem>
            <IonCheckbox
                slot="start"
                checked={todo.isCompleted}
                onIonChange={() => toggleTodo(todo.id)}
            />
            {isEditing ? (
                <>
                    <IonInput
                        ref={inputRef}
                        value={editText}
                        onIonInput={e => setEditText(e.detail.value!)}
                        onKeyUp={handleKeyPress}
                        onBlur={handleSave}
                    />
                    <IonButton fill="clear" size="small" onClick={() => setShowDueDatePicker(true)}>
                        <IonIcon icon={calendarOutline} />
                    </IonButton>
                </>
            ) : (
                <IonLabel
                    className={todo.isCompleted ? 'ion-text-wrap line-through' : 'ion-text-wrap'}
                    style={{ textDecoration: todo.isCompleted ? 'line-through' : 'none', cursor: 'pointer' }}
                    onClick={handleEdit}
                >
                    {todo.title}
                    {todo.dueDate && (
                        <span style={{ fontSize: '12px', color: 'var(--ion-color-medium)', marginLeft: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }} onClick={(e) => { e.stopPropagation(); setShowDueDatePicker(true); }}>
                            Due: {formatDate(todo.dueDate)}
                            <IonIcon icon={calendarOutline} style={{ marginLeft: '4px', fontSize: '14px' }} />
                        </span>
                    )}
                </IonLabel>
            )}
            <IonButton fill="clear" color="danger" slot="end" onClick={() => deleteTodo(todo.id)}>
                <IonIcon icon={trashOutline} />
            </IonButton>
            {!isEditing && !todo.dueDate && (
                <IonButton fill="clear" size="small" slot="end" onClick={() => setShowDueDatePicker(true)}>
                    <IonIcon icon={calendarOutline} />
                </IonButton>
            )}
            <IonPopover
                isOpen={showDueDatePicker}
                onDidDismiss={() => setShowDueDatePicker(false)}
            >
                <IonDatetime
                    value={todo.dueDate ? new Date(todo.dueDate).toISOString() : ''}
                    onIonChange={handleDueDateChange}
                    presentation="date-time"
                />
            </IonPopover>
        </IonItem>
    );
};