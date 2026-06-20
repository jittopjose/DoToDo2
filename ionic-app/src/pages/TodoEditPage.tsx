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
import { arrowBackOutline, checkmarkDoneOutline, trashOutline } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { EditorDetailsSection, SubtasksSection, AddSubtaskRow } from '../features/todos/components/TodoItemEditorSheet.sections';
import { useTodoStore } from '../features/todos/store/todoStore';
import { getSubtaskProgress } from '../features/todos/components/TodoItem.utils';
import '../features/todos/components/TodoItem.css';
import './TodoEditPage.css';

const TodoEditPage: React.FC = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const todo = useTodoStore((state) => state.todos.find((item) => item.id === id));
    const addSubtask = useTodoStore((state) => state.addSubtask);
    const deleteTodo = useTodoStore((state) => state.deleteTodo);
    const toggleSubtask = useTodoStore((state) => state.toggleSubtask);
    const updateTodo = useTodoStore((state) => state.updateTodo);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [newSubtaskText, setNewSubtaskText] = useState('');

    useEffect(() => {
        if (!todo) return;
        setTitle(todo.title);
        setDescription(todo.description || '');
        setNewSubtaskText('');
    }, [todo, todo?.id, todo?.title, todo?.description]);

    const goBack = useCallback(() => {
        history.goBack();
    }, [history]);

    const handleSave = useCallback(() => {
        if (!todo) return;
        updateTodo(todo.id, {
            title: title.trim() || todo.title,
            description: description.trim() || undefined,
        });
        goBack();
    }, [description, goBack, title, todo, updateTodo]);

    const handleDelete = useCallback(() => {
        if (!todo) return;
        deleteTodo(todo.id);
        goBack();
    }, [deleteTodo, goBack, todo]);

    const handleAddSubtask = useCallback(() => {
        if (!todo) return;
        const trimmed = newSubtaskText.trim();
        if (!trimmed) return;
        addSubtask(todo.id, trimmed);
        setNewSubtaskText('');
    }, [addSubtask, newSubtaskText, todo]);

    const handleSubtaskKeyPress = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddSubtask();
        }
    }, [handleAddSubtask]);

    const handleToggleSubtask = useCallback((subtaskId: string) => {
        if (!todo) return;
        toggleSubtask(todo.id, subtaskId);
    }, [todo, toggleSubtask]);

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
                    </IonButtons>
                    <IonTitle className="todo-edit-toolbar-title">Edit task</IonTitle>
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
                            className="todo-edit-toolbar-action todo-edit-toolbar-action--done"
                            fill="clear"
                            onClick={handleSave}
                            aria-label="Save task"
                        >
                            <IonIcon icon={checkmarkDoneOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="todo-edit-content">
                <IonGrid className="todo-edit-grid">
                    <div className="todo-edit-summary">
                        <span className={`todo-edit-summary-dot todo-edit-summary-dot--${todo.itemType}`} />
                        <span>{todo.isCompleted ? 'Completed task' : 'Active task'}</span>
                    </div>

                    <EditorDetailsSection
                        title={title}
                        description={description}
                        onTitleChange={setTitle}
                        onDescriptionChange={setDescription}
                    />

                    <SubtasksSection
                        subtasks={todo.subtasks}
                        onToggleSubtask={handleToggleSubtask}
                        progress={subtaskProgress}
                    />

                    <AddSubtaskRow
                        value={newSubtaskText}
                        onValueChange={setNewSubtaskText}
                        onSubmit={handleAddSubtask}
                        onKeyPress={handleSubtaskKeyPress}
                        isEnabled={Boolean(todo.subtasks && todo.subtasks.length > 0)}
                    />
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default TodoEditPage;
