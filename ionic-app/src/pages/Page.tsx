import { IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonSearchbar, IonTitle, IonToolbar, IonProgressBar, IonLabel, IonText } from '@ionic/react';
import { useParams } from 'react-router';
import { useTodoStore } from '../features/todos/store/todoStore';
import { TodoInput } from '../features/todos/components/TodoInput';
import { TodoList } from '../features/todos/components/TodoList';
import './Page.css';

const Page: React.FC = () => {

  const { name } = useParams<{ name: string; }>();
  const list = name || 'All Lists';
  const searchTerm = useTodoStore((state) => state.searchTerm);
  const setSearchTerm = useTodoStore((state) => state.setSearchTerm);
  const clearCompleted = useTodoStore((state) => state.clearCompleted);
  const todos = useTodoStore((state) => state.todos);
  const filter = useTodoStore((state) => state.filter);

  const listTodos = todos.filter((t) => t.list === list);
  const totalTasks = listTodos.length;
  const completedTasks = listTodos.filter((t) => t.isCompleted).length;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{list}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={clearCompleted}>Clear Completed</IonButton>
          </IonButtons>
        </IonToolbar>
        {totalTasks > 0 && (
          <IonToolbar style={{ minHeight: 'auto', padding: '4px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IonProgressBar value={progress} style={{ flex: 1 }} />
              <IonLabel style={{ fontSize: '12px', color: 'var(--ion-color-medium)', whiteSpace: 'nowrap' }}>
                {completedTasks}/{totalTasks}
              </IonLabel>
            </div>
          </IonToolbar>
        )}
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
            <IonTitle size="large">{list}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <TodoInput list={list} />
        <TodoList list={list} />
      </IonContent>
    </IonPage>
  );
};

export default Page;