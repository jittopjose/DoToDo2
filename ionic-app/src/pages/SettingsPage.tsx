import { IonContent, IonIcon, IonItem, IonPage, IonRadio, IonRadioGroup } from '@ionic/react';
import {
  colorPaletteOutline,
  desktopOutline,
  moonOutline,
  sunnyOutline,
} from 'ionicons/icons';
import React, { useCallback } from 'react';
import { ThemePreference, useSettingsStore } from '../features/settings/store/settingsStore';
import './SettingsPage.css';

const themeOptions: { value: ThemePreference; label: string; description: string; icon: string }[] = [
  { value: 'system', label: 'System default', description: 'Follows your device theme', icon: desktopOutline },
  { value: 'light', label: 'Light', description: 'Always use light theme', icon: sunnyOutline },
  { value: 'dark', label: 'Dark', description: 'Always use dark theme', icon: moonOutline },
];

const SettingsPage: React.FC = () => {
  const themePreference = useSettingsStore((state) => state.themePreference);
  const setThemePreference = useSettingsStore((state) => state.setThemePreference);

  const handleThemeChange = useCallback((e: CustomEvent) => {
    setThemePreference(e.detail.value as ThemePreference);
  }, [setThemePreference]);

  return (
    <IonPage className="settings-page">
      <IonContent className="settings-content">
        <div className="settings-header">
          <h1>Settings</h1>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            <IonIcon icon={colorPaletteOutline} />
            <span>Appearance</span>
          </div>

          <div className="settings-theme-card">
            <IonRadioGroup
              value={themePreference}
              onIonChange={handleThemeChange}
            >
              {themeOptions.map((option) => (
                <IonItem key={option.value} className="settings-theme-item" lines="full">
                  <div className="settings-theme-item-content">
                    <IonIcon icon={option.icon} />
                    <div className="settings-theme-item-label">
                      <span>{option.label}</span>
                      <small>{option.description}</small>
                    </div>
                  </div>
                  <IonRadio
                    slot="end"
                    value={option.value}
                    aria-label={option.label}
                    color="primary"
                  />
                </IonItem>
              ))}
            </IonRadioGroup>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
