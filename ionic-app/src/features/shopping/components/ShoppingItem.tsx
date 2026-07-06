import React, { memo, useCallback } from 'react';
import { IonCheckbox, IonChip, IonIcon, IonItem } from '@ionic/react';
import { cartOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { DoTodo } from '../../shared/types';
import { useDoTodoStore } from '../../shared/store/doTodoStore';
import './ShoppingItem.css';

interface ShoppingItemProps {
    item: DoTodo;
}

export const ShoppingItem: React.FC<ShoppingItemProps> = memo(({ item }) => {
    const toggleEntry = useDoTodoStore((state) => state.toggleEntry);
    const history = useHistory();

    const handleToggle = useCallback(() => {
        toggleEntry(item.id);
    }, [item.id, toggleEntry]);

    const handleClick = useCallback(() => {
        history.push(`/shopping/${encodeURIComponent(item.id)}/edit`);
    }, [history, item.id]);

    return (
        <IonItem
            className={`shop-item ${item.isCompleted ? 'is-completed' : ''}`}
            lines="none"
            button
            detail={false}
            onClick={handleClick}
            aria-label={`${item.title}${item.quantity ? `, quantity ${item.quantity}` : ''}`}
        >
            <IonCheckbox
                checked={item.isCompleted}
                onIonChange={handleToggle}
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
                        <IonChip className="shop-item-qty">
                            ×{item.quantity}
                        </IonChip>
                    )}
                    {item.price && (
                        <IonChip className="shop-item-price">
                            ${item.price.toFixed(2)}
                        </IonChip>
                    )}
                </div>
            </div>
        </IonItem>
    );
});
