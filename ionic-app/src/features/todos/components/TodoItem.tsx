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
import './TodoItem.css';

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
    }, [editingShopping, priceRef, qtyRef, todo.price, todo.quantity]);

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
            quantity: typeof newQuantity === 'number' && Number.isFinite(newQuantity) ? newQuantity : undefined,
            price: typeof newPrice === 'number' && Number.isFinite(newPrice) ? newPrice : undefined
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
        <IonItemSliding className={`todo-item ${isOverdue(todo) ? 'is-overdue' : ''}`}>
            <IonItem className="task-row" lines="none">
            <IonCheckbox
                className="task-checkbox"
                slot="start"
                checked={todo.isCompleted}
                onIonChange={() => toggleTodo(todo.id)}
                aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
            />
            {!isOverdue(todo) && todo.priority && !isEditing && (
                <IonIcon className={`task-priority-dot task-priority-dot--${todo.priority}`} icon={ellipse} />
            )}
            {isOverdue(todo) && !isEditing && (
                <IonIcon className="task-overdue-icon" icon={alertCircleOutline} />
            )}
            {isEditing ? (
                <div className="edit-stack">
                    <div className="edit-title-row">
                        <IonInput
                            ref={inputRef}
                            className="edit-title-input"
                            value={editText}
                            onIonInput={e => setEditText(e.detail.value!)}
                            onKeyUp={handleKeyPress}
                            placeholder="Enter title"
                        />
                        <IonButton className="compact-button save-button" fill="clear" size="small" onClick={() => { handleSave(); handleDescriptionSave(); }} aria-label="Save changes">
                            Done
                        </IonButton>
                        <IonButton className="compact-button cancel-button" fill="clear" size="small" onClick={() => { handleCancel(); setEditDescription(todo.description || ''); }} aria-label="Cancel editing">
                            Cancel
                        </IonButton>
                    </div>
                    <IonInput
                        ref={descRef}
                        className="edit-description-input"
                        value={editDescription}
                        onIonInput={e => setEditDescription(e.detail.value!)}
                        onKeyUp={handleDescKeyPress}
                        placeholder="Add description"
                        aria-label="Edit description"
                    />
                    {todo.subtasks && todo.subtasks.length > 0 && (
                        <div className="edit-subtask-summary">
                            <IonText className="task-progress-text">
                                Subtasks: {todo.subtasks.filter((s) => s.isCompleted).length}/{todo.subtasks.length}
                            </IonText>
                        </div>
                    )}
                    <IonInput
                        className="subtask-input"
                        value={newSubtaskText}
                        onIonInput={e => setNewSubtaskText(e.detail.value!)}
                        onKeyUp={(e) => { if (e.key === 'Enter') { addSubtask(todo.id, newSubtaskText); setNewSubtaskText(''); } }}
                        placeholder="Add subtask..."
                        aria-label="Add subtask to this task"
                    />
                    <div className="edit-actions">
                        <IonButton className="compact-button icon-compact-button" fill="clear" size="small" onClick={handlePriorityClick} aria-label="Change priority">
                            <IonIcon className={`task-priority-dot ${todo.priority ? `task-priority-dot--${todo.priority}` : ''}`} icon={ellipse} />
                        </IonButton>
                        <IonButton className="compact-button icon-compact-button" fill="clear" size="small" onClick={() => setShowDueDatePicker(true)} aria-label="Change due date">
                            <IonIcon icon={calendarOutline} />
                        </IonButton>
                    </div>
                </div>
            ) : (
                <IonLabel
                    className={`task-label ${todo.isCompleted ? 'is-completed' : ''}`}
                    onClick={handleEdit}
                >
                    <div className="task-title-row">
                        <IonIcon className={`task-type-icon task-type-icon--${todo.itemType}`} icon={typeIcons[todo.itemType]} />
                        <strong className="task-title-text">{todo.title}</strong>
                        <IonBadge className="task-badge" color="medium">{typeLabels[todo.itemType]}</IonBadge>
                        {isOverdue(todo) && (
                            <IonBadge className="task-badge task-badge--danger" color="danger">Overdue</IonBadge>
                        )}
                    </div>
                    {todo.description && (
                        <div className="task-description">
                            {todo.description}
                        </div>
                    )}
                    {todo.subtasks && todo.subtasks.length > 0 && todo.itemType !== 'checklist' && (
                        <div className="task-subtask-list">
                            <IonText className="task-progress-text">
                                Subtasks: {todo.subtasks.filter((s) => s.isCompleted).length}/{todo.subtasks.length}
                            </IonText>
                            {todo.subtasks.map((subtask) => (
                                <div
                                    className={`task-subtask-row ${subtask.isCompleted ? 'is-completed' : ''}`}
                                    key={subtask.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSubtask(todo.id, subtask.id);
                                    }}
                                >
                                    <IonIcon className="task-subtask-icon" icon={subtask.isCompleted ? checkmarkDoneOutline : ellipse} />
                                    <span>{subtask.title}</span>
                                    <span className="sr-only">{subtask.isCompleted ? ' (completed)' : ' (pending)'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {todo.itemType === 'todo' && !todo.isCompleted && (
                        <div className="task-subtask-add-row">
                            <IonInput
                                className="subtask-input"
                                value={newSubtaskText}
                                onIonInput={e => setNewSubtaskText(e.detail.value!)}
                                onKeyUp={(e) => { if (e.key === 'Enter') { addSubtask(todo.id, newSubtaskText); setNewSubtaskText(''); } }}
                                placeholder="Add subtask..."
                                aria-label="Add new subtask to this task"
                            />
                            <IonButton className="compact-button subtask-add-button" fill="clear" size="small" onClick={() => { addSubtask(todo.id, newSubtaskText); setNewSubtaskText(''); }}>
                                Add
                            </IonButton>
                        </div>
                    )}
                    {todo.itemType === 'shopping' && (todo.quantity || todo.price) && (
                        <div className="task-shopping-row" onClick={(e) => { e.stopPropagation(); setEditingShopping(true); }} aria-label="Edit shopping item details">
                            {editingShopping ? (
                                <div className="shopping-edit-row" onClick={(e) => e.stopPropagation()}>
                                    <IonInput
                                        ref={qtyRef}
                                        className="shopping-edit-input"
                                        value={editQuantity}
                                        onIonInput={e => setEditQuantity(e.detail.value!)}
                                        onKeyUp={handleShoppingKeyPress}
                                        type="number"
                                        placeholder="Qty"
                                        aria-label="Edit quantity"
                                    />
                                    <IonInput
                                        ref={priceRef}
                                        className="shopping-edit-input"
                                        value={editPrice}
                                        onIonInput={e => setEditPrice(e.detail.value!)}
                                        onKeyUp={handleShoppingKeyPress}
                                        type="number"
                                        placeholder="Price"
                                        aria-label="Edit price"
                                    />
                                    <IonButton className="compact-button save-button" fill="clear" size="small" onClick={handleShoppingSave}>Done</IonButton>
                                    <IonButton className="compact-button cancel-button" fill="clear" size="small" onClick={handleShoppingCancel}>Cancel</IonButton>
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
                        <div className="task-checklist-block">
                            {todo.subtasks && todo.subtasks.length > 0 ? (
                                <>
                                    <IonText className="task-progress-text">
                                        Checklist: {todo.subtasks.filter((s) => s.isCompleted).length}/{todo.subtasks.length}
                                    </IonText>
                                    <div className="task-subtask-list">
                                        {todo.subtasks.map((subtask) => (
                                            <div
                                                className={`task-subtask-row ${subtask.isCompleted ? 'is-completed' : ''}`}
                                                key={subtask.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSubtask(todo.id, subtask.id);
                                                }}
                                            >
                                                <IonIcon className="task-subtask-icon" icon={subtask.isCompleted ? checkmarkDoneOutline : ellipse} />
                                                <span>{subtask.title}</span>
                                                <span className="sr-only">{subtask.isCompleted ? ' (completed)' : ' (pending)'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : null}
                            {!todo.isCompleted && (
                                <div className="task-subtask-add-row">
                                    <IonInput
                                        className="subtask-input"
                                        value={newSubtaskText}
                                        onIonInput={e => setNewSubtaskText(e.detail.value!)}
                                        onKeyUp={(e) => { if (e.key === 'Enter') { addSubtask(todo.id, newSubtaskText); setNewSubtaskText(''); } }}
                                        placeholder={todo.subtasks && todo.subtasks.length > 0 ? "Add subtask..." : "Add your first subtask..."}
                                        aria-label="Add new subtask"
                                    />
                                    <IonButton className="compact-button subtask-add-button" fill="clear" size="small" onClick={() => { addSubtask(todo.id, newSubtaskText); setNewSubtaskText(''); }}>
                                        Add
                                    </IonButton>
                                </div>
                            )}
                        </div>
                    )}
                    {todo.dueDate && (
                        <div className={`task-due-row ${isOverdue(todo) ? 'is-overdue' : ''}`} onClick={(e) => { e.stopPropagation(); setShowDueDatePicker(true); }}>
                            <IonIcon icon={calendarOutline} />
                            <span>Due: {formatDate(todo.dueDate)}</span>
                        </div>
                    )}
                </IonLabel>
            )}
            <IonPopover className="datetime-popover" isOpen={showDueDatePicker} onDidDismiss={() => setShowDueDatePicker(false)}>
                <IonDatetime
                    value={todo.dueDate ? new Date(todo.dueDate).toISOString() : ''}
                    onIonChange={handleDueDateChange}
                    presentation="date-time"
                />
            </IonPopover>
            </IonItem>
            <IonItemOptions side="end" className="task-options">
                <IonItemOption color="danger" onClick={() => deleteTodo(todo.id)} aria-label={`Delete ${todo.title}`}>
                    <IonIcon icon={trashOutline} />
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
    );
};
