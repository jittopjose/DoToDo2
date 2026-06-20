import { memo, type KeyboardEvent } from 'react';
import {
    IonButton,
    IonIcon,
    IonInput,
    IonTextarea,
} from '@ionic/react';
import {
    addOutline,
    checkmarkDoneOutline,
    listOutline,
} from 'ionicons/icons';

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

interface SubtaskProgress {
    completed: number;
    total: number;
    percent: number;
}

interface SubtasksSectionProps {
    subtasks: Subtask[] | undefined;
    onToggleSubtask: (subtaskId: string) => void;
    progress: SubtaskProgress;
}

export const SubtasksSection = memo(function SubtasksSection({
    subtasks,
    onToggleSubtask,
    progress,
}: SubtasksSectionProps) {
    const subtaskList = subtasks ?? [];
    const hasSubtasks = subtaskList.length > 0;
    const progressLabel = progress.total > 0 ? `${progress.completed}/${progress.total}` : '0/0';

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
                    <span className="edit-progress-pill">{progressLabel}</span>
                    {progress.total > 0 && (
                        <div
                            className="edit-progress-track"
                            role="progressbar"
                            aria-valuenow={progress.percent}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${progress.percent}% complete`}
                        >
                            <div className="edit-progress-fill" style={{ width: `${progress.percent}%` }} />
                        </div>
                    )}
                </div>
            </div>

            {hasSubtasks ? (
                <div className="subtask-editor-list" role="list" aria-label="Subtasks">
                    {subtaskList.map((subtask) => (
                        <div key={subtask.id} className="subtask-list-item" role="listitem">
                            <button
                                type="button"
                                className={`subtask-row ${subtask.isCompleted ? 'is-completed' : ''}`}
                                onClick={() => onToggleSubtask(subtask.id)}
                                aria-label={`Mark "${subtask.title}" as ${subtask.isCompleted ? 'incomplete' : 'complete'}`}
                                aria-pressed={subtask.isCompleted}
                            >
                                <div className={`subtask-check ${subtask.isCompleted ? 'is-checked' : ''}`} aria-hidden="true">
                                    {subtask.isCompleted && (
                                        <IonIcon icon={checkmarkDoneOutline} />
                                    )}
                                </div>
                                <span className="subtask-text">{subtask.title}</span>
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
