import { memo, useCallback } from 'react';
import {
    IonButton,
    IonButtons,
    IonCol,
    IonGrid,
    IonIcon,
    IonInput,
    IonItem,
    IonNote,
    IonRow,
    IonTextarea,
    IonTitle,
} from '@ionic/react';
import {
    addOutline,
    cartOutline,
    checkmarkDoneOutline,
    ellipse,
} from 'ionicons/icons';
import type { Todo } from '../types';
import type { EditorSection } from './TodoItem.constants';

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
        <IonGrid className="editor-section" id="todo-editor-section-details">
            <IonItem className="editor-field" lines="none">
                <IonCol>
                    <IonNote className="field-label">Title</IonNote>
                    <IonInput
                        className="editor-title-input"
                        value={title}
                        onIonInput={(event) => onTitleChange(event.detail.value ?? '')}
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
                        onIonInput={(event) => onDescriptionChange(event.detail.value ?? '')}
                        placeholder="Add notes, context, or instructions"
                        rows={4}
                    />
                </IonCol>
            </IonItem>
        </IonGrid>
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
    const progress = subtasks
        ? {
              total: subtasks.length,
              completed: subtasks.filter((st) => st.isCompleted).length,
          }
        : { total: 0, completed: 0 };

    return (
        <IonGrid className="editor-section" id="todo-editor-section-subtasks">
            <IonRow className="editor-section-heading">
                <IonCol>
                    <IonIcon icon={checkmarkDoneOutline} />
                    <IonTitle>Subtasks</IonTitle>
                </IonCol>
                {progress.total > 0 && (
                    <IonCol size="auto">
                        <IonNote className="subtask-progress-label">
                            {progress.completed}/{progress.total}
                        </IonNote>
                    </IonCol>
                )}
            </IonRow>
            {hasSubtasks && (
                <IonGrid className="subtask-editor-list">
                    {subtasks!.map((subtask) => (
                        <IonItem
                            key={subtask.id}
                            className={`subtask-editor-row ${subtask.isCompleted ? 'is-completed' : ''}`}
                            lines="none"
                            button
                            detail={false}
                            onClick={() => onToggleSubtask(subtask.id)}
                        >
                            <IonIcon
                                className="subtask-editor-icon"
                                icon={subtask.isCompleted ? checkmarkDoneOutline : ellipse}
                            />
                            <IonNote className="subtask-editor-title">{subtask.title}</IonNote>
                        </IonItem>
                    ))}
                </IonGrid>
            )}
        </IonGrid>
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
        <IonItem className="subtask-editor-add" lines="none">
            <IonInput
                className="subtask-editor-input"
                value={value}
                onIonInput={(event) => onValueChange(event.detail.value ?? '')}
                placeholder={isEnabled ? 'Add another subtask' : 'Add your first subtask'}
            />
            <IonButton
                className="subtask-editor-add-button"
                fill="clear"
                onClick={onSubmit}
                disabled={!value.trim()}
            >
                <IonIcon icon={addOutline} />
            </IonButton>
        </IonItem>
    );
});

interface ShoppingSectionProps {
    quantity: string;
    price: string;
    onQuantityChange: (value: string) => void;
    onPriceChange: (value: string) => void;
    onBlur: () => void;
}

export const ShoppingSection = memo(function ShoppingSection({
    quantity,
    price,
    onQuantityChange,
    onPriceChange,
    onBlur,
}: ShoppingSectionProps) {
    return (
        <IonGrid className="editor-section" id="todo-editor-section-shopping">
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
                            onIonInput={(event) => onQuantityChange(event.detail.value ?? '')}
                            onBlur={onBlur}
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
                            onIonInput={(event) => onPriceChange(event.detail.value ?? '')}
                            onBlur={onBlur}
                            placeholder="4.99"
                        />
                    </IonCol>
                </IonRow>
            </IonGrid>
        </IonGrid>
    );
});
