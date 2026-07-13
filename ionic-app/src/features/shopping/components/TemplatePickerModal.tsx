import React, { useCallback, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonRadio,
    IonRadioGroup,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectTemplates } from '../../shared/store/doTodoStore';
import { DoTodo } from '../../shared/types';
import { DEFAULT_CATEGORIES } from '../types';
import { RepeatSection } from '../../todo/components/RepeatSection';

interface TemplatePickerModalProps {
    isOpen: boolean
    onDismiss: () => void
}

const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({ isOpen, onDismiss }) => {
    const history = useHistory();
    const templates = useDoTodoStore(useShallow(selectTemplates));
    const createFromTemplate = useDoTodoStore((state) => state.createFromTemplate);

    const [selectedId, setSelectedId] = useState<string>('');
    const [listName, setListName] = useState('');
    const [recurrence, setRecurrence] = useState<DoTodo['recurrence']>();

    const handleSelect = useCallback((id: string) => {
        setSelectedId(id);
        const tpl = templates.find((t) => t.id === id);
        if (tpl) {
            setListName(tpl.title);
        }
    }, [templates]);

    const handleConfirm = useCallback(() => {
        if (!selectedId || !listName.trim()) return;
        const newId = createFromTemplate(selectedId, listName.trim(), recurrence);
        onDismiss();
        setSelectedId('');
        setListName('');
        setRecurrence(undefined);
        if (newId) {
            history.push(`/shopping/${encodeURIComponent(newId)}`);
        }
    }, [selectedId, listName, recurrence, createFromTemplate, onDismiss, history]);

    const handleDismiss = useCallback(() => {
        onDismiss();
        setSelectedId('');
        setListName('');
        setRecurrence(undefined);
    }, [onDismiss]);

    const handleRecurrenceChange = useCallback((r: DoTodo['recurrence'] | undefined) => {
        setRecurrence(r);
    }, []);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleDismiss}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={handleDismiss} aria-label="Close">
                            <IonIcon icon={closeOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Create from Template</IonTitle>
                    <IonButtons slot="end">
                        <IonButton
                            onClick={handleConfirm}
                            disabled={!selectedId || !listName.trim()}
                            strong
                        >
                            Create
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="template-picker-content">
                <div className="template-picker-name-row">
                    <IonInput
                        className="template-picker-name-input"
                        value={listName}
                        placeholder="List name"
                        onIonInput={(e) => setListName(e.detail.value ?? '')}
                        aria-label="List name"
                    />
                </div>

                <div className="template-picker-repeat-section">
                    <RepeatSection value={recurrence} onChange={handleRecurrenceChange} />
                </div>

                <p className="template-picker-label">Pick a template</p>

                {templates.length === 0 ? (
                    <p className="template-picker-empty">No templates yet. Save a shopping list as template first.</p>
                ) : (
                    <IonRadioGroup value={selectedId} onIonChange={(e) => handleSelect(e.detail.value)}>
                        <IonList className="template-picker-list">
                            {templates.map((tpl) => {
                                const itemCount = tpl.shoppingItems?.length ?? 0;
                                const catList = tpl.shoppingItems?.reduce<string[]>((acc, item) => {
                                    const cat = item.category && DEFAULT_CATEGORIES.some((c) => c.key === item.category)
                                        ? item.category
                                        : 'other';
                                    if (!acc.includes(cat)) acc.push(cat);
                                    return acc;
                                }, []) ?? [];

                                return (
                                    <IonItem key={tpl.id} className="template-picker-item">
                                        <IonRadio slot="start" value={tpl.id} />
                                        <IonLabel className="template-picker-item-label">
                                            <span className="template-picker-item-name">{tpl.title}</span>
                                            <span className="template-picker-item-meta">
                                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                                                {catList.length > 0 && ` · ${catList.length} categor${catList.length !== 1 ? 'ies' : 'y'}`}
                                            </span>
                                        </IonLabel>
                                    </IonItem>
                                );
                            })}
                        </IonList>
                    </IonRadioGroup>
                )}
            </IonContent>
        </IonModal>
    );
};

export default TemplatePickerModal;
