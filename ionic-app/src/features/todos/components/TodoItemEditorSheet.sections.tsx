import { memo, useCallback } from 'react';
import {
    IonButton,
    IonCol,
    IonGrid,
    IonIcon,
    IonInput,
    IonNote,
    IonRow,
    IonTextarea,
} from '@ionic/react';
import {
    addOutline,
    checkmarkDoneOutline,
    ellipse,
} from 'ionicons/icons';
import type { Todo } from '../types';

interface EditorDetailsProps {
    title: string;
    description: string;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
}

export const EditorDetailsSection = memo(function EditorDetailsSection({
    title,
    description,
    onTitleChange,
    onDescriptionChange,
}: EditorDetailsProps) {
    return (
        <div className="edit-fields">
            <div className="edit-field">
                <label className="edit-label">Title</label>
                <IonInput
                    className="edit-title-input"
                    value={title}
                    onIonInput={(event) => onTitleChange(event.detail.value ?? '')}
                    placeholder="Task title"
                />
            </div>
            <div className="edit-field">
                <label className="edit-label">Description</label>
                <IonTextarea
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

interface Subtask {
    id: string;
    title: string;
    isCompleted: boolean;
}

interface SubtasksSectionProps {
    subtasks: Subtask[] | undefined;
    onToggleSubtask: (subtaskId: string) => void;
}

export const SubtasksSection = memo(function SubtasksSection({
    subtasks,
    onToggleSubtask,
}: SubtasksSectionProps) {
    const hasSubtasks = subtasks && subtasks.length > 0;
    const completed = subtasks
        ? subtasks.filter((st) => st.isCompleted).length
        : 0;
    const total = subtasks?.length ?? 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <div className="edit-section" id="todo-editor-section-subtasks">
            <div className="edit-section-header">
                <div className="edit-section-title">
                    {total > 0 && <IonIcon icon={checkmarkDoneOutline} />}
                </div>
                {total > 0 && (
                    <div className="edit-section-meta">
                        <span className="edit-progress-pill">{completed}/{total}</span>
                        <div className="edit-progress-track">
                            <div className="edit-progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                )}
            </div>
            {hasSubtasks && (
                <div className="subtask-editor-list">
                    {subtasks!.map((subtask) => (
                        <div
                            key={subtask.id}
                            className={`subtask-row ${subtask.isCompleted ? 'is-completed' : ''}`}
                            onClick={() => onToggleSubtask(subtask.id)}
                        >
                            <div className={`subtask-check ${subtask.isCompleted ? 'is-checked' : ''}`}>
                                {subtask.isCompleted && (
                                    <IonIcon icon={checkmarkDoneOutline} />
                                )}
                            </div>
                            <span className="subtask-text">{subtask.title}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
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
    return (
        <div className="subtask-add-row">
            <IonInput
                className="subtask-add-input"
                value={value}
                onIonInput={(event) => onValueChange(event.detail.value ?? '')}
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
