import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import hi from './hi.json';
import en from './en.json';
import fr from './fr.json';
import ar from './ar.json';
import es from './es.json';

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  // Español por defecto. Si una clave no existe en es.json, cae a inglés
  // (fallback) en lugar de mostrar la clave cruda. (APP-21)
  lng: 'es',
  fallbackLng: 'en',
  resources: {
    hi: hi,
    en: en,
    fr: fr,
    ar: ar,
    es: es,
  },
});

export default i18next;
