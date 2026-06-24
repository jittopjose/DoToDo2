import { memo, useCallback, type KeyboardEvent } from 'react';
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
} from 'ionicons/icons';

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
                            className={`subtask-row ${subtask.isCompleted ? 'is-completed' : ''}`}
                            onClick={() => onToggleSubtask(subtask.id)}
                            aria-label={`Mark "${subtask.title}" as ${subtask.isCompleted ? 'incomplete' : 'complete'}`}
                            aria-pressed={subtask.isCompleted}
                        >
                            <div className={`subtask-check ${subtask.isCompleted ? 'is-checked' : ''}`} slot="start" aria-hidden="true">
                                {subtask.isCompleted && (
                                    <IonIcon icon={checkmarkDoneOutline} />
                                )}
                            </div>
                            <IonLabel className="subtask-text">{subtask.title}</IonLabel>
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
