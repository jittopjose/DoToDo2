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
    const addSubtask = useTodoStore((state) => state.addSubtask);
    const deleteTodo = useTodoStore((state) => state.deleteTodo);
    const updateTodo = useTodoStore((state) => state.updateTodo);
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(todo.title);
    const [editDescription, setEditDescription] = useState(todo.description || '');
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [editingShopping, setEditingShopping] = useState(false);
    const [editQuantity, setEditQuantity] = useState(todo.quantity?.toString() ?? '');
    const [editPrice, setEditPrice] = useState(todo.price?.toString() ?? '');
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const inputRef = useRef<HTMLIonInputElement>(null);
    const descRef = useRef<HTMLIonInputElement>(null);
    const qtyRef = useRef<HTMLIonInputElement>(null);
    const priceRef = useRef<HTMLIonInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.setFocus();
        }
    }, [isEditing]);

    useEffect(() => {
        if (editingShopping) {
            if (qtyRef.current && todo.quantity !== undefined) {
                qtyRef.current.setFocus();
            } else if (priceRef.current && (todo.quantity === undefined || todo.price !== undefined)) {
                priceRef.current.setFocus();
            }
        }
    }, [editingShopping]);

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

    const handleDescriptionSave = () => {
        const trimmed = editDescription.trim();
        if (trimmed !== (todo.description || '')) {
            updateTodo(todo.id, { description: trimmed || undefined });
        }
    };

    const handleShoppingSave = () => {
        const newQuantity = editQuantity ? parseFloat(editQuantity) : undefined;
        const newPrice = editPrice ? parseFloat(editPrice) : undefined;
        updateTodo(todo.id, { 
            quantity: isNaN(newQuantity) ? undefined : newQuantity,
            price: isNaN(newPrice) ? undefined : newPrice
        });
        setEditingShopping(false);
    };

    const handleShoppingCancel = () => {
        setEditQuantity(todo.quantity?.toString() ?? '');
        setEditPrice(todo.price?.toString() ?? '');
        setEditingShopping(false);
    };

    const handleShoppingKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleShoppingSave();
        } else if (e.key === 'Escape') {
            handleShoppingCancel();
        }
    };

    const handleDescKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleDescriptionSave();
            setIsEditing(false);
        } else if (e.key === 'Escape') {
            setEditDescription(todo.description || '');
            setIsEditing(false);
        }
    };

    return (
        <IonItemSliding className="todo-item">
            <IonItem
                style={{
                    borderLeft: isOverdue(todo) ? '3px solid var(--ion-color-danger)' : undefined
                } as any}
            >
            <IonCheckbox
                slot="start"
                checked={todo.isCompleted}
                onIonChange={() => toggleTodo(todo.id)}
                aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
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
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IonInput
                            ref={inputRef}
                            value={editText}
                            onIonInput={e => setEditText(e.detail.value!)}
                            onKeyUp={handleKeyPress}
                            placeholder="Enter title"
                            style={{ flex: 1 }}
                        />
                        <IonButton fill="clear" size="small" onClick={() => { handleSave(); handleDescriptionSave(); }} aria-label="Save changes">
                            Done
                        </IonButton>
                        <IonButton fill="clear" size="small" onClick={() => { handleCancel(); setEditDescription(todo.description || ''); }} aria-label="Cancel editing">
                            Cancel
                        </IonButton>
                    </div>
                    <IonInput
                        ref={descRef}
                        value={editDescription}
                        onIonInput={e => setEditDescription(e.detail.value!)}
                        onKeyUp={handleDescKeyPress}
                        placeholder="Add description"
                        style={{ fontSize: '14px' }}
                        aria-label="Edit description"
                    />
                    {todo.subtasks && todo.subtasks.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                            <IonText style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>
                                Subtasks: {todo.subtasks.filter((s) => s.isCompleted).length}/{todo.subtasks.length}
                            </IonText>
                        </div>
                    )}
                    <IonInput
                        value={newSubtaskText}
                        onIonInput={e => setNewSubtaskText(e.detail.value!)}
                        onKeyUp={(e) => { if (e.key === 'Enter') { addSubtask(todo.id, newSubtaskText); setNewSubtaskText(''); } }}
                        placeholder="Add subtask..."
                        style={{ fontSize: '12px' }}
                        aria-label="Add subtask to this task"
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <IonButton fill="clear" size="small" onClick={handlePriorityClick}>
                            <IonIcon icon={ellipse} style={{
                                color: todo.priority ? priorityColors[todo.priority] : 'var(--ion-color-medium)',
                                fontSize: '16px'
                            }} />
                        </IonButton>
                        <IonButton fill="clear" size="small" onClick={() => setShowDueDatePicker(true)}>
                            <IonIcon icon={calendarOutline} />
                        </IonButton>
                    </div>
                </div>
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
                    {todo.subtasks && todo.subtasks.length > 0 && todo.itemType !== 'checklist' && (
                        <div style={{ marginTop: '8px' }}>
                            <IonText style={{ fontSize: '12px', color: 'var(--ion-color-medium)' }}>
                                Subtasks: {todo.subtasks.filter((s) => s.isCompleted).length}/{todo.subtasks.length}
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
                    {todo.itemType === 'todo' && !todo.isCompleted && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <IonInput
                                value={newSubtaskText}
                                onIonInput={e => setNewSubtaskText(e.detail.value!)}
                                onKeyUp={(e) => { if (e.key === 'Enter') { addSubtask(todo.id, newSubtaskText); setNewSubtaskText(''); } }}
                                placeholder={todo.subtasks && todo.subtasks.length > 0 ? "Add subtask..." : "Add subtask..."}
                                style={{ fontSize: '12px', flex: 1 }}
                                aria-label="Add new subtask to this task"
                            />
                            <IonButton fill="clear" size="small" onClick={() => { addSubtask(todo.id, newSubtaskText); setNewSubtaskText(''); }}>
                                Add
                            </IonButton>
                        </div>
                    )}
                    {todo.itemType === 'shopping' && (todo.quantity || todo.price) && (
                        <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setEditingShopping(true); }} aria-label="Edit shopping item details">
                            {editingShopping ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <IonInput
                                        ref={qtyRef}
                                        value={editQuantity}
                                        onIonInput={e => setEditQuantity(e.detail.value!)}
                                        onKeyUp={handleShoppingKeyPress}
                                        type="number"
                                        placeholder="Qty"
                                        style={{ width: '60px', fontSize: '12px' }}
                                        aria-label="Edit quantity"
                                    />
                                    <IonInput
                                        ref={priceRef}
                                        value={editPrice}
                                        onIonInput={e => setEditPrice(e.detail.value!)}
                                        onKeyUp={handleShoppingKeyPress}
                                        type="number"
                                        placeholder="Price"
                                        style={{ width: '80px', fontSize: '12px' }}
                                        aria-label="Edit price"
                                    />
                                    <IonButton fill="clear" size="small" onClick={handleShoppingSave}>Done</IonButton>
                                    <IonButton fill="clear" size="small" onClick={handleShoppingCancel}>Cancel</IonButton>
                                </div>
                            ) : (
                                <>
                                    {todo.quantity !== undefined && <span>Qty: {todo.quantity}</span>}
                                    {todo.quantity !== undefined && todo.price !== undefined && <span> · </span>}
                                    {todo.price !== undefined && <span>Price: ${todo.price.toFixed(2)}</span>}
                                </>
                            )}
                        </div>
                    )}
                    {todo.itemType === 'checklist' && (
                        <div style={{ marginTop: '8px' }}>
                            {todo.subtasks && todo.subtasks.length > 0 ? (
                                <>
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
                                                <span className="sr-only">{subtask.isCompleted ? ' (completed)' : ' (pending)'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : null}
                            {!todo.isCompleted && (
                                <div style={{ marginTop: todo.subtasks && todo.subtasks.length > 0 ? '8px' : '0', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                    <IonInput
                                        value={newSubtaskText}
                                        onIonInput={e => setNewSubtaskText(e.detail.value!)}
                                        onKeyUp={(e) => { if (e.key === 'Enter') { addSubtask(todo.id, newSubtaskText); setNewSubtaskText(''); } }}
                                        placeholder={todo.subtasks && todo.subtasks.length > 0 ? "Add subtask..." : "Add your first subtask..."}
                                        style={{ fontSize: '12px', flex: 1 }}
                                        aria-label="Add new subtask"
                                    />
                                    <IonButton fill="clear" size="small" onClick={() => { addSubtask(todo.id, newSubtaskText); setNewSubtaskText(''); }}>
                                        Add
                                    </IonButton>
                                </div>
                            )}
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
                <IonItemOption color="danger" onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.title}`}>
                    <IonIcon icon={trashOutline} />
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    );
};