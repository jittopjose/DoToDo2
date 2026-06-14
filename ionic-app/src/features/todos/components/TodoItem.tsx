import React, { useState, useMemo } from 'react';
import {
    IonButton,
    IonCheckbox,
    IonChip,
    IonCol,
    IonDatetime,
    IonGrid,
    IonIcon,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonNote,
    IonPopover,
    IonRow,
    IonTitle,
} from '@ionic/react';
import {
    addOutline,
    calendarOutline,
    cartOutline,
    checkmarkDoneOutline,
    documentTextOutline,
    ellipse,
    flagOutline,
    alertCircleOutline,
    trashOutline,
} from 'ionicons/icons';
import { Todo, TodoPriority } from '../types';
import { useTodoStore } from '../store/todoStore';
import { formatDueDate } from '../utils/formatDueDate';
import './TodoItem.css';
import { TodoItemEditorSheet, EditorSection } from './TodoItemEditorSheet';
import { priorityLevels, priorityLabels } from './TodoItem.constants';
import { typeIcons } from './TodoItem.constants';
import { getDueDateInputValue, getSubtaskProgress, isOverdue, truncateText } from './TodoItem.utils';

interface Props {
    todo: Todo;
}

export const TodoItem: React.FC<Props> = ({ todo }) => {
    const toggleTodo = useTodoStore((state) => state.toggleTodo);
    const toggleSubtask = useTodoStore((state) => state.toggleSubtask);
    const addSubtask = useTodoStore((state) => state.addSubtask);
    const deleteTodo = useTodoStore((state) => state.deleteTodo);
    const updateTodo = useTodoStore((state) => state.updateTodo);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorSection, setEditorSection] = useState<EditorSection>('details');
    const [quickMode, setQuickMode] = useState(false);
    const [isDueCalendarOpen, setIsDueCalendarOpen] = useState(false);
    const [isPriorityPopoverOpen, setIsPriorityPopoverOpen] = useState(false);

    const openEditor = (section: EditorSection = 'details', quickModeParam?: boolean) => {
        setEditorSection(section);
        setQuickMode(Boolean(quickModeParam));
        setIsEditorOpen(true);
    };

    const closeEditor = () => {
        setIsEditorOpen(false);
        setQuickMode(false);
    };

    const handleDirectDueDateChange = (event: CustomEvent) => {
        const value = event.detail.value as string | undefined;
        if (value) {
            const [year, month, day] = value.split('-').map(Number);
            const dueDate = new Date(year, month - 1, day).setHours(0, 0, 0, 0);
            updateTodo(todo.id, { dueDate });
        }
        setIsDueCalendarOpen(false);
    };

    const handleDirectDueDateClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDueCalendarOpen(true);
    };

    const handlePriorityClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setIsPriorityPopoverOpen(true);
    };

    const handlePriorityChange = (priority: TodoPriority | undefined) => {
        updateTodo(todo.id, { priority });
        setIsPriorityPopoverOpen(false);
    };

    const handleDelete = () => {
        deleteTodo(todo.id);
        closeEditor();
    };

    const subtaskProgress = getSubtaskProgress(todo);
    const overdue = isOverdue(todo);

    const quickActions = useMemo(() => {
        const actions: Array<{ label: string; icon: string; section: EditorSection }> = [];

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
                                    {todo.dueDate ? (
                                        <IonChip
                                            className={`task-chip task-chip--due ${overdue ? 'is-danger' : ''}`}
                                            onClick={handleDirectDueDateClick}
                                        >
                                            <IonIcon icon={overdue ? alertCircleOutline : calendarOutline} />
                                            <span>{formatDueDate(todo.dueDate)}</span>
                                        </IonChip>
                                    ) : (
                                        <IonChip
                                            className="task-chip task-chip--quick-add"
                                            onClick={handleDirectDueDateClick}
                                        >
                                            <IonIcon icon={calendarOutline} />
                                            <span>Add due</span>
                                        </IonChip>
                                    )}

                                    {todo.priority && (
                                        <IonChip
                                            className={`task-chip task-chip--priority task-chip--priority-${todo.priority}`}
                                            onClick={handlePriorityClick}
                                        >
                                            <IonIcon icon={ellipse} />
                                            <span>{priorityLabels[todo.priority]}</span>
                                        </IonChip>
                                    )}
                                    {!todo.priority && (
                                        <IonChip
                                            className="task-chip task-chip--quick-add"
                                            onClick={handlePriorityClick}
                                        >
                                            <IonIcon icon={flagOutline} />
                                            <span>Priority</span>
                                        </IonChip>
                                    )}

                                    {subtaskProgress.total > 0 && (
                                        <IonChip
                                            className="task-chip task-chip--subtasks"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditor('subtasks', true);
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
                                                openEditor('shopping', true);
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

                                    {quickActions.length > 0 && quickActions.map((action) => (
                                        <IonChip
                                            key={`${action.section}-${action.label}`}
                                            className="task-chip task-chip--quick"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openEditor(action.section, true);
                                            }}
                                        >
                                            <IonIcon icon={action.icon} />
                                            <span>{action.label}</span>
                                        </IonChip>
                                    ))}
                                </div>

{subtaskProgress.total > 0 && (
                                    <div className="task-progress-track" aria-label={`${subtaskProgress.percent}% complete`}>
                                        <div className="task-progress-fill" style={{ width: `${subtaskProgress.percent}%` }} />
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
                    <IonItemOption color="warning" onClick={handleDirectDueDateClick} aria-label={`Set due date for ${todo.title}`}>
                        <IonIcon icon={calendarOutline} />
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
                quickMode={quickMode}
                onDismiss={closeEditor}
                onDelete={handleDelete}
                onToggleSubtask={toggleSubtask}
                onAddSubtask={addSubtask}
                onUpdate={updateTodo}
                onSwitchToFull={() => openEditor(editorSection)}
            />
            <IonPopover
                isOpen={isDueCalendarOpen}
                onDidDismiss={() => setIsDueCalendarOpen(false)}
            >
                <IonDatetime
                    className="due-calendar-datetime"
                    presentation="date"
                    value={getDueDateInputValue(todo.dueDate)}
                    onIonChange={handleDirectDueDateChange}
                />
            </IonPopover>
            <IonPopover
                isOpen={isPriorityPopoverOpen}
                onDidDismiss={() => setIsPriorityPopoverOpen(false)}
                className="priority-popover"
            >
                <div className="priority-popover-content">
                    {priorityLevels.map((priority) => (
                        <IonChip
                            key={priority}
                            className={`task-chip task-chip--priority${priority ? '-' + priority : ''} ${todo.priority === priority ? 'selected' : ''}`}
                            onClick={() => handlePriorityChange(priority)}
                        >
                            <span>{priority ? priorityLabels[priority] : 'None'}</span>
                        </IonChip>
                    ))}
                </div>
            </IonPopover>
        </>
    );
};