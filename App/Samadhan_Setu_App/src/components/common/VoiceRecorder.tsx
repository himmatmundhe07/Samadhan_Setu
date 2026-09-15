/**
 * Samadhan Setu — Voice Recorder Component
 * Features:
 * - Real audio recording via device microphone (expo-av) when native module is available
 * - Graceful degradation to simulated recording in Expo Go (no native build)
 * - Animated pulse recording indicator & live timer
 * - Native audio playback (Play/Pause) when available
 * - Re-record and delete capabilities
 * - Returns audio URI to parent
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Mic, Square, Play, Pause, Trash2, Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';
import { useAppStore } from '../../store/appStore';
import { resolveVoiceLanguage, transcribeAudio } from '../../services/voice.service';

// Lazy load expo-av to prevent crash when native module is missing (Expo Go)
let AudioModule: any = null;
let isNativeAvailable = false;

try {
  AudioModule = require('expo-av').Audio;
  isNativeAvailable = true;
} catch {
  isNativeAvailable = false;
}

// Lazy load expo-file-system safely
// NOTE: readAsStringAsync is deprecated in Expo v54 but still works — warning is harmless.
// Do NOT import from 'expo-file-system/legacy' on Windows — Metro crashes due to invalid symlink path.
let FileSystemModule: any = null;
try {
  FileSystemModule = require('expo-file-system');
} catch {
  FileSystemModule = null;
}

interface VoiceRecorderProps {
  onRecordingComplete: (uri: string | null, durationSeconds?: number) => void;
  onTranscript?: (text: string) => void;
  initialUri?: string | null;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  onTranscript,
  initialUri = null,
}) => {
  const language = useAppStore((s) => s.language);
  const [recording, setRecording] = useState<any>(null);
  const [sound, setSound] = useState<any>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(initialUri);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const timerRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation while recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sound && isNativeAvailable) {
        try { sound.unloadAsync(); } catch {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sound]);

  const startRecording = async () => {
    if (isNativeAvailable && AudioModule) {
      try {
        const { status } = await AudioModule.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('अनुमति आवश्यक', 'आवाज़ रिकॉर्ड करने के लिए माइक्रोफ़ोन की अनुमति चाहिए।');
          return;
        }

        await AudioModule.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await AudioModule.Recording.createAsync(
          AudioModule.RecordingOptionsPresets.HIGH_QUALITY
        );

        setRecording(newRecording);
        setIsRecording(true);
        setDuration(0);

        timerRef.current = setInterval(() => {
          setDuration((prev: number) => prev + 1);
        }, 1000);
      } catch (err) {
        console.error('Failed to start recording:', err);
        // Fall through to simulated mode
        startSimulatedRecording();
      }
    } else {
      // Simulated recording for Expo Go
      startSimulatedRecording();
    }
  };

  const startSimulatedRecording = () => {
    setIsRecording(true);
    setDuration(0);
    timerRef.current = setInterval(() => {
      setDuration((prev: number) => prev + 1);
    }, 1000);
  };

  const handleASR = async (fileUri: string | null) => {
    if (!onTranscript || !fileUri) return;
    try {
      if (FileSystemModule && FileSystemModule.readAsStringAsync && FileSystemModule.EncodingType) {
        const base64 = await FileSystemModule.readAsStringAsync(fileUri, {
          encoding: FileSystemModule.EncodingType.Base64,
        });
        const effectiveLang = resolveVoiceLanguage(language);
        const transcriptText = await transcribeAudio(base64, effectiveLang);
        if (transcriptText) {
          onTranscript(transcriptText);
        }
      }
    } catch (err) {
      console.warn('[VoiceRecorder] Bhashini ASR failed, continuing without transcript:', err);
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (isNativeAvailable && recording) {
      try {
        await recording.stopAndUnloadAsync();
        await AudioModule.setAudioModeAsync({ allowsRecordingIOS: false });
        const uri = recording.getURI();
        setRecording(null);
        setRecordingUri(uri);
        onRecordingComplete(uri, duration);
        handleASR(uri);
        return;
      } catch (err) {
        console.error('Failed to stop recording:', err);
      }
    }

    // Simulated: create a fake URI for demo
    const fakeUri = `file:///simulated_voice_note_${Date.now()}.m4a`;
    setRecording(null);
    setRecordingUri(fakeUri);
    onRecordingComplete(fakeUri, duration);
    handleASR(fakeUri);
  };

  const playSound = async () => {
    if (!recordingUri) return;

    if (isNativeAvailable && AudioModule) {
      try {
        if (sound) {
          if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
            return;
          } else {
            await sound.playAsync();
            setIsPlaying(true);
            return;
          }
        }

        const { sound: newSound } = await AudioModule.Sound.createAsync(
          { uri: recordingUri },
          { shouldPlay: true },
          (status: any) => {
            if (status.isLoaded && status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        );

        setSound(newSound);
        setIsPlaying(true);
      } catch (err) {
        console.error('Failed to play sound:', err);
        // Simulate playback
        simulatePlayback();
      }
    } else {
      simulatePlayback();
    }
  };

  const simulatePlayback = () => {
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), Math.max(duration * 1000, 2000));
  };

  const resetRecording = async () => {
    if (sound && isNativeAvailable) {
      try { await sound.unloadAsync(); } catch {}
    }
    setSound(null);
    setRecordingUri(null);
    setIsPlaying(false);
    setDuration(0);
    onRecordingComplete(null, 0);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      {!recordingUri ? (
        /* ====== RECORDING STATE ====== */
        <View style={styles.recordBox}>
          <TouchableOpacity
            onPress={isRecording ? stopRecording : startRecording}
            activeOpacity={0.8}
            style={styles.micTouch}
          >
            <Animated.View
              style={[
                styles.micCircle,
                isRecording && styles.micCircleRecording,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              {isRecording ? (
                <Square size={36} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Mic size={40} color="#FFFFFF" />
              )}
            </Animated.View>
          </TouchableOpacity>

          <Text style={styles.timerText}>
            {isRecording ? formatTimer(duration) : 'माइक्रोफ़ोन दबाकर बोलें'}
          </Text>

          {isRecording && (
            <View style={styles.waveRow}>
              {[...Array(7)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveBar,
                    { height: Math.floor(Math.random() * 20) + 10 },
                  ]}
                />
              ))}
            </View>
          )}

          {!isNativeAvailable && !isRecording && (
            <Text style={styles.simNote}>
              📱 डिवाइस बिल्ड पर असली रिकॉर्डिंग होगी
            </Text>
          )}
        </View>
      ) : (
        /* ====== PLAYBACK STATE ====== */
        <View style={styles.playbackCard}>
          <View style={styles.playbackRow}>
            <TouchableOpacity onPress={playSound} style={styles.playBtn}>
              {isPlaying ? (
                <Pause size={24} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
              )}
            </TouchableOpacity>

            <View style={styles.playbackDetails}>
              <View style={styles.recordedHeader}>
                <Check size={16} color={colors.forestGreen} />
                <Text style={styles.recordedTitle}>आवाज़ सहेज ली गई</Text>
              </View>
              <Text style={styles.playbackTimer}>
                {duration > 0 ? `${formatTimer(duration)} रिकॉर्डेड` : 'सुनने के लिए दबाएँ'}
              </Text>
            </View>

            <TouchableOpacity onPress={resetRecording} style={styles.deleteBtn}>
              <Trash2 size={20} color={colors.sindoor} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  recordBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  micTouch: {
    marginBottom: spacing.md,
  },
  micCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.charcoal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  micCircleRecording: {
    backgroundColor: colors.sindoor,
  },
  timerText: {
    fontSize: fontSize.lg,
    color: colors.mudBrown,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.md,
    height: 30,
  },
  waveBar: {
    width: 4,
    backgroundColor: colors.sindoor,
    borderRadius: 2,
  },
  simNote: {
    fontSize: 12,
    color: colors.terracotta,
    marginTop: spacing.sm,
    textAlign: 'center',
    opacity: 0.7,
  },

  /* Playback Card */
  playbackCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
    elevation: 2,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playbackDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  recordedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordedTitle: {
    fontSize: fontSize.base,
    color: colors.forestGreen,
    fontWeight: '700',
  },
  playbackTimer: {
    fontSize: fontSize.sm,
    color: colors.mudBrown,
    marginTop: 2,
  },
  deleteBtn: {
    padding: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
  },
});
