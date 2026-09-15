import api from './api';

// Native Bhashini TTS models available for Jharkhand regional languages:
// hi, en, bn, or, bho, sat, anp, kht, nag, mag, mai, kru
const BHASHINI_NATIVE_LANGS = [
  'hi', 'en', 'bn', 'or', 'bho', 'sat', 'anp', 'kht', 'nag', 'mag', 'mai', 'kru'
];

export function resolveVoiceLanguage(appLanguage: string): string {
  if (!appLanguage) return 'hi';
  const clean = appLanguage.toLowerCase().trim();

  // Explicit mappings for common names / codes
  if (clean === 'bengali' || clean === 'bangla' || clean === 'bn') return 'bn';
  if (clean === 'odia' || clean === 'oriya' || clean === 'or') return 'or';
  if (clean === 'bhojpuri' || clean === 'bho') return 'bho';
  if (clean === 'santhali' || clean === 'santali' || clean === 'sat') return 'sat';
  if (clean === 'khortha' || clean === 'kht') return 'kht';
  if (clean === 'nagpuri' || clean === 'sadri' || clean === 'nag' || clean === 'sck') return 'nag';
  if (clean === 'angika' || clean === 'anp' || clean === 'ang') return 'anp';
  if (clean === 'magahi' || clean === 'mag') return 'mag';
  if (clean === 'maithili' || clean === 'mai') return 'mai';
  if (clean === 'kurukh' || clean === 'oraon' || clean === 'kru') return 'kru';
  if (clean === 'ho' || clean === 'mun' || clean === 'mundari') return 'sat'; // Closest tribal tongue with Bhashini support
  if (clean === 'english' || clean === 'en') return 'en';

  if (BHASHINI_NATIVE_LANGS.includes(clean)) {
    return clean;
  }
  return 'hi';
}

export function isBhashiniSupported(lang: string): boolean {
  return true;
}

export async function synthesizeSpeech(text: string, language: string): Promise<string> {
  try {
    const effectiveLang = resolveVoiceLanguage(language);
    // POST /api/voice/tts -> { audio: base64String }
    const res = await api.post('/voice/tts', { text, language: effectiveLang });
    return res.data.audio;
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.warn('[Voice Service] /voice/tts route not found (404) on current backend. Check if backend is updated & deployed.');
    } else {
      console.warn('[Voice Service] TTS error:', err.response?.data || err.message);
    }
    throw err;
  }
}

export async function transcribeAudio(audioBase64: string, language: string): Promise<string> {
  try {
    // POST /api/voice/asr -> { text: string }
    const res = await api.post('/voice/asr', { audioBase64, language });
    return res.data.text;
  } catch (err: any) {
    if (err.response?.status === 404) {
      console.warn('[Voice Service] /voice/asr route not found (404) on current backend.');
    } else {
      console.warn('[Voice Service] ASR error:', err.response?.data || err.message);
    }
    throw err;
  }
}
