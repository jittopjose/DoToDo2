import React, { memo, useCallback, useEffect, useState } from 'react';
import {
    IonButton,
    IonCheckbox,
    IonChip,
    IonIcon,
    IonInput,
    IonItem,
} from '@ionic/react';
import { cartOutline, chevronDownOutline, trashOutline } from 'ionicons/icons';
import type { ShoppingItem as ShoppingItemType } from '../../shared/types';
import './ShoppingItem.css';

interface ShoppingItemProps {
    item: ShoppingItemType;
    isEditing: boolean;
    onToggle: () => void;
    onStartEdit: () => void;
    onSave: (updates: Partial<Pick<ShoppingItemType, 'title' | 'quantity' | 'price'>>) => void;
    onDelete: () => void;
    onCancel: () => void;
}

export const ShoppingItem: React.FC<ShoppingItemProps> = memo(({
    item,
    isEditing,
    onToggle,
    onStartEdit,
    onSave,
    onDelete,
    onCancel,
}) => {
    const [editTitle, setEditTitle] = useState(item.title);
    const [editQty, setEditQty] = useState(item.quantity ?? 1);
    const [editPrice, setEditPrice] = useState(item.price ? item.price.toFixed(2) : '');

    useEffect(() => {
        setEditTitle(item.title);
        setEditQty(item.quantity ?? 1);
        setEditPrice(item.price ? item.price.toFixed(2) : '');
    }, [item.title, item.quantity, item.price]);

    const handleSummaryClick = useCallback(() => {
        if (isEditing) {
            onCancel();
        } else {
            setEditTitle(item.title);
            setEditQty(item.quantity ?? 1);
            setEditPrice(item.price ? item.price.toFixed(2) : '');
            onStartEdit();
        }
    }, [isEditing, item, onCancel, onStartEdit]);

    const handleSave = useCallback(() => {
        if (!editTitle.trim()) return;
        onSave({
            title: editTitle.trim(),
            quantity: Math.max(1, editQty),
            price: editPrice ? parseFloat(editPrice) : undefined,
        });
    }, [editTitle, editQty, editPrice, onSave]);

    const handleQtyDec = useCallback(() => {
        setEditQty((prev) => Math.max(1, prev - 1));
    }, []);

    const handleQtyInc = useCallback(() => {
        setEditQty((prev) => Math.min(999, prev + 1));
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        }
        if (e.key === 'Escape') {
            onCancel();
        }
    }, [handleSave, onCancel]);

    return (
        <div className={`shop-item-wrap ${item.isCompleted ? 'is-completed' : ''} ${isEditing ? 'is-editing' : ''}`}>
            <IonItem
                className="shop-item-summary"
                lines="none"
                button
                detail={false}
                onClick={handleSummaryClick}
                aria-label={`${item.title}${item.quantity ? `, quantity ${item.quantity}` : ''}`}
            >
                <IonCheckbox
                    checked={item.isCompleted}
                    onIonChange={onToggle}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Mark "${item.title}" as ${item.isCompleted ? 'incomplete' : 'complete'}`}
                />
                <IonIcon
                    icon={cartOutline}
                    className="shop-item-icon"
                />
                <div className="shop-item-body">
                    <span className="shop-item-name">{item.title}</span>
                    <div className="shop-item-meta">
                        {item.quantity && item.quantity > 0 && (
                            <IonChip className="shop-item-qty">×{item.quantity}</IonChip>
                        )}
                        {item.price && (
                            <IonChip className="shop-item-price">${item.price.toFixed(2)}</IonChip>
                        )}
                    </div>
                </div>
                <IonIcon
                    icon={chevronDownOutline}
                    className={`shop-item-chevron ${isEditing ? 'is-open' : ''}`}
                />
            </IonItem>

            <div className={`shop-item-editor-collapse ${isEditing ? 'is-open' : ''}`}>
                <div className="shop-item-editor" onKeyDown={handleKeyDown}>
                    <div className="shop-editor-field">
                        <IonInput
                            className="shop-editor-name"
                            value={editTitle}
                            onIonInput={(e) => setEditTitle(e.detail.value ?? '')}
                            placeholder="Item name"
                            aria-label="Item name"
                        />
                    </div>
                    <div className="shop-editor-row">
                        <div className="shop-editor-qty">
                            <span className="shop-editor-label">Qty</span>
                            <div className="shop-qty-stepper">
                                <IonButton
                                    className="shop-qty-btn"
                                    fill="clear"
                                    onClick={handleQtyDec}
                                    disabled={editQty <= 1}
                                    aria-label="Decrease quantity"
                                >−</IonButton>
                                <span className="shop-qty-value">{editQty}</span>
                                <IonButton
                                    className="shop-qty-btn"
                                    fill="clear"
                                    onClick={handleQtyInc}
                                    disabled={editQty >= 999}
                                    aria-label="Increase quantity"
                                >+</IonButton>
                            </div>
                        </div>
                        <div className="shop-editor-price">
                            <span className="shop-editor-label">Price</span>
                            <div className="shop-price-input-wrap">
                                <span className="shop-price-currency">$</span>
                                <IonInput
                                    className="shop-price-input"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editPrice}
                                    placeholder="0.00"
                                    onIonInput={(e) => setEditPrice(e.detail.value ?? '')}
                                    aria-label="Price"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="shop-editor-actions">
                        <IonButton
                            className="shop-editor-save-btn"
                            size="small"
                            onClick={handleSave}
                            disabled={!editTitle.trim()}
                        >
                            Save
                        </IonButton>
                        <IonButton
                            className="shop-editor-delete-btn"
                            size="small"
                            fill="clear"
                            color="danger"
                            onClick={onDelete}
                        >
                            <IonIcon icon={trashOutline} slot="start" />
                            Delete
                        </IonButton>
                    </div>
                </div>
            </div>
        </div>
    );
});
