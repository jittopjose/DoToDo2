import { IonContent, IonIcon, IonItem, IonLabel, IonList, IonPage, IonRadio, IonRadioGroup, IonSelect, IonSelectOption } from '@ionic/react';
import {
  cashOutline,
  colorPaletteOutline,
  desktopOutline,
  moonOutline,
  sunnyOutline,
} from 'ionicons/icons';
import React, { useCallback } from 'react';
import { CurrencyCode, currencyOptions, ThemePreference, useSettingsStore } from '../features/settings/store/settingsStore';
import './SettingsPage.css';

const themeOptions: { value: ThemePreference; label: string; description: string; icon: string }[] = [
  { value: 'system', label: 'System default', description: 'Follows your device theme', icon: desktopOutline },
  { value: 'light', label: 'Light', description: 'Always use light theme', icon: sunnyOutline },
  { value: 'dark', label: 'Dark', description: 'Always use dark theme', icon: moonOutline },
];

const SettingsPage: React.FC = () => {
  const themePreference = useSettingsStore((state) => state.themePreference);
  const setThemePreference = useSettingsStore((state) => state.setThemePreference);
  const currency = useSettingsStore((state) => state.currency);
  const setCurrency = useSettingsStore((state) => state.setCurrency);

  const handleThemeChange = useCallback((e: CustomEvent) => {
    console.log('[Settings] onIonChange fired, detail.value=', e.detail.value);
    setThemePreference(e.detail.value as ThemePreference);
  }, [setThemePreference]);

  const handleCurrencyChange = useCallback((e: CustomEvent) => {
    setCurrency(e.detail.value as CurrencyCode);
  }, [setCurrency]);

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

          <IonList inset={true} className="settings-theme-list">
            <IonRadioGroup
              value={themePreference}
              onIonChange={handleThemeChange}
            >
              {themeOptions.map((option) => (
                <IonItem key={option.value}>
                  <IonIcon icon={option.icon} slot="start" />
                  <IonLabel>
                    <h2>{option.label}</h2>
                    <p>{option.description}</p>
                  </IonLabel>
                  <IonRadio
                    slot="end"
                    value={option.value}
                    aria-label={option.label}
                    color="primary"
                  />
                </IonItem>
              ))}
            </IonRadioGroup>
          </IonList>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">
            <IonIcon icon={cashOutline} />
            <span>Currency</span>
          </div>

          <IonList inset={true} className="settings-theme-list">
            <IonItem>
              <IonIcon icon={cashOutline} slot="start" />
              <IonLabel>
                <h2>Currency</h2>
                <p>Display symbol for prices</p>
              </IonLabel>
              <IonSelect
                slot="end"
                value={currency}
                onIonChange={handleCurrencyChange}
                interface="action-sheet"
                className="settings-currency-select"
              >
                {currencyOptions.map((opt) => (
                  <IonSelectOption key={opt.value} value={opt.value}>
                    {opt.label} ({opt.symbol})
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;
