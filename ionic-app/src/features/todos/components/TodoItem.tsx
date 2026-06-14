import React, { useState, useMemo, useCallback, memo } from 'react';
import {
    IonChip,
    IonCol,
    IonDatetime,
    IonGrid,
    IonIcon,
    IonItem,
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
} from 'ionicons/icons';
import { Todo, TodoPriority } from '../types';
import { useTodoStore } from '../store/todoStore';
import { formatDueDate } from '../utils/formatDueDate';
import './TodoItem.css';
import { TodoItemEditorSheet, EditorSection } from './TodoItemEditorSheet';
import { priorityLabels } from './TodoItem.constants';
import { typeIcons } from './TodoItem.constants';
import { getDueDateInputValue, getSubtaskProgress, isOverdue, truncateText } from './TodoItem.utils';

interface Props {
    todo: Todo;
}

const priorityLevelValues: Array<TodoPriority | undefined> = ['low', 'medium', 'high', undefined];

export const TodoItem: React.FC<Props> = memo(({ todo }) => {
    const toggleTodo = useTodoStore((state) => state.toggleTodo);
    const toggleSubtask = useTodoStore((state) => state.toggleSubtask);
    const addSubtask = useTodoStore((state) => state.addSubtask);
    const deleteTodo = useTodoStore((state) => state.deleteTodo);
    const updateTodo = useTodoStore((state) => state.updateTodo);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorSection, setEditorSection] = useState<EditorSection>('details');
    const [quickMode, setQuickMode] = useState(false);
    const [isDueCalendarOpen, setIsDueCalendarOpen] = useState(false);

    const openEditor = useCallback((section: EditorSection = 'details', quickModeParam?: boolean) => {
        setEditorSection(section);
        setQuickMode(Boolean(quickModeParam));
        setIsEditorOpen(true);
    }, []);

    const closeEditor = useCallback(() => {
        setIsEditorOpen(false);
        setQuickMode(false);
    }, []);

    const handleDueCalendarDismiss = useCallback(() => {
        setIsDueCalendarOpen(false);
    }, []);

    const handleDirectDueDateChange = useCallback((event: CustomEvent) => {
        const value = event.detail.value as string | undefined;
        if (value) {
            const [year, month, day] = value.split('-').map(Number);
            const dueDate = new Date(year, month - 1, day).setHours(0, 0, 0, 0);
            updateTodo(todo.id, { dueDate });
        }
        setIsDueCalendarOpen(false);
    }, [todo.id, updateTodo]);

    const handleDirectDueDateClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDueCalendarOpen(true);
    }, []);

    const handleToggle = useCallback(() => {
        toggleTodo(todo.id);
    }, [todo.id, toggleTodo]);

    const handleSwitchToFull = useCallback(() => {
        openEditor(editorSection);
    }, [editorSection, openEditor]);

    const handleDelete = useCallback(() => {
        deleteTodo(todo.id);
        closeEditor();
    }, [todo.id, deleteTodo, closeEditor]);

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
        openEditor('subtasks', true);
    }, [openEditor]);

    const handleShoppingClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        openEditor('shopping', true);
    }, [openEditor]);

    const handleItemClick = useCallback(() => {
        openEditor();
    }, [openEditor]);

    const handleQuickActionClick = useCallback((action: { label: string; icon: string; section: EditorSection }) => (e: React.MouseEvent) => {
        e.stopPropagation();
        openEditor(action.section, true);
    }, [openEditor]);

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
                                <div
                                    className="custom-checkbox"
                                    role="checkbox"
                                    aria-checked={todo.isCompleted}
                                    aria-label={`Mark "${todo.title}" as ${todo.isCompleted ? 'incomplete' : 'complete'}`}
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggle();
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleToggle();
                                        }
                                    }}
                                >
                                    {todo.isCompleted && (
                                        <IonIcon
                                            className="custom-checkbox__tick"
                                            icon={checkmarkDoneOutline}
                                        />
                                    )}
                                </div>
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
                                        >
                                            <IonIcon icon={checkmarkDoneOutline} />
                                            <span>{subtaskProgress.completed}/{subtaskProgress.total}</span>
                                        </IonChip>
                                    )}

                                    {todo.itemType === 'shopping' && (todo.quantity !== undefined || todo.price !== undefined) && (
                                        <IonChip
                                            className="task-chip task-chip--shopping"
                                            onClick={handleShoppingClick}
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
                                            onClick={handleQuickActionClick(action)}
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
                onSwitchToFull={handleSwitchToFull}
            />
            <IonPopover
                isOpen={isDueCalendarOpen}
                onDidDismiss={handleDueCalendarDismiss}
            >
                {isDueCalendarOpen && (
                    <IonDatetime
                        className="due-calendar-datetime"
                        presentation="date"
                        value={getDueDateInputValue(todo.dueDate)}
                        onIonChange={handleDirectDueDateChange}
                    />
                )}
            </IonPopover>
        </>
    );
});