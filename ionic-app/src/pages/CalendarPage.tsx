import { IonContent, IonDatetime, IonIcon, IonList, IonPage } from '@ionic/react';
import { calendarNumberOutline } from 'ionicons/icons';
import React, { useMemo, useState } from 'react';
import { TodoItem } from '../features/todos/components/TodoItem';
import { useTodoStore } from '../features/todos/store/todoStore';
import './CalendarPage.css';

const CalendarPage: React.FC = () => {
  const todos = useTodoStore((state) => state.todos);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    return now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
  });

  const dateLabel = useMemo(() => {
    const d = new Date(selectedDate + 'T12:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = d.toDateString() === today.toDateString();
    const isTomorrow = d.toDateString() === tomorrow.toDateString();

    const formatted = d.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    if (isToday) return `Today — ${formatted}`;
    if (isTomorrow) return `Tomorrow — ${formatted}`;
    return formatted;
  }, [selectedDate]);

  const dayStart = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d.getTime();
  }, [selectedDate]);

  const dayEnd = useMemo(() => {
    const d = new Date(selectedDate + 'T23:59:59.999');
    return d.getTime();
  }, [selectedDate]);

  const dayTodos = useMemo(() => {
    return todos.filter((t) =>
      t.dueDate !== undefined &&
      t.dueDate >= dayStart &&
      t.dueDate <= dayEnd
    );
  }, [todos, dayStart, dayEnd]);

  return (
    <IonPage className="calendar-page">
      <IonContent className="calendar-content">
        <div className="calendar-header">
          <h1>Calendar</h1>
        </div>

        <div className="calendar-body">
          <div className="calendar-picker">
            <IonDatetime
              value={selectedDate}
              onIonChange={(e) => {
                const val = e.detail.value;
                if (val && typeof val === 'string') {
                  const datePart = val.split('T')[0];
                  setSelectedDate(datePart);
                }
              }}
              presentation="date"
              preferWheel={false}
              locale="en-US"
            />
          </div>

          <div className="calendar-tasks-section">
            <div className="calendar-tasks-header">
              <IonIcon icon={calendarNumberOutline} />
              <h2>Tasks for {dateLabel}</h2>
            </div>

            {dayTodos.length > 0 ? (
              <IonList lines="none">
                {dayTodos.map((todo) => (
                  <TodoItem key={todo.id} todo={todo} />
                ))}
              </IonList>
            ) : (
              <div className="calendar-tasks-empty">
                <IonIcon icon={calendarNumberOutline} />
                <p>No tasks on this day</p>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CalendarPage;
