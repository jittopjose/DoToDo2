import React, { useState } from 'react';
import { IonButton, IonIcon, IonInput, IonLabel, IonPopover, IonSegment, IonSegmentButton, IonTextarea, IonDatetime } from '@ionic/react';
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
        <div className="composer-card">
            <div className="composer-top-row">
                <IonSegment value={itemType} onIonChange={(e) => setItemType(e.detail.value as TodoItemType)} className="type-segment">
                    <IonSegmentButton value="todo" className="type-pill">
                        <IonIcon icon={listOutline} />
                        <IonLabel>Task</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="shopping" className="type-pill">
                        <IonIcon icon={cartOutline} />
                        <IonLabel>Shop</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="note" className="type-pill">
                        <IonIcon icon={documentTextOutline} />
                        <IonLabel>Note</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="checklist" className="type-pill">
                        <IonIcon icon={checkmarkDoneOutline} />
                        <IonLabel>Check</IonLabel>
                    </IonSegmentButton>
                </IonSegment>
                <div className="composer-actions">
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
                </div>
            </div>
            <div className="composer-input-row">
                <IonInput
                    className="composer-title-input"
                    value={text}
                    placeholder={titlePlaceholders[itemType]}
                    onIonInput={(e) => setText(e.detail.value ?? '')}
                    onKeyUp={handleKeyPress}
                />
                {dueDate && (
                    <span className="due-chip">
                        {formatDate(dueDate)}
                    </span>
                )}
                <IonButton className="composer-add-button" onClick={handleAdd} disabled={!text.trim()}>
                    <IonIcon icon={addOutline} />
                </IonButton>
            </div>
            {(itemType === 'note' || itemType === 'todo' || itemType === 'shopping') && (
                <div className="composer-section">
                    <label className="composer-section-label">Details</label>
                    <IonTextarea
                        className="composer-textarea"
                        value={description}
                        placeholder={itemType === 'note' ? 'Note body...' : 'Add details...'}
                        onIonInput={(e) => setDescription(e.detail.value ?? '')}
                        rows={3}
                    />
                </div>
            )}
            {itemType === 'shopping' && (
                <div className="composer-section shopping-grid">
                    <div className="composer-field">
                        <label className="composer-section-label">Quantity</label>
                        <IonInput
                            className="composer-input"
                            type="number"
                            value={quantity}
                            onIonInput={(e) => setQuantity(e.detail.value ?? '')}
                        />
                    </div>
                    <div className="composer-field">
                        <label className="composer-section-label">Price</label>
                        <IonInput
                            className="composer-input"
                            type="number"
                            value={price}
                            onIonInput={(e) => setPrice(e.detail.value ?? '')}
                        />
                    </div>
                </div>
            )}
            {itemType === 'checklist' && (
                <>
                    <div className="composer-section checklist-row">
                        <div className="composer-field">
                            <label className="composer-section-label">Subtasks</label>
                            <IonInput
                                className="composer-input"
                                value={checklistText}
                                placeholder="Checklist item"
                                onIonInput={(e) => setChecklistText(e.detail.value ?? '')}
                                onKeyUp={(e) => { if (e.key === 'Enter') handleAddChecklistItem(); }}
                            />
                        </div>
                        <IonButton className="checklist-add-button" fill="clear" onClick={handleAddChecklistItem}>
                            Add
                        </IonButton>
                    </div>
                    {subtasks.length > 0 && (
                        <div className="composer-section checklist-preview">
                            <div className="checklist-preview-list">
                                {subtasks.map((subtask, index) => (
                                    <div className="checklist-chip" key={subtask.id}>
                                        <span>{subtask.title}</span>
                                        <IonButton fill="clear" size="small" onClick={() => setSubtasks(prev => prev.filter((_, i) => i !== index))} aria-label={`Remove ${subtask.title}`}>
                                            Remove
                                        </IonButton>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
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
        </div>
    );
};
