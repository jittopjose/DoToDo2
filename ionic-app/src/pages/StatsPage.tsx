import { IonContent, IonIcon, IonPage, IonNote } from '@ionic/react';
import { checkmarkCircleOutline, alertCircleOutline, trendingUpOutline } from 'ionicons/icons';
import React, { useMemo } from 'react';
import { useDoTodoStore } from '../features/shared/store/doTodoStore';
import { formatDueDate } from '../features/shared/utils/formatDueDate';
import type { DoTodo } from '../features/shared/types';
import './StatsPage.css';

interface DayData {
  label: string
  count: number
  isToday: boolean
}

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0);
  d.setMinutes(0, 0, 0);
  return d;
};

const endOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const StatsPage: React.FC = () => {
  const entries = useDoTodoStore((state) => state.entries);
  const entryIds = useDoTodoStore((state) => state.entryIds);

  const stats = useMemo(() => {
    const tasks = entryIds
      .map((id) => entries[id])
      .filter((e): e is DoTodo => e.itemType === 'todo');

    const total = tasks.length;
    const completed = tasks.filter((e) => e.isCompleted).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const now = new Date();
    const todayStart = startOfDay(now).getTime();

    const overdue = tasks
      .filter((e) => !e.isCompleted && e.dueDate !== undefined && e.dueDate < todayStart)
      .sort((a, b) => (a.dueDate ?? 0) - (b.dueDate ?? 0));

    const showMore = overdue.length > 3;

    return { total, completed, rate, overdue, showMore };
  }, [entries, entryIds]);

  const weeklyData = useMemo(() => {
    const now = new Date();
    const days: DayData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = startOfDay(date).getTime();
      const dayEnd = endOfDay(date).getTime();

      const count = entryIds
        .map((id) => entries[id])
        .filter((e) =>
          e.itemType === 'todo'
          && e.completedAt !== undefined
          && e.completedAt >= dayStart
          && e.completedAt <= dayEnd
        ).length;

      days.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
        isToday: i === 0,
      });
    }

    return days;
  }, [entries, entryIds]);

  const maxCount = Math.max(1, ...weeklyData.map((d) => d.count));

  return (
    <IonPage className="stats-page">
      <IonContent className="stats-content">
        <div className="stats-header">
          <h1>Stats</h1>
        </div>

        <div className="stats-body">
          <div className="summary-row">
            <div className="summary-card">
              <IonNote className="summary-label">DONE</IonNote>
              <span className="summary-value">{stats.completed}</span>
              <IonNote className="summary-sub">Completed</IonNote>
              <div className="summary-icon summary-icon--done">
                <IonIcon icon={checkmarkCircleOutline} />
              </div>
            </div>
            <div className="summary-card">
              <IonNote className="summary-label">RATE</IonNote>
              <span className="summary-value">{stats.rate}%</span>
              <IonNote className="summary-sub">Completion</IonNote>
              <div className="summary-icon summary-icon--rate">
                <IonIcon icon={trendingUpOutline} />
              </div>
            </div>
          </div>

          <div className="overdue-section">
            <div className="overdue-header">
              <IonIcon icon={alertCircleOutline} className="overdue-header-icon" />
              <IonNote className="overdue-header-label">
                {stats.overdue.length > 0
                  ? `${stats.overdue.length} task${stats.overdue.length !== 1 ? 's' : ''} past due`
                  : 'All caught up'}
              </IonNote>
            </div>
            {stats.overdue.length > 0 && (
              <div className="overdue-list">
                {stats.overdue.slice(0, 3).map((task) => (
                  <div key={task.id} className="overdue-item">
                    <span className="overdue-item-title">{task.title}</span>
                    <IonNote className="overdue-item-date">{formatDueDate(task.dueDate!)}</IonNote>
                  </div>
                ))}
                {stats.showMore && (
                  <IonNote className="overdue-more">+{stats.overdue.length - 3} more</IonNote>
                )}
              </div>
            )}
          </div>

          <div className="chart-section">
            <div className="chart-header">
              <span className="chart-title">Weekly Activity</span>
              <IonNote className="chart-badge">LAST 7 DAYS</IonNote>
            </div>
            <div className="chart-bars">
              {weeklyData.map((day) => (
                <div key={day.label} className="chart-bar-col">
                  <div className="chart-bar-track">
                    <div
                      className={`chart-bar ${day.isToday ? 'chart-bar--today' : ''}`}
                      style={{ height: `${(day.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className={`chart-bar-label ${day.isToday ? 'chart-bar-label--today' : ''}`}>
                    {day.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default StatsPage;
