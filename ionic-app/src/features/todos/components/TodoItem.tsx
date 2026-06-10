import React, { useState, useRef, useEffect } from 'react';
import {
    IonItem,
    IonLabel,
    IonCheckbox,
    IonButton,
    IonIcon,
    IonInput,
    IonPopover,
    IonDatetime,
    IonBadge,
    IonText,
    IonItemSliding,
    IonItemOptions,
    IonItemOption
} from '@ionic/react';
import { trashOutline, calendarOutline, ellipse, listOutline, cartOutline, documentTextOutline, checkmarkDoneOutline, alertCircleOutline } from 'ionicons/icons';
import { Todo } from '../types';
import { useTodoStore } from '../store/todoStore';

interface Props {
    todo: Todo;
}

const isOverdue = (todo: Todo): boolean => {
    return todo.dueDate !== undefined && todo.dueDate < Date.now() && !todo.isCompleted;
};

const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.ceil((today.getTime() - dueDay.getTime()) / (1000 * 60 * 60 * 24));
    
    const datePart = d.toLocaleDateString();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timePart = `${hour12}:${minutes} ${ampm}`;
    
    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago (${datePart})`;
    }
    return `${datePart}, ${timePart}`;
};

const priorityColors = {
    low: 'var(--ion-color-success)',
    medium: 'var(--ion-color-warning)',
    high: 'var(--ion-color-danger)'
};

const typeIcons = {
    todo: listOutline,
    shopping: cartOutline,
    note: documentTextOutline,
    checklist: checkmarkDoneOutline,
};

const typeLabels = {
    todo: 'Task',
    shopping: 'Shopping',
    note: 'Note',
    checklist: 'Checklist',
};

export const TodoItem: React.FC<Props> = ({ todo }) => {
    const toggleTodo = useTodoStore((state) => state.toggleTodo);
    const toggleSubtask = useTodoStore((state) => state.toggleSubtask);
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

    const handlePriorityClick = () => {
        const levels: Array<'low' | 'medium' | 'high' | undefined> = ['low', 'medium', 'high', undefined];
        const currentIndex = levels.indexOf(todo.priority as any);
        const nextPriority = levels[(currentIndex + 1) % levels.length];
        updateTodo(todo.id, { priority: nextPriority });
    };

    return (
        <IonItemSliding>
            <IonItem
                style={{
                    borderLeft: isOverdue(todo) ? '3px solid var(--ion-color-danger)' : undefined
                } as any}
            >
            <IonCheckbox
                slot="start"
                checked={todo.isCompleted}
                onIonChange={() => toggleTodo(todo.id)}
            />
            {!isOverdue(todo) && todo.priority && !isEditing && (
                <IonIcon icon={ellipse} style={{
                    color: priorityColors[todo.priority],
                    marginRight: '8px',
                    fontSize: '16px'
                }} />
            )}
            {isOverdue(todo) && !isEditing && (
                <IonIcon icon={alertCircleOutline} style={{
                    color: 'var(--ion-color-danger)',
                    marginRight: '8px',
                    fontSize: '16px'
                }} />
            )}
            {isEditing ? (
                <>
                    <IonInput
                        ref={inputRef}
                        value={editText}
                        onIonInput={e => setEditText(e.detail.value!)}
                        onKeyUp={handleKeyPress}
                        onBlur={handleSave}
                        placeholder="Enter title"
                    />
                    <IonButton fill="clear" size="small" onClick={handlePriorityClick}>
                        <IonIcon icon={ellipse} style={{
                            color: todo.priority ? priorityColors[todo.priority] : 'var(--ion-color-medium)',
                            fontSize: '16px'
                        }} />
                    </IonButton>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IonIcon icon={typeIcons[todo.itemType]} style={{ fontSize: '18px', color: 'var(--ion-color-primary)' }} />
                        <strong>{todo.title}</strong>
                        <IonBadge color="medium" style={{ textTransform: 'none' }}>{typeLabels[todo.itemType]}</IonBadge>
                        {isOverdue(todo) && (
                            <IonBadge color="danger" style={{ fontSize: '10px' }}>Overdue</IonBadge>
                        )}
                    </div>
                    {todo.description && (
                        <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', marginTop: '4px' }}>
                            {todo.description}
                        </div>
                    )}
                    {todo.itemType === 'shopping' && (todo.quantity || todo.price) && (
                        <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', marginTop: '4px' }}>
                            {todo.quantity !== undefined && <span>Qty: {todo.quantity}</span>}
                            {todo.quantity !== undefined && todo.price !== undefined && <span> · </span>}
                            {todo.price !== undefined && <span>Price: ${todo.price.toFixed(2)}</span>}
                        </div>
                    )}
                    {todo.itemType === 'checklist' && todo.subtasks && todo.subtasks.length > 0 && (
                        <div style={{ marginTop: '8px' }}>
                            <IonText style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>
                                Checklist: {todo.subtasks.filter((s) => s.isCompleted).length}/{todo.subtasks.length}
                            </IonText>
                            <div style={{ marginTop: '4px' }}>
                                {todo.subtasks.map((subtask) => (
                                    <div 
                                        key={subtask.id} 
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: subtask.isCompleted ? 'var(--ion-color-success)' : 'var(--ion-color-medium)', cursor: 'pointer' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSubtask(todo.id, subtask.id);
                                        }}
                                    >
                                        <IonIcon icon={subtask.isCompleted ? checkmarkDoneOutline : ellipse} style={{ fontSize: '12px' }} />
                                        <span style={{ textDecoration: subtask.isCompleted ? 'line-through' : 'none' }}>{subtask.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {todo.dueDate && (
                        <div style={{ fontSize: '12px', color: isOverdue(todo) ? 'var(--ion-color-danger)' : 'var(--ion-color-medium)', marginTop: '4px', display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setShowDueDatePicker(true); }}>
                            <IonIcon icon={calendarOutline} style={{ marginRight: '4px', fontSize: '14px' }} />
                            Due: {formatDate(todo.dueDate)}
                        </div>
                    )}
                </IonLabel>
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
            <IonItemOptions side="end">
                <IonItemOption color="danger" onClick={() => deleteTodo(todo.id)}>
                    <IonIcon icon={trashOutline} />
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    );
};