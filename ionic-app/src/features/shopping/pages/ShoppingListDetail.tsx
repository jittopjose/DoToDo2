import React, { useCallback, useState } from 'react';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { addOutline, archiveOutline, cartOutline, chevronDownOutline } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectShoppingListItems, selectShoppingListSummary } from '../../shared/store/doTodoStore';
import { ShoppingItem } from '../components/ShoppingItem';
import './ShoppingListDetail.css';

const ShoppingListDetail: React.FC = () => {
    const history = useHistory();
    const { listId } = useParams<{ listId: string }>();
    const entry = useDoTodoStore((state) => state.entries[listId]);
    const items = useDoTodoStore(useShallow(selectShoppingListItems(listId)));
    const summary = useDoTodoStore(useShallow(selectShoppingListSummary(listId)));
    const addShoppingItem = useDoTodoStore((state) => state.addShoppingItem);
    const toggleShoppingItem = useDoTodoStore((state) => state.toggleShoppingItem);
    const updateShoppingItem = useDoTodoStore((state) => state.updateShoppingItem);
    const removeShoppingItem = useDoTodoStore((state) => state.removeShoppingItem);
    const archiveShoppingList = useDoTodoStore((state) => state.archiveShoppingList);

    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [newItemText, setNewItemText] = useState('');
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemPrice, setNewItemPrice] = useState('');
    const [showMore, setShowMore] = useState(false);

    const handleAddItem = useCallback(() => {
        const trimmed = newItemText.trim();
        if (!trimmed) return;
        addShoppingItem(
            listId,
            trimmed,
            showMore ? Math.max(1, newItemQty) : undefined,
            showMore && newItemPrice ? parseFloat(newItemPrice) : undefined,
        );
        setNewItemText('');
        setNewItemQty(1);
        setNewItemPrice('');
    }, [newItemText, newItemQty, newItemPrice, showMore, listId, addShoppingItem]);

    const handleAddKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddItem();
        }
    }, [handleAddItem]);

    const handleQtyDec = useCallback(() => {
        setNewItemQty((prev) => Math.max(1, prev - 1));
    }, []);

    const handleQtyInc = useCallback(() => {
        setNewItemQty((prev) => Math.min(999, prev + 1));
    }, []);

    const handleArchive = useCallback(() => {
        archiveShoppingList(listId);
        history.goBack();
    }, [listId, archiveShoppingList, history]);

    if (!entry) {
        return (
            <IonPage>
                <IonContent className="ion-padding">
                    <p>Shopping list not found.</p>
                    <IonButton onClick={() => history.push('/shopping')}>Go back</IonButton>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/shopping" text="Lists" />
                    </IonButtons>
                    <IonTitle>{entry.title}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleArchive} aria-label={entry.isArchived ? 'Unarchive list' : 'Archive list'}>
                            <IonIcon icon={archiveOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="shop-detail-content">
                <div className="shop-detail-total-row">
                    <IonCard className="shop-detail-total-card">
                        <IonCardContent className="shop-detail-total-content">
                            <IonIcon icon={cartOutline} className="shop-detail-total-icon" />
                            <span className="shop-detail-total-label">Total</span>
                            <span className="shop-detail-total-value">${summary.total.toFixed(2)}</span>
                        </IonCardContent>
                    </IonCard>
                </div>

                <div className="shop-detail-composer">
                    <div className="shop-detail-composer-main">
                        <IonInput
                            className="shop-detail-composer-input"
                            value={newItemText}
                            placeholder="What to buy?"
                            onIonInput={(e) => setNewItemText(e.detail.value ?? '')}
                            onKeyDown={handleAddKeyDown}
                            aria-label="Item name"
                        />
                        <IonButton
                            className="shop-detail-composer-add-btn"
                            onClick={handleAddItem}
                            disabled={!newItemText.trim()}
                            aria-label="Add item"
                        >
                            <IonIcon icon={addOutline} />
                        </IonButton>
                    </div>
                    <div className="shop-detail-composer-more-toggle" onClick={() => setShowMore((prev) => !prev)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowMore((prev) => !prev); } }}>
                        <IonIcon icon={chevronDownOutline} className={`shop-detail-composer-chevron ${showMore ? 'is-open' : ''}`} />
                        <span className="shop-detail-composer-more-text">Add qty & price</span>
                    </div>
                    {showMore && (
                        <div className="shop-detail-composer-extras">
                            <div className="shop-qty-stepper">
                                <IonButton className="shop-qty-btn" fill="clear" onClick={handleQtyDec} disabled={newItemQty <= 1} aria-label="Decrease quantity">−</IonButton>
                                <span className="shop-qty-value">{newItemQty}</span>
                                <IonButton className="shop-qty-btn" fill="clear" onClick={handleQtyInc} disabled={newItemQty >= 999} aria-label="Increase quantity">+</IonButton>
                            </div>
                            <div className="shop-price-input-wrap">
                                <span className="shop-price-currency">$</span>
                                <IonInput
                                    className="shop-price-input"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={newItemPrice}
                                    placeholder="0.00"
                                    onIonInput={(e) => setNewItemPrice(e.detail.value ?? '')}
                                    aria-label="Price"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="shop-detail-empty">
                        <p className="shop-detail-empty-text">
                            No items yet — add your first item above.
                        </p>
                    </div>
                ) : (
                    <IonList className="shop-detail-list" lines="none">
                        {items.map((item) => (
                            <ShoppingItem
                                key={item.id}
                                item={item}
                                isEditing={editingItemId === item.id}
                                onToggle={() => toggleShoppingItem(listId, item.id)}
                                onStartEdit={() => setEditingItemId(item.id)}
                                onSave={(updates) => {
                                    updateShoppingItem(listId, item.id, updates);
                                    setEditingItemId(null);
                                }}
                                onDelete={() => {
                                    removeShoppingItem(listId, item.id);
                                    setEditingItemId(null);
                                }}
                                onCancel={() => setEditingItemId(null)}
                            />
                        ))}
                    </IonList>
                )}
            </IonContent>
        </IonPage>
    );
};

export default ShoppingListDetail;
