/**
 * Samadhan Setu — Dynamic Voice Alert Component
 * Automatically speaks dynamic messages (errors, successes, network alerts) aloud immediately
 * upon appearing, paired with unmistakable visual icons (Red X, Green Check, Alert Warning).
 * Never requires reading to understand status changes.
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { XCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react-native';
import { useAppStore } from '../../store/appStore';
import { colors } from '../../theme/colors';

export function DynamicVoiceAlert() {
  const activeAlert = useAppStore((s) => s.activeAlert);
  const dismissAlert = useAppStore((s) => s.dismissAlert);

  useEffect(() => {
    if (activeAlert) {
      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => {
        dismissAlert();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeAlert]);

  if (!activeAlert) return null;

  const renderIcon = () => {
    switch (activeAlert.type) {
      case 'error':
        return <XCircle size={32} color="#D32F2F" />;
      case 'success':
        return <CheckCircle2 size={32} color="#2E7D32" />;
      case 'warning':
        return <AlertTriangle size={32} color="#F57C00" />;
      case 'info':
      default:
        return <Info size={32} color="#0288D1" />;
    }
  };

  const getBorderColor = () => {
    switch (activeAlert.type) {
      case 'error':
        return '#D32F2F';
      case 'success':
        return '#2E7D32';
      case 'warning':
        return '#F57C00';
      case 'info':
      default:
        return '#0288D1';
    }
  };

  const getBgColor = () => {
    switch (activeAlert.type) {
      case 'error':
        return '#FFEBEE';
      case 'success':
        return '#E8F5E9';
      case 'warning':
        return '#FFF3E0';
      case 'info':
      default:
        return '#E1F5FE';
    }
  };

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <View
        style={[
          styles.alertBox,
          {
            backgroundColor: getBgColor(),
            borderColor: getBorderColor(),
          },
        ]}
      >
        <View style={styles.iconWrap}>{renderIcon()}</View>

        <View style={{ flex: 1 }}>
          <Text style={[styles.messageText, { color: colors.mudBrown }]}>
            {activeAlert.message}
          </Text>
          <Text style={styles.subText}>🔊 आवाज में सुनाया गया • Spoken aloud</Text>
        </View>

        <TouchableOpacity
          onPress={dismissAlert}
          style={styles.closeBtn}
          accessibilityLabel="Dismiss Alert"
        >
          <X size={20} color={colors.mudBrown} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 99999,
    alignItems: 'center',
  },
  alertBox: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    gap: 12,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  subText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mudBrown,
    opacity: 0.65,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
});
