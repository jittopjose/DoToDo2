import { memo, useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import {
    IonBadge,
    IonButton,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonProgressBar,
    IonTextarea,
} from '@ionic/react';
import {
    addOutline,
    checkmarkDoneOutline,
    listOutline,
    trashOutline,
} from 'ionicons/icons';
import { TodoSubtask } from '../types';

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
        <IonList lines="none" className="edit-fields">
            <IonItem lines="none" className="edit-field">
                <IonLabel position="stacked">Title</IonLabel>
                <IonInput
                    ref={titleRef}
                    className="edit-title-input"
                    value={title}
                    onIonInput={(event) => onTitleChange(event.detail.value ?? '')}
                    placeholder="Task title"
                />
            </IonItem>
            <IonItem lines="none" className="edit-field">
                <IonLabel position="stacked">Description</IonLabel>
                <IonTextarea
                    ref={descRef}
                    className="edit-description-input"
                    value={description}
                    onIonInput={(event) => onDescriptionChange(event.detail.value ?? '')}
                    placeholder="What needs to be done?"
                    rows={1}
                    autoGrow
                />
            </IonItem>
        </IonList>
    );
});

interface SubtasksSectionProps {
    subtasks: TodoSubtask[] | undefined;
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

    const startEditing = useCallback((subtask: TodoSubtask) => {
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

    const handleLabelClick = useCallback((e: React.MouseEvent, subtask: TodoSubtask) => {
        e.stopPropagation();
        startEditing(subtask);
    }, [startEditing]);

    const handleDeleteClick = useCallback((e: React.MouseEvent, subtaskId: string) => {
        e.stopPropagation();
        onDeleteSubtask(subtaskId);
    }, [onDeleteSubtask]);

    return (
        <section className="edit-section edit-section--subtasks" id="todo-editor-section-subtasks" aria-labelledby="todo-editor-section-subtasks-title">
            <div className="edit-section-heading">
                <h2 id="todo-editor-section-subtasks-title" className="edit-section-title">
                    <IonIcon icon={listOutline} aria-hidden="true" />
                    <span>Subtasks</span>
                </h2>
                <div
                    className="edit-section-meta"
                    aria-label={progress.total > 0 ? `${progress.completed} of ${progress.total} subtasks completed` : 'No subtasks'}
                >
                    <IonBadge color="medium" className="edit-progress-pill">{progressLabel}</IonBadge>
                    {progress.total > 0 && (
                        <IonProgressBar
                            value={progress.percent / 100}
                            color="primary"
                            className="edit-progress-bar"
                            aria-label={`${progress.percent}% complete`}
                        />
                    )}
                </div>
            </div>

            {hasSubtasks ? (
                <IonList lines="none" className="subtask-editor-list" aria-label="Subtasks">
                    {subtaskList.map((subtask) => (
                        <IonItem
                            key={subtask.id}
                            button
                            detail={false}
                            lines="none"
                            className={`subtask-row ${subtask.isCompleted ? 'is-completed' : ''} ${editingId === subtask.id ? 'is-editing' : ''}`}
                            onClick={editingId === subtask.id ? undefined : () => onToggleSubtask(subtask.id)}
                            aria-label={`Mark "${subtask.title}" as ${subtask.isCompleted ? 'incomplete' : 'complete'}`}
                            aria-pressed={subtask.isCompleted}
                        >
                            <div className={`subtask-check ${subtask.isCompleted ? 'is-checked' : ''}`} slot="start" aria-hidden="true">
                                {subtask.isCompleted && (
                                    <IonIcon icon={checkmarkDoneOutline} />
                                )}
                            </div>
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
                                <IonLabel className="subtask-text" onClick={(e) => handleLabelClick(e, subtask)}>
                                    {subtask.title}
                                </IonLabel>
                            )}
                            <IonButton
                                slot="end"
                                fill="clear"
                                color="medium"
                                className="subtask-delete-button"
                                onClick={(e) => handleDeleteClick(e, subtask.id)}
                                aria-label={`Delete "${subtask.title}"`}
                            >
                                <IonIcon icon={trashOutline} />
                            </IonButton>
                        </IonItem>
                    ))}
                </IonList>
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
    onKeyPress?: (event: KeyboardEvent) => void;
    isEnabled: boolean;
}

export const AddSubtaskRow = memo(function AddSubtaskRow({
    value,
    onValueChange,
    onSubmit,
    onKeyPress,
    isEnabled,
}: AddSubtaskRowProps) {
    return (
        <div className="subtask-add-row">
            <IonInput
                className="subtask-add-input"
                value={value}
                onIonInput={(event) => onValueChange(event.detail.value ?? '')}
                onKeyPress={onKeyPress}
                placeholder={isEnabled ? 'Add subtask' : 'Add your first subtask'}
            />
            <IonButton
                className="subtask-add-button"
                fill="solid"
                color="primary"
                onClick={onSubmit}
                disabled={!value.trim()}
            >
                <IonIcon icon={addOutline} slot="start" />
                Add
            </IonButton>
        </div>
    );
});
