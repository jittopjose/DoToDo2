import React, { useEffect, useState, useCallback, memo } from 'react';
import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonIcon,
    IonModal,
    IonNote,
    IonRow,
    IonTitle,
} from '@ionic/react';
import { checkmarkDoneOutline, closeOutline, trashOutline } from 'ionicons/icons';
import { Todo } from '../types';
import { getSubtaskProgress, parseOptionalNumber } from './TodoItem.utils';
import { EditorSection, sectionTitles, typeLabels } from './TodoItem.constants';
import {
    EditorDetailsSection,
    SubtasksSection,
    AddSubtaskRow,
    ShoppingSection,
} from './TodoItemEditorSheet.sections';
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

export const TodoItemEditorSheet: React.FC<EditorSheetProps> = memo(({
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

    const resetForm = useCallback(() => {
        setTitle(todo.title);
        setDescription(todo.description || '');
        setQuantity(todo.quantity?.toString() ?? '');
        setPrice(todo.price?.toString() ?? '');
        setNewSubtaskText('');
    }, [todo.title, todo.description, todo.quantity, todo.price]);

    useEffect(() => {
        if (!isOpen) return;
        resetForm();
    }, [isOpen, todo.id, resetForm]);

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

    const close = useCallback(() => onDismiss(), [onDismiss]);

    const handleSave = useCallback(() => {
        onUpdate(todo.id, {
            title: title.trim() || todo.title,
            description: description.trim() || undefined,
            quantity: parseOptionalNumber(quantity),
            price: parseOptionalNumber(price),
        });
        close();
    }, [todo.id, todo.title, title, description, quantity, price, onUpdate, close]);

    const handleAddSubtask = useCallback(() => {
        const trimmed = newSubtaskText.trim();
        if (!trimmed) return;
        onAddSubtask(todo.id, trimmed);
        setNewSubtaskText('');
        if (quickMode) close();
    }, [todo.id, newSubtaskText, onAddSubtask, quickMode, close]);

    const handleSubtaskKeyPress = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleAddSubtask();
        }
    }, [handleAddSubtask]);

    const handleShoppingChange = useCallback(() => {
        onUpdate(todo.id, {
            quantity: parseOptionalNumber(quantity),
            price: parseOptionalNumber(price),
        });
        if (quickMode) close();
    }, [todo.id, quantity, price, onUpdate, quickMode, close]);

    const handleToggleSubtask = useCallback((subtaskId: string) => {
        onToggleSubtask(todo.id, subtaskId);
    }, [todo.id, onToggleSubtask]);

    const subtaskProgress = getSubtaskProgress(todo);

    return (
        <>
            <IonModal
                className="todo-editor-modal"
                isOpen={isOpen}
                onDidDismiss={onDismiss}
                initialBreakpoint={quickMode ? 0.42 : 0.62}
                breakpoints={quickMode ? [0.38, 0.55, 1] : [0.55, 0.78, 1]}
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
                                    <IonButton
                                        className="editor-header-action editor-delete-fab"
                                        fill="clear"
                                        onClick={onDelete}
                                        aria-label="Delete task"
                                    >
                                        <IonIcon icon={trashOutline} />
                                    </IonButton>
                                    <IonButton
                                        className="editor-header-action editor-done-fab"
                                        fill="clear"
                                        onClick={handleSave}
                                        aria-label="Save and close"
                                    >
                                        <IonIcon icon={checkmarkDoneOutline} />
                                    </IonButton>
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
                            <EditorDetailsSection
                                title={title}
                                description={description}
                                onTitleChange={setTitle}
                                onDescriptionChange={setDescription}
                            />
                        )}

                        {(quickMode
                            ? [initialSection]
                            : (['subtasks'] as readonly EditorSection[])
                        ).map((section) => {
                            if (section === 'shopping' && todo.itemType !== 'shopping') return null;
                            return section === 'subtasks' ? (
                                <IonGrid key="todo-editor-section-subtasks" className="editor-section" id="todo-editor-section-subtasks">
                                    <SubtasksSection
                                        subtasks={todo.subtasks}
                                        onToggleSubtask={handleToggleSubtask}
                                    />
                                    <AddSubtaskRow
                                        value={newSubtaskText}
                                        onValueChange={setNewSubtaskText}
                                        onSubmit={handleAddSubtask}
                                        isEnabled={Boolean(todo.subtasks && todo.subtasks.length > 0)}
                                    />
                                </IonGrid>
                            ) : (
                                <ShoppingSection
                                    key="todo-editor-section-shopping"
                                    quantity={quantity}
                                    price={price}
                                    onQuantityChange={setQuantity}
                                    onPriceChange={setPrice}
                                    onBlur={handleShoppingChange}
                                />
                            );
                        })}

                    </IonGrid>
                </IonContent>
            </IonModal>
        </>
    );
});