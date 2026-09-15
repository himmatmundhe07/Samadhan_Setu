/**
 * Samadhan Setu — Unified Location Picker
 * Designed for non-literate tribal citizens across Registration & Grievance Submission:
 * - Automatic GPS location detection with radar animation
 * - Spoken audio confirmation of detected district ("आपकी जगह [जिला] पाई गई...")
 * - Visual Confirmation Card with large Green Check (✅) and Retry (🔄) icons
 * - Fallback: 5-Division Visual Region Map-Tap grid of Jharkhand with large icons and audio playback
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  MapPin,
  Check,
  RefreshCw,
  Compass,
  Trees,
  Mountain,
  Waves,
  Flame,
  Volume2,
} from 'lucide-react-native';
import * as Location from 'expo-location';
import { colors } from '../../theme/colors';
import { districts, getDistrictName } from '../../utils/districts';
import { useAppStore } from '../../store/appStore';
import { playSpeech } from '../../services/voiceFeedback.service';

// Jharkhand 5 Administrative Divisions with cultural visual symbols
export interface DivisionConfig {
  id: string;
  nameHi: string;
  nameEn: string;
  defaultDistrictId: string;
  IconComponent: any;
  color: string;
  districtsList: string[];
}

export const JHARKHAND_DIVISIONS: DivisionConfig[] = [
  {
    id: 'south_chotanagpur',
    nameHi: 'दक्षिणी छोटानागपुर (रांची, गुमला, सिमडेगा...)',
    nameEn: 'South Chotanagpur (Ranchi, Gumla, Simdega)',
    defaultDistrictId: 'ranchi',
    IconComponent: Trees,
    color: '#2E7D32',
    districtsList: ['ranchi', 'gumla', 'simdega', 'khunti', 'lohardaga'],
  },
  {
    id: 'north_chotanagpur',
    nameHi: 'उत्तरी छोटानागपुर (धनबाद, बोकारो, हजारीबाग...)',
    nameEn: 'North Chotanagpur (Dhanbad, Bokaro, Hazaribagh)',
    defaultDistrictId: 'dhanbad',
    IconComponent: Mountain,
    color: '#0288D1',
    districtsList: ['dhanbad', 'bokaro', 'hazaribagh', 'giridih', 'ramgarh', 'chatra', 'koderma'],
  },
  {
    id: 'santhal_pargana',
    nameHi: 'संथाल परगना (दुमका, देवघर, गोड्डा...)',
    nameEn: 'Santhal Pargana (Dumka, Deoghar, Godda)',
    defaultDistrictId: 'dumka',
    IconComponent: Compass,
    color: '#E65100',
    districtsList: ['dumka', 'deoghar', 'godda', 'sahibganj', 'pakur', 'jamtara'],
  },
  {
    id: 'kolhan',
    nameHi: 'कोल्हान (जमशेदपुर, चाईबासा...)',
    nameEn: 'Kolhan (Jamshedpur, Chaibasa)',
    defaultDistrictId: 'east-singhbhum',
    IconComponent: Waves,
    color: '#00695C',
    districtsList: ['east-singhbhum', 'west-singhbhum', 'seraikela-kharsawan'],
  },
  {
    id: 'palamu',
    nameHi: 'पलामू (मेदिनीनगर, गढ़वा, लातेहार...)',
    nameEn: 'Palamu (Medininagar, Garhwa, Latehar)',
    defaultDistrictId: 'palamu',
    IconComponent: Flame,
    color: '#C2185B',
    districtsList: ['palamu', 'garhwa', 'latehar'],
  },
];

interface UnifiedLocationPickerProps {
  selectedDistrict: string;
  onSelectDistrict: (districtId: string, coords?: { latitude: number; longitude: number }) => void;
  onAddressDetected?: (address: string) => void;
}

export function UnifiedLocationPicker({
  selectedDistrict,
  onSelectDistrict,
  onAddressDetected,
}: UnifiedLocationPickerProps) {
  const language = useAppStore((s) => s.language);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'found' | 'failed'>('idle');
  const [detectedDistrict, setDetectedDistrict] = useState<string>('');
  const [detectedAddress, setDetectedAddress] = useState<string>('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    handleDetectGPS();
  }, []);

  const handleDetectGPS = async () => {
    try {
      setGpsStatus('detecting');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGpsStatus('failed');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;
      setCoords({ latitude, longitude });

      let matchedDistrictId = 'ranchi';
      let fullAddress = '';

      try {
        const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (geocoded && geocoded.length > 0) {
          const g = geocoded[0];
          fullAddress = [g.name, g.street, g.subregion, g.city, g.district, g.postalCode]
            .filter(Boolean)
            .join(', ');
          setDetectedAddress(fullAddress);
          if (onAddressDetected) onAddressDetected(fullAddress);

          const searchName = (g.district || g.subregion || g.city || '').toLowerCase();
          const found = districts.find(
            (d) =>
              searchName.includes(d.id) ||
              searchName.includes(d.nameEn.toLowerCase()) ||
              d.nameEn.toLowerCase().includes(searchName)
          );
          if (found) {
            matchedDistrictId = found.id;
          }
        }
      } catch {}

      setDetectedDistrict(matchedDistrictId);
      setGpsStatus('found');
      onSelectDistrict(matchedDistrictId, { latitude, longitude });

      // Automatically speak spoken confirmation
      const districtLabel = getDistrictName(matchedDistrictId, language);
      const audioPrompt = `आपकी जगह ${districtLabel} पाई गई है। क्या यह सही है?`;
      playSpeech(audioPrompt, language);
    } catch {
      setGpsStatus('failed');
    }
  };

  const handleConfirmLocation = () => {
    if (detectedDistrict) {
      onSelectDistrict(detectedDistrict, coords || undefined);
    }
  };

  const handleSelectDivision = (division: DivisionConfig) => {
    onSelectDistrict(division.defaultDistrictId);
    const audioText = `आपने ${division.nameHi.split('(')[0]} चुना है।`;
    playSpeech(audioText, language);
  };

  return (
    <View style={styles.container}>
      {/* GPS Status / Auto-Detection Hero Card */}
      {gpsStatus === 'detecting' && (
        <View style={styles.detectingCard}>
          <ActivityIndicator size="large" color={colors.forestGreen} style={{ marginBottom: 12 }} />
          <Text style={styles.detectingTitle}>आपकी जगह खोजी जा रही है...</Text>
          <Text style={styles.detectingSub}>Detecting your location via GPS...</Text>
        </View>
      )}

      {gpsStatus === 'found' && (
        <View style={styles.foundCard}>
          <View style={styles.foundHeader}>
            <View style={styles.foundIconCircle}>
              <MapPin size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.foundDistrictText}>
                {getDistrictName(detectedDistrict || selectedDistrict, language)}
              </Text>
              <Text style={styles.foundAddressText} numberOfLines={2}>
                {detectedAddress || 'झारखंड (Jharkhand)'}
              </Text>
            </View>
          </View>

          {/* Action Buttons: Confirm & Re-detect */}
          <View style={styles.foundActionsRow}>
            <TouchableOpacity
              onPress={handleConfirmLocation}
              style={styles.confirmBtn}
              accessibilityRole="button"
              accessibilityLabel="Confirm Location"
            >
              <Check size={22} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>सही जगह है • Confirm</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDetectGPS}
              style={styles.retryBtn}
              accessibilityRole="button"
              accessibilityLabel="Retry GPS"
            >
              <RefreshCw size={20} color={colors.forestGreen} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Fallback: Visual Map-Tap Regional Division Grid */}
      {(gpsStatus === 'failed' || gpsStatus === 'idle') && (
        <View style={styles.fallbackContainer}>
          <View style={styles.fallbackHeader}>
            <Compass size={22} color={colors.forestGreen} />
            <Text style={styles.fallbackTitle}>
              नक्शे पर अपना इलाका चुनें • Tap Your Region
            </Text>
          </View>
          <Text style={styles.fallbackSub}>
            तस्वीर देखकर अपने संभाग/क्षेत्र पर दबाएं
          </Text>

          <View style={styles.divisionGrid}>
            {JHARKHAND_DIVISIONS.map((div) => {
              const Icon = div.IconComponent;
              const isSelected = div.districtsList.includes(selectedDistrict);

              return (
                <TouchableOpacity
                  key={div.id}
                  onPress={() => handleSelectDivision(div)}
                  style={[
                    styles.divisionCard,
                    { borderLeftColor: div.color },
                    isSelected && styles.divisionCardSelected,
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.divIconWrap, { backgroundColor: `${div.color}18` }]}>
                    <Icon size={28} color={div.color} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.divNameHi}>{div.nameHi}</Text>
                    <Text style={styles.divNameEn}>{div.nameEn}</Text>
                  </View>

                  {isSelected ? (
                    <View style={[styles.checkCircle, { backgroundColor: div.color }]}>
                      <Check size={16} color="#FFFFFF" />
                    </View>
                  ) : (
                    <Volume2 size={18} color={colors.mudBrown} opacity={0.4} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  detectingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E8DFD0',
    elevation: 2,
  },
  detectingTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  detectingSub: {
    fontSize: 12,
    color: colors.mudBrown,
    opacity: 0.7,
    marginTop: 4,
  },
  foundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.forestGreen,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  foundHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  foundIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foundDistrictText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  foundAddressText: {
    fontSize: 12,
    color: colors.mudBrown,
    opacity: 0.75,
    marginTop: 2,
  },
  foundActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.forestGreen,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  retryBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.forestGreen}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.forestGreen,
  },
  fallbackContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E8DFD0',
  },
  fallbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fallbackTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.forestGreen,
  },
  fallbackSub: {
    fontSize: 12,
    color: colors.mudBrown,
    opacity: 0.7,
    marginBottom: 12,
  },
  divisionGrid: {
    gap: 10,
  },
  divisionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5EE',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: '#E8DFD0',
    gap: 12,
  },
  divisionCardSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: colors.forestGreen,
  },
  divIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divNameHi: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.mudBrown,
  },
  divNameEn: {
    fontSize: 11,
    color: colors.mudBrown,
    opacity: 0.65,
    marginTop: 2,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
