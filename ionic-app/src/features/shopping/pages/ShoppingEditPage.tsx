import React, { useCallback, useEffect, useState } from 'react';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonPage,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { arrowBackOutline, trashOutline } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useDoTodoStore, selectEntryById } from '../../shared/store/doTodoStore';
import './ShoppingEditPage.css';

const ShoppingEditPage: React.FC = () => {
    const history = useHistory();
    const { id } = useParams<{ id: string }>();
    const item = useDoTodoStore(selectEntryById(id));
    const updateEntry = useDoTodoStore((state) => state.updateEntry);
    const deleteEntry = useDoTodoStore((state) => state.deleteEntry);
    const [title, setTitle] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState('');

    useEffect(() => {
        if (!item) return;
        setTitle(item.title);
        setQuantity(item.quantity ?? 1);
        setPrice(item.price ? item.price.toFixed(2) : '');
    }, [item, item?.id, item?.title, item?.quantity, item?.price]);

    const goBack = useCallback(() => {
        history.goBack();
    }, [history]);

    const handleSave = useCallback(() => {
        if (!item || !title.trim()) return;
        updateEntry(item.id, {
            title: title.trim(),
            quantity: Math.max(1, quantity),
            price: price ? parseFloat(price) : undefined,
        });
        goBack();
    }, [item, title, quantity, price, updateEntry, goBack]);

    const handleDelete = useCallback(() => {
        if (!item) return;
        deleteEntry(item.id);
        goBack();
    }, [item, deleteEntry, goBack]);

    if (!item) {
        return (
            <IonPage>
                <IonContent className="ion-padding">
                    <p>Item not found.</p>
                    <IonButton onClick={goBack}>Go back</IonButton>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton icon={arrowBackOutline} text="Back" />
                    </IonButtons>
                    <IonTitle>Edit Item</IonTitle>
                    <IonButtons slot="end">
                        <IonButton color="danger" onClick={handleDelete}>
                            <IonIcon icon={trashOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonGrid className="ion-padding">
                    <IonList>
                        <IonItem>
                            <IonLabel position="stacked">Name</IonLabel>
                            <IonInput
                                value={title}
                                onIonInput={(e) => setTitle(e.detail.value || '')}
                                placeholder="Item name"
                            />
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Quantity</IonLabel>
                            <IonInput
                                type="number"
                                value={quantity}
                                onIonInput={(e) => setQuantity(parseInt(e.detail.value || '1', 10) || 1)}
                                min={1}
                            />
                        </IonItem>
                        <IonItem>
                            <IonLabel position="stacked">Price</IonLabel>
                            <IonInput
                                type="number"
                                value={price}
                                onIonInput={(e) => setPrice(e.detail.value || '')}
                                placeholder="0.00"
                            />
                        </IonItem>
                    </IonList>
                    <IonButton expand="block" className="ion-margin-top" onClick={handleSave}>
                        Save
                    </IonButton>
                </IonGrid>
            </IonContent>
        </IonPage>
    );
};

export default ShoppingEditPage;
