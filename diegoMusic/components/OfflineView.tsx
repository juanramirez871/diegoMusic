import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';

interface OfflineViewProps {
  onRetry?: () => Promise<boolean>;
  title?: string;
  message?: string;
}

export const OfflineView = ({ onRetry, title, message }: OfflineViewProps) => {
  const { t } = useLanguage();
  const resolvedTitle = title ?? t('offline.title');
  const resolvedMessage = message ?? t('offline.message');

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={80} color="#666" />
      <Text style={styles.title}>{resolvedTitle}</Text>
      <Text style={styles.message}>{resolvedMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#252424ff',
    zIndex: 1000,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#aaa',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#2c5af3ff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#1a3a99',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
