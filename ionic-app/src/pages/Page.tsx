import { IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonSearchbar, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import { useTodoStore } from '../features/todos/store/todoStore';
import { TodoInput } from '../features/todos/components/TodoInput';
import { TodoList } from '../features/todos/components/TodoList';
import './Page.css';

const Page: React.FC = () => {

  const { name } = useParams<{ name: string; }>();
  const searchTerm = useTodoStore((state) => state.searchTerm);
  const setSearchTerm = useTodoStore((state) => state.setSearchTerm);
  const clearCompleted = useTodoStore((state) => state.clearCompleted);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={clearCompleted}>Clear Completed</IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar 
            value={searchTerm || ''}
            onIonInput={(e) => setSearchTerm(e.detail.value || '')}
            placeholder="Search todos..." 
          />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">{name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <TodoInput />
        <TodoList />
      </IonContent>
    </IonPage>
  );
};

export default Page;