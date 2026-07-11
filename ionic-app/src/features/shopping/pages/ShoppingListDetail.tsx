import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { addOutline, archiveOutline, cart, cartOutline, checkmarkCircleOutline, chevronDownOutline, chevronUpOutline, scanOutline } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectShoppingListItems, selectShoppingListSummary } from '../../shared/store/doTodoStore';
import { useSettingsStore } from '../../settings/store/settingsStore';
import { formatPrice, getCurrencySymbol } from '../../shared/utils/formatPrice';
import { ShoppingItem } from '../components/ShoppingItem';
import ScannerOverlay from '../components/ScannerOverlay';
import { isNativeBarcodeScanAvailable, lookupProduct, scanBarcode } from '../../../services/barcode.service';
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

    const currency = useSettingsStore((state) => state.currency);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [newItemText, setNewItemText] = useState('');
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemPrice, setNewItemPrice] = useState('');
    const [showMore, setShowMore] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [isScanningNative, setIsScanningNative] = useState(false);
    const [storeMode, setStoreMode] = useState(false);
    const [showChecked, setShowChecked] = useState(false);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const handleToggleStoreMode = useCallback(() => {
        setStoreMode((prev) => !prev);
        if (!storeMode) {
            setShowChecked(false);
            setEditingItemId(null);
        }
    }, [storeMode]);

    useEffect(() => {
        if (storeMode) {
            navigator.wakeLock.request('screen').then((sentinel) => {
                wakeLockRef.current = sentinel;
            }).catch(() => {});
        } else {
            wakeLockRef.current?.release().catch(() => {});
            wakeLockRef.current = null;
        }
        return () => {
            wakeLockRef.current?.release().catch(() => {});
            wakeLockRef.current = null;
        };
    }, [storeMode]);

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

    const handleScanResult = useCallback(async (barcode: string | null) => {
        setIsScanningNative(false);
        if (!barcode) return;
        const product = await lookupProduct(barcode);
        setNewItemText(product?.productName ?? barcode);
    }, []);

    const handleScanClick = useCallback(async () => {
        if (isNativeBarcodeScanAvailable()) {
            setIsScanningNative(true);
            const barcode = await scanBarcode();
            handleScanResult(barcode);
        } else {
            setScannerOpen(true);
        }
    }, [handleScanResult]);

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
                    <IonTitle>{storeMode ? `${items.filter((i) => !i.isCompleted).length} items` : entry.title}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleToggleStoreMode} aria-label={storeMode ? 'Exit shopping mode' : 'Enter shopping mode'}>
                            <IonIcon icon={storeMode ? cart : cartOutline} />
                        </IonButton>
                        <IonButton onClick={handleArchive} aria-label={entry.isArchived ? 'Unarchive list' : 'Archive list'}>
                            <IonIcon icon={archiveOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className={`shop-detail-content ${storeMode ? 'shop-detail-store-mode' : ''}`}>
                {!storeMode && (
                    <>
                        <div className="shop-detail-total-row">
                            <IonCard className="shop-detail-total-card">
                                <IonCardContent className="shop-detail-total-content">
                                    <IonIcon icon={cartOutline} className="shop-detail-total-icon" />
                                    <div className="shop-detail-total-body">
                                        <div className="shop-detail-total-top">
                                            <span className="shop-detail-total-label">Total</span>
                                            <span className="shop-detail-total-value">{formatPrice(summary.total, currency)}</span>
                                        </div>
                                        <span className="shop-detail-total-sublabel">
                                            <IonIcon icon={checkmarkCircleOutline} style={{ verticalAlign: 'middle', marginRight: 3, fontSize: 12 }} />
                                            {items.filter((i) => i.isCompleted).length} of {items.length} items
                                        </span>
                                    </div>
                                </IonCardContent>
                            </IonCard>
                        </div>

                        <IonCard className="shop-detail-composer">
                            <IonCardContent className="shop-detail-composer-inner">
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
                                        className="shop-detail-composer-scan-btn"
                                        onClick={handleScanClick}
                                        disabled={isScanningNative}
                                        aria-label="Scan barcode"
                                    >
                                        <IonIcon icon={scanOutline} style={{ fontSize: 24 }} />
                                    </IonButton>
                                    <IonButton
                                        className="shop-detail-composer-add-btn"
                                        onClick={handleAddItem}
                                        disabled={!newItemText.trim()}
                                        aria-label="Add item"
                                    >
                                        <IonIcon icon={addOutline} style={{ fontSize: 24 }} />
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
                                            <span className="shop-price-currency">{getCurrencySymbol(currency)}</span>
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
                            </IonCardContent>
                        </IonCard>
                    </>
                )}

                {items.length === 0 ? (
                    <div className="shop-detail-empty">
                        <p className="shop-detail-empty-text">
                            No items yet — add your first item above.
                        </p>
                    </div>
                ) : storeMode ? (
                    <>
                        <IonList className="shop-detail-list" lines="none">
                            {items.filter((i) => !i.isCompleted).map((item, idx) => (
                                <ShoppingItem
                                    key={item.id}
                                    item={item}
                                    index={idx}
                                    storeMode
                                    isEditing={false}
                                    onToggle={() => toggleShoppingItem(listId, item.id)}
                                    onStartEdit={() => {}}
                                    onSave={() => {}}
                                    onDelete={() => {}}
                                    onCancel={() => {}}
                                />
                            ))}
                        </IonList>
                        {items.some((i) => i.isCompleted) && (
                            <>
                                <div
                                    className="shop-detail-checked-toggle"
                                    onClick={() => setShowChecked((prev) => !prev)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowChecked((prev) => !prev); } }}
                                >
                                    <IonIcon icon={showChecked ? chevronDownOutline : chevronUpOutline} className="shop-detail-checked-chevron" />
                                    <span>Show checked ({items.filter((i) => i.isCompleted).length})</span>
                                </div>
                                {showChecked && (
                                    <IonList className="shop-detail-list" lines="none">
                                        {items.filter((i) => i.isCompleted).map((item, idx) => (
                                            <ShoppingItem
                                                key={item.id}
                                                item={item}
                                                index={idx}
                                                storeMode
                                                isEditing={false}
                                                onToggle={() => toggleShoppingItem(listId, item.id)}
                                                onStartEdit={() => {}}
                                                onSave={() => {}}
                                                onDelete={() => {}}
                                                onCancel={() => {}}
                                            />
                                        ))}
                                    </IonList>
                                )}
                            </>
                        )}
                    </>
                ) : (
                    <IonList className="shop-detail-list" lines="none">
                        {items.map((item, idx) => (
                            <ShoppingItem
                                key={item.id}
                                item={item}
                                index={idx}
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

                {isScanningNative && (
                    <div className="shop-detail-native-scanning">
                        <p>Opening scanner…</p>
                    </div>
                )}

                <ScannerOverlay
                    isOpen={scannerOpen}
                    onScanResult={(barcode) => {
                        setScannerOpen(false);
                        handleScanResult(barcode);
                    }}
                    onDismiss={() => setScannerOpen(false)}
                />
            </IonContent>
        </IonPage>
    );
};

export default ShoppingListDetail;
