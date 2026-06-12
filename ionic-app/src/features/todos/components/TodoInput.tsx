import React, { useState } from 'react';
import { IonButton, IonIcon, IonInput, IonItem, IonLabel, IonPopover, IonSegment, IonSegmentButton, IonTextarea, IonDatetime } from '@ionic/react';
import { addOutline, calendarOutline, ellipse, listOutline, documentTextOutline, cartOutline, checkmarkDoneOutline } from 'ionicons/icons';
import { useTodoStore } from '../store/todoStore';

const priorityColors = {
    low: 'var(--ion-color-success)',
    medium: 'var(--ion-color-warning)',
    high: 'var(--ion-color-danger)'
};

export const TodoInput: React.FC<{ list: string }> = ({ list }) => {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState<string>('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>(undefined);
    const [itemType, setItemType] = useState<'todo' | 'shopping' | 'note' | 'checklist'>('todo');
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
        <>
            <IonItem>
                <IonSegment value={itemType} onIonChange={(e) => setItemType(e.detail.value as any)}>
                    <IonSegmentButton value="todo">
                        <IonIcon icon={listOutline} />
                    </IonSegmentButton>
                    <IonSegmentButton value="shopping">
                        <IonIcon icon={cartOutline} />
                    </IonSegmentButton>
                    <IonSegmentButton value="note">
                        <IonIcon icon={documentTextOutline} />
                    </IonSegmentButton>
                    <IonSegmentButton value="checklist">
                        <IonIcon icon={checkmarkDoneOutline} />
                    </IonSegmentButton>
                </IonSegment>
            </IonItem>
            <IonItem>
                <IonButton
                    fill={dueDate ? "solid" : "clear"}
                    color={dueDate ? "primary" : undefined}
                    slot="start"
                    onClick={() => setShowDatePicker(true)}
                >
                    <IonIcon icon={calendarOutline} />
                </IonButton>
                <IonButton
                    fill={priority ? "solid" : "clear"}
                    color={priority ? (priority === 'low' ? 'success' : priority === 'medium' ? 'warning' : 'danger') : undefined}
                    slot="start"
                    onClick={handlePriorityClick}
                >
                    <IonIcon icon={ellipse} />
                </IonButton>
                <IonInput
                    value={text}
                    placeholder={titlePlaceholders[itemType]}
                    onIonInput={e => setText(e.detail.value!)}
                    onKeyUp={handleKeyPress}
                />
                {dueDate && (
                    <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--ion-color-primary)' }}>
                        {formatDate(dueDate)}
                    </span>
                )}
                <IonButton slot="end" onClick={handleAdd}>
                    <IonIcon icon={addOutline} />
                </IonButton>
            </IonItem>
            {(itemType === 'note' || itemType === 'todo' || itemType === 'shopping') && (
                <IonItem>
                    <IonLabel position="stacked">Details</IonLabel>
                    <IonTextarea
                        value={description}
                        placeholder={itemType === 'note' ? 'Note body...' : 'Add details...'}
                        onIonInput={(e) => setDescription(e.detail.value!)}
                    />
                </IonItem>
            )}
            {itemType === 'shopping' && (
                <IonItem>
                    <IonLabel position="stacked">Quantity</IonLabel>
                    <IonInput
                        type="number"
                        value={quantity}
                        onIonInput={(e) => setQuantity(e.detail.value!)}
                    />
                    <IonLabel position="stacked" style={{ marginLeft: '16px' }}>Price</IonLabel>
                    <IonInput
                        type="number"
                        value={price}
                        onIonInput={(e) => setPrice(e.detail.value!)}
                    />
                </IonItem>
            )}
            {itemType === 'checklist' && (
                <>
                    <IonItem>
                        <IonLabel position="stacked">Subtasks (enter one below)</IonLabel>
                        <IonInput
                            value={checklistText}
                            placeholder="Checklist item"
                            onIonInput={(e) => setChecklistText(e.detail.value!)}
                            onKeyUp={(e) => { if (e.key === 'Enter') handleAddChecklistItem(); }}
                        />
                        <IonButton fill="clear" slot="end" onClick={handleAddChecklistItem}>
                            Add
                        </IonButton>
                    </IonItem>
                    {subtasks.length > 0 && (
                        <IonItem>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '4px', padding: '4px 0' }}>
                                {subtasks.map((subtask, index) => (
                                    <div key={subtask.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                        <span style={{ flex: 1 }}>{subtask.title}</span>
                                        <IonButton fill="clear" size="small" onClick={() => setSubtasks(prev => prev.filter((_, i) => i !== index))} aria-label={`Remove ${subtask.title}`}>
                                            Remove
                                        </IonButton>
                                    </div>
                                ))}
                            </div>
                        </IonItem>
                    )}
                </>
            )}
            <IonPopover
                isOpen={showDatePicker}
                onDidDismiss={() => setShowDatePicker(false)}
            >
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
        </>
    );
};