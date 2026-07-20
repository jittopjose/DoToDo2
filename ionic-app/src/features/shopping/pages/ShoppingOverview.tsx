import React, { useCallback, useRef, useState } from 'react';
import {
    IonActionSheet,
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonChip,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar,
    useIonToast,
} from '@ionic/react';
import { addOutline, archiveOutline, cartOutline, checkmarkCircleOutline, chevronDownOutline, documentOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectActiveShoppingLists, selectArchivedShoppingLists, selectShoppingListSummary, selectTemplates } from '../../shared/store/doTodoStore';
import { useSettingsStore } from '../../settings/store/settingsStore';
import { formatPrice } from '../../shared/utils/formatPrice';
import TemplatePickerModal from '../components/TemplatePickerModal';
import './ShoppingOverview.css';

const ShoppingOverview: React.FC = () => {
    const history = useHistory();
    const currency = useSettingsStore((state) => state.currency);
    const [newListName, setNewListName] = useState('');
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['Active']));
    const [templateModalOpen, setTemplateModalOpen] = useState(false);
    const [templateModalInitialId, setTemplateModalInitialId] = useState<string | undefined>(undefined);
    const [actionListId, setActionListId] = useState<string | null>(null);
    const [templateActionId, setTemplateActionId] = useState<string | null>(null);
    const [presentToast] = useIonToast();

    const addShoppingList = useDoTodoStore((state) => state.addShoppingList);
    const saveAsTemplate = useDoTodoStore((state) => state.saveAsTemplate);
    const deleteTemplate = useDoTodoStore((state) => state.deleteTemplate);
    const activeLists = useDoTodoStore(useShallow(selectActiveShoppingLists));
    const archivedLists = useDoTodoStore(useShallow(selectArchivedShoppingLists));
    const templates = useDoTodoStore(useShallow(selectTemplates));

    const handleCreateList = useCallback(() => {
        const trimmed = newListName.trim();
        if (!trimmed) return;
        addShoppingList(trimmed);
        setNewListName('');
    }, [newListName, addShoppingList]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreateList();
        }
    }, [handleCreateList]);

    const toggleGroup = useCallback((title: string) => {
        setExpanded((prev) => {
            const next = new Set(prev);
            if (next.has(title)) next.delete(title);
            else next.add(title);
            return next;
        });
    }, []);

    const handleSaveAsTemplate = useCallback(() => {
        if (actionListId) {
            saveAsTemplate(actionListId);
            setActionListId(null);
            presentToast({
                message: 'Saved as template',
                duration: 2000,
                color: 'tertiary',
                position: 'bottom',
            });
        }
    }, [actionListId, saveAsTemplate, presentToast]);

    const handleDeleteTemplate = useCallback(() => {
        if (templateActionId) {
            deleteTemplate(templateActionId);
            setTemplateActionId(null);
            presentToast({
                message: 'Template deleted',
                duration: 2000,
                color: 'tertiary',
                position: 'bottom',
            });
        }
    }, [templateActionId, deleteTemplate, presentToast]);

    const ListCard: React.FC<{ listId: string; isTemplate?: boolean }> = ({ listId, isTemplate }) => {
        const entry = useDoTodoStore((state) => state.entries[listId]);
        const summary = useDoTodoStore(useShallow(selectShoppingListSummary(listId)));
        const doneCount = (entry?.shoppingItems ?? []).filter((i) => i.isCompleted).length;
        const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

        const handleTap = useCallback(() => {
            history.push(`/shopping/${encodeURIComponent(listId)}`);
        }, [history, listId]);

        const handlePointerDown = useCallback(() => {
            longPressTimer.current = setTimeout(() => {
                setActionListId(listId);
            }, 500);
        }, [listId]);

        const handlePointerUp = useCallback(() => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = undefined;
            }
        }, []);

        const handleTemplatePointerDown = useCallback(() => {
            longPressTimer.current = setTimeout(() => {
                setTemplateActionId(listId);
            }, 500);
        }, [listId]);

        const handleUseTemplate = useCallback(() => {
            setTemplateModalInitialId(listId);
            setTemplateModalOpen(true);
        }, [listId]);

        if (isTemplate) {
            const catCount = entry?.shoppingItems?.reduce<string[]>((acc, item) => {
                const cat = item.category || 'other';
                if (!acc.includes(cat)) acc.push(cat);
                return acc;
            }, []) ?? [];

            return (
                <IonItem
                    className="shop-list-card shop-template-card"
                    button
                    lines="none"
                    onClick={handleUseTemplate}
                    onPointerDown={handleTemplatePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <IonIcon icon={documentOutline} className="shop-list-card-icon shop-template-card-icon" slot="start" />
                    <div className="shop-list-card-body">
                        <span className="shop-list-card-name">{entry?.title ?? 'Unknown template'}</span>
                        <span className="shop-list-card-summary">
                            {summary.count} item{summary.count !== 1 ? 's' : ''}
                            {catCount.length > 0 && ` · ${catCount.length} categor${catCount.length !== 1 ? 'ies' : 'y'}`}
                            <IonChip className="shop-template-badge">Template</IonChip>
                        </span>
                        <span className="shop-template-hint">
                            Tap to create a new list
                            <IonButton
                                className="shop-template-use-btn"
                                fill="clear"
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUseTemplate();
                                }}
                                aria-label="Use template"
                            >
                                <IonIcon icon={addOutline} slot="icon-only" />
                            </IonButton>
                        </span>
                    </div>
                </IonItem>
            );
        }

        return (
            <IonItem
                className="shop-list-card"
                button
                lines="none"
                onClick={handleTap}
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                <IonIcon icon={cartOutline} className="shop-list-card-icon" slot="start" />
                <div className="shop-list-card-body">
                    <span className="shop-list-card-name">{entry?.title ?? 'Unknown list'}</span>
                    <span className="shop-list-card-summary">
                        {summary.count} item{summary.count !== 1 ? 's' : ''} · {formatPrice(summary.total, currency)}
                        {summary.count > 0 && (
                            <IonChip className="shop-list-card-progress">
                                <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: 2, fontSize: 10 }} />
                                {doneCount}/{summary.count}
                            </IonChip>
                        )}
                    </span>
                </div>
            </IonItem>
        );
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/list/all-lists" text="Home" />
                    </IonButtons>
                    <IonTitle>Shopping Lists</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent className="shop-overview-content">
                <div className="shop-overview-header">
                    <p className="shop-overview-subtitle">
                        {activeLists.length} active list{activeLists.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <IonCard className="composer-card shop-create-card">
                    <IonCardContent className="composer-content">
                        <IonGrid className="composer-input-grid">
                            <IonRow className="composer-input-row">
                                <IonCol className="composer-input-col">
                                    <IonInput
                                        className="composer-title-input"
                                        value={newListName}
                                        placeholder="New list name..."
                                        onIonInput={(e) => setNewListName(e.detail.value ?? '')}
                                        onKeyDown={handleKeyDown}
                                        aria-label="New shopping list name"
                                    />
                                </IonCol>
                                <IonCol size="auto" className="composer-input-actions">
                                    <IonButton
                                        className="composer-add-button shop-create-add-btn"
                                        fill="clear"
                                        onClick={handleCreateList}
                                        disabled={!newListName.trim()}
                                        aria-label="Create shopping list"
                                    >
                                        <IonIcon icon={addOutline} />
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                        <div className="shop-from-template-row">
                            <IonButton
                                className="shop-from-template-btn"
                                fill="clear"
                                size="small"
                                onClick={() => setTemplateModalOpen(true)}
                            >
                                <IonIcon icon={documentOutline} slot="start" />
                                From template
                            </IonButton>
                        </div>
                    </IonCardContent>
                </IonCard>

                {activeLists.length > 0 && (
                    <div className="shop-overview-section">
                        <div
                            className="dotodo-group-header group--active"
                            onClick={() => toggleGroup('Active')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup('Active'); } }}
                            aria-expanded={expanded.has('Active')}
                        >
                            <IonIcon icon={cartOutline} className="dotodo-group-icon" />
                            <h2 className="dotodo-group-title">Active</h2>
                            <IonBadge className="dotodo-group-badge">{activeLists.length}</IonBadge>
                            <IonIcon icon={chevronDownOutline} className={`dotodo-group-chevron ${expanded.has('Active') ? 'is-expanded' : ''}`} />
                        </div>
                        <div className={`dotodo-group-items group--active ${expanded.has('Active') ? 'is-expanded' : ''}`}>
                            {expanded.has('Active') && activeLists.map((list) => (
                                <ListCard key={list.id} listId={list.id} />
                            ))}
                        </div>
                    </div>
                )}

                {templates.length > 0 && (
                    <div className="shop-overview-section">
                        <div
                            className="dotodo-group-header group--template"
                            onClick={() => toggleGroup('Templates')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup('Templates'); } }}
                            aria-expanded={expanded.has('Templates')}
                        >
                            <IonIcon icon={documentOutline} className="dotodo-group-icon" />
                            <h2 className="dotodo-group-title">Templates</h2>
                            <IonBadge className="dotodo-group-badge">{templates.length}</IonBadge>
                            <IonIcon icon={chevronDownOutline} className={`dotodo-group-chevron ${expanded.has('Templates') ? 'is-expanded' : ''}`} />
                        </div>
                        <div className={`dotodo-group-items group--template ${expanded.has('Templates') ? 'is-expanded' : ''}`}>
                            {expanded.has('Templates') && templates.map((tpl) => (
                                <ListCard key={tpl.id} listId={tpl.id} isTemplate />
                            ))}
                        </div>
                    </div>
                )}

                {activeLists.length === 0 && archivedLists.length === 0 && (
                    <div className="shop-overview-empty">
                        <IonIcon icon={cartOutline} className="shop-overview-empty-icon" />
                        <p className="shop-overview-empty-text">
                            Your shopping lists live here.<br />Start one above.
                        </p>
                    </div>
                )}

                {archivedLists.length > 0 && (
                    <div className="shop-overview-section">
                        <div
                            className="dotodo-group-header group--archived"
                            onClick={() => toggleGroup('Archived')}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup('Archived'); } }}
                            aria-expanded={expanded.has('Archived')}
                        >
                            <IonIcon icon={archiveOutline} className="dotodo-group-icon" />
                            <h2 className="dotodo-group-title">Archived</h2>
                            <IonBadge className="dotodo-group-badge">{archivedLists.length}</IonBadge>
                            <IonIcon icon={chevronDownOutline} className={`dotodo-group-chevron ${expanded.has('Archived') ? 'is-expanded' : ''}`} />
                        </div>
                        <div className={`dotodo-group-items group--archived ${expanded.has('Archived') ? 'is-expanded' : ''}`}>
                            {expanded.has('Archived') && archivedLists.map((list) => (
                                <ListCard key={list.id} listId={list.id} />
                            ))}
                        </div>
                    </div>
                )}

                <IonActionSheet
                    isOpen={actionListId !== null}
                    onDidDismiss={() => setActionListId(null)}
                    header="List options"
                    buttons={[
                        { text: 'Save as template', handler: handleSaveAsTemplate },
                        { text: 'Cancel', role: 'cancel' },
                    ]}
                />

                <IonActionSheet
                    isOpen={templateActionId !== null}
                    onDidDismiss={() => setTemplateActionId(null)}
                    header="Template options"
                    buttons={[
                        { text: 'Delete template', role: 'destructive', handler: handleDeleteTemplate },
                        { text: 'Cancel', role: 'cancel' },
                    ]}
                />

                <TemplatePickerModal
                    isOpen={templateModalOpen}
                    initialTemplateId={templateModalInitialId}
                    onDismiss={() => {
                        setTemplateModalOpen(false);
                        setTemplateModalInitialId(undefined);
                    }}
                />
            </IonContent>
        </IonPage>
    );
};

export default ShoppingOverview;
