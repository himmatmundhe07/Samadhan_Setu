/**
 * Samadhan Setu — Category Definitions
 * 8 standard categories + 1 emergency.
 * Each has: icon, color, Hindi/English labels.
 */
import { colors } from '../theme/colors';

export type CategoryId = 
  | 'water'
  | 'road'
  | 'health'
  | 'environment'
  | 'school'
  | 'electricity'
  | 'toilet'
  | 'other'
  | 'emergency';

export interface CategoryConfig {
  id: CategoryId;
  icon: string;       // Lucide icon name
  emoji: string;      // Fallback emoji
  color: string;
  labelHi: string;
  labelEn: string;
  isEmergency: boolean;
}

export const categories: CategoryConfig[] = [
  {
    id: 'water',
    icon: 'droplets',
    emoji: '💧',
    color: '#2196F3',
    labelHi: 'पानी',
    labelEn: 'Water',
    isEmergency: false,
  },
  {
    id: 'road',
    icon: 'route',
    emoji: '🛣️',
    color: '#795548',
    labelHi: 'सड़क',
    labelEn: 'Road',
    isEmergency: false,
  },
  {
    id: 'health',
    icon: 'heart-pulse',
    emoji: '🏥',
    color: '#E91E63',
    labelHi: 'स्वास्थ्य',
    labelEn: 'Health',
    isEmergency: false,
  },
  {
    id: 'environment',
    icon: 'trees',
    emoji: '🌿',
    color: colors.leafGreen,
    labelHi: 'पर्यावरण',
    labelEn: 'Environment',
    isEmergency: false,
  },
  {
    id: 'school',
    icon: 'school',
    emoji: '🏫',
    color: '#FF9800',
    labelHi: 'स्कूल',
    labelEn: 'School',
    isEmergency: false,
  },
  {
    id: 'electricity',
    icon: 'zap',
    emoji: '⚡',
    color: '#FFC107',
    labelHi: 'बिजली',
    labelEn: 'Electricity',
    isEmergency: false,
  },
  {
    id: 'toilet',
    icon: 'bath',
    emoji: '🚽',
    color: '#00BCD4',
    labelHi: 'शौचालय',
    labelEn: 'Toilet',
    isEmergency: false,
  },
  {
    id: 'other',
    icon: 'plus-circle',
    emoji: '➕',
    color: colors.ochre,
    labelHi: 'अन्य',
    labelEn: 'Other',
    isEmergency: false,
  },
  {
    id: 'emergency',
    icon: 'siren',
    emoji: '🚨',
    color: colors.sindoor,
    labelHi: 'तुरंत ख़तरा',
    labelEn: 'Immediate Danger',
    isEmergency: true,
  },
];

export const getCategoryById = (id: CategoryId): CategoryConfig | undefined =>
  categories.find((c) => c.id === id);
