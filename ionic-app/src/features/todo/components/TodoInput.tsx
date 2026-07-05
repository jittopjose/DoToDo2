import React, { useEffect, useState } from 'react';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCol,
    IonGrid,
    IonIcon,
    IonInput,
    IonRow
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useDoTodoStore } from '../../todos/store/doTodoStore';
import { type ItemType } from '../../todos/types';
import './TodoInput.css';

export const TodoInput: React.FC<{ list: string }> = ({ list }) => {
    const [text, setText] = useState('');
    const [itemType, setItemType] = useState<ItemType>('todo');
    const addEntry = useDoTodoStore((state) => state.addEntry);
    const setSearchTerm = useDoTodoStore((state) => state.setSearchTerm);
    const typeFilter = useDoTodoStore((state) => state.typeFilter);
    const activeTypeFilter = typeFilter || 'all';

    useEffect(() => {
        setItemType(activeTypeFilter === 'all' ? 'todo' : activeTypeFilter);
    }, [activeTypeFilter]);

    const titlePlaceholders = {
        todo: 'What needs to be done?',
        shopping: 'What should you buy?',
        note: 'Enter note title',
        checklist: 'Enter checklist title',
    } as const;

    const handleAdd = () => {
        if (text.trim().length === 0) return;
        addEntry(text, itemType, undefined, undefined, undefined, undefined, undefined, undefined, list);
        setSearchTerm('');
        setText('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <IonCard className="composer-card">
            <IonCardContent className="composer-content">
                <IonGrid className="composer-input-grid">
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
