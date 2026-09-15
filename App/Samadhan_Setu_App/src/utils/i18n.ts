/**
 * Samadhan Setu — i18n Configuration
 * Multi-language support: Hindi, English, Santhali, Ho, Mundari.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import hi from './locales/hi.json';
import en from './locales/en.json';
import sat from './locales/sat.json';
import bn from './locales/bn.json';
import or from './locales/or.json';
import bho from './locales/bho.json';
import anp from './locales/anp.json';
import kht from './locales/kht.json';
import nag from './locales/nag.json';
import mag from './locales/mag.json';
import mai from './locales/mai.json';
import kru from './locales/kru.json';
import ho from './locales/ho.json';
import mun from './locales/mun.json';

const resources = {
  hi: { translation: hi },
  en: { translation: en },
  sat: { translation: sat },
  bn: { translation: bn },
  or: { translation: or },
  bho: { translation: bho },
  anp: { translation: anp },
  kht: { translation: kht },
  nag: { translation: nag },
  mag: { translation: mag },
  mai: { translation: mai },
  kru: { translation: kru },
  ho: { translation: ho },
  mun: { translation: mun },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'hi', // Default: Hindi (Devanagari-first)
    fallbackLng: 'hi',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
