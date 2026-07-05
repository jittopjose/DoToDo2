import {
  IonBadge,
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
} from '@ionic/react';

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { addOutline, folderOpenOutline, listOutline, listSharp, trashOutline } from 'ionicons/icons';
import { useDoTodoStore, selectActiveCount, selectCompletedCount } from '../features/shared/store/doTodoStore';
import './Menu.css';

const Menu: React.FC = () => {
  const location = useLocation();
  const clearCompleted = useDoTodoStore((state) => state.clearCompleted);
  const activeCount = useDoTodoStore(selectActiveCount);
  const completedCount = useDoTodoStore(selectCompletedCount);
  const customLists = useDoTodoStore((state) => state.customLists);
  const addList = useDoTodoStore((state) => state.addList);
  const [newListName, setNewListName] = useState('');

  const handleAddList = () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;
    addList(trimmed);
    setNewListName('');
  };

  return (
    <IonMenu className="app-menu" contentId="main" type="overlay">
      <IonContent className="menu-content">
        <div className="menu-brand">
          <div className="menu-mark">✓</div>
          <div>
            <strong>dotodo2</strong>
            <span>{activeCount} open task{activeCount === 1 ? '' : 's'}</span>
          </div>
        </div>

        <IonList id="lists-list" className="menu-list">
          <IonListHeader className="menu-section-title">Lists</IonListHeader>
          <IonMenuToggle autoHide={false}>
            <IonItem className={`menu-item ${location.pathname === '/list/All Lists' ? 'is-selected' : ''}`} routerLink="/list/All Lists" routerDirection="none" lines="none" detail={false}>
              <IonIcon aria-hidden="true" slot="start" ios={listOutline} md={listSharp} />
              <IonLabel>All Lists</IonLabel>
              {activeCount > 0 && (
                <IonBadge className="menu-badge" color="primary" slot="end">{activeCount}</IonBadge>
              )}
            </IonItem>
          </IonMenuToggle>

          {customLists.length === 0 && (
            <IonItem lines="none" className="menu-empty">
              <IonLabel color="medium">No custom lists yet</IonLabel>
            </IonItem>
          )}

          {customLists.map((list, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem
                className={`menu-item ${location.pathname === `/list/${encodeURIComponent(list)}` ? 'is-selected' : ''}`}
                routerLink={`/list/${encodeURIComponent(list)}`}
                routerDirection="none"
                lines="none"
                detail={false}
              >
                <IonIcon aria-hidden="true" slot="start" icon={folderOpenOutline} />
                <IonLabel>{list}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}

          <IonItem lines="none" className="menu-create-row">
            <IonInput
              className="menu-list-input"
              value={newListName}
              placeholder="New list name"
              onIonInput={(e) => setNewListName(e.detail.value!)}
            />
            <IonButton className="menu-add-button" fill="clear" slot="end" onClick={handleAddList} aria-label="Add list">
              <IonIcon icon={addOutline} />
            </IonButton>
          </IonItem>

          <IonItem lines="none" className="menu-clear-row" button onClick={clearCompleted}>
            <IonIcon aria-hidden="true" slot="start" icon={trashOutline} />
            <IonLabel>Clear Completed</IonLabel>
            {completedCount > 0 && (
              <IonBadge className="menu-badge menu-badge-muted" color="medium" slot="end">{completedCount}</IonBadge>
            )}
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
