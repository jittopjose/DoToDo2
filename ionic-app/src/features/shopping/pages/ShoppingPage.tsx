import React, { useCallback, useMemo, useState } from 'react';
import { IonCard, IonCardContent, IonContent, IonIcon, IonPage, IonSearchbar } from '@ionic/react';
import { cartOutline } from 'ionicons/icons';
import { useParams } from 'react-router';
import { useDoTodoStore } from '../../shared/store/doTodoStore';
import { ShoppingInput } from '../components/ShoppingInput';
import { ShoppingList } from '../components/ShoppingList';
import './ShoppingPage.css';

const ShoppingPage: React.FC = () => {
    const { name } = useParams<{ name: string }>();
    const list = name || 'all-lists';
    const [searchTerm, setSearchTerm] = useState('');

    const total = useDoTodoStore((state) =>
        state.entryIds.reduce((sum, id) => {
            const e = state.entries[id];
            if (e.itemType === 'shopping' && e.list === list) {
                return sum + (e.price || 0) * (e.quantity || 1);
            }
            return sum;
        }, 0)
    );
    const displayTotal = useMemo(() => total.toFixed(2), [total]);

    const handleSearchInput = useCallback((e: CustomEvent) => {
        setSearchTerm(e.detail.value || '');
    }, []);

    return (
        <IonPage>
            <IonContent className="shop-page-content">
                <div className="shop-greeting">
                    <div className="shop-greeting-copy">
                        <h1 className="shop-greeting-title">Shopping List</h1>
                        <p className="shop-greeting-subtitle">What do you need to buy?</p>
                    </div>
                    <IonIcon icon={cartOutline} className="shop-greeting-icon" />
                </div>

                <div className="shop-search-row">
                    <IonSearchbar
                        value={searchTerm}
                        onIonInput={handleSearchInput}
                        placeholder="Search shopping list…"
                        aria-label="Search shopping list"
                    />
                </div>

                <div className="shop-total-row">
                    <IonCard className="shop-total-card">
                        <IonCardContent className="shop-total-content">
                            <IonIcon icon={cartOutline} className="shop-total-icon" />
                            <span className="shop-total-label">Total</span>
                            <span className="shop-total-value">${displayTotal}</span>
                        </IonCardContent>
                    </IonCard>
                </div>

                <div className="shop-input-row">
                    <ShoppingInput list={list} />
                </div>

                <div className="shop-list-row">
                    <ShoppingList list={list} searchTerm={searchTerm} />
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ShoppingPage;
