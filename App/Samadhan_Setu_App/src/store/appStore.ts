/**
 * Samadhan Setu — App Store (Zustand)
 * Global app state: language, connectivity, voice guide toggle.
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { speakDynamicAlert } from '../services/voiceFeedback.service';

export type Language = 'hi' | 'en' | 'sat' | 'kht' | 'nag' | 'bho' | 'anp' | 'mag' | 'mai' | 'or' | 'bn' | 'kru' | 'ho' | 'mun';

export interface DynamicAlertState {
  id: string;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
}

const STORAGE_LANG_KEY = '@samadhan_selected_language';
const STORAGE_WALKTHROUGH_KEY = '@samadhan_completed_walkthrough';

interface AppState {
  language: Language;
  isOffline: boolean;
  isVoiceGuideEnabled: boolean;
  isSpeaking: boolean;
  hasSelectedLanguage: boolean;
  hasCompletedWalkthrough: boolean;
  activeAlert: DynamicAlertState | null;

  // Actions
  setLanguage: (lang: Language) => void;
  setOffline: (offline: boolean) => void;
  setVoiceGuideEnabled: (enabled: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
  setHasSelectedLanguage: (completed: boolean) => void;
  setHasCompletedWalkthrough: (completed: boolean) => void;
  triggerAlert: (message: string, type?: 'error' | 'success' | 'warning' | 'info') => void;
  dismissAlert: () => void;
  initAppPreferences: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  language: 'hi',
  isOffline: false,
  isVoiceGuideEnabled: true,
  isSpeaking: false,
  hasSelectedLanguage: false,
  hasCompletedWalkthrough: false,
  activeAlert: null,

  setLanguage: (language) => {
    set({ language });
    AsyncStorage.setItem(STORAGE_LANG_KEY, language).catch(() => {});
  },
  setOffline: (isOffline) => set({ isOffline }),
  setVoiceGuideEnabled: (isVoiceGuideEnabled) => set({ isVoiceGuideEnabled }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),

  setHasSelectedLanguage: (hasSelectedLanguage) => {
    set({ hasSelectedLanguage });
    if (hasSelectedLanguage) {
      AsyncStorage.setItem(STORAGE_LANG_KEY, get().language).catch(() => {});
    }
  },

  setHasCompletedWalkthrough: (hasCompletedWalkthrough) => {
    set({ hasCompletedWalkthrough });
    if (hasCompletedWalkthrough) {
      AsyncStorage.setItem(STORAGE_WALKTHROUGH_KEY, 'true').catch(() => {});
    }
  },

  triggerAlert: (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'error') => {
    const alert: DynamicAlertState = {
      id: String(Date.now()),
      message,
      type,
    };
    set({ activeAlert: alert });
    // Immediately speak alert aloud in the active user language
    speakDynamicAlert(message, get().language).catch(() => {});
  },

  dismissAlert: () => set({ activeAlert: null }),

  initAppPreferences: async () => {
    try {
      const [savedLang, savedWalkthrough] = await Promise.all([
        AsyncStorage.getItem(STORAGE_LANG_KEY),
        AsyncStorage.getItem(STORAGE_WALKTHROUGH_KEY),
      ]);

      if (savedLang) {
        set({
          language: savedLang as Language,
          hasSelectedLanguage: true,
        });
      }
      if (savedWalkthrough === 'true') {
        set({ hasCompletedWalkthrough: true });
      }
    } catch (e) {
      console.warn('[AppStore] Failed to load preferences:', e);
    }
  },
}));
