import { IonButton, IonCard, IonCardContent, IonCardTitle, IonCol, IonContent, IonGrid, IonIcon, IonNote, IonPage, IonRow, IonSearchbar } from '@ionic/react';
import { closeOutline, searchOutline } from 'ionicons/icons';
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

    if (hour < 21) {
        return 'Good evening';
    }

    return 'Good night';
};

const typeFilterButtons = [
    { label: 'Task', value: 'todo' },
    { label: 'Shop', value: 'shopping' },
    { label: 'Note', value: 'note' },
    { label: 'Check', value: 'checklist' },
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

    const totalTasks = listTodos.length;
    const completedTasks = listTodos.reduce((count, todo) => count + (todo.isCompleted ? 1 : 0), 0);
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
            <p className="greeting-subtitle">Let's get things done!</p>
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
          <IonRow className="type-filter-row">
            <IonCol>
              <IonGrid className="type-filter-grid" onClick={handleTypeFilterSelectClick}>
                <IonRow className="type-filter-row-scroll">
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
                        <span className="type-filter-label">{button.label}</span>
                      </IonButton>
                    );
                  })}
                </IonRow>
              </IonGrid>
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
