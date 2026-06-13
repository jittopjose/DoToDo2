import { IonButton, IonButtons, IonCard, IonCardContent, IonCardTitle, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonMenuButton, IonNote, IonPage, IonRow, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react';
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
  const getFilteredTodos = useTodoStore((state) => state.getFilteredTodos);

  const listTodos = getFilteredTodos(list);
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
        <IonGrid className="page-grid">
          <IonRow className="progress-row">
            <IonCol>
              <IonCard className={`panel-card progress-panel ${shouldShowSearch ? 'progress-panel--search-open' : ''}`}>
                <IonCardContent className="progress-content">
                  <IonGrid className="progress-grid">
                    <IonRow className="progress-main">
                      <IonCol size="auto" className="progress-ring-col">
                        <IonNote className="progress-ring" style={progressStyle} aria-label={`${progressPercent}% complete`}>
                          <span>{progressPercent}%</span>
                        </IonNote>
                      </IonCol>
                      <IonCol className="progress-copy">
                        <IonNote className="focus-eyebrow">Daily progress</IonNote>
                        <IonCardTitle className="progress-title">{completedTasks} of {totalTasks} done</IonCardTitle>
                        <IonNote className="progress-subtitle">{focusSubtitle}</IonNote>
                      </IonCol>
                      <IonCol size="auto" className="progress-actions">
                        <IonButton className={`progress-search-button ${shouldShowSearch ? 'progress-search-button--active' : ''}`} fill="clear" onClick={shouldShowSearch ? closeSearch : openSearch} aria-label={shouldShowSearch ? 'Close search' : 'Search todos'}>
                          <IonIcon icon={shouldShowSearch ? closeOutline : searchOutline} />
                        </IonButton>
                      </IonCol>
                    </IonRow>
                    <IonGrid className={`progress-search-grid ${shouldShowSearch ? 'progress-search-grid--open' : ''}`}>
                      <IonRow>
                        <IonCol>
                          <IonSearchbar
                            ref={searchbarRef}
                            disabled={!shouldShowSearch}
                            value={searchTerm || ''}
                            onIonInput={(e) => setSearchTerm(e.detail.value || '')}
                            onIonCancel={closeSearch}
                            placeholder="Search todos..."
                            aria-label="Search todos"
                          />
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          <IonRow className="composer-row">
            <IonCol>
              <TodoInput list={list} />
            </IonCol>
          </IonRow>
          <IonRow className="list-row">
            <IonCol>
              <TodoList list={list} />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Page;
