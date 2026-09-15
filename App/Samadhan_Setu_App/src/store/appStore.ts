/**
 * Samadhan Setu — App Store (Zustand)
 * Global app state: language, connectivity, voice guide toggle.
 */
import { create } from 'zustand';

export type Language = 'hi' | 'en' | 'sat' | 'kht' | 'nag' | 'bho' | 'anp' | 'mag' | 'mai' | 'or' | 'bn' | 'kru' | 'ho' | 'mun';

interface AppState {
  language: Language;
  isOffline: boolean;
  isVoiceGuideEnabled: boolean;
  isSpeaking: boolean;

  // Actions
  setLanguage: (lang: Language) => void;
  setOffline: (offline: boolean) => void;
  setVoiceGuideEnabled: (enabled: boolean) => void;
  setSpeaking: (speaking: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  language: 'hi',
  isOffline: false,
  isVoiceGuideEnabled: true,
  isSpeaking: false,

  setLanguage: (language) => set({ language }),
  setOffline: (isOffline) => set({ isOffline }),
  setVoiceGuideEnabled: (isVoiceGuideEnabled) => set({ isVoiceGuideEnabled }),
  setSpeaking: (isSpeaking) => set({ isSpeaking }),
}));
