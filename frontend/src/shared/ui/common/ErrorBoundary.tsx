import { useTranslation } from '@/shared/lib/hooks/useTranslation';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const { t } = useTranslation('common');

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-gray-900"
      edges={['top', 'bottom']}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 24,
        }}
        accessibilityLabel={t('errorBoundary.title')}
      >
        <View className="items-center">
          <Text
            className="mb-4 text-6xl"
            accessibilityLabel={t('errorBoundary.title')}
          >
            ⚠️
          </Text>
          <Text
            className="mb-2 text-2xl font-bold text-gray-900 dark:text-white"
            accessibilityRole="header"
            accessibilityLabel={t('errorBoundary.title')}
          >
            {t('errorBoundary.title')}
          </Text>
          <Text className="mb-6 text-center text-base text-gray-600 dark:text-gray-400">
            {t('errorBoundary.description')}
          </Text>

          {__DEV__ && error && (
            <View className="mb-6 w-full rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
              <Text
                className="mb-2 font-semibold text-gray-900 dark:text-white"
                accessibilityLabel={t('errorBoundary.errorDetails')}
              >
                {t('errorBoundary.errorDetails')}:
              </Text>
              <Text
                className="font-mono text-sm text-red-600 dark:text-red-400"
                accessibilityLabel={`${t('errorBoundary.errorMessage')}: ${error.toString()}`}
              >
                {error.toString()}
              </Text>
              {error.stack && (
                <ScrollView
                  className="mt-2 max-h-48"
                  accessibilityLabel={t('errorBoundary.errorStack')}
                >
                  <Text className="font-mono text-xs text-gray-700 dark:text-gray-300">
                    {error.stack}
                  </Text>
                </ScrollView>
              )}
            </View>
          )}

          <TouchableOpacity
            onPress={onReset}
            className="rounded-lg bg-blue-600 px-6 py-3 dark:bg-blue-500"
            accessibilityRole="button"
            accessibilityLabel={t('errorBoundary.reloadButton')}
            accessibilityHint={t('errorBoundary.description')}
          >
            <Text className="text-base font-semibold text-white">
              {t('errorBoundary.reloadButton')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  return (
    <ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>
  );
}
