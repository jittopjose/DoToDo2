import React, { useCallback, useEffect, useState } from 'react';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { arrowBackOutline, trashOutline } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { EditorDetailsSection, SubtasksSection, AddSubtaskRow } from '../features/todos/components/TodoItemEditorSheet.sections';
import { RepeatSection } from '../features/todos/components/RepeatSection';
import { Todo } from '../features/todos/types';
import { useTodoStore, selectEntryById } from '../features/todos/store/todoStore';
import { getSubtaskProgress } from '../features/todos/components/TodoItem.utils';
import '../features/todos/components/TodoItem.css';
import '../features/todos/components/RepeatSection.css';
import './TodoEditPage.css';

const TodoEditPage: React.FC = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const todo = useTodoStore(selectEntryById(id));
    const addSubtask = useTodoStore((state) => state.addSubtask);
    const updateSubtask = useTodoStore((state) => state.updateSubtask);
    const deleteSubtask = useTodoStore((state) => state.deleteSubtask);
    const deleteEntry = useTodoStore((state) => state.deleteEntry);
    const toggleSubtask = useTodoStore((state) => state.toggleSubtask);
    const updateEntry = useTodoStore((state) => state.updateEntry);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [newSubtaskText, setNewSubtaskText] = useState('');
    const [recurrence, setRecurrence] = useState<Todo['recurrence']>(undefined);

    useEffect(() => {
        if (!todo) return;
        setTitle(todo.title);
        setDescription(todo.description || '');
        setRecurrence(todo.recurrence || undefined);
        setNewSubtaskText('');
    }, [todo, todo?.id, todo?.title, todo?.description, todo?.recurrence]);

    const goBack = useCallback(() => {
        history.goBack();
    }, [history]);

    const handleSave = useCallback(() => {
        if (!todo) return;
        updateEntry(todo.id, {
            title: title.trim() || todo.title,
            description: description.trim() || undefined,
            recurrence: recurrence,
        });
        goBack();
    }, [description, goBack, recurrence, title, todo, updateEntry]);

    const handleDelete = useCallback(() => {
        if (!todo) return;
        deleteEntry(todo.id);
        goBack();
    }, [deleteEntry, goBack, todo]);

    const handleAddSubtask = useCallback(() => {
        if (!todo) return;
        const trimmed = newSubtaskText.trim();
        if (!trimmed) return;
        addSubtask(todo.id, trimmed);
        setNewSubtaskText('');
    }, [addSubtask, newSubtaskText, todo]);

    const handleToggleSubtask = useCallback((subtaskId: string) => {
        if (!todo) return;
        toggleSubtask(todo.id, subtaskId);
    }, [todo, toggleSubtask]);

    const handleUpdateSubtask = useCallback((subtaskId: string, title: string) => {
        if (!todo) return;
        updateSubtask(todo.id, subtaskId, title);
    }, [todo, updateSubtask]);

    const handleDeleteSubtask = useCallback((subtaskId: string) => {
        if (!todo) return;
        deleteSubtask(todo.id, subtaskId);
    }, [todo, deleteSubtask]);

    if (!todo || !id) {
        return (
            <IonPage className="todo-edit-page todo-edit-page--missing">
                <IonHeader className="todo-edit-header">
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton className="todo-edit-toolbar-action" fill="clear" onClick={goBack} aria-label="Go back">
                                <IonIcon icon={arrowBackOutline} />
                            </IonButton>
                        </IonButtons>
                        <IonTitle>Task not found</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="todo-edit-content">
                    <IonGrid className="todo-edit-grid">
                        <div className="todo-edit-empty">
                            <h1 className="todo-edit-empty-title">This task is no longer available.</h1>
                            <p className="todo-edit-empty-copy">It may have been deleted from the list.</p>
                        </div>
                    </IonGrid>
                </IonContent>
            </IonPage>
        );
    }

    const subtaskProgress = getSubtaskProgress(todo);

    return (
        <IonPage className="todo-edit-page">
            <IonHeader className="todo-edit-header">
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref={`/list/${encodeURIComponent(todo.list)}`} text="" aria-label="Go back" />
                        <span className="todo-edit-title">Edit Task</span>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton
                            className="todo-edit-toolbar-action todo-edit-toolbar-action--delete"
                            fill="clear"
                            onClick={handleDelete}
                            aria-label="Delete task"
                        >
                            <IonIcon icon={trashOutline} />
                        </IonButton>
                        <IonButton
                            className="todo-edit-toolbar-save"
                            fill="clear"
                            onClick={handleSave}
                            aria-label="Save task"
                        >
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="todo-edit-content">
                <IonGrid className="todo-edit-grid">
                    <span className="todo-edit-status-chip">
                        <span className="todo-edit-status-dot" />
                        {todo.isCompleted ? 'COMPLETED TASK' : 'ACTIVE TASK'}
                    </span>

                    <EditorDetailsSection
                        title={title}
                        description={description}
                        onTitleChange={setTitle}
                        onDescriptionChange={setDescription}
                    />

                    {todo.itemType === 'todo' && (
                        <RepeatSection
                            value={recurrence}
                            dueDate={todo.dueDate}
                            onChange={setRecurrence}
                        />
                    )}

                    <SubtasksSection
                        subtasks={todo.subtasks}
                        onToggleSubtask={handleToggleSubtask}
                        onUpdateSubtask={handleUpdateSubtask}
                        onDeleteSubtask={handleDeleteSubtask}
                        progress={subtaskProgress}
                    />

                    <AddSubtaskRow
                        value={newSubtaskText}
                        onValueChange={setNewSubtaskText}
                        onSubmit={handleAddSubtask}
                        isEnabled={Boolean(todo.subtasks && todo.subtasks.length > 0)}
                    />
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default TodoEditPage;
