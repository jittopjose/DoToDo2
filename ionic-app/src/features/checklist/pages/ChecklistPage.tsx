import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    IonAlert,
    IonBackButton,
    IonButton,
    IonButtons,
    IonChip,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar,
    useIonToast,
} from '@ionic/react';
import {
    addOutline,
    checkmarkDoneOutline,
    checkmarkOutline,
    chevronDownOutline,
    closeOutline,
    listOutline,
    repeatOutline,
    trashOutline,
} from 'ionicons/icons';
import { useParams } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectChecklists, selectChecklistProgress } from '../../shared/store/doTodoStore';
import { DoTodo, DoTodoSubtask, Recurrence } from '../../shared/types';
import { formatRecurrenceSummary } from '../../shared/utils/recurrence';
import { RepeatSection } from '../../todo/components/RepeatSection';
import '../../todo/components/RepeatSection.css';
import '../../todo/components/TodoInput.css';
import '../../todo/components/TodoItem.css';
import './ChecklistPage.css';

interface ChecklistCardProps {
    listId: string;
    isExpanded: boolean;
    view: 'active' | 'completed';
    onToggle: () => void;
    draft: string;
    onDraftChange: (value: string) => void;
    onDelete: (entry: DoTodo) => void;
}

const ChecklistCard: React.FC<ChecklistCardProps> = ({
    listId,
    isExpanded,
    view,
    onToggle,
    draft,
    onDraftChange,
    onDelete,
}) => {
    const entry = useDoTodoStore((state) => state.entries[listId]);
    const progress = useDoTodoStore(useShallow(selectChecklistProgress(listId)));
    const addSubtask = useDoTodoStore((state) => state.addSubtask);
    const toggleSubtask = useDoTodoStore((state) => state.toggleSubtask);
    const updateSubtask = useDoTodoStore((state) => state.updateSubtask);
    const deleteSubtask = useDoTodoStore((state) => state.deleteSubtask);
    const toggleEntry = useDoTodoStore((state) => state.toggleEntry);
    const updateEntry = useDoTodoStore((state) => state.updateEntry);
    const [presentToast] = useIonToast();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const startEditing = useCallback((subtask: DoTodoSubtask) => {
        setEditingId(subtask.id);
        setEditValue(subtask.title);
    }, []);

    const commitEditing = useCallback((subtaskId: string) => {
        const trimmed = editValue.trim();
        if (trimmed) {
            updateSubtask(listId, subtaskId, trimmed);
        }
        setEditingId(null);
        setEditValue('');
    }, [editValue, listId, updateSubtask]);

    const cancelEditing = useCallback(() => {
        setEditingId(null);
        setEditValue('');
    }, []);

    const handleAddItem = useCallback(() => {
        const trimmed = draft.trim();
        if (!trimmed) return;
        addSubtask(listId, trimmed);
        onDraftChange('');
    }, [addSubtask, draft, listId, onDraftChange]);

    const handleComplete = useCallback(() => {
        const isRoutine = !!entry?.recurrence;
        toggleEntry(listId);
        presentToast({
            message: isRoutine ? `${entry?.title}: completed — next run scheduled` : `${entry?.title}: marked complete`,
            duration: 2000,
            color: 'success',
            position: 'bottom',
        });
    }, [entry, listId, presentToast, toggleEntry]);

    const handleRecurrenceChange = useCallback((recurrence?: Recurrence) => {
        if (!recurrence) {
            updateEntry(listId, { recurrence: undefined });
            return;
        }
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const dueDate = entry?.dueDate ?? endOfToday.getTime();
        updateEntry(listId, { recurrence, dueDate });
    }, [entry, listId, updateEntry]);

    if (!entry) return null;

    const items = entry.subtasks ?? [];

    return (
        <div className={`checklist-card ${isExpanded ? 'is-expanded' : ''}`}>
            <div
                className="checklist-card-header"
                onClick={onToggle}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggle();
                    }
                }}
                aria-expanded={isExpanded}
            >
                <IonIcon icon={checkmarkDoneOutline} className="checklist-card-icon" aria-hidden="true" />
                <div className="checklist-card-copy">
                    <span className="checklist-card-title">{entry.title}</span>
                    {entry.recurrence && (
                        <span className="checklist-card-schedule">
                            <IonIcon icon={repeatOutline} aria-hidden="true" />
                            {formatRecurrenceSummary(entry.recurrence)}
                        </span>
                    )}
                </div>
                {progress.total > 0 && (
                    <IonChip className="checklist-card-progress" aria-label={`${progress.completed} of ${progress.total} items completed`}>
                        <IonIcon icon={checkmarkDoneOutline} aria-hidden="true" />
                        <span>{progress.completed}/{progress.total}</span>
                    </IonChip>
                )}
                <div className="checklist-card-header-actions">
                    <IonButton
                        className="checklist-delete-btn"
                        fill="clear"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(entry);
                        }}
                        aria-label={`Delete "${entry.title}"`}
                    >
                        <IonIcon icon={trashOutline} slot="icon-only" />
                    </IonButton>
                    <IonIcon icon={chevronDownOutline} className={`checklist-card-chevron ${isExpanded ? 'is-expanded' : ''}`} aria-hidden="true" />
                </div>
            </div>
            <div className={`checklist-card-body ${isExpanded ? 'is-expanded' : ''}`}>
                {items.length > 0 && (
                    <div className="checklist-item-list">
                        {items.map((subtask) => (
                            <div
                                key={subtask.id}
                                className={`subtask-card checklist-item ${subtask.isCompleted ? 'is-completed' : ''} ${editingId === subtask.id ? 'is-editing' : ''}`}
                            >
                                <button
                                    type="button"
                                    className={`subtask-checkbox ${subtask.isCompleted ? 'is-checked' : ''}`}
                                    onClick={() => toggleSubtask(listId, subtask.id)}
                                    aria-label={`Mark "${subtask.title}" as ${subtask.isCompleted ? 'incomplete' : 'complete'}`}
                                    aria-pressed={subtask.isCompleted}
                                >
                                    {subtask.isCompleted && <IonIcon icon={checkmarkOutline} aria-hidden="true" />}
                                </button>
                                {editingId === subtask.id ? (
                                    <IonInput
                                        className="subtask-edit-input"
                                        value={editValue}
                                        onIonInput={(e) => setEditValue(e.detail.value ?? '')}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') commitEditing(subtask.id);
                                            if (e.key === 'Escape') cancelEditing();
                                        }}
                                        onIonBlur={() => commitEditing(subtask.id)}
                                        autofocus
                                        enterkeyhint="done"
                                        aria-label="Edit item title"
                                    />
                                ) : (
                                    <span
                                        className={`subtask-text ${subtask.isCompleted ? 'is-completed' : ''}`}
                                        onClick={() => startEditing(subtask)}
                                    >
                                        {subtask.title}
                                    </span>
                                )}
                                <button
                                    type="button"
                                    className="subtask-delete-button"
                                    onClick={() => deleteSubtask(listId, subtask.id)}
                                    aria-label={`Delete "${subtask.title}"`}
                                >
                                    <IonIcon icon={closeOutline} aria-hidden="true" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {view === 'active' && (
                    <div className="subtask-add-row checklist-add-row">
                        <IonInput
                            className="subtask-add-input"
                            value={draft}
                            placeholder="Add an item..."
                            onIonInput={(e) => onDraftChange(e.detail.value ?? '')}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddItem();
                            }}
                            aria-label="New checklist item"
                        />
                        <IonButton
                            className="subtask-add-button"
                            fill="solid"
                            onClick={handleAddItem}
                            disabled={!draft.trim()}
                        >
                            <IonIcon icon={addOutline} slot="start" />
                            Add
                        </IonButton>
                    </div>
                )}

                {view === 'active' && (
                    <div className="checklist-card-footer">
                        <RepeatSection value={entry.recurrence} dueDate={entry.dueDate} onChange={handleRecurrenceChange} />
                        <IonButton
                            className="checklist-complete-btn"
                            fill="solid"
                            expand="block"
                            onClick={handleComplete}
                        >
                            <IonIcon icon={checkmarkDoneOutline} slot="start" />
                            {entry.recurrence ? 'Complete today' : 'Mark complete'}
                        </IonButton>
                    </div>
                )}
            </div>
        </div>
    );
};

const SectionHeader: React.FC<{ icon: string; title: string; count: number; isFirst?: boolean }> = ({ icon, title, count, isFirst }) => (
    <div className={`checklist-section-header${isFirst ? '' : ' is-after'}`}>
        <IonIcon icon={icon} className="checklist-section-icon" aria-hidden="true" />
        <h2 className="checklist-section-title">{title}</h2>
        <IonChip className="checklist-section-badge">{count}</IonChip>
    </div>
);

const ChecklistPage: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const list = name || 'all-lists';
    const [newListName, setNewListName] = useState('');
    const [expanded, setExpanded] = useState<Set<string>>(new Set());
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [view, setView] = useState<'active' | 'completed'>('active');
    const [deleteTarget, setDeleteTarget] = useState<DoTodo | null>(null);
    const [presentToast] = useIonToast();
    const addEntry = useDoTodoStore((state) => state.addEntry);
    const deleteEntry = useDoTodoStore((state) => state.deleteEntry);
    const checklists = useDoTodoStore(useShallow(selectChecklists));

    useEffect(() => {
        setExpanded((prev) => {
            if (prev.size > 0 || checklists.length === 0) return prev;
            return new Set([checklists[0].id]);
        });
    }, [checklists]);

    const routines = checklists.filter((c) => !!c.recurrence && !c.isCompleted);
    const oneOffs = checklists.filter((c) => !c.recurrence && !c.isCompleted);
    const completed = checklists.filter((c) => c.isCompleted);
    const activeCount = routines.length + oneOffs.length;

    const orderedActive = useMemo(() => {
        const rows: Array<{
            item: DoTodo;
            showHeader: boolean;
            headerIcon: string;
            headerTitle: string;
            headerCount: number;
            headerIsFirst: boolean;
        }> = [];
        routines.forEach((c, i) => {
            rows.push({
                item: c,
                showHeader: i === 0,
                headerIcon: repeatOutline,
                headerTitle: 'Routines',
                headerCount: routines.length,
                headerIsFirst: true,
            });
        });
        oneOffs.forEach((c, i) => {
            rows.push({
                item: c,
                showHeader: i === 0,
                headerIcon: checkmarkDoneOutline,
                headerTitle: 'One-off',
                headerCount: oneOffs.length,
                headerIsFirst: routines.length === 0,
            });
        });
        return rows;
    }, [routines, oneOffs]);

    const handleCreate = useCallback(() => {
        const trimmed = newListName.trim();
        if (!trimmed) return;
        addEntry(trimmed, 'checklist', undefined, undefined, undefined, undefined, undefined, undefined, list);
        setNewListName('');
    }, [addEntry, list, newListName]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleCreate();
    }, [handleCreate]);

    const toggleCard = useCallback((listId: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(listId)) next.delete(listId);
            else next.add(listId);
            return next;
        });
    }, []);

    const handleDraftChange = useCallback((listId: string, value: string) => {
        setDrafts((prev) => ({ ...prev, [listId]: value }));
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (deleteTarget) {
            deleteEntry(deleteTarget.id);
            presentToast({
                message: 'Checklist deleted',
                duration: 2000,
                color: 'danger',
                position: 'bottom',
            });
        }
        setDeleteTarget(null);
    }, [deleteEntry, deleteTarget, presentToast]);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/list/all-lists" text="Home" />
                    </IonButtons>
                    <IonTitle>Checklists</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="checklist-overview-content">
                <div className="checklist-overview-header">
                    <p className="checklist-overview-subtitle">
                        {checklists.length} checklist{checklists.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="composer-card checklist-create-card">
                    <div className="composer-content">
                        <IonGrid className="composer-input-grid">
                            <IonRow className="composer-input-row">
                                <IonCol className="composer-input-col">
                                    <IonInput
                                        className="composer-title-input"
                                        value={newListName}
                                        placeholder="Enter checklist title"
                                        onIonInput={(e) => setNewListName(e.detail.value ?? '')}
                                        onKeyDown={handleKeyDown}
                                        aria-label="New checklist title"
                                    />
                                </IonCol>
                                <IonCol size="auto" className="composer-input-actions">
                                    <IonButton
                                        className="composer-add-button checklist-create-add-btn"
                                        fill="clear"
                                        onClick={handleCreate}
                                        disabled={!newListName.trim()}
                                        aria-label="Create checklist"
                                    >
                                        <IonIcon icon={addOutline} />
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                </div>

                <div className="checklist-view-toggle" role="tablist" aria-label="Filter checklists">
                    <button
                        type="button"
                        role="tab"
                        aria-selected={view === 'active'}
                        className={`checklist-view-toggle-btn ${view === 'active' ? 'is-active' : ''}`}
                        onClick={() => setView('active')}
                    >
                        Active
                        <span className="checklist-view-count">{activeCount}</span>
                    </button>
                    <button
                        type="button"
                        role="tab"
                        aria-selected={view === 'completed'}
                        className={`checklist-view-toggle-btn ${view === 'completed' ? 'is-active' : ''}`}
                        onClick={() => setView('completed')}
                    >
                        Completed
                        <span className="checklist-view-count">{completed.length}</span>
                    </button>
                </div>

                {view === 'active' ? (
                    activeCount === 0 ? (
                        <div className="checklist-empty">
                            <div className="checklist-empty-icon" aria-hidden="true">
                                <IonIcon icon={listOutline} />
                            </div>
                            <p className="checklist-empty-title">
                                {checklists.length === 0 ? 'No checklists yet' : 'All clear'}
                            </p>
                            <p className="checklist-empty-copy">
                                {checklists.length === 0
                                    ? 'Packing lists, chores, routines —'
                                    : 'Nothing active right now.'}
                                <br />
                                {checklists.length === 0
                                    ? 'Start one above.'
                                    : 'Finished checklists land in Completed.'}
                            </p>
                        </div>
                    ) : (
                        <div className="checklist-section">
                            {orderedActive.map(({ item: checklist, showHeader, headerIcon, headerTitle, headerCount, headerIsFirst }) => (
                                <React.Fragment key={checklist.id}>
                                    {showHeader && (
                                        <SectionHeader icon={headerIcon} title={headerTitle} count={headerCount} isFirst={headerIsFirst} />
                                    )}
                                    <ChecklistCard
                                        listId={checklist.id}
                                        isExpanded={expanded.has(checklist.id)}
                                        view="active"
                                        onToggle={() => toggleCard(checklist.id)}
                                        draft={drafts[checklist.id] ?? ''}
                                        onDraftChange={(value) => handleDraftChange(checklist.id, value)}
                                        onDelete={setDeleteTarget}
                                    />
                                </React.Fragment>
                            ))}
                        </div>
                    )
                ) : (
                    <>
                        {completed.length > 0 && (
                            <div className="checklist-section">
                                <SectionHeader icon={checkmarkDoneOutline} title="Completed" count={completed.length} isFirst />
                                {completed.map((checklist) => (
                                    <ChecklistCard
                                        key={checklist.id}
                                        listId={checklist.id}
                                        isExpanded={expanded.has(checklist.id)}
                                        view="completed"
                                        onToggle={() => toggleCard(checklist.id)}
                                        draft={drafts[checklist.id] ?? ''}
                                        onDraftChange={(value) => handleDraftChange(checklist.id, value)}
                                        onDelete={setDeleteTarget}
                                    />
                                ))}
                            </div>
                        )}

                        {completed.length === 0 && (
                            <div className="checklist-empty">
                                <div className="checklist-empty-icon" aria-hidden="true">
                                    <IonIcon icon={checkmarkDoneOutline} />
                                </div>
                                <p className="checklist-empty-title">Nothing completed yet</p>
                                <p className="checklist-empty-copy">Finished checklists land here.</p>
                            </div>
                        )}
                    </>
                )}

                <IonAlert
                    isOpen={deleteTarget !== null}
                    onDidDismiss={() => setDeleteTarget(null)}
                    header="Delete checklist?"
                    message={`"${deleteTarget?.title}" and all its items will be permanently deleted.`}
                    buttons={[
                        { text: 'Cancel', role: 'cancel' },
                        { text: 'Delete', role: 'destructive', handler: handleConfirmDelete },
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default ChecklistPage;
