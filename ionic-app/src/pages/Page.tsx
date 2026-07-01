import { IonButton, IonCard, IonCardContent, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonNote, IonPage, IonRow, IonSearchbar } from '@ionic/react';
import {
    cartOutline,
    checkmarkDoneOutline,
    closeOutline,
    documentTextOutline,
    listOutline,
    searchOutline,
} from 'ionicons/icons';
import React, { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useParams } from 'react-router';
import { useTodoStore } from '../features/todos/store/todoStore';
import { TodoTypeFilter } from '../features/todos/types';
import { TodoInput } from '../features/todos/components/TodoInput';
import { TodoList } from '../features/todos/components/TodoList';
import './Page.css';

type SearchbarHandle = HTMLIonSearchbarElement;

const getGreeting = (date = new Date()) => {
    const hour = date.getHours();

    if (hour < 12) {
        return 'Good morning';
    }

    if (hour < 17) {
        return 'Good afternoon';
    }

    return 'Good evening';
};

const typeFilterButtons = [
    { label: 'Task', value: 'todo', icon: listOutline },
    { label: 'Shop', value: 'shopping', icon: cartOutline },
    { label: 'Note', value: 'note', icon: documentTextOutline },
    { label: 'Check', value: 'checklist', icon: checkmarkDoneOutline },
] as const;

const Page: React.FC = () => {

    const { name } = useParams<{ name: string; }>();
    const [greeting] = useState(() => getGreeting());
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchbarRef = useRef<SearchbarHandle | null>(null);
    const list = name || 'All Lists';
    const searchTerm = useTodoStore((state) => state.searchTerm);
    const setSearchTerm = useTodoStore((state) => state.setSearchTerm);
    const setTypeFilter = useTodoStore((state) => state.setTypeFilter);
    const todos = useTodoStore((state) => state.todos);
    const filter = useTodoStore((state) => state.filter);
    const typeFilter = useTodoStore((state) => state.typeFilter) || 'all';
    const normalizedSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const listTodos = useMemo(() => {
        let filtered = todos.filter((t: typeof todos[0]) => t.list === list);

        if (typeFilter && typeFilter !== 'all') {
            filtered = filtered.filter((t: typeof todos[0]) => t.itemType === typeFilter);
        }

        if (normalizedSearchTerm) {
            filtered = filtered.filter((t: typeof todos[0]) =>
                t.title.toLowerCase().includes(normalizedSearchTerm) ||
                (t.description && t.description.toLowerCase().includes(normalizedSearchTerm))
            );
        }

        switch (filter) {
            case 'active':
                return filtered.filter((t: typeof todos[0]) => !t.isCompleted);
            case 'completed':
                return filtered.filter((t: typeof todos[0]) => t.isCompleted);
            default:
                return filtered;
        }
    }, [todos, list, typeFilter, normalizedSearchTerm, filter]);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    const todayStartTs = todayStart.getTime();
    const todayEndTs = todayEnd.getTime();

    const dueTodayTodos = listTodos.filter(t =>
        t.dueDate !== undefined && t.dueDate >= todayStartTs && t.dueDate <= todayEndTs
    );

    const denominator = dueTodayTodos.length;
    const numerator = dueTodayTodos.filter(t => t.isCompleted).length;
    const progress = denominator > 0 ? numerator / denominator : 1;
    const progressPercent = Math.round(progress * 100);
    const remainingToday = denominator - numerator;
    const focusSubtitle = listTodos.length === 0
        ? 'Your notebook is waiting'
        : remainingToday <= 0
            ? 'All tasks up to date'
            : `${remainingToday} task${remainingToday > 1 ? 's' : ''} left today`;
    const progressStyle: CSSProperties & { '--progress-value': string } = {
        '--progress-value': `${progressPercent}%`
    };
    const shouldShowSearch = isSearchOpen || searchTerm !== '';

    const handleSearchInput = useCallback((e: CustomEvent) => {
        setSearchTerm(e.detail.value || '');
    }, [setSearchTerm]);

    useEffect(() => {
        if (!isSearchOpen) return;
        const frame = requestAnimationFrame(() => searchbarRef.current?.setFocus());
        return () => cancelAnimationFrame(frame);
    }, [isSearchOpen]);

    const openSearch = useCallback(() => {
        setIsSearchOpen(true);
    }, []);

    const closeSearch = useCallback(() => {
        setSearchTerm('');
        setIsSearchOpen(false);
    }, [setSearchTerm]);

    const handleTypeFilterSelect = useCallback((nextTypeFilter: TodoTypeFilter) => {
        setTypeFilter(typeFilter === nextTypeFilter ? 'all' : nextTypeFilter);
        setSearchTerm('');
    }, [setSearchTerm, setTypeFilter, typeFilter]);

    const handleTypeFilterSelectClick = useCallback((event: React.MouseEvent) => {
        const target = event.target as HTMLElement | null;
        const button = target?.closest<HTMLIonButtonElement>('.type-filter-button');
        const value = button?.dataset.typeFilter as TodoTypeFilter | undefined;

        if (!value) return;

        handleTypeFilterSelect(value);
    }, [handleTypeFilterSelect]);

  return (
    <IonPage>
      <IonContent className="page-content">
        <div className="greeting-section">
          <div className="greeting-copy">
            <h1 className="greeting-title">{greeting}</h1>
            <p className="greeting-subtitle">What's on your notebook today?</p>
          </div>
        </div>

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
                        <IonCardTitle className="progress-title">{numerator} of {denominator} done</IonCardTitle>
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
                            onIonInput={handleSearchInput}
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
          <div className="type-filter-row" onClick={handleTypeFilterSelectClick}>
            <div className="type-filter-row-scroll">
              {typeFilterButtons.map((button) => {
                const isActive = typeFilter === button.value;

                return (
                  <IonButton
                    key={button.value}
                    className={`type-filter-button type-filter-button--${button.value} ${isActive ? 'is-active' : ''}`}
                    fill="clear"
                    data-type-filter={button.value}
                    aria-pressed={isActive}
                  >
                    <IonIcon icon={button.icon} className="type-filter-icon" />
                    <span className="type-filter-label">{button.label}</span>
                  </IonButton>
                );
              })}
            </div>
          </div>
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
