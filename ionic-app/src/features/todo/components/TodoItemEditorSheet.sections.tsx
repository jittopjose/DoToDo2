import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
    IonButton,
    IonIcon,
    IonInput,
    IonTextarea,
} from '@ionic/react';
import {
    addOutline,
    checkmarkOutline,
    listOutline,
    trashOutline,
} from 'ionicons/icons';
import { DoTodoSubtask } from '../../todos/types';

interface EditorDetailsProps {
    title: string;
    description: string;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
}

const setNativeCaretColor = (el: HTMLIonInputElement | HTMLIonTextareaElement | null) => {
    if (!el) return;
    const timer = setInterval(async () => {
        const native = await el.getInputElement();
        if (native) {
            native.style.caretColor = 'var(--dotodo-primary)';
            clearInterval(timer);
        }
    }, 50);
};

export const EditorDetailsSection = memo(function EditorDetailsSection({
    title,
    description,
    onTitleChange,
    onDescriptionChange,
}: EditorDetailsProps) {
    const titleRef = useCallback((el: HTMLIonInputElement | null) => setNativeCaretColor(el), []);
    const descRef = useCallback((el: HTMLIonTextareaElement | null) => setNativeCaretColor(el), []);

    return (
        <div className="edit-details-card">
            <div className="edit-field">
                <label className="edit-field-label">Title</label>
                <IonInput
                    ref={titleRef}
                    className="edit-title-input"
                    value={title}
                    onIonInput={(event) => onTitleChange(event.detail.value ?? '')}
                    placeholder="Enter task title..."
                />
            </div>
            <div className="edit-details-divider" />
            <div className="edit-field">
                <label className="edit-field-label">Description</label>
                <IonTextarea
                    ref={descRef}
                    className="edit-description-input"
                    value={description}
                    onIonInput={(event) => onDescriptionChange(event.detail.value ?? '')}
                    placeholder="What needs to be done?"
                    rows={1}
                    autoGrow
                />
            </div>
        </div>
    );
});

interface SubtasksSectionProps {
    subtasks: DoTodoSubtask[] | undefined;
    onToggleSubtask: (subtaskId: string) => void;
    onUpdateSubtask: (subtaskId: string, title: string) => void;
    onDeleteSubtask: (subtaskId: string) => void;
    progress: { completed: number; total: number; percent: number };
}

export const SubtasksSection = memo(function SubtasksSection({
    subtasks,
    onToggleSubtask,
    onUpdateSubtask,
    onDeleteSubtask,
    progress,
}: SubtasksSectionProps) {
    const subtaskList = subtasks ?? [];
    const hasSubtasks = subtaskList.length > 0;
    const progressLabel = progress.total > 0 ? `${progress.completed}/${progress.total}` : '0/0';
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const editInputRef = useRef<HTMLIonInputElement | null>(null);

    const startEditing = useCallback((subtask: DoTodoSubtask) => {
        setEditingId(subtask.id);
        setEditValue(subtask.title);
    }, []);

    useEffect(() => {
        if (!editingId) return;
        setNativeCaretColor(editInputRef.current);
        requestAnimationFrame(() => {
            editInputRef.current?.setFocus();
        });
    }, [editingId]);

    const cancelEditing = useCallback(() => {
        setEditingId(null);
        setEditValue('');
    }, []);

    const commitEditing = useCallback(() => {
        if (editingId && editValue.trim()) {
            onUpdateSubtask(editingId, editValue.trim());
        }
        cancelEditing();
    }, [editingId, editValue, onUpdateSubtask, cancelEditing]);

    const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitEditing();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEditing();
        }
    }, [commitEditing, cancelEditing]);

    const handleLabelClick = useCallback((e: React.MouseEvent, subtask: DoTodoSubtask) => {
        e.stopPropagation();
        startEditing(subtask);
    }, [startEditing]);

    const handleDeleteClick = useCallback((e: React.MouseEvent, subtaskId: string) => {
        e.stopPropagation();
        onDeleteSubtask(subtaskId);
    }, [onDeleteSubtask]);

    return (
        <section className="edit-section edit-section--subtasks" id="dotodo-editor-section-subtasks" aria-labelledby="dotodo-editor-section-subtasks-title">
            <div className="edit-section-heading">
                <h2 id="dotodo-editor-section-subtasks-title" className="edit-section-title">
                    <IonIcon icon={listOutline} aria-hidden="true" />
                    <span>Subtasks</span>
                </h2>
                <div
                    className="edit-section-meta"
                    aria-label={progress.total > 0 ? `${progress.completed} of ${progress.total} subtasks completed` : 'No subtasks'}
                >
                    <span className="edit-progress-pill">{progressLabel}</span>
                    {progress.total > 0 && (
                        <div className="edit-progress-track">
                            <div className="edit-progress-fill" style={{ width: `${progress.percent}%` }} />
                        </div>
                    )}
                </div>
            </div>

            {hasSubtasks ? (
                <div className="subtask-card-list" aria-label="Subtasks">
                    {subtaskList.map((subtask) => (
                        <div
                            key={subtask.id}
                            className={`subtask-card ${subtask.isCompleted ? 'is-completed' : ''} ${editingId === subtask.id ? 'is-editing' : ''}`}
                        >
                            <button
                                className={`subtask-checkbox ${subtask.isCompleted ? 'is-checked' : ''}`}
                                onClick={() => onToggleSubtask(subtask.id)}
                                aria-label={`Mark "${subtask.title}" as ${subtask.isCompleted ? 'incomplete' : 'complete'}`}
                                aria-pressed={subtask.isCompleted}
                            >
                                {subtask.isCompleted && <IonIcon icon={checkmarkOutline} aria-hidden="true" />}
                            </button>
                            {editingId === subtask.id ? (
                                <IonInput
                                    ref={editInputRef}
                                    className="subtask-edit-input"
                                    value={editValue}
                                    onIonInput={(e) => setEditValue(e.detail.value ?? '')}
                                    onKeyDown={handleEditKeyDown}
                                    onIonBlur={commitEditing}
                                    aria-label="Edit subtask title"
                                />
                            ) : (
                                <span className={`subtask-text ${subtask.isCompleted ? 'is-completed' : ''}`} onClick={(e) => handleLabelClick(e, subtask)}>
                                    {subtask.title}
                                </span>
                            )}
                            <button
                                className="subtask-delete-button"
                                onClick={(e) => handleDeleteClick(e, subtask.id)}
                                aria-label={`Delete "${subtask.title}"`}
                            >
                                <IonIcon icon={trashOutline} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="subtask-empty-state" role="status">
                    <div className="subtask-empty-icon" aria-hidden="true">
                        <IonIcon icon={listOutline} />
                    </div>
                    <h3 className="subtask-empty-title">No subtasks yet</h3>
                    <p className="subtask-empty-copy">Break this task into smaller steps.</p>
                </div>
            )}
        </section>
    );
});

interface AddSubtaskRowProps {
    value: string;
    onValueChange: (value: string) => void;
    onSubmit: () => void;
    isEnabled: boolean;
}

export const AddSubtaskRow = memo(function AddSubtaskRow({
    value,
    onValueChange,
    onSubmit,
    isEnabled,
}: AddSubtaskRowProps) {
    const [isAdding, setIsAdding] = useState(false);
    const inputRef = useRef<HTMLIonInputElement>(null);

    const handleOpen = useCallback(() => {
        setIsAdding(true);
        requestAnimationFrame(() => inputRef.current?.setFocus());
    }, []);

    const handleClose = useCallback(() => {
        setIsAdding(false);
        onValueChange('');
    }, [onValueChange]);

    const handleSubmit = useCallback(() => {
        onSubmit();
        if (value.trim()) {
            setIsAdding(false);
        }
    }, [onSubmit, value]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            handleClose();
        }
    }, [handleSubmit, handleClose]);

    return isAdding ? (
        <div className="subtask-add-row">
            <IonInput
                ref={inputRef}
                className="subtask-add-input"
                value={value}
                onIonInput={(event) => onValueChange(event.detail.value ?? '')}
                onKeyDown={handleKeyPress}
                placeholder={isEnabled ? 'Add subtask' : 'Add your first subtask'}
            />
            <IonButton
                className="subtask-add-button"
                fill="solid"
                color="primary"
                onClick={handleSubmit}
                disabled={!value.trim()}
            >
                <IonIcon icon={addOutline} slot="start" />
                Add
            </IonButton>
        </div>
    ) : (
        <button className="subtask-add-trigger" onClick={handleOpen} type="button">
            <IonIcon icon={addOutline} aria-hidden="true" />
            <span>Add subtask</span>
        </button>
    );
});
