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
  IonNote,
} from '@ionic/react';

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { addOutline, archiveOutline, archiveSharp, bookmarkOutline, folderOpenOutline, heartOutline, heartSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import { useTodoStore } from '../features/todos/store/todoStore';
import './Menu.css';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Inbox',
    url: '/folder/Inbox',
    iosIcon: mailOutline,
    mdIcon: mailSharp
  },
  {
    title: 'Outbox',
    url: '/folder/Outbox',
    iosIcon: paperPlaneOutline,
    mdIcon: paperPlaneSharp
  },
  {
    title: 'Favorites',
    url: '/folder/Favorites',
    iosIcon: heartOutline,
    mdIcon: heartSharp
  },
  {
    title: 'Archived',
    url: '/folder/Archived',
    iosIcon: archiveOutline,
    mdIcon: archiveSharp
  },
  {
    title: 'Trash',
    url: '/folder/Trash',
    iosIcon: trashOutline,
    mdIcon: trashSharp
  },
  {
    title: 'Spam',
    url: '/folder/Spam',
    iosIcon: warningOutline,
    mdIcon: warningSharp
  }
];

const labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

const Menu: React.FC = () => {
  const location = useLocation();
  const clearCompleted = useTodoStore((state) => state.clearCompleted);
  const activeCount = useTodoStore((state) => state.getActiveCount());
  const completedCount = useTodoStore((state) => state.getCompletedCount());
  const customFolders = useTodoStore((state) => state.customFolders);
  const addFolder = useTodoStore((state) => state.addFolder);
  const [newFolderName, setNewFolderName] = useState('');

  const handleAddFolder = () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    addFolder(trimmed);
    setNewFolderName('');
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Inbox</IonListHeader>
          <IonNote>hi@ionicframework.com</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                  {appPage.title === 'Inbox' && activeCount > 0 && (
                    <IonBadge color="primary" slot="end">{activeCount}</IonBadge>
                  )}
                </IonItem>
              </IonMenuToggle>
            );
          })}
          <IonItem lines="none" button onClick={clearCompleted}>
            <IonIcon aria-hidden="true" slot="start" icon={trashOutline} />
            <IonLabel>Clear Completed</IonLabel>
            {completedCount > 0 && (
              <IonBadge color="medium" slot="end">{completedCount}</IonBadge>
            )}
          </IonItem>
        </IonList>

        <IonList id="custom-folders-list">
          <IonListHeader>Custom Folders</IonListHeader>
          {customFolders.length === 0 && (
            <IonItem lines="none">
              <IonLabel color="medium">No custom folders yet</IonLabel>
            </IonItem>
          )}
          {customFolders.map((folder, index) => (
            <IonMenuToggle key={index} autoHide={false}>
              <IonItem
                className={location.pathname === `/folder/${encodeURIComponent(folder)}` ? 'selected' : ''}
                routerLink={`/folder/${encodeURIComponent(folder)}`}
                routerDirection="none"
                lines="none"
                detail={false}
              >
                <IonIcon aria-hidden="true" slot="start" ios={folderOpenOutline} md={folderOpenOutline} />
                <IonLabel>{folder}</IonLabel>
              </IonItem>
            </IonMenuToggle>
          ))}
          <IonItem lines="none">
            <IonInput
              value={newFolderName}
              placeholder="New folder name"
              onIonInput={(e) => setNewFolderName(e.detail.value!)}
            />
            <IonButton fill="clear" slot="end" onClick={handleAddFolder}>
              <IonIcon icon={addOutline} />
            </IonButton>
          </IonItem>
        </IonList>

        <IonList id="labels-list">
          <IonListHeader>Labels</IonListHeader>
          {labels.map((label, index) => (
            <IonItem lines="none" key={index}>
              <IonIcon aria-hidden="true" slot="start" icon={bookmarkOutline} />
              <IonLabel>{label}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;