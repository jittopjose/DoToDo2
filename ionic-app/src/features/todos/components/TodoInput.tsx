import React, { useEffect, useState } from 'react';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonChip,
    IonCol,
    IonGrid,
    IonIcon,
    IonInput,
    IonRow
} from '@ionic/react';
import { addOutline, checkmarkDoneOutline, documentTextOutline, listOutline, cartOutline } from 'ionicons/icons';
import { useTodoStore } from '../store/todoStore';
import { TodoTypeFilter } from '../types';
import './TodoInput.css';

type TodoItemType = 'todo' | 'shopping' | 'note' | 'checklist';

export const TodoInput: React.FC<{ list: string }> = ({ list }) => {
    const [text, setText] = useState('');
    const [itemType, setItemType] = useState<TodoItemType>('todo');
    const addTodo = useTodoStore((state) => state.addTodo);
    const setSearchTerm = useTodoStore((state) => state.setSearchTerm);
    const typeFilter = useTodoStore((state) => state.typeFilter);
    const setTypeFilter = useTodoStore((state) => state.setTypeFilter);
    const activeTypeFilter = typeFilter || 'all';

    useEffect(() => {
        setItemType(activeTypeFilter === 'all' ? 'todo' : activeTypeFilter);
    }, [activeTypeFilter]);

    const titlePlaceholders = {
        todo: `What needs to be done in ${list}?`,
        shopping: 'What should you buy?',
        note: 'Enter note title',
        checklist: 'Enter checklist title',
    } as const;

    const handleAdd = () => {
        if (text.trim().length === 0) return;
        addTodo(text, itemType, undefined, undefined, undefined, undefined, undefined, undefined, list);
        setSearchTerm('');
        setText('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    const handleTypeSelect = (type: TodoItemType) => {
        const nextTypeFilter: TodoTypeFilter = activeTypeFilter === type ? 'all' : type;
        setTypeFilter(nextTypeFilter);
        setSearchTerm('');
        setItemType(nextTypeFilter === 'all' ? type : nextTypeFilter);
    };

    return (
        <IonCard className="composer-card">
            <IonCardContent className="composer-content">
                <IonGrid className="composer-input-grid">
                    <IonGrid className="composer-type-scroll">
                        <IonRow className="composer-type-row">
                            <IonChip
                                className={`composer-type-chip composer-type-chip--todo ${activeTypeFilter === 'todo' ? 'is-active' : ''}`}
                                onClick={() => handleTypeSelect('todo')}
                                aria-label="Task type"
                            >
                                <IonIcon icon={listOutline} />
                                <span className="composer-type-label">Task</span>
                            </IonChip>
                            <IonChip
                                className={`composer-type-chip composer-type-chip--shopping ${activeTypeFilter === 'shopping' ? 'is-active' : ''}`}
                                onClick={() => handleTypeSelect('shopping')}
                                aria-label="Shopping type"
                            >
                                <IonIcon icon={cartOutline} />
                                <span className="composer-type-label">Shop</span>
                            </IonChip>
                            <IonChip
                                className={`composer-type-chip composer-type-chip--note ${activeTypeFilter === 'note' ? 'is-active' : ''}`}
                                onClick={() => handleTypeSelect('note')}
                                aria-label="Note type"
                            >
                                <IonIcon icon={documentTextOutline} />
                                <span className="composer-type-label">Note</span>
                            </IonChip>
                            <IonChip
                                className={`composer-type-chip composer-type-chip--checklist ${activeTypeFilter === 'checklist' ? 'is-active' : ''}`}
                                onClick={() => handleTypeSelect('checklist')}
                                aria-label="Checklist type"
                            >
                                <IonIcon icon={checkmarkDoneOutline} />
                                <span className="composer-type-label">Check</span>
                            </IonChip>
                        </IonRow>
                    </IonGrid>
                    <IonRow className="composer-input-row">
                        <IonCol className="composer-input-col">
                            <IonInput
                                className="composer-title-input"
                                value={text}
                                placeholder={titlePlaceholders[itemType]}
                                onIonInput={(e) => setText(e.detail.value ?? '')}
                                onKeyUp={handleKeyPress}
                                aria-label="Task title"
                            />
                        </IonCol>
                        <IonCol size="auto" className="composer-input-actions">
                            <IonButton className="composer-add-button" fill="clear" onClick={handleAdd} disabled={!text.trim()} aria-label="Add task">
                                <IonIcon icon={addOutline} />
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonCardContent>
        </IonCard>
    );
};
