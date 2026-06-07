import React, { useState } from 'react';
import { IonItem, IonInput, IonButton, IonIcon, IonDatetime, IonPopover } from '@ionic/react';
import { addOutline, calendarOutline } from 'ionicons/icons';
import { useTodoStore } from '../store/todoStore';

export const TodoInput: React.FC = () => {
    const [text, setText] = useState('');
    const [dueDate, setDueDate] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const addTodo = useTodoStore((state) => state.addTodo);

    const handleAdd = () => {
        if (text.trim().length === 0) return;
        const dueDateTime = dueDate ? new Date(dueDate).getTime() : undefined;
        addTodo(text, dueDateTime);
        setText('');
        setDueDate('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
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
                <IonButton
                    fill={dueDate ? "solid" : "clear"}
                    color={dueDate ? "primary" : undefined}
                    slot="start"
                    onClick={() => setShowDatePicker(true)}
                >
                    <IonIcon icon={calendarOutline} />
                </IonButton>
                <IonInput
                    value={text}
                    placeholder="What needs to be done?"
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
            <IonPopover
                isOpen={showDatePicker}
                onDidDismiss={() => setShowDatePicker(false)}
            >
                <IonDatetime
                    value={dueDate}
                    onIonChange={e => { setDueDate(e.detail.value!); setShowDatePicker(false); }}
                    presentation="date-time"
                    min={new Date().toISOString()}
                />
            </IonPopover>
        </>
    );
};
