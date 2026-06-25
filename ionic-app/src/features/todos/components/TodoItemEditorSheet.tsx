import React, { useEffect, useState, useCallback, memo } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonGrid,
    IonIcon,
    IonModal,
} from '@ionic/react';
import { checkmarkDoneOutline, closeOutline, trashOutline } from 'ionicons/icons';
import { Todo } from '../types';
import { getSubtaskProgress, parseOptionalNumber } from './TodoItem.utils';
import { EditorDetailsSection, SubtasksSection, AddSubtaskRow } from './TodoItemEditorSheet.sections';
import './TodoItem.css';

interface EditorSheetProps {
    todo: Todo;
    isOpen: boolean;
    onDismiss: () => void;
    onDelete: () => void;
    onToggleSubtask: (todoId: string, subtaskId: string) => void;
    onAddSubtask: (todoId: string, title: string) => void;
    onUpdateSubtask: (todoId: string, subtaskId: string, title: string) => void;
    onDeleteSubtask: (todoId: string, subtaskId: string) => void;
    onUpdate: (id: string, updates: Partial<Pick<Todo, 'title' | 'description'>>) => void;
}

export const TodoItemEditorSheet: React.FC<EditorSheetProps> = memo(({
    todo,
    isOpen,
    onDismiss,
    onDelete,
    onToggleSubtask,
    onAddSubtask,
    onUpdateSubtask,
    onDeleteSubtask,
    onUpdate,
}) => {
    const [title, setTitle] = useState(todo.title);
    const [description, setDescription] = useState(todo.description || '');
    const [newSubtaskText, setNewSubtaskText] = useState('');

    const resetForm = useCallback(() => {
        setTitle(todo.title);
        setDescription(todo.description || '');
        setNewSubtaskText('');
    }, [todo.title, todo.description]);

    useEffect(() => {
        if (!isOpen) return;
        resetForm();
    }, [isOpen, todo.id, resetForm]);

    const close = useCallback(() => onDismiss(), [onDismiss]);

    const handleSave = useCallback(() => {
        onUpdate(todo.id, {
            title: title.trim() || todo.title,
            description: description.trim() || undefined,
        });
        close();
    }, [todo.id, todo.title, title, description, onUpdate, close]);

    const handleAddSubtask = useCallback(() => {
        const trimmed = newSubtaskText.trim();
        if (!trimmed) return;
        onAddSubtask(todo.id, trimmed);
        setNewSubtaskText('');
    }, [todo.id, newSubtaskText, onAddSubtask]);

    const handleSubtaskKeyPress = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddSubtask();
        }
    }, [handleAddSubtask]);

    const handleToggleSubtask = useCallback((subtaskId: string) => {
        onToggleSubtask(todo.id, subtaskId);
    }, [todo.id, onToggleSubtask]);

    const handleUpdateSubtask = useCallback((subtaskId: string, title: string) => {
        onUpdateSubtask(todo.id, subtaskId, title);
    }, [todo.id, onUpdateSubtask]);

    const handleDeleteSubtask = useCallback((subtaskId: string) => {
        onDeleteSubtask(todo.id, subtaskId);
    }, [todo.id, onDeleteSubtask]);

    return (
        <IonModal
            className="todo-editor-modal"
            isOpen={isOpen}
            onDidDismiss={onDismiss}
            initialBreakpoint={0.45}
            breakpoints={[0.45, 0.72, 1]}
            handle
        >
            <IonContent className="editor-content">
                <IonGrid className="editor-grid">
                    <div className="editor-header-row">
                        <div className="editor-header-left">
                            <h2 className="editor-title">Edit task</h2>
                        </div>
                        <div className="editor-header-actions">
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
                            <IonButton className="editor-header-action editor-close-button" fill="clear" onClick={close} aria-label="Close">
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </div>
                    </div>

                    <EditorDetailsSection
                        title={title}
                        description={description}
                        onTitleChange={setTitle}
                        onDescriptionChange={setDescription}
                    />

                    <SubtasksSection
                        subtasks={todo.subtasks}
                        onToggleSubtask={handleToggleSubtask}
                        onUpdateSubtask={handleUpdateSubtask}
                        onDeleteSubtask={handleDeleteSubtask}
                        progress={getSubtaskProgress(todo)}
                    />

                    <AddSubtaskRow
                        value={newSubtaskText}
                        onValueChange={setNewSubtaskText}
                        onSubmit={handleAddSubtask}
                        onKeyPress={handleSubtaskKeyPress}
                        isEnabled={Boolean(todo.subtasks && todo.subtasks.length > 0)}
                    />
                </IonGrid>
            </IonContent>
        </IonModal>
    );
});
