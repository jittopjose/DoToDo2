import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { documentTextOutline, listCircleOutline, checkboxOutline, settingsOutline } from 'ionicons/icons';
import Tasks from './pages/tasks/Tasks';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { useEffect } from 'react';
import { createTasksStore } from './data/storage';
import CreateEditTask from './pages/tasks/CreateEditTask';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    const setupStore = async () => {
      createTasksStore();
    }
    setupStore();
  }, []);
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tasks">
              <Tasks />
            </Route>
            <Route exact path="/tasks/create-edit">
              <CreateEditTask />
            </Route>
            <Route exact path="/tab2">
              <Tab2 />
            </Route>
            <Route path="/tab3">
              <Tab3 />
            </Route>
            <Route exact path="/">
              <Redirect to="/tasks" />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="tab1" href="/tab1">
              <IonIcon aria-hidden="true" icon={settingsOutline} />
            </IonTabButton>
            <IonTabButton tab="tab3" href="/tab2">
              <IonIcon aria-hidden="true" icon={checkboxOutline} />
            </IonTabButton>
            <IonTabButton tab="tab4" href="/tab3">
              <IonIcon aria-hidden="true" icon={documentTextOutline} />
            </IonTabButton>
            <IonTabButton tab="tasks" href="/tasks">
              <IonIcon aria-hidden="true" icon={listCircleOutline} />
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  )
}

export default App;
