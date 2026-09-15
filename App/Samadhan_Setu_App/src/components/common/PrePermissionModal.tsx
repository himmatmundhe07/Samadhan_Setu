/**
 * Samadhan Setu — OS Pre-Permission Explanation Modal
 * Shown immediately before native OS system dialogs (Camera, Location, Microphone).
 * Non-literate citizens are guided via audio and large visual icons on what button to press
 * on the system popup (e.g., "Allow" / "While using app" / Green button).
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Camera, MapPin, Mic, ArrowRight, Volume2 } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../store/appStore';
import { PRE_PERMISSION_AUDIO, playSpeech, stopSpeech } from '../../services/voiceFeedback.service';

export type PermissionType = 'camera' | 'location' | 'microphone';

interface PrePermissionModalProps {
  visible: boolean;
  type: PermissionType;
  onProceed: () => void;
  onCancel?: () => void;
}

export function PrePermissionModal({
  visible,
  type,
  onProceed,
  onCancel,
}: PrePermissionModalProps) {
  const language = useAppStore((s) => s.language);

  const getAudioPrompt = () => {
    const map = PRE_PERMISSION_AUDIO[type];
    return (map as any)[language] || map.hi;
  };

  useEffect(() => {
    if (visible) {
      const prompt = getAudioPrompt();
      const timer = setTimeout(() => {
        playSpeech(prompt, language);
      }, 300);
      return () => {
        clearTimeout(timer);
        stopSpeech();
      };
    }
  }, [visible, type, language]);

  const handleProceed = () => {
    stopSpeech();
    onProceed();
  };

  const renderIcon = () => {
    const size = 64;
    switch (type) {
      case 'camera':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#E8F5E9' }]}>
            <Camera size={size} color="#2E7D32" />
          </View>
        );
      case 'location':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#E1F5FE' }]}>
            <MapPin size={size} color="#0288D1" />
          </View>
        );
      case 'microphone':
        return (
          <View style={[styles.iconCircle, { backgroundColor: '#FFF3E0' }]}>
            <Mic size={size} color="#E65100" />
          </View>
        );
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {renderIcon()}

          <View style={styles.listenPill}>
            <Volume2 size={16} color={colors.forestGreen} />
            <Text style={styles.listenPillText}>सुनिए • Listen carefully</Text>
          </View>

          <Text style={styles.instructionText}>{getAudioPrompt()}</Text>

          <View style={styles.mockSystemButton}>
            <Text style={styles.mockButtonText}>[ Allow / अनुमति / While using app ]</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={handleProceed}
            style={styles.proceedBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Proceed to System Dialog"
          >
            <Text style={styles.proceedBtnText}>समझ गए • Proceed</Text>
            <ArrowRight size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  listenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginBottom: 12,
  },
  listenPillText: {
    color: colors.forestGreen,
    fontWeight: '700',
    fontSize: 12,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.mudBrown,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 18,
  },
  mockSystemButton: {
    backgroundColor: '#F1F8E9',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#81C784',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  mockButtonText: {
    color: '#2E7D32',
    fontWeight: '800',
    fontSize: 13,
  },
  proceedBtn: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: colors.forestGreen,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 3,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
  },
});
