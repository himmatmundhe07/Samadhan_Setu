import { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Volume2 } from 'lucide-react-native';
import { resolveVoiceLanguage, isBhashiniSupported, synthesizeSpeech } from '../../services/voice.service';
import { useAppStore } from '../../store/appStore';
import { colors } from '../../theme/colors';

// Dynamic native audio loaders for maximum compatibility across Expo versions
let ExpoAudioModule: any = null;
try {
  ExpoAudioModule = require('expo-audio');
} catch {
  ExpoAudioModule = null;
}

let ExpoAvModule: any = null;
try {
  ExpoAvModule = require('expo-av').Audio;
} catch {
  ExpoAvModule = null;
}

let SpeechModule: any = null;
try {
  SpeechModule = require('expo-speech');
} catch {
  SpeechModule = null;
}

let FileSystemModule: any = null;
try {
  FileSystemModule = require('expo-file-system');
} catch {
  FileSystemModule = null;
}

let currentSound: any = null;

interface VoiceGuideButtonProps {
  text: string;
}

const DEVICE_LANG_MAP: Record<string, string> = {
  bn: 'bn-IN',
  or: 'or-IN',
  bho: 'hi-IN',
  sat: 'hi-IN',
  anp: 'hi-IN',
  kht: 'hi-IN',
  nag: 'hi-IN',
  mag: 'hi-IN',
  mai: 'hi-IN',
  kru: 'hi-IN',
  hi: 'hi-IN',
  en: 'en-IN',
};

export function VoiceGuideButton({ text }: VoiceGuideButtonProps) {
  const language = useAppStore((s) => s.language);
  const isVoiceGuideEnabled = useAppStore((s) => s.isVoiceGuideEnabled);
  const [loading, setLoading] = useState(false);

  if (!isVoiceGuideEnabled) return null;

  const speakWithDevice = (lang: string) => {
    if (SpeechModule && SpeechModule.speak) {
      try {
        if (typeof SpeechModule.stop === 'function') SpeechModule.stop();
      } catch {}
      const deviceLang = DEVICE_LANG_MAP[lang] || 'hi-IN';
      SpeechModule.speak(text, { language: deviceLang });
    }
  };

  const handlePress = async () => {
    if (!text || typeof text !== 'string' || !text.trim()) return;
    setLoading(true);
    const effectiveLang = resolveVoiceLanguage(language);

    try {
      const audioBase64 = await synthesizeSpeech(text, effectiveLang);
      await playBase64Audio(audioBase64);
    } catch (err) {
      console.warn('[VoiceGuideButton] Bhashini audio playback failed, falling back to device voice:', err);
      speakWithDevice(effectiveLang);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.button} disabled={loading}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.chuna} />
      ) : (
        <Volume2 size={20} color={colors.chuna} />
      )}
    </TouchableOpacity>
  );
}

async function playBase64Audio(base64: string) {
  let fileUri = `data:audio/wav;base64,${base64}`;

  // Write base64 audio to cache file if FileSystem is available for smooth native audio decoding
  if (FileSystemModule && FileSystemModule.cacheDirectory) {
    try {
      const tempPath = `${FileSystemModule.cacheDirectory}bhashini_${Date.now()}.wav`;
      await FileSystemModule.writeAsStringAsync(tempPath, base64, {
        encoding: FileSystemModule.EncodingType?.Base64 || 'base64',
      });
      fileUri = tempPath;
    } catch (fsErr) {
      // Fallback to data URI if file writing fails
    }
  }

  // 1. Try modern expo-audio
  if (ExpoAudioModule && typeof ExpoAudioModule.createAudioPlayer === 'function') {
    try {
      if (currentSound && typeof currentSound.pause === 'function') {
        currentSound.pause();
      }
      const player = ExpoAudioModule.createAudioPlayer(fileUri);
      player.play();
      currentSound = player;
      return;
    } catch (audioErr) {
      console.warn('[VoiceGuideButton] expo-audio failed, trying expo-av:', audioErr);
    }
  }

  // 2. Try legacy expo-av
  if (ExpoAvModule && typeof ExpoAvModule.Sound?.createAsync === 'function') {
    if (currentSound && typeof currentSound.unloadAsync === 'function') {
      try {
        await currentSound.unloadAsync();
      } catch {}
    }
    const { sound } = await ExpoAvModule.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: true }
    );
    currentSound = sound;
    return;
  }

  throw new Error('Native audio player (expo-audio/expo-av) not available in current runtime');
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
});