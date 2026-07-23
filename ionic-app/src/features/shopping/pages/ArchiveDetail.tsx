import React, { useCallback } from 'react';
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonAlert,
    useIonToast,
} from '@ionic/react';
import { archiveOutline, cartOutline, checkmarkCircleOutline, trashOutline } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import { useDoTodoStore, selectShoppingListSummary } from '../../shared/store/doTodoStore';
import { useSettingsStore } from '../../settings/store/settingsStore';
import { formatPrice } from '../../shared/utils/formatPrice';
import { DEFAULT_CATEGORIES } from '../types';
import './ArchiveDetail.css';

const ArchiveDetail: React.FC = () => {
    const history = useHistory();
    const { listId } = useParams<{ listId: string }>();
    const entry = useDoTodoStore((state) => state.entries[listId]);
    const summary = useDoTodoStore(useShallow(selectShoppingListSummary(listId)));
    const unarchiveShoppingList = useDoTodoStore((state) => state.unarchiveShoppingList);
    const deleteEntry = useDoTodoStore((state) => state.deleteEntry);

    const currency = useSettingsStore((state) => state.currency);
    const [presentToast] = useIonToast();
    const [presentAlert] = useIonAlert();

    const handleUnarchive = useCallback(() => {
        unarchiveShoppingList(listId);
        presentToast({
            message: 'List restored to active',
            duration: 2000,
            color: 'tertiary',
            position: 'bottom',
        });
        history.push('/shopping');
    }, [listId, unarchiveShoppingList, presentToast, history]);

    const handleDelete = useCallback(() => {
        presentAlert({
            header: 'Delete permanently?',
            message: 'This action cannot be undone. All items will be lost.',
            buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                    text: 'Delete',
                    role: 'destructive',
                    handler: () => {
                        deleteEntry(listId);
                        presentToast({
                            message: 'List deleted',
                            duration: 2000,
                            color: 'danger',
                            position: 'bottom',
                        });
                        history.push('/shopping');
                    },
                },
            ],
        });
    }, [listId, deleteEntry, presentToast, history, presentAlert]);

    if (!entry) {
        return (
            <IonPage>
                <IonContent className="ion-padding">
                    <p>Archived list not found.</p>
                    <IonButton onClick={() => history.push('/shopping')}>Go back</IonButton>
                </IonContent>
            </IonPage>
        );
    }

    const items = entry.shoppingItems ?? [];
    const boughtItems = items.filter((i) => i.isCompleted);
    const skippedItems = items.filter((i) => !i.isCompleted);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCategoryLabel = (categoryKey?: string) => {
        if (!categoryKey) return 'Other';
        const cat = DEFAULT_CATEGORIES.find((c) => c.key === categoryKey);
        return cat?.label ?? 'Other';
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/shopping" text="Lists" />
                    </IonButtons>
                    <IonTitle>Archive Detail</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleDelete} aria-label="Delete permanently" color="danger">
                            <IonIcon icon={trashOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="archive-detail-content">
                <div className="archive-detail-header">
                    <h1 className="archive-detail-title">{entry.title}</h1>
                    <p className="archive-detail-date">
                        Archived on {entry.archivedAt ? formatDate(entry.archivedAt) : 'Unknown date'}
                    </p>
                </div>

                <IonCard className="archive-detail-summary-card">
                    <IonCardContent className="archive-detail-summary-content">
                        <div className="archive-detail-summary-row">
                            <div className="archive-detail-summary-stat">
                                <IonIcon icon={cartOutline} className="archive-detail-summary-icon" />
                                <span className="archive-detail-summary-value">{boughtItems.length}</span>
                                <span className="archive-detail-summary-label">bought</span>
                            </div>
                            <div className="archive-detail-summary-stat">
                                <IonIcon icon={checkmarkCircleOutline} className="archive-detail-summary-icon archive-detail-summary-icon--skipped" />
                                <span className="archive-detail-summary-value">{skippedItems.length}</span>
                                <span className="archive-detail-summary-label">skipped</span>
                            </div>
                            <div className="archive-detail-summary-stat">
                                <span className="archive-detail-summary-value">{formatPrice(summary.total, currency)}</span>
                                <span className="archive-detail-summary-label">total</span>
                            </div>
                        </div>
                    </IonCardContent>
                </IonCard>

                <div className="archive-detail-items-section">
                    <h2 className="archive-detail-section-title">Items</h2>
                    {items.length === 0 ? (
                        <p className="archive-detail-empty">No items in this list.</p>
                    ) : (
                        <div className="archive-detail-items-list">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className={`archive-detail-item ${item.isCompleted ? 'archive-detail-item--bought' : 'archive-detail-item--skipped'}`}
                                >
                                    <div className="archive-detail-item-status">
                                        <IonIcon
                                            icon={item.isCompleted ? checkmarkCircleOutline : archiveOutline}
                                            className={`archive-detail-item-icon ${item.isCompleted ? 'archive-detail-item-icon--bought' : 'archive-detail-item-icon--skipped'}`}
                                        />
                                    </div>
                                    <div className="archive-detail-item-body">
                                        <span className="archive-detail-item-title">{item.title}</span>
                                        <span className="archive-detail-item-category">{getCategoryLabel(item.category)}</span>
                                    </div>
                                    <div className="archive-detail-item-meta">
                                        {item.quantity && item.quantity > 1 && (
                                            <IonChip className="archive-detail-item-qty">×{item.quantity}</IonChip>
                                        )}
                                        {item.price !== undefined && (
                                            <span className="archive-detail-item-price">{formatPrice(item.price, currency)}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="archive-detail-actions">
                    <IonButton
                        className="archive-detail-unarchive-btn"
                        expand="block"
                        fill="outline"
                        onClick={handleUnarchive}
                    >
                        <IonIcon icon={archiveOutline} slot="start" />
                        Unarchive List
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ArchiveDetail;
