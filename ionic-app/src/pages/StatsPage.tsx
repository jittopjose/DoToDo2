import { IonContent, IonIcon, IonPage } from '@ionic/react';
import { barChartOutline } from 'ionicons/icons';
import React from 'react';
import './StatsPage.css';

const StatsPage: React.FC = () => {
  return (
    <IonPage className="stats-page">
      <IonContent className="stats-content">
        <div className="stats-header">
          <h1>Stats</h1>
        </div>
        <div className="stats-placeholder">
          <IonIcon icon={barChartOutline} />
          <h2>Your stats dashboard</h2>
          <p>Charts and insights for your tasks are coming soon.</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default StatsPage;
