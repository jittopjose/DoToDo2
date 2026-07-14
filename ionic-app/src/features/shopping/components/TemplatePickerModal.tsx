import React, { useCallback, useMemo, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonInput,
    IonModal,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { cartOutline, checkmarkCircle, closeOutline, repeatOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectTemplates } from '../../shared/store/doTodoStore';
import { DoTodo } from '../../shared/types';
import { DEFAULT_CATEGORIES } from '../types';
import { RepeatSection } from '../../todo/components/RepeatSection';
import './TemplatePickerModal.css';

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
    const [showRepeat, setShowRepeat] = useState(false);

    const sel = useMemo(
        () => templates.find((t) => t.id === selectedId),
        [templates, selectedId],
    );

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
        setShowRepeat(false);
        if (newId) {
            history.push(`/shopping/${encodeURIComponent(newId)}`);
        }
    }, [selectedId, listName, recurrence, createFromTemplate, onDismiss, history]);

    const handleDismiss = useCallback(() => {
        onDismiss();
        setSelectedId('');
        setListName('');
        setRecurrence(undefined);
        setShowRepeat(false);
    }, [onDismiss]);

    const handleRecurrenceChange = useCallback((r: DoTodo['recurrence'] | undefined) => {
        setRecurrence(r);
        if (!r) setShowRepeat(false);
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
                    <IonTitle>Choose a template</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="tpl-content">
                <div className="tpl-config-row">
                    <IonInput
                        className="tpl-name-input"
                        value={listName}
                        placeholder="List name"
                        onIonInput={(e) => setListName(e.detail.value ?? '')}
                        aria-label="List name"
                    />
                    <IonButton
                        className={`tpl-repeat-toggle ${showRepeat || recurrence ? 'is-active' : ''}`}
                        fill="clear"
                        onClick={() => setShowRepeat((prev) => !prev)}
                        aria-label="Set schedule"
                    >
                        <IonIcon icon={repeatOutline} />
                    </IonButton>
                </div>

                {showRepeat && (
                    <div className="tpl-repeat-section">
                        <RepeatSection value={recurrence} onChange={handleRecurrenceChange} />
                    </div>
                )}

                {templates.length === 0 ? (
                    <div className="tpl-empty">
                        <div className="tpl-empty-icon">
                            <IonIcon icon={cartOutline} />
                        </div>
                        <p className="tpl-empty-text">
                            No templates yet.<br />
                            Save a shopping list as template first.
                        </p>
                    </div>
                ) : (
                    <div className="tpl-card-list">
                        {templates.map((tpl, idx) => {
                            const isSelected = tpl.id === selectedId;
                            const items = tpl.shoppingItems ?? [];
                            const itemCount = items.length;
                            const previewItems = items.slice(0, 3);
                            const remaining = itemCount - 3;
                            const catKeys = items.reduce<string[]>((acc, item) => {
                                const cat = item.category && DEFAULT_CATEGORIES.some((c) => c.key === item.category)
                                    ? item.category
                                    : 'other';
                                if (!acc.includes(cat)) acc.push(cat);
                                return acc;
                            }, []);
                            const catLabels = catKeys
                                .map((key) => DEFAULT_CATEGORIES.find((c) => c.key === key)?.label ?? key)
                                .slice(0, 3);

                            return (
                                <div
                                    key={tpl.id}
                                    className={`tpl-card ${isSelected ? 'is-selected' : ''}`}
                                    style={{ animationDelay: `${idx * 0.04}s` }}
                                    onClick={() => handleSelect(tpl.id)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleSelect(tpl.id);
                                        }
                                    }}
                                >
                                    <div className="tpl-card-inner">
                                        <div className="tpl-card-icon">
                                            <IonIcon icon={cartOutline} />
                                        </div>
                                        <div className="tpl-card-body">
                                            <div className="tpl-card-top">
                                                <span className="tpl-card-name">{tpl.title}</span>
                                                <span className="tpl-card-count">{itemCount}&nbsp;item{itemCount !== 1 ? 's' : ''}</span>
                                                {isSelected && (
                                                    <IonIcon icon={checkmarkCircle} className="tpl-card-check" />
                                                )}
                                            </div>
                                            {previewItems.length > 0 && (
                                                <div className="tpl-card-preview">
                                                    {previewItems.map((item, i) => (
                                                        <span key={item.id} className="tpl-card-preview-item">
                                                            {item.title}{i < previewItems.length - 1 ? ',' : ''}
                                                        </span>
                                                    ))}
                                                    {remaining > 0 && (
                                                        <span className="tpl-card-preview-more">+{remaining}</span>
                                                    )}
                                                </div>
                                            )}
                                            {catLabels.length > 0 && (
                                                <div className="tpl-card-cats">
                                                    {catLabels.map((label) => (
                                                        <span key={label} className="tpl-card-cat">{label}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </IonContent>

            <IonFooter className="tpl-footer">
                <IonButton
                    className="tpl-create-btn"
                    expand="block"
                    onClick={handleConfirm}
                    disabled={!selectedId || !listName.trim()}
                >
                    {sel ? `Create from "${sel.title}"` : 'Select a template'}
                </IonButton>
            </IonFooter>
        </IonModal>
    );
};

export default TemplatePickerModal;
