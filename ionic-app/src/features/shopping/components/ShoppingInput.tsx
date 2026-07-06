import React, { useCallback, useState } from 'react';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCol,
    IonGrid,
    IonIcon,
    IonInput,
    IonRow,
} from '@ionic/react';
import { addOutline, barcodeOutline } from 'ionicons/icons';
import { useDoTodoStore } from '../../shared/store/doTodoStore';
import './ShoppingInput.css';

interface ShoppingInputProps {
    list: string;
}

export const ShoppingInput: React.FC<ShoppingInputProps> = ({ list }) => {
    const [text, setText] = useState('');
    const [quantity, setQuantity] = useState(1);
    const addEntry = useDoTodoStore((state) => state.addEntry);

    const handleAdd = useCallback(() => {
        const trimmed = text.trim();
        if (!trimmed) return;
        addEntry(trimmed, 'shopping', undefined, undefined, undefined, quantity, undefined, undefined, list);
        setText('');
        setQuantity(1);
    }, [text, quantity, addEntry, list]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    }, [handleAdd]);

    const handleQuantityDecrement = useCallback(() => {
        setQuantity((prev) => Math.max(1, prev - 1));
    }, []);

    const handleQuantityIncrement = useCallback(() => {
        setQuantity((prev) => Math.min(999, prev + 1));
    }, []);

    return (
        <IonCard className="shop-composer-card">
            <IonCardContent className="shop-composer-content">
                <IonGrid className="shop-composer-grid">
                    <IonRow className="shop-composer-row">
                        <IonCol className="shop-composer-input-col">
                            <IonInput
                                className="shop-composer-title-input"
                                value={text}
                                placeholder="What to buy?"
                                onIonInput={(e) => setText(e.detail.value ?? '')}
                                onKeyUp={handleKeyPress}
                                aria-label="Item name"
                            />
                        </IonCol>
                    </IonRow>
                    <IonRow className="shop-composer-actions-row">
                        <IonCol className="shop-composer-qty-col">
                            <div className="shop-qty-stepper">
                                <IonButton
                                    className="shop-qty-btn"
                                    fill="clear"
                                    onClick={handleQuantityDecrement}
                                    disabled={quantity <= 1}
                                    aria-label="Decrease quantity"
                                >
                                    −
                                </IonButton>
                                <span className="shop-qty-value">{quantity}</span>
                                <IonButton
                                    className="shop-qty-btn"
                                    fill="clear"
                                    onClick={handleQuantityIncrement}
                                    disabled={quantity >= 999}
                                    aria-label="Increase quantity"
                                >
                                    +
                                </IonButton>
                            </div>
                        </IonCol>
                        <IonCol className="shop-composer-actions-col">
                            <IonButton
                                className="shop-composer-scan-btn"
                                fill="clear"
                                disabled
                                aria-label="Scan barcode (coming soon)"
                            >
                                <IonIcon icon={barcodeOutline} />
                            </IonButton>
                            <IonButton
                                className="shop-composer-add-btn"
                                fill="clear"
                                onClick={handleAdd}
                                disabled={!text.trim()}
                                aria-label="Add item"
                            >
                                <IonIcon icon={addOutline} />
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonCardContent>
        </IonCard>
    );
};
