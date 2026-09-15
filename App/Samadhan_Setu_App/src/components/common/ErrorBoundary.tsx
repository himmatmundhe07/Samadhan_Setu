/**
 * Samadhan Setu — ErrorBoundary Component
 * Generic crash handler with reassuring Devanagari message.
 * Follows the same warm, non-scary tone as the offline banner.
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { fontSize } from '../../theme/typography';
import { spacing, touchTargets, borderRadius } from '../../theme/spacing';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>🛠️</Text>
          <Text style={styles.title}>कुछ गड़बड़ हो गई</Text>
          <Text style={styles.message}>
            चिंता मत करो, आपका डेटा सुरक्षित है।{'\n'}
            थोड़ी देर बाद फिर कोशिश करो।
          </Text>
          <TouchableOpacity
            onPress={this.handleRetry}
            style={styles.retryButton}
            activeOpacity={0.7}
          >
            <Text style={styles.retryText}>🔄 फिर से कोशिश करो</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.chuna,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize['2xl'],
    color: colors.mudBrown,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    fontSize: fontSize.base,
    color: colors.terracotta,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing['2xl'],
  },
  retryButton: {
    backgroundColor: colors.forestGreen,
    paddingHorizontal: spacing.xl,
    minHeight: touchTargets.buttonHeight,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
});
