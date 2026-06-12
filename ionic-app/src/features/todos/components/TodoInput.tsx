import React, { useState } from 'react';
import { IonButton, IonCard, IonCardContent, IonCol, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonNote, IonPopover, IonRow, IonSegment, IonSegmentButton, IonTextarea, IonDatetime } from '@ionic/react';
import { addOutline, calendarOutline, ellipse, listOutline, documentTextOutline, cartOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { useTodoStore } from '../store/todoStore';
import './TodoInput.css';

type TodoItemType = 'todo' | 'shopping' | 'note' | 'checklist';

export const TodoInput: React.FC<{ list: string }> = ({ list }) => {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState<string>('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
    const [itemType, setItemType] = useState<TodoItemType>('todo');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState<string>('1');
    const [price, setPrice] = useState<string>('');
    const [checklistText, setChecklistText] = useState('');
    const [subtasks, setSubtasks] = useState<Array<{ id: string; title: string; isCompleted: boolean }>>([]);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const addTodo = useTodoStore((state) => state.addTodo);

    const titlePlaceholders = {
        todo: `What needs to be done in ${list}?`,
        shopping: 'What should you buy?',
        note: 'Enter note title',
        checklist: 'Enter checklist title',
    } as const;

    const handleAdd = () => {
        if (text.trim().length === 0) return;
        const dueDateTime = dueDate ? new Date(dueDate).getTime() : undefined;
        const quantityValue = quantity ? Number(quantity) : undefined;
        const priceValue = price ? Number(price) : undefined;
        const subtasksValue = itemType === 'checklist' && subtasks.length > 0 ? subtasks : undefined;
        addTodo(text, itemType, description || undefined, dueDateTime, priority, quantityValue, priceValue, subtasksValue, list);
        setText('');
        setDueDate('');
        setPriority(undefined);
        setDescription('');
        setQuantity('1');
        setPrice('');
        setChecklistText('');
        setSubtasks([]);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    const handlePriorityClick = () => {
        const levels: Array<'low' | 'medium' | 'high' | undefined> = ['low', 'medium', 'high', undefined];
        const currentIndex = levels.indexOf(priority);
        const nextPriority = levels[(currentIndex + 1) % levels.length];
        setPriority(nextPriority);
    };

    const handleAddChecklistItem = () => {
        const trimmed = checklistText.trim();
        if (!trimmed) return;
        setSubtasks((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, title: trimmed, isCompleted: false }]);
        setChecklistText('');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        const datePart = d.toLocaleDateString();
        const hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        const timePart = `${hour12}:${minutes} ${ampm}`;
        return `${datePart}, ${timePart}`;
    };

    return (
        <IonCard className="composer-card">
            <IonCardContent className="ion-padding composer-content">
                <IonGrid className="composer-top-row">
                    <IonRow>
                        <IonCol>
                            <IonSegment value={itemType} onIonChange={(e) => setItemType(e.detail.value as TodoItemType)} className="type-segment">
                                <IonSegmentButton value="todo" className="type-pill" layout="icon-top">
                                    <IonIcon icon={listOutline} />
                                    <IonLabel>Task</IonLabel>
                                </IonSegmentButton>
                                <IonSegmentButton value="shopping" className="type-pill" layout="icon-top">
                                    <IonIcon icon={cartOutline} />
                                    <IonLabel>Shop</IonLabel>
                                </IonSegmentButton>
                                <IonSegmentButton value="note" className="type-pill" layout="icon-top">
                                    <IonIcon icon={documentTextOutline} />
                                    <IonLabel>Note</IonLabel>
                                </IonSegmentButton>
                                <IonSegmentButton value="checklist" className="type-pill" layout="icon-top">
                                    <IonIcon icon={checkmarkDoneOutline} />
                                    <IonLabel>Check</IonLabel>
                                </IonSegmentButton>
                            </IonSegment>
                        </IonCol>
                        <IonCol size="auto" className="composer-actions">
                            <IonButton
                                className="composer-action date-action"
                                fill={dueDate ? "solid" : "clear"}
                                color={dueDate ? "primary" : undefined}
                                onClick={() => setShowDatePicker(true)}
                                aria-label="Choose due date"
                            >
                                <IonIcon icon={calendarOutline} />
                            </IonButton>
                            <IonButton
                                className={`composer-action priority-action ${priority ? `priority-action--${priority}` : ''}`}
                                fill={priority ? "solid" : "clear"}
                                color={priority ? (priority === 'low' ? 'success' : priority === 'medium' ? 'warning' : 'danger') : undefined}
                                onClick={handlePriorityClick}
                                aria-label="Choose priority"
                            >
                                <IonIcon icon={ellipse} />
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <IonItem className="composer-input-row" lines="none">
                    <IonInput
                        className="composer-title-input"
                        slot="start"
                        value={text}
                        placeholder={titlePlaceholders[itemType]}
                        onIonInput={(e) => setText(e.detail.value ?? '')}
                        onKeyUp={handleKeyPress}
                    />
                    {dueDate && (
                        <IonNote className="due-chip" slot="end">
                            {formatDate(dueDate)}
                        </IonNote>
                    )}
                    <IonButton className="composer-add-button" slot="end" onClick={handleAdd} disabled={!text.trim()}>
                        <IonIcon icon={addOutline} />
                    </IonButton>
                </IonItem>

                {(itemType === 'note' || itemType === 'todo' || itemType === 'shopping') && (
                    <IonGrid className="composer-section">
                        <IonRow>
                            <IonCol>
                                <IonNote className="composer-section-label">Details</IonNote>
                                <IonTextarea
                                    className="composer-textarea"
                                    value={description}
                                    placeholder={itemType === 'note' ? 'Note body...' : 'Add details...'}
                                    onIonInput={(e) => setDescription(e.detail.value ?? '')}
                                    rows={3}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                )}

                {itemType === 'shopping' && (
                    <IonGrid className="composer-section shopping-grid">
                        <IonRow>
                            <IonCol className="composer-field">
                                <IonNote className="composer-section-label">Quantity</IonNote>
                                <IonInput
                                    className="composer-input"
                                    type="number"
                                    value={quantity}
                                    onIonInput={(e) => setQuantity(e.detail.value ?? '')}
                                />
                            </IonCol>
                            <IonCol className="composer-field">
                                <IonNote className="composer-section-label">Price</IonNote>
                                <IonInput
                                    className="composer-input"
                                    type="number"
                                    value={price}
                                    onIonInput={(e) => setPrice(e.detail.value ?? '')}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                )}

                {itemType === 'checklist' && (
                    <IonGrid className="composer-section checklist-row">
                        <IonRow>
                            <IonCol className="composer-field">
                                <IonNote className="composer-section-label">Subtasks</IonNote>
                                {!checklistText.trim() && <IonNote className="composer-placeholder">Add subtask...</IonNote>}
                                <IonInput
                                    className="composer-input"
                                    value={checklistText}
                                    onIonInput={(e) => setChecklistText(e.detail.value ?? '')}
                                    onKeyUp={(e) => { if (e.key === 'Enter') handleAddChecklistItem(); }}
                                    aria-label="Add subtask"
                                />
                            </IonCol>
                            <IonCol size="auto" className="composer-checklist-action">
                                <IonButton className="checklist-add-button" fill="clear" onClick={handleAddChecklistItem}>
                                    Add
                                </IonButton>
                            </IonCol>
                        </IonRow>
                        {subtasks.length > 0 && (
                            <IonRow className="checklist-preview">
                                <IonCol>
                                    <IonGrid className="checklist-preview-list">
                                        <IonRow>
                                            {subtasks.map((subtask, index) => (
                                                <IonCol size="auto" key={subtask.id}>
                                                    <IonNote className="checklist-chip">
                                                        <span>{subtask.title}</span>
                                                        <IonButton fill="clear" size="small" onClick={() => setSubtasks(prev => prev.filter((_, i) => i !== index))} aria-label={`Remove ${subtask.title}`}>
                                                            Remove
                                                        </IonButton>
                                                    </IonNote>
                                                </IonCol>
                                            ))}
                                        </IonRow>
                                    </IonGrid>
                                </IonCol>
                            </IonRow>
                        )}
                    </IonGrid>
                )}

                <IonPopover className="datetime-popover" isOpen={showDatePicker} onDidDismiss={() => setShowDatePicker(false)}>
                    <IonDatetime
                        value={dueDate}
                        onIonChange={e => {
                            const rawValue = e.detail.value;
                            const dateValue = Array.isArray(rawValue) ? rawValue[0] : rawValue;
                            setDueDate(dateValue ?? '');
                            setShowDatePicker(false);
                        }}
                        presentation="date-time"
                        min={new Date().toISOString()}
                    />
                </IonPopover>
            </IonCardContent>
        </IonCard>
    );
};
