import React, { useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonDatetime,
    IonGrid,
    IonIcon,
    IonInput,
    IonItem,
    IonModal,
    IonNote,
    IonPopover,
    IonRow,
    IonTextarea,
    IonTitle,
} from '@ionic/react';
import { addOutline, cartOutline, checkmarkDoneOutline, closeOutline, ellipse } from 'ionicons/icons';
import { Todo } from '../types';
import { getSubtaskProgress, parseOptionalNumber } from './TodoItem.utils';
import { EditorSection, sectionTitles, typeLabels } from './TodoItem.constants';
import './TodoItem.css';
export type { EditorSection };

interface EditorSheetProps {
    todo: Todo;
    isOpen: boolean;
    initialSection: EditorSection;
    quickMode: boolean;
    onDismiss: () => void;
    onDelete: () => void;
    onToggleSubtask: (todoId: string, subtaskId: string) => void;
    onAddSubtask: (todoId: string, title: string) => void;
    onUpdate: (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'dueDate' | 'priority' | 'quantity' | 'price'>>) => void;
    onSwitchToFull: () => void;
}

export const TodoItemEditorSheet: React.FC<EditorSheetProps> = ({
    todo,
    isOpen,
    initialSection,
    quickMode,
    onDismiss,
    onDelete,
    onToggleSubtask,
    onAddSubtask,
    onUpdate,
    onSwitchToFull,
}) => {
    const [title, setTitle] = useState(todo.title);
    const [description, setDescription] = useState(todo.description || '');
    const [quantity, setQuantity] = useState(todo.quantity?.toString() ?? '');
    const [price, setPrice] = useState(todo.price?.toString() ?? '');
    const [newSubtaskText, setNewSubtaskText] = useState('');

    const resetForm = () => {
        setTitle(todo.title);
        setDescription(todo.description || '');
        setQuantity(todo.quantity?.toString() ?? '');
        setPrice(todo.price?.toString() ?? '');
        setNewSubtaskText('');
    };

    useEffect(() => {
        if (!isOpen) return;
        resetForm();
    }, [isOpen, todo.id, todo.title, todo.description, todo.quantity, todo.price]);

    useEffect(() => {
        if (!isOpen || !initialSection) return;
        const frame = requestAnimationFrame(() => {
            document.getElementById(`todo-editor-section-${initialSection}`)?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        });
        return () => cancelAnimationFrame(frame);
    }, [isOpen, initialSection]);

    const close = () => onDismiss();

    const handleSave = () => {
        onUpdate(todo.id, {
            title: title.trim() || todo.title,
            description: description.trim() || undefined,
            quantity: parseOptionalNumber(quantity),
            price: parseOptionalNumber(price),
        });
        close();
    };

    const handleAddSubtask = () => {
        const trimmed = newSubtaskText.trim();
        if (!trimmed) return;
        onAddSubtask(todo.id, trimmed);
        setNewSubtaskText('');
        if (quickMode) close();
    };

    const handleSubtaskKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleAddSubtask();
        }
    };

    const handleShoppingChange = () => {
        onUpdate(todo.id, {
            quantity: parseOptionalNumber(quantity),
            price: parseOptionalNumber(price),
        });
        if (quickMode) close();
    };

    const subtaskProgress = getSubtaskProgress(todo);

    return (
        <>
            <IonModal
                className="todo-editor-modal"
                isOpen={isOpen}
                onDidDismiss={onDismiss}
                initialBreakpoint={quickMode ? 0.42 : 0.58}
                breakpoints={quickMode ? [0.38, 0.55, 1] : [0.45, 0.72, 1]}
                handle
            >
                <IonContent className="editor-content">
                    <IonGrid className="editor-grid">
                        <IonRow className="editor-header-row">
                            <IonCol>
                                <IonTitle className="editor-title">{quickMode ? sectionTitles[initialSection] : 'Task details'}</IonTitle>
                                {!quickMode && <IonNote className="editor-subtitle">{typeLabels[todo.itemType]}</IonNote>}
                            </IonCol>
                            <IonCol size="auto">
                                <IonButtons>
                                    {quickMode && (
                                        <IonButton
                                            className="editor-text-button"
                                            fill="clear"
                                            size="small"
                                            onClick={onSwitchToFull}
                                        >
                                            Edit full
                                        </IonButton>
                                    )}
                                    <IonButton className="editor-close-button" fill="clear" onClick={close} aria-label="Close task details">
                                        <IonIcon icon={closeOutline} />
                                    </IonButton>
                                </IonButtons>
                            </IonCol>
                        </IonRow>

                        {!quickMode && (
                            <IonGrid className="editor-section" id="todo-editor-section-details">
                                <IonItem className="editor-field" lines="none">
                                    <IonCol>
                                        <IonNote className="field-label">Title</IonNote>
                                        <IonInput
                                            className="editor-title-input"
                                            value={title}
                                            onIonInput={(event) => setTitle(event.detail.value ?? '')}
                                            placeholder="Task title"
                                        />
                                    </IonCol>
                                </IonItem>
                                <IonItem className="editor-field" lines="none">
                                    <IonCol>
                                        <IonNote className="field-label">Details</IonNote>
                                        <IonTextarea
                                            className="editor-description-input"
                                            value={description}
                                            onIonInput={(event) => setDescription(event.detail.value ?? '')}
                                            placeholder="Add notes, context, or instructions"
                                            rows={4}
                                        />
                                    </IonCol>
                                </IonItem>
                            </IonGrid>
                        )}

                        {(quickMode
                            ? [initialSection]
                            : (['subtasks'] as readonly EditorSection[])
                        ).map((section) => {
                            if (section === 'shopping' && todo.itemType !== 'shopping') return null;
                            return section === 'subtasks' ? (
                                <IonGrid key="todo-editor-section-subtasks" className="editor-section" id="todo-editor-section-subtasks">
                                    <IonRow className="editor-section-heading">
                                        <IonCol>
                                            <IonIcon icon={checkmarkDoneOutline} />
                                            <IonTitle>Subtasks</IonTitle>
                                        </IonCol>
                                        {subtaskProgress.total > 0 && (
                                            <IonCol size="auto">
                                                <IonNote className="subtask-progress-label">{subtaskProgress.completed}/{subtaskProgress.total}</IonNote>
                                            </IonCol>
                                        )}
                                    </IonRow>
                                    {todo.subtasks && todo.subtasks.length > 0 && (
                                        <IonGrid className="subtask-editor-list">
                                            {todo.subtasks.map((subtask) => (
                                                <IonItem
                                                    key={subtask.id}
                                                    className={`subtask-editor-row ${subtask.isCompleted ? 'is-completed' : ''}`}
                                                    lines="none"
                                                    button
                                                    detail={false}
                                                    onClick={() => onToggleSubtask(todo.id, subtask.id)}
                                                >
                                                    <IonIcon className="subtask-editor-icon" icon={subtask.isCompleted ? checkmarkDoneOutline : ellipse} />
                                                    <IonNote className="subtask-editor-title">{subtask.title}</IonNote>
                                                </IonItem>
                                            ))}
                                        </IonGrid>
                                    )}
                                    <IonItem className="subtask-editor-add" lines="none">
                                        <IonInput
                                            className="subtask-editor-input"
                                            value={newSubtaskText}
                                            onIonInput={(event) => setNewSubtaskText(event.detail.value ?? '')}
                                            onKeyUp={handleSubtaskKeyPress}
                                            placeholder={todo.subtasks && todo.subtasks.length > 0 ? 'Add another subtask' : 'Add your first subtask'}
                                        />
                                        <IonButton className="subtask-editor-add-button" fill="clear" onClick={handleAddSubtask} disabled={!newSubtaskText.trim()}>
                                            <IonIcon icon={addOutline} />
                                        </IonButton>
                                    </IonItem>
                                </IonGrid>
                            ) : (
                                <IonGrid key="todo-editor-section-shopping" className="editor-section" id="todo-editor-section-shopping">
                                    <IonRow className="editor-section-heading">
                                        <IonCol>
                                            <IonIcon icon={cartOutline} />
                                            <IonTitle>Shopping details</IonTitle>
                                        </IonCol>
                                    </IonRow>
                                    <IonGrid className="shopping-editor-grid">
                                        <IonRow>
                                            <IonCol>
                                                <IonNote className="field-label">Quantity</IonNote>
                                                <IonInput
                                                    className="shopping-editor-input"
                                                    type="number"
                                                    inputMode="decimal"
                                                    value={quantity}
                                                    onIonInput={(event) => setQuantity(event.detail.value ?? '')}
                                                    onBlur={handleShoppingChange}
                                                    placeholder="12"
                                                />
                                            </IonCol>
                                            <IonCol>
                                                <IonNote className="field-label">Price</IonNote>
                                                <IonInput
                                                    className="shopping-editor-input"
                                                    type="number"
                                                    inputMode="decimal"
                                                    value={price}
                                                    onIonInput={(event) => setPrice(event.detail.value ?? '')}
                                                    onBlur={handleShoppingChange}
                                                    placeholder="4.99"
                                                />
                                            </IonCol>
                                        </IonRow>
                                    </IonGrid>
                                </IonGrid>
                            );
                        })}

                        {!quickMode && (
                            <IonGrid className="editor-actions">
                                <IonRow>
                                    <IonCol size="6">
                                        <IonButton className="editor-delete-button" expand="block" fill="outline" onClick={onDelete}>
                                            Delete
                                        </IonButton>
                                    </IonCol>
                                    <IonCol size="6">
                                        <IonButton className="editor-done-button" expand="block" onClick={handleSave}>
                                            Done
                                        </IonButton>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        )}
                    </IonGrid>
                </IonContent>
            </IonModal>
        </>
    );
};