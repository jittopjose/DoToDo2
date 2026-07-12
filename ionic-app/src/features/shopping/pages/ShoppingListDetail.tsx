import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    IonActionSheet,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonChip,
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonInput,
    IonPage,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { addOutline, archiveOutline, cart, cartOutline, checkmarkCircleOutline, chevronDownOutline, chevronUpOutline, funnelOutline, scanOutline } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectShoppingListItems, selectShoppingListSummary } from '../../shared/store/doTodoStore';
import { useSettingsStore } from '../../settings/store/settingsStore';
import { formatPrice, getCurrencySymbol } from '../../shared/utils/formatPrice';
import { ShoppingItem } from '../components/ShoppingItem';
import { DEFAULT_CATEGORIES } from '../types';
import ScannerOverlay from '../components/ScannerOverlay';
import { isNativeBarcodeScanAvailable, lookupProduct, scanBarcode } from '../../../services/barcode.service';
import { useRecentProductsStore } from '../store/recentProductsStore';
import './ShoppingListDetail.css';

type SortMode = 'custom' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'checked-last' | 'checked-first';

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
    const reorderShoppingItems = useDoTodoStore((state) => state.reorderShoppingItems);
    const archiveShoppingList = useDoTodoStore((state) => state.archiveShoppingList);

    const currency = useSettingsStore((state) => state.currency);
    const [sortMode, setSortMode] = useState<SortMode>('custom');
    const [sortOpen, setSortOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [newItemText, setNewItemText] = useState('');
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemPrice, setNewItemPrice] = useState('');
    const [showMore, setShowMore] = useState(false);
    const [scannerOpen, setScannerOpen] = useState(false);
    const [isScanningNative, setIsScanningNative] = useState(false);
    const [storeMode, setStoreMode] = useState(false);
    const [showChecked, setShowChecked] = useState(false);
    const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
    const [dragging, setDragging] = useState(false);
    const [newItemCategory, setNewItemCategory] = useState<string>('');
    const [inputFocused, setInputFocused] = useState(false);
    const recentProducts = useRecentProductsStore((s) => s.products);
    const recordUsage = useRecentProductsStore((s) => s.recordUsage);
    const filteredRecents = useMemo(() => {
        const lower = newItemText.toLowerCase().trim();
        return lower
            ? recentProducts.filter((p) => p.title.toLowerCase().includes(lower))
            : recentProducts;
    }, [recentProducts, newItemText]);
    const showRecents = inputFocused && filteredRecents.length > 0;
    const dragFromRef = useRef<number | null>(null);
    const dragListRef = useRef<string[]>([]);
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    const handleToggleStoreMode = useCallback(() => {
        setStoreMode((prev) => {
            if (!prev) {
                setShowChecked(false);
                setEditingItemId(null);
                setSortMode('checked-last');
            } else {
                setSortMode('custom');
            }
            return !prev;
        });
    }, []);

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

    const sortedItems = useMemo(() => {
        if (sortMode === 'custom') return items;
        const sorted = [...items];
        switch (sortMode) {
            case 'name-asc':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;
            case 'price-asc':
                sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
                break;
            case 'price-desc':
                sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
                break;
            case 'checked-last':
                sorted.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
                break;
            case 'checked-first':
                sorted.sort((a, b) => Number(b.isCompleted) - Number(a.isCompleted));
                break;
        }
        return sorted;
    }, [items, sortMode]);

    useEffect(() => {
        dragListRef.current = sortedItems.map((i) => i.id);
    }, [sortedItems]);

    const groupedItems = useMemo(() => {
        const groups: Record<string, typeof sortedItems> = {};
        for (const item of sortedItems) {
            const key = item.category && DEFAULT_CATEGORIES.some((c) => c.key === item.category) ? item.category : 'other';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        }
        return DEFAULT_CATEGORIES
            .filter((c) => groups[c.key]?.length > 0)
            .map((c) => ({ key: c.key, category: c, items: groups[c.key] }));
    }, [sortedItems]);

    const handleDragHandlePointerDown = useCallback((e: React.PointerEvent, idx: number) => {
        if (sortMode !== 'custom' || dragging) return;
        e.preventDefault();
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        dragFromRef.current = idx;
        setDragOverIdx(idx);
        setDragging(true);
    }, [sortMode, dragging]);

    useEffect(() => {
        if (!dragging) return;

        const handleMove = (e: PointerEvent) => {
            const el = document.elementFromPoint(e.clientX, e.clientY);
            if (!el) return;
            const wrap = (el as HTMLElement).closest('[data-shop-item-index]');
            if (!wrap) return;
            const targetIdx = parseInt(wrap.getAttribute('data-shop-item-index')!, 10);
            if (isNaN(targetIdx)) return;

            const from = dragFromRef.current;
            if (from === null || from === targetIdx) return;

            const ids = dragListRef.current;
            const newIds = [...ids];
            const [moved] = newIds.splice(from, 1);
            newIds.splice(targetIdx, 0, moved);
            reorderShoppingItems(listId, newIds);
            dragListRef.current = newIds;
            dragFromRef.current = targetIdx;
            setDragOverIdx(targetIdx);
        };

        const handleUp = () => {
            setDragging(false);
            setDragOverIdx(null);
            dragFromRef.current = null;
        };

        document.addEventListener('pointermove', handleMove);
        document.addEventListener('pointerup', handleUp);
        return () => {
            document.removeEventListener('pointermove', handleMove);
            document.removeEventListener('pointerup', handleUp);
        };
    }, [dragging, listId, reorderShoppingItems]);

    const handleAddItem = useCallback(() => {
        const trimmed = newItemText.trim();
        if (!trimmed) return;
        addShoppingItem(
            listId,
            trimmed,
            showMore ? Math.max(1, newItemQty) : undefined,
            showMore && newItemPrice ? parseFloat(newItemPrice) : undefined,
            newItemCategory || undefined,
        );
        recordUsage(trimmed);
        setNewItemText('');
        setNewItemQty(1);
        setNewItemPrice('');
    }, [newItemText, newItemQty, newItemPrice, newItemCategory, showMore, listId, addShoppingItem, recordUsage]);

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
        const name = product?.productName ?? barcode;
        setNewItemText(name);
        if (product?.productName) {
            recordUsage(product.productName);
        }
        if (product?.category) {
            setNewItemCategory(product.category);
        }
    }, [recordUsage]);

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
                        {!storeMode && (
                            <IonButton onClick={() => setSortOpen(true)} aria-label="Sort items" className={sortMode !== 'custom' ? 'shop-header-sort-active' : ''}>
                                <IonIcon icon={funnelOutline} />
                            </IonButton>
                        )}
                        <IonButton onClick={handleArchive} aria-label={entry.isArchived ? 'Unarchive list' : 'Archive list'}>
                            <IonIcon icon={archiveOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonActionSheet
                isOpen={sortOpen}
                onDidDismiss={() => setSortOpen(false)}
                header="Sort items"
                buttons={[
                    { text: sortMode === 'custom' ? '✓ Custom order' : 'Custom order', handler: () => { setSortMode('custom'); return false; } },
                    { text: sortMode === 'name-asc' ? '✓ Name A–Z' : 'Name A–Z', handler: () => { setSortMode('name-asc'); return false; } },
                    { text: sortMode === 'name-desc' ? '✓ Name Z–A' : 'Name Z–A', handler: () => { setSortMode('name-desc'); return false; } },
                    { text: sortMode === 'price-asc' ? '✓ Price: Low to high' : 'Price: Low to high', handler: () => { setSortMode('price-asc'); return false; } },
                    { text: sortMode === 'price-desc' ? '✓ Price: High to low' : 'Price: High to low', handler: () => { setSortMode('price-desc'); return false; } },
                    { text: sortMode === 'checked-last' ? '✓ Unchecked first' : 'Unchecked first', handler: () => { setSortMode('checked-last'); return false; } },
                    { text: sortMode === 'checked-first' ? '✓ Checked first' : 'Checked first', handler: () => { setSortMode('checked-first'); return false; } },
                    { text: 'Cancel', role: 'cancel' },
                ]}
            />

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
                                        onIonFocus={() => setInputFocused(true)}
                                        onIonBlur={() => setInputFocused(false)}
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
                                        <IonSelect
                                            className="shop-composer-category"
                                            value={newItemCategory}
                                            placeholder="Category"
                                            interface="popover"
                                            onIonChange={(e) => setNewItemCategory(e.detail.value)}
                                            aria-label="Category"
                                        >
                                            <IonSelectOption value="">None</IonSelectOption>
                                            {DEFAULT_CATEGORIES.map((cat) => (
                                                <IonSelectOption key={cat.key} value={cat.key}>{cat.label}</IonSelectOption>
                                            ))}
                                        </IonSelect>
                                    </div>
                                )}
                            </IonCardContent>
                        </IonCard>

                        {showRecents && (
                            <div className="shop-recent-row">
                                {filteredRecents.map((p) => (
                                    <IonChip
                                        key={p.title}
                                        className="shop-recent-chip"
                                        onClick={() => setNewItemText(p.title)}
                                    >
                                        {p.title}
                                    </IonChip>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {!storeMode && items.length > 0 && (
                    <IonButton
                        className="shop-detail-start-btn"
                        expand="block"
                        fill="outline"
                        onClick={handleToggleStoreMode}
                        aria-label="Start shopping"
                    >
                        <IonIcon icon={cartOutline} slot="start" />
                        {items.some((i) => i.isCompleted) ? 'Continue shopping' : 'Start shopping'}
                    </IonButton>
                )}

                {items.length === 0 ? (
                    <div className="shop-detail-empty">
                        <p className="shop-detail-empty-text">
                            No items yet — add your first item above.
                        </p>
                    </div>
                ) : storeMode ? (
                    <>
                        {groupedItems.filter((g) => g.items.some((i) => !i.isCompleted)).map((group) => (
                            <React.Fragment key={group.key}>
                                <div className="shop-category-minimal-header">
                                    <span className="shop-category-minimal-label">{group.category.label}</span>
                                </div>
                                {group.items.filter((i) => !i.isCompleted).map((item) => (
                                    <ShoppingItem
                                        key={item.id}
                                        item={item}
                                        storeMode
                                        isEditing={false}
                                        onToggle={() => toggleShoppingItem(listId, item.id)}
                                        onStartEdit={() => {}}
                                        onSave={() => {}}
                                        onDelete={() => {}}
                                        onCancel={() => {}}
                                    />
                                ))}
                            </React.Fragment>
                        ))}
                        {sortedItems.some((i) => i.isCompleted) && (
                            <>
                                <div
                                    className="shop-detail-checked-toggle"
                                    onClick={() => setShowChecked((prev) => !prev)}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowChecked((prev) => !prev); } }}
                                >
                                    <IonIcon icon={showChecked ? chevronDownOutline : chevronUpOutline} className="shop-detail-checked-chevron" />
                                    <span>Show checked ({sortedItems.filter((i) => i.isCompleted).length})</span>
                                </div>
                                {showChecked && (
                                    <>
                                        {groupedItems.filter((g) => g.items.some((i) => i.isCompleted)).map((group) => (
                                            <React.Fragment key={group.key}>
                                                <div className="shop-category-minimal-header">
                                                    <span className="shop-category-minimal-label">{group.category.label}</span>
                                                </div>
                                                {group.items.filter((i) => i.isCompleted).map((item) => (
                                                    <ShoppingItem
                                                        key={item.id}
                                                        item={item}
                                                        storeMode
                                                        isEditing={false}
                                                        onToggle={() => toggleShoppingItem(listId, item.id)}
                                                        onStartEdit={() => {}}
                                                        onSave={() => {}}
                                                        onDelete={() => {}}
                                                        onCancel={() => {}}
                                                    />
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </>
                ) : sortMode === 'custom' ? (
                    <div className="shop-detail-list">
                        {sortedItems.map((item, idx) => (
                            <ShoppingItem
                                key={item.id}
                                item={item}
                                index={idx}
                                showReorder
                                isEditing={editingItemId === item.id}
                                dragOver={dragOverIdx === idx}
                                onDragHandlePointerDown={(e) => handleDragHandlePointerDown(e, idx)}
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
                    </div>
                ) : (
                    <>
                        {groupedItems.map((group) => (
                            <React.Fragment key={group.key}>
                                <div className="shop-category-minimal-header">
                                    <span className="shop-category-minimal-label">{group.category.label}</span>
                                </div>
                                {group.items.map((item) => (
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
                            </React.Fragment>
                        ))}
                    </>
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

            {storeMode && (
                <IonFooter className="shop-detail-footer">
                    <div
                        className="shop-detail-footer-progress"
                        style={{ width: `${items.length > 0 ? (items.filter((i) => i.isCompleted).length / items.length) * 100 : 0}%` }}
                    />
                    <div className="shop-detail-footer-inner">
                        <IonIcon icon={cart} className="shop-detail-footer-icon" />
                        <span className="shop-detail-footer-label">
                            {items.filter((i) => i.isCompleted).length} of {items.length} items
                        </span>
                        <IonButton className="shop-detail-footer-exit-btn" size="small" fill="outline" onClick={handleToggleStoreMode}>
                            Exit
                        </IonButton>
                    </div>
                </IonFooter>
            )}
        </IonPage>
    );
};

export default ShoppingListDetail;
