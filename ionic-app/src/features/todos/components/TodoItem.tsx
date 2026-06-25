import React, { useState, useMemo, useCallback, memo } from 'react';
import {
    IonCheckbox,
    IonChip,
    IonCol,
    IonDatetime,
    IonGrid,
    IonIcon,
    IonItem,
    IonNote,
    IonPopover,
    IonProgressBar,
    IonRow,
} from '@ionic/react';
import {
    addOutline,
    alertCircleOutline,
    calendarOutline,
    checkmarkDoneOutline,
    ellipse,
    flagOutline,
    repeatOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { Todo, TodoPriority } from '../types';
import { useTodoStore } from '../store/todoStore';
import { formatDueDate } from '../utils/formatDueDate';
import { formatRecurrenceSummary } from '../utils/recurrence';
import './TodoItem.css';
import { priorityLabels } from './TodoItem.constants';
import { typeIcons } from './TodoItem.constants';
import { getDueDateInputValue, getSubtaskProgress, isOverdue, truncateText } from './TodoItem.utils';

interface Props {
    todo: Todo;
}

const priorityLevelValues: Array<TodoPriority | undefined> = ['low', 'medium', 'high', undefined];

export const TodoItem: React.FC<Props> = memo(({ todo }) => {
    const history = useHistory();
    const toggleTodo = useTodoStore((state) => state.toggleTodo);
    const updateTodo = useTodoStore((state) => state.updateTodo);
    const [isDueCalendarOpen, setIsDueCalendarOpen] = useState(false);

    const handleDueCalendarDismiss = useCallback(() => {
        setIsDueCalendarOpen(false);
    }, []);

    const openEditor = useCallback(() => {
        history.push(`/task/${encodeURIComponent(todo.id)}/edit`);
    }, [history, todo.id]);

    const handleDueDateChange = useCallback((event: CustomEvent) => {
        const raw = event.detail.value as string | undefined;
        if (!raw) {
            setIsDueCalendarOpen(false);
            return;
        }
        const datePart = raw.includes('T') ? raw.split('T')[0] : raw;
        const [year, month, day] = datePart.split('-').map(Number);
        if (![year, month, day].every(Number.isFinite)) {
            setIsDueCalendarOpen(false);
            return;
        }
        const dueDate = new Date(year, month - 1, day).setHours(0, 0, 0, 0);
        updateTodo(todo.id, { dueDate });
        setIsDueCalendarOpen(false);
    }, [todo.id, updateTodo]);

    const handleDirectDueDateClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDueCalendarOpen(true);
    }, []);

    const handleToggle = useCallback(() => {
        toggleTodo(todo.id);
    }, [todo.id, toggleTodo]);

    const handlePriorityCycle = useCallback(() => {
        const currentIndex = priorityLevelValues.indexOf(todo.priority as TodoPriority);
        const nextPriority = priorityLevelValues[(currentIndex + 1) % priorityLevelValues.length];
        updateTodo(todo.id, { priority: nextPriority });
    }, [todo.id, todo.priority, updateTodo]);

    const handlePriorityClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handlePriorityCycle();
    }, [handlePriorityCycle]);

    const handleSubtaskClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        openEditor();
    }, [openEditor]);

    const handleItemClick = useCallback(() => {
        openEditor();
    }, [openEditor]);

    const subtaskProgress = getSubtaskProgress(todo);
    const overdue = isOverdue(todo);

    const quickActions = useMemo(() => {
        const actions: Array<{ label: string; icon: string; onAction?: () => void }> = [];

        if (!todo.subtasks || todo.subtasks.length === 0) {
            actions.push({ label: '+ subtask', icon: addOutline, onAction: openEditor });
        }

        return actions.slice(0, 2);
    }, [openEditor, todo.subtasks]);

return (
        <>
            <IonItem
                className={`task-row ${todo.isCompleted ? 'is-completed' : ''} ${overdue ? 'is-overdue' : ''}`}
                lines="none"
                button
                detail={false}
                onClick={handleItemClick}
                aria-label={`Open details for ${todo.title}`}
            >
                    <IonGrid className="task-row-grid">
                        <IonRow className="task-row-main">
                            <IonCol size="auto" className="task-checkbox-col">
                                <IonCheckbox
                                    checked={todo.isCompleted}
                                    onIonChange={handleToggle}
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
                                />
                            </IonCol>
                            <IonCol className="task-content-stack">
                                <IonGrid className="task-main-grid">
                                    <IonRow className="task-title-row">
                                        <IonCol size="auto">
                                        <IonIcon
                                            slot="start"
                                            className={`task-type-icon task-type-icon--${todo.itemType}`}
                                            icon={typeIcons[todo.itemType]}
                                        />
                                        </IonCol>
                                    <IonCol className="task-title-col">
                                        <div className="task-title-text">{todo.title}</div>
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

                                    <IonChip
                                        className={todo.priority ? 
                                            `task-chip task-chip--priority-${todo.priority}` : 
                                            "task-chip task-chip--quick-add"
                                        }
                                        onClick={handlePriorityClick}
                                    >
                                        {todo.priority ? (
                                            <>
                                                <IonIcon icon={ellipse} style={{ marginRight: '4px', fontSize: '12px' }} />
                                                <span>{priorityLabels[todo.priority]}</span>
                                            </>
                                        ) : (
                                            <>
                                                <IonIcon icon={flagOutline} style={{ marginRight: '4px', fontSize: '12px' }} />
                                                <span>Priority</span>
                                            </>
                                        )}
                                    </IonChip>

                                    {subtaskProgress.total > 0 && (
                                        <IonChip
                                            className="task-chip task-chip--subtasks"
                                            onClick={handleSubtaskClick}
                                            aria-label={`${subtaskProgress.completed} of ${subtaskProgress.total} subtasks completed`}
                                        >
                                            <IonIcon icon={checkmarkDoneOutline} />
                                            <span>{subtaskProgress.completed}/{subtaskProgress.total}</span>
                                        </IonChip>
                                    )}

                                    {todo.recurrence && (
                                        <IonChip
                                            className="task-chip task-chip--repeat"
                                            onClick={handleSubtaskClick}
                                        >
                                            <IonIcon icon={repeatOutline} />
                                            <span>{formatRecurrenceSummary(todo.recurrence)}</span>
                                        </IonChip>
                                    )}

                                    {quickActions.length > 0 && quickActions.map((action) => (
                                        <IonChip
                                            key={action.label}
                                            className="task-chip task-chip--quick"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                action.onAction?.();
                                            }}
                                            aria-label={action.label === '+ subtask' ? 'Add subtask' : action.label}
                                        >
                                            <IonIcon icon={action.icon} />
                                            <span>{action.label}</span>
                                        </IonChip>
                                    ))}
                                </div>

                                {subtaskProgress.total > 0 && (
                                    <IonProgressBar className="task-progress-bar" value={subtaskProgress.percent / 100} aria-label={`${subtaskProgress.percent}% complete`} />
                                )}
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </IonItem>

            <IonPopover
                isOpen={isDueCalendarOpen}
                onDidDismiss={handleDueCalendarDismiss}
            >
                {isDueCalendarOpen && (
                    <IonDatetime
                        className="due-calendar-datetime"
                        presentation="date"
                        value={getDueDateInputValue(todo.dueDate)}
                        onIonChange={handleDueDateChange}
                    />
                )}
            </IonPopover>
        </>
    );
});