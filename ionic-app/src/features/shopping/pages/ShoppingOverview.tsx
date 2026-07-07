import React, { useCallback, useState } from 'react';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonChip,
    IonContent,
    IonIcon,
    IonInput,
    IonPage,
} from '@ionic/react';
import { addOutline, cartOutline, checkmarkCircleOutline, chevronDownOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectActiveShoppingLists, selectArchivedShoppingLists, selectShoppingListSummary } from '../../shared/store/doTodoStore';
import './ShoppingOverview.css';

const ShoppingOverview: React.FC = () => {
    const history = useHistory();
    const [newListName, setNewListName] = useState('');
    const [showArchived, setShowArchived] = useState(false);
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

    const ListCard: React.FC<{ listId: string }> = ({ listId }) => {
        const entry = useDoTodoStore((state) => state.entries[listId]);
        const summary = useDoTodoStore(useShallow(selectShoppingListSummary(listId)));
        const doneCount = (entry?.shoppingItems ?? []).filter((i) => i.isCompleted).length;
        const handleTap = useCallback(() => {
            history.push(`/shopping/${encodeURIComponent(listId)}`);
        }, [history, listId]);

        return (
            <IonCard className="shop-list-card" button onClick={handleTap}>
                <IonCardContent className="shop-list-card-content">
                    <IonIcon icon={cartOutline} className="shop-list-card-icon" />
                    <div className="shop-list-card-body">
                        <span className="shop-list-card-name">{entry?.title ?? 'Unknown list'}</span>
                        <span className="shop-list-card-summary">
                            {summary.count} item{summary.count !== 1 ? 's' : ''} · ${summary.total.toFixed(2)}
                            {summary.count > 0 && (
                                <IonChip className="shop-list-card-progress">
                                    <IonIcon icon={checkmarkCircleOutline} style={{ marginRight: 2, fontSize: 10 }} />
                                    {doneCount}/{summary.count}
                                </IonChip>
                            )}
                        </span>
                    </div>
                </IonCardContent>
            </IonCard>
        );
    };

    return (
        <IonPage>
            <IonContent className="shop-overview-content">
                <div className="shop-overview-header">
                    <h1 className="shop-overview-title">Shopping Lists</h1>
                    <p className="shop-overview-subtitle">
                        {activeLists.length} active list{activeLists.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="shop-overview-create">
                    <div className="shop-overview-create-input-row">
                        <IonInput
                            className="shop-overview-create-input"
                            value={newListName}
                            placeholder="New list name..."
                            onIonInput={(e) => setNewListName(e.detail.value ?? '')}
                            onKeyDown={handleKeyDown}
                            aria-label="New shopping list name"
                        />
                        <IonButton
                            className="shop-overview-create-btn"
                            onClick={handleCreateList}
                            disabled={!newListName.trim()}
                            aria-label="Create shopping list"
                        >
                            <IonIcon icon={addOutline} />
                        </IonButton>
                    </div>
                </div>

                {activeLists.length > 0 && (
                    <div className="shop-overview-section">
                        <h2 className="shop-overview-section-title">Active</h2>
                        {activeLists.map((list) => (
                            <ListCard key={list.id} listId={list.id} />
                        ))}
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
                            className="shop-overview-archived-header"
                            onClick={() => setShowArchived((prev) => !prev)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowArchived((prev) => !prev); } }}
                        >
                            <IonIcon
                                icon={chevronDownOutline}
                                className={`shop-overview-archived-chevron ${showArchived ? 'is-open' : ''}`}
                            />
                            <h2 className="shop-overview-section-title">
                                Archived ({archivedLists.length})
                            </h2>
                        </div>
                        {showArchived && archivedLists.map((list) => (
                            <ListCard key={list.id} listId={list.id} />
                        ))}
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default ShoppingOverview;
