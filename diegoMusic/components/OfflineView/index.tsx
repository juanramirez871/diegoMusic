import React from 'react';
import { View, Text } from 'react-native';
import { IconSymbol } from '@/components/IconSymbol';
import { useLanguage } from '@/context/LanguageContext';
import type { OfflineViewProps } from '@/interfaces/ui';
import { styles } from './styles';

export const OfflineView = ({ onRetry, title, message }: OfflineViewProps) => {
  const { t } = useLanguage();
  const resolvedTitle = title ?? t('offline.title');
  const resolvedMessage = message ?? t('offline.message');

  return (
    <View style={styles.container}>
      <IconSymbol name="cloud-offline-outline" size={80} color="#666" />
      <Text style={styles.title}>{resolvedTitle}</Text>
      <Text style={styles.message}>{resolvedMessage}</Text>
    </View>
  );
};
