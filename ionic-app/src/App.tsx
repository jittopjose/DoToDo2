import { IonApp, IonContent, IonIcon, IonLabel, IonPage, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { createMemoryHistory } from 'history';
import { useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Page from './pages/Page';
import TodoEditPage from './pages/TodoEditPage';
import CalendarPage from './pages/CalendarPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';
import { useTodoStore } from './features/todos/store/todoStore';

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

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
import '@ionic/react/css/palettes/dark.class.css';
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* Theme variables */
import './theme/variables.css';

/* Tab bar styles */
import './theme/tab-bar.css';

import {
  barChartOutline,
  calendarOutline,
  homeOutline,
  settingsOutline,
} from 'ionicons/icons';
import { useSettingsStore } from './features/settings/store/settingsStore';

setupIonicReact({
    mode: 'md',
});

const history = createMemoryHistory();

const App: React.FC = () => {
  const themePreference = useSettingsStore((state) => state.themePreference);
  const isHydrated = useTodoStore((state) => state.isHydrated);

  useEffect(() => {
    useTodoStore.getState().hydrate()
  }, [])

  useEffect(() => {
    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = themePreference === 'dark' || (themePreference === 'system' && prefersDark);
      console.log('[Theme] applyTheme: themePreference=%s prefersDark=%s isDark=%s', themePreference, prefersDark, isDark);
      document.documentElement.classList.toggle('ion-palette-dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      console.log('[Theme] html classList:', document.documentElement.className);
    };

    applyTheme();

    if (themePreference === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', applyTheme);
      return () => mq.removeEventListener('change', applyTheme);
    }
  }, [themePreference]);

  console.log('[Theme] render: themePreference=%s', themePreference);

  if (!isHydrated) {
    return (
      <IonApp>
        <IonPage>
          <IonContent className="ion-padding ion-text-center ion-justify-content-center ion-align-items-center">
            <p style={{ marginTop: '40vh' }}>Loading…</p>
          </IonContent>
        </IonPage>
      </IonApp>
    )
  }

  return (
    <IonApp>
      <IonReactRouter history={history}>
        <Switch>
          <Route path="/task/:id/edit" exact>
            <TodoEditPage />
          </Route>
          <Route>
            <IonTabs>
              <IonRouterOutlet id="main">
                <Route path="/" exact>
                  <Redirect to="/list/All Lists" />
                </Route>
                <Route path="/list/:name" exact>
                  <Page />
                </Route>
                <Route path="/calendar" exact>
                  <CalendarPage />
                </Route>
                <Route path="/stats" exact>
                  <StatsPage />
                </Route>
                <Route path="/settings" exact>
                  <SettingsPage />
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="home" href="/list/All Lists">
                  <IonIcon icon={homeOutline} />
                  <IonLabel>Home</IonLabel>
                </IonTabButton>
                <IonTabButton tab="calendar" href="/calendar">
                  <IonIcon icon={calendarOutline} />
                  <IonLabel>Calendar</IonLabel>
                </IonTabButton>
                <IonTabButton tab="stats" href="/stats">
                  <IonIcon icon={barChartOutline} />
                  <IonLabel>Stats</IonLabel>
                </IonTabButton>
                <IonTabButton tab="settings" href="/settings">
                  <IonIcon icon={settingsOutline} />
                  <IonLabel>Settings</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </Route>
        </Switch>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
