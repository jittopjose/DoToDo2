import React, { useEffect, useMemo, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonCheckbox,
    IonChip,
    IonCol,
    IonContent,
    IonGrid,
    IonIcon,
    IonInput,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonModal,
    IonNote,
    IonRow,
    IonTextarea,
    IonTitle
} from '@ionic/react';
import {
    addOutline,
    calendarOutline,
    cartOutline,
    checkmarkDoneOutline,
    closeOutline,
    documentTextOutline,
    ellipse,
    flagOutline,
    listOutline,
    trashOutline,
    alertCircleOutline
} from 'ionicons/icons';
import { Todo, TodoPriority } from '../types';
import { useTodoStore } from '../store/todoStore';
import { formatDueDate } from '../utils/formatDueDate';
import './TodoItem.css';

interface Props {
    todo: Todo;
}

type EditorSection = 'details' | 'due' | 'priority' | 'subtasks' | 'shopping';

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

const priorityLevels: Array<TodoPriority | undefined> = [undefined, 'low', 'medium', 'high'];

const priorityLabels: Record<TodoPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
};

const parseOptionalNumber = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const getDueDateInputValue = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
};

const getDueTimestampFromDays = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(9, 0, 0, 0);
    return date.getTime();
};

const getDueTimestampFromInput = (value: string, existingTimestamp?: number) => {
    const [year, month, day] = value.split('-').map(Number);
    if (![year, month, day].every(Number.isFinite)) return undefined;

    const reference = existingTimestamp ? new Date(existingTimestamp) : new Date();
    if (!existingTimestamp) {
        reference.setHours(9, 0, 0, 0);
    }

    const dueDate = new Date(year, month - 1, day);
    dueDate.setHours(reference.getHours(), reference.getMinutes(), 0, 0);
    return dueDate.getTime();
};

const isDueQuickSelected = (todo: Todo, daysFromNow: number) => {
    if (!todo.dueDate) return false;
    const dueDay = startOfDay(new Date(todo.dueDate));
    const targetDay = startOfDay(new Date());
    targetDay.setDate(targetDay.getDate() + daysFromNow);
    return dueDay.getTime() === targetDay.getTime();
};

const truncateText = (value: string, maxLength = 110) => {
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};

const getSubtaskProgress = (todo: Todo) => {
    const total = todo.subtasks?.length ?? 0;
    const completed = todo.subtasks?.filter((subtask) => subtask.isCompleted).length ?? 0;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
};

const isOverdue = (todo: Todo): boolean => {
    return todo.dueDate !== undefined && todo.dueDate < Date.now() && !todo.isCompleted;
};

export const TodoItem: React.FC<Props> = ({ todo }) => {
    const toggleTodo = useTodoStore((state) => state.toggleTodo);
    const toggleSubtask = useTodoStore((state) => state.toggleSubtask);
    const addSubtask = useTodoStore((state) => state.addSubtask);
    const deleteTodo = useTodoStore((state) => state.deleteTodo);
    const updateTodo = useTodoStore((state) => state.updateTodo);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorSection, setEditorSection] = useState<EditorSection>('details');

    const openEditor = (section: EditorSection = 'details') => {
        setEditorSection(section);
        setIsEditorOpen(true);
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
    };

    const handleDelete = () => {
        deleteTodo(todo.id);
        closeEditor();
    };

    const subtaskProgress = getSubtaskProgress(todo);
    const overdue = isOverdue(todo);

    const quickActions = useMemo(() => {
        const actions: Array<{ label: string; icon: string; section: EditorSection }> = [];

        if (!todo.dueDate) {
            actions.push({ label: 'Add due', icon: calendarOutline, section: 'due' });
        }

        if (!todo.priority) {
            actions.push({ label: 'Priority', icon: flagOutline, section: 'priority' });
        }

        if (!todo.description) {
            actions.push({ label: 'Add note', icon: documentTextOutline, section: 'details' });
        }

        if (!todo.subtasks || todo.subtasks.length === 0) {
            actions.push({
                label: todo.itemType === 'shopping' ? '+ item' : '+ subtask',
                icon: addOutline,
                section: 'subtasks',
            });
        }

        if (todo.itemType === 'shopping' && todo.quantity === undefined) {
            actions.push({ label: 'Qty', icon: cartOutline, section: 'shopping' });
        }

        if (todo.itemType === 'shopping' && todo.price === undefined) {
            actions.push({ label: 'Price', icon: cartOutline, section: 'shopping' });
        }

        return actions.slice(0, 4);
    }, [todo]);

    return (
        <>
            <IonItemSliding className={`todo-item ${overdue ? 'is-overdue' : ''}`}>
                <IonItem
                    className={`task-row ${todo.isCompleted ? 'is-completed' : ''}`}
                    lines="none"
                    button
                    detail={false}
                    onClick={() => openEditor()}
                    aria-label={`Open details for ${todo.title}`}
                >
                <IonGrid className="task-row-grid">
                    <IonRow className="task-row-main">
                        <IonCol size="auto" className="task-checkbox-col">
                            <IonCheckbox
                                className="task-checkbox"
                                checked={todo.isCompleted}
                                onIonChange={() => toggleTodo(todo.id)}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
                            />
                        </IonCol>
                        <IonCol className="task-content-stack">
                            <IonGrid className="task-main-grid">
                                <IonRow className="task-title-row">
                                    <IonCol size="auto">
                                        <IonIcon className={`task-type-icon task-type-icon--${todo.itemType}`} icon={typeIcons[todo.itemType]} />
                                    </IonCol>
                                    <IonCol className="task-title-col">
                                        <IonTitle className="task-title-text">{todo.title}</IonTitle>
                                        {todo.description && (
                                            <IonNote className="task-description">{truncateText(todo.description)}</IonNote>
                                        )}
                                    </IonCol>
                                </IonRow>
                            </IonGrid>

                            <div className="task-metadata-row">
                                {todo.dueDate && (
                                    <IonChip
                                        className={`task-chip task-chip--due ${overdue ? 'is-danger' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditor('due');
                                        }}
                                    >
                                        <IonIcon icon={overdue ? alertCircleOutline : calendarOutline} />
                                        <span>{formatDueDate(todo.dueDate)}</span>
                                    </IonChip>
                                )}

                                {todo.priority && (
                                    <IonChip
                                        className={`task-chip task-chip--priority task-chip--priority-${todo.priority}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditor('priority');
                                        }}
                                    >
                                        <IonIcon icon={ellipse} />
                                        <span>{priorityLabels[todo.priority]}</span>
                                    </IonChip>
                                )}

                                {subtaskProgress.total > 0 && (
                                    <IonChip
                                        className="task-chip task-chip--subtasks"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditor('subtasks');
                                        }}
                                    >
                                        <IonIcon icon={checkmarkDoneOutline} />
                                        <span>{subtaskProgress.completed}/{subtaskProgress.total}</span>
                                    </IonChip>
                                )}

                                {todo.itemType === 'shopping' && (todo.quantity !== undefined || todo.price !== undefined) && (
                                    <IonChip
                                        className="task-chip task-chip--shopping"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditor('shopping');
                                        }}
                                    >
                                        <IonIcon icon={cartOutline} />
                                        <span>
                                            {todo.quantity !== undefined && <>Qty {todo.quantity}</>}
                                            {todo.quantity !== undefined && todo.price !== undefined && <> · </>}
                                            {todo.price !== undefined && <>${todo.price.toFixed(2)}</>}
                                        </span>
                                    </IonChip>
                                )}
                            </div>

                            {subtaskProgress.total > 0 && (
                                <div className="task-progress-track" aria-label={`${subtaskProgress.percent}% complete`}>
                                    <div className="task-progress-fill" style={{ width: `${subtaskProgress.percent}%` }} />
                                </div>
                            )}

                            {quickActions.length > 0 && (
                                <div className="task-quick-chips">
                                    {quickActions.map((action) => (
                                        <IonChip
                                            key={`${action.section}-${action.label}`}
                                            className="task-chip task-chip--quick"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditor(action.section);
                                            }}
                                        >
                                            <IonIcon icon={action.icon} />
                                            <span>{action.label}</span>
                                        </IonChip>
                                    ))}
                                </div>
                            )}
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonItem>

            <IonItemOptions side="start" className="task-options task-options--complete">
                <IonItemOption color="success" onClick={() => toggleTodo(todo.id)} aria-label={`Complete ${todo.title}`}>
                    <IonIcon icon={checkmarkDoneOutline} />
                </IonItemOption>
            </IonItemOptions>

            <IonItemOptions side="end" className="task-options">
                <IonItemOption color="primary" onClick={() => openEditor('details')} aria-label={`Edit ${todo.title}`}>
                    <IonIcon icon={documentTextOutline} />
                </IonItemOption>
                <IonItemOption color="warning" onClick={() => openEditor('due')} aria-label={`Set due date for ${todo.title}`}>
                    <IonIcon icon={calendarOutline} />
                </IonItemOption>
                <IonItemOption color="secondary" onClick={() => openEditor('priority')} aria-label={`Set priority for ${todo.title}`}>
                    <IonIcon icon={flagOutline} />
                </IonItemOption>
                <IonItemOption color="danger" onClick={handleDelete} aria-label={`Delete ${todo.title}`}>
                    <IonIcon icon={trashOutline} />
                </IonItemOption>
            </IonItemOptions>
        </IonItemSliding>
            <TodoItemEditorSheet
                todo={todo}
                isOpen={isEditorOpen}
                initialSection={editorSection}
                onDismiss={closeEditor}
                onDelete={handleDelete}
                onToggleSubtask={toggleSubtask}
                onAddSubtask={addSubtask}
                onUpdate={updateTodo}
            />
        </>
    );
};

interface EditorSheetProps {
    todo: Todo;
    isOpen: boolean;
    initialSection: EditorSection;
    onDismiss: () => void;
    onDelete: () => void;
    onToggleSubtask: (todoId: string, subtaskId: string) => void;
    onAddSubtask: (todoId: string, title: string) => void;
    onUpdate: (id: string, updates: Partial<Pick<Todo, 'title' | 'description' | 'dueDate' | 'priority' | 'quantity' | 'price'>>) => void;
}

const TodoItemEditorSheet: React.FC<EditorSheetProps> = ({
    todo,
    isOpen,
    initialSection,
    onDismiss,
    onDelete,
    onToggleSubtask,
    onAddSubtask,
    onUpdate,
}) => {
    const [title, setTitle] = useState(todo.title);
    const [description, setDescription] = useState(todo.description || '');
    const [priority, setPriority] = useState<TodoPriority | undefined>(todo.priority);
    const [quantity, setQuantity] = useState(todo.quantity?.toString() ?? '');
    const [price, setPrice] = useState(todo.price?.toString() ?? '');
    const [newSubtaskText, setNewSubtaskText] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        setTitle(todo.title);
        setDescription(todo.description || '');
        setPriority(todo.priority);
        setQuantity(todo.quantity?.toString() ?? '');
        setPrice(todo.price?.toString() ?? '');
    }, [isOpen, todo.id, todo.title, todo.description, todo.dueDate, todo.priority, todo.quantity, todo.price]);

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

    const handleSave = () => {
        onUpdate(todo.id, {
            title: title.trim() || todo.title,
            description: description.trim() || undefined,
            priority,
            quantity: parseOptionalNumber(quantity),
            price: parseOptionalNumber(price),
        });
        onDismiss();
    };

    const handleDueDateInputChange = (event: CustomEvent) => {
        const value = event.detail.value as string | undefined;
        onUpdate(todo.id, { dueDate: value ? getDueTimestampFromInput(value, todo.dueDate) : undefined });
    };

    const handleDueQuickSelect = (daysFromNow: number) => {
        onUpdate(todo.id, { dueDate: getDueTimestampFromDays(daysFromNow) });
    };

    const handleClearDueDate = () => {
        onUpdate(todo.id, { dueDate: undefined });
    };

    const handlePrioritySelect = (nextPriority: TodoPriority | undefined) => {
        setPriority(nextPriority);
        onUpdate(todo.id, { priority: nextPriority });
    };

    const handleAddSubtask = () => {
        const trimmed = newSubtaskText.trim();
        if (!trimmed) return;
        onAddSubtask(todo.id, trimmed);
        setNewSubtaskText('');
    };

    const handleSubtaskKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleAddSubtask();
        }
    };

    const dueInputValue = getDueDateInputValue(todo.dueDate);
    const subtaskProgress = getSubtaskProgress(todo);

    return (
        <IonModal className="todo-editor-modal" isOpen={isOpen} onDidDismiss={onDismiss} initialBreakpoint={0.58} breakpoints={[0.45, 0.72, 1]} handle>
            <IonContent className="editor-content">
                <IonGrid className="editor-grid">
                    <IonRow className="editor-header-row">
                        <IonCol>
                            <IonTitle className="editor-title">Task details</IonTitle>
                            <IonNote className="editor-subtitle">{typeLabels[todo.itemType]}</IonNote>
                        </IonCol>
                        <IonCol size="auto">
                            <IonButtons>
                                <IonButton className="editor-close-button" fill="clear" onClick={onDismiss} aria-label="Close task details">
                                    <IonIcon icon={closeOutline} />
                                </IonButton>
                            </IonButtons>
                        </IonCol>
                    </IonRow>

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

                    <IonGrid className="editor-section" id="todo-editor-section-due">
                        <IonRow className="editor-section-heading">
                            <IonCol>
                                <IonIcon icon={calendarOutline} />
                                <IonTitle>Due date</IonTitle>
                            </IonCol>
                            {todo.dueDate && (
                                <IonCol size="auto">
                                    <IonButton className="editor-text-button" fill="clear" size="small" onClick={handleClearDueDate}>
                                        Clear
                                    </IonButton>
                                </IonCol>
                            )}
                        </IonRow>

                        <IonGrid className="due-quick-options">
                            <IonRow>
                                <IonCol size="4">
                                    <IonButton
                                        className={`due-quick-option ${isDueQuickSelected(todo, 0) ? 'is-selected' : ''}`}
                                        fill={isDueQuickSelected(todo, 0) ? 'solid' : 'outline'}
                                        onClick={() => handleDueQuickSelect(0)}
                                    >
                                        Today
                                    </IonButton>
                                </IonCol>
                                <IonCol size="4">
                                    <IonButton
                                        className={`due-quick-option ${isDueQuickSelected(todo, 1) ? 'is-selected' : ''}`}
                                        fill={isDueQuickSelected(todo, 1) ? 'solid' : 'outline'}
                                        onClick={() => handleDueQuickSelect(1)}
                                    >
                                        Tomorrow
                                    </IonButton>
                                </IonCol>
                                <IonCol size="4">
                                    <IonButton
                                        className={`due-quick-option ${isDueQuickSelected(todo, 7) ? 'is-selected' : ''}`}
                                        fill={isDueQuickSelected(todo, 7) ? 'solid' : 'outline'}
                                        onClick={() => handleDueQuickSelect(7)}
                                    >
                                        Next week
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>

                        <IonItem className="editor-field due-input-field" lines="none">
                            <IonCol>
                                <IonNote className="field-label">Custom date</IonNote>
                                <IonInput
                                    className="due-custom-input"
                                    type="date"
                                    value={dueInputValue}
                                    onIonInput={handleDueDateInputChange}
                                />
                            </IonCol>
                        </IonItem>

                        {todo.dueDate && (
                            <IonNote className="selected-due-note">
                                Selected: {formatDueDate(todo.dueDate)}
                            </IonNote>
                        )}
                    </IonGrid>

                    <IonGrid className="editor-section" id="todo-editor-section-priority">
                        <IonRow className="editor-section-heading">
                            <IonCol>
                                <IonIcon icon={flagOutline} />
                                <IonTitle>Priority</IonTitle>
                            </IonCol>
                        </IonRow>
                        <IonGrid className="priority-options">
                            <IonRow>
                                {priorityLevels.map((level) => (
                                    <IonCol key={level ?? 'none'} size="6">
                                        <IonButton
                                            className={`priority-option ${priority === level ? 'is-selected' : ''}`}
                                            fill={priority === level ? 'solid' : 'outline'}
                                            onClick={() => handlePrioritySelect(level)}
                                        >
                                            {level ? priorityLabels[level] : 'None'}
                                        </IonButton>
                                    </IonCol>
                                ))}
                            </IonRow>
                        </IonGrid>
                    </IonGrid>

                    <IonGrid className="editor-section" id="todo-editor-section-subtasks">
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

                    {todo.itemType === 'shopping' && (
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
                                            onIonInput={(event) => setQuantity(event.detail.value ?? '')}
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
                                            placeholder="4.99"
                                        />
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonGrid>
                    )}

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
                </IonGrid>
            </IonContent>
        </IonModal>
    );
};
