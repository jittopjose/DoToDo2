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
import { useTodoStore } from '../features/todos/store/todoStore';
import './Menu.css';

const Menu: React.FC = () => {
  const location = useLocation();
  const clearCompleted = useTodoStore((state) => state.clearCompleted);
  const activeCount = useTodoStore((state) => state.getActiveCount());
  const completedCount = useTodoStore((state) => state.getCompletedCount());
  const customLists = useTodoStore((state) => state.customLists);
  const addList = useTodoStore((state) => state.addList);
  const [newListName, setNewListName] = useState('');

  const handleAddList = () => {
    const trimmed = newListName.trim();
    if (!trimmed) return;
    addList(trimmed);
    setNewListName('');
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="lists-list">
          <IonListHeader>Lists</IonListHeader>
          <IonMenuToggle autoHide={false}>
            <IonItem className={location.pathname === '/list/All Lists' ? 'selected' : ''} routerLink="/list/All Lists" routerDirection="none" lines="none" detail={false}>
              <IonIcon aria-hidden="true" slot="start" ios={listOutline} md={listSharp} />
              <IonLabel>All Lists</IonLabel>
              {activeCount > 0 && (
                <IonBadge color="primary" slot="end">{activeCount}</IonBadge>
              )}
            </IonItem>
          </IonMenuToggle>

          {customLists.length === 0 && (
            <IonItem lines="none">
              <IonLabel color="medium">No custom lists yet</IonLabel>
            </IonItem>
          )}

          {customLists.map((list, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem
                className={location.pathname === `/list/${encodeURIComponent(list)}` ? 'selected' : ''}
                routerLink={`/list/${encodeURIComponent(list)}`}
                routerDirection="none"
                lines="none"
                detail={false}
              >
                <IonIcon aria-hidden="true" slot="start" ios={folderOpenOutline} md={folderOpenOutline} />
                <IonLabel>{list}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}

          <IonItem lines="none">
            <IonInput
              value={newListName}
              placeholder="New list name"
              onIonInput={(e) => setNewListName(e.detail.value!)}
            />
            <IonButton fill="clear" slot="end" onClick={handleAddList}>
              <IonIcon icon={addOutline} />
            </IonButton>
          </IonItem>

          <IonItem lines="none" button onClick={clearCompleted}>
            <IonIcon aria-hidden="true" slot="start" icon={trashOutline} />
            <IonLabel>Clear Completed</IonLabel>
            {completedCount > 0 && (
              <IonBadge color="medium" slot="end">{completedCount}</IonBadge>
            )}
          </IonItem>
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;