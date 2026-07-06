import React, { useMemo } from 'react';
import { IonCard, IonCardContent, IonCardTitle, IonIcon, IonList, IonNote } from '@ionic/react';
import { cartOutline } from 'ionicons/icons';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore } from '../../shared/store/doTodoStore';
import { DoTodo } from '../../shared/types';
import { ShoppingItem } from './ShoppingItem';
import './ShoppingList.css';

interface ShoppingListProps {
    list: string;
    searchTerm: string;
}

const selectShoppingEntries = (list: string) => (state: { entries: Record<string, DoTodo>; entryIds: string[] }) =>
    state.entryIds
        .filter((id) => state.entries[id].itemType === 'shopping' && state.entries[id].list === list)
        .map((id) => state.entries[id]);

export const ShoppingList: React.FC<ShoppingListProps> = ({ list, searchTerm }) => {
    const entries = useDoTodoStore(useShallow(selectShoppingEntries(list)));

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return entries;
        const term = searchTerm.toLowerCase();
        return entries.filter((e) => e.title.toLowerCase().includes(term));
    }, [entries, searchTerm]);

    if (filtered.length === 0) {
        return (
            <IonCard className="shop-empty-card">
                <IonCardContent className="shop-empty-content">
                    <div className="shop-empty-illustration">
                        <IonIcon icon={cartOutline} />
                    </div>
                    <IonCardTitle className="shop-empty-title">
                        {entries.length === 0 ? 'Shopping list empty' : 'No matches'}
                    </IonCardTitle>
                    <IonNote className="shop-empty-copy">
                        {entries.length === 0
                            ? 'Add items above to get started'
                            : `No results for "${searchTerm}"`
                        }
                    </IonNote>
                </IonCardContent>
            </IonCard>
        );
    }

    return (
        <IonList className="shop-list" lines="none">
            {filtered.map((item) => (
                <ShoppingItem key={item.id} item={item} />
            ))}
        </IonList>
    );
};
