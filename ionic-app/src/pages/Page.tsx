import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonMenuButton, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react';
import { closeOutline, searchOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useParams } from 'react-router';
import { useTodoStore } from '../features/todos/store/todoStore';
import { TodoInput } from '../features/todos/components/TodoInput';
import { TodoList } from '../features/todos/components/TodoList';
import './Page.css';

type SearchbarHandle = HTMLIonSearchbarElement;

const Page: React.FC = () => {

  const { name } = useParams<{ name: string; }>();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchbarRef = useRef<SearchbarHandle | null>(null);
  const list = name || 'All Lists';
  const searchTerm = useTodoStore((state) => state.searchTerm);
  const setSearchTerm = useTodoStore((state) => state.setSearchTerm);
  const clearCompleted = useTodoStore((state) => state.clearCompleted);
  const todos = useTodoStore((state) => state.todos);

  const listTodos = todos.filter((t) => t.list === list);
  const totalTasks = listTodos.length;
  const completedTasks = listTodos.filter((t) => t.isCompleted).length;
  const remainingTasks = totalTasks - completedTasks;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const progressPercent = Math.round(progress * 100);
  const focusSubtitle = totalTasks === 0
    ? 'Start with one small step'
    : remainingTasks === 0
      ? 'Everything is complete'
      : `${remainingTasks} task${remainingTasks > 1 ? 's' : ''} left`;
  const progressStyle: CSSProperties & { '--progress-value': string } = {
    '--progress-value': `${progressPercent}%`
  };
  const shouldShowSearch = isSearchOpen || searchTerm !== '';

  useEffect(() => {
    if (!isSearchOpen) return;
    const frame = requestAnimationFrame(() => searchbarRef.current?.setFocus());
    return () => cancelAnimationFrame(frame);
  }, [isSearchOpen]);

  const openSearch = () => {
    setIsSearchOpen(true);
  };

  const closeSearch = () => {
    setSearchTerm('');
    setIsSearchOpen(false);
  };

  return (
    <IonPage>
      <IonHeader className="page-header">
        <IonToolbar className="top-toolbar">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle className="page-title">{list}</IonTitle>
          <IonButtons slot="end">
            <IonButton className="clear-button" disabled={completedTasks === 0} onClick={clearCompleted}>
              Clear completed
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <div className="header-panel">
          <div className={`panel-card progress-panel ${shouldShowSearch ? 'progress-panel--search-open' : ''}`}>
            <div className="progress-main">
              <div className="progress-ring" style={progressStyle} aria-label={`${progressPercent}% complete`}>
                <span>{progressPercent}%</span>
              </div>
              <div className="progress-copy">
                <span className="focus-eyebrow">Daily progress</span>
                <strong>{completedTasks} of {totalTasks} done</strong>
                <small>{focusSubtitle}</small>
              </div>
            </div>
            <div className="progress-actions">
              <IonButton className={`progress-search-button ${shouldShowSearch ? 'progress-search-button--active' : ''}`} fill="clear" onClick={shouldShowSearch ? closeSearch : openSearch} aria-label={shouldShowSearch ? 'Close search' : 'Search todos'}>
                <IonIcon icon={shouldShowSearch ? closeOutline : searchOutline} />
              </IonButton>
            </div>
            <div className="progress-search-shell">
              <IonSearchbar
                ref={searchbarRef}
                disabled={!shouldShowSearch}
                value={searchTerm || ''}
                onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                onIonCancel={closeSearch}
                placeholder="Search todos..."
                aria-label="Search todos"
              />
            </div>
          </div>
        </div>
        <TodoInput list={list} />
        <TodoList list={list} />
      </IonContent>
    </IonPage>
  );
};

export default Page;
