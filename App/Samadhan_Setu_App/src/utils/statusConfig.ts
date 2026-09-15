/**
 * Samadhan Setu — Status Configuration
 * Maps each status to its color, icon name, and Devanagari label.
 * RULE: Status must ALWAYS show color + icon + text together. NEVER color alone.
 */
import { colors } from '../theme/colors';

export type ProblemStatus = 
  | 'submitted'
  | 'verified'
  | 'assigned'
  | 'in_progress'
  | 'resolved'
  | 'disputed'
  | 'pending_confirmation';

export interface StatusConfig {
  color: string;
  backgroundColor: string;
  icon: string;        // Lucide icon name
  labelHi: string;     // Hindi label
  labelEn: string;     // English label
  step: number;        // Timeline position (1-6)
}

export const statusConfig: Record<ProblemStatus, StatusConfig> = {
  submitted: {
    color: colors.status.submitted,
    backgroundColor: '#A0522D20',
    icon: 'send',
    labelHi: 'भेजा गया',
    labelEn: 'Submitted',
    step: 1,
  },
  verified: {
    color: colors.status.verified,
    backgroundColor: '#4A7C2E20',
    icon: 'check-circle',
    labelHi: 'जाँचा गया',
    labelEn: 'Verified',
    step: 2,
  },
  assigned: {
    color: colors.status.assigned,
    backgroundColor: '#E4A85320',
    icon: 'user-check',
    labelHi: 'सौंपा गया',
    labelEn: 'Assigned',
    step: 3,
  },
  in_progress: {
    color: colors.status.in_progress,
    backgroundColor: '#D89B3C20',
    icon: 'loader',
    labelHi: 'काम चल रहा है',
    labelEn: 'In Progress',
    step: 4,
  },
  resolved: {
    color: colors.status.resolved,
    backgroundColor: '#2D501620',
    icon: 'check-circle-2',
    labelHi: 'हल हो गया',
    labelEn: 'Resolved',
    step: 5,
  },
  disputed: {
    color: colors.status.disputed,
    backgroundColor: '#8B1A1A20',
    icon: 'alert-triangle',
    labelHi: 'विवादित',
    labelEn: 'Disputed',
    step: 0, // Not in normal timeline
  },
  pending_confirmation: {
    color: colors.status.pending_confirmation,
    backgroundColor: '#D89B3C20',
    icon: 'help-circle',
    labelHi: 'आपकी पुष्टि बाकी',
    labelEn: 'Your Confirmation Pending',
    step: 5, // Same position as resolved
  },
};

/**
 * Timeline steps in order for the visual progress dots.
 */
export const timelineSteps: ProblemStatus[] = [
  'submitted',
  'verified',
  'assigned',
  'in_progress',
  'resolved',
];
