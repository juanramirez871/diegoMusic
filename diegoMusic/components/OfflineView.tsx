import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OfflineViewProps {
  onRetry?: () => Promise<boolean>;
  title?: string;
  message?: string;
}

export const OfflineView = ({ 
  onRetry, 
  title = "No internet connection", 
  message = "Please check your network settings and try again." 
}: OfflineViewProps) => {


  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={80} color="#666" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
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
