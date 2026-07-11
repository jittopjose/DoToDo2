import React, { useCallback, useState } from 'react';
import {
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
} from '@ionic/react';
import { addOutline, archiveOutline, cartOutline, checkmarkCircleOutline, chevronDownOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectActiveShoppingLists, selectArchivedShoppingLists, selectShoppingListSummary } from '../../shared/store/doTodoStore';
import { useSettingsStore } from '../../settings/store/settingsStore';
import { formatPrice } from '../../shared/utils/formatPrice';
import './ShoppingOverview.css';

const ShoppingOverview: React.FC = () => {
    const history = useHistory();
    const currency = useSettingsStore((state) => state.currency);
    const [newListName, setNewListName] = useState('');
    const [expanded, setExpanded] = useState<Set<string>>(new Set(['Active']));
    const addShoppingList = useDoTodoStore((state) => state.addShoppingList);
    const activeLists = useDoTodoStore(useShallow(selectActiveShoppingLists));
    const archivedLists = useDoTodoStore(useShallow(selectArchivedShoppingLists));

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

    const ListCard: React.FC<{ listId: string }> = ({ listId }) => {
        const entry = useDoTodoStore((state) => state.entries[listId]);
        const summary = useDoTodoStore(useShallow(selectShoppingListSummary(listId)));
        const doneCount = (entry?.shoppingItems ?? []).filter((i) => i.isCompleted).length;
        const handleTap = useCallback(() => {
            history.push(`/shopping/${encodeURIComponent(listId)}`);
        }, [history, listId]);

        return (
            <IonItem className="shop-list-card" button lines="none" onClick={handleTap}>
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
            </IonContent>
        </IonPage>
    );
};

export default ShoppingOverview;
