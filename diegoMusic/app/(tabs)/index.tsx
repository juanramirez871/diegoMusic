import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [selectedTag, setSelectedTag] = useState('Music');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Image source={require('@/assets/images/avatar.jpg')} style={styles.avatar} />
          </View>
          
          <View style={styles.tagsContainer}>
            <TouchableOpacity 
              style={[styles.tag, selectedTag === 'Music' && styles.selectedTag]} 
              onPress={() => setSelectedTag('Music')}
            >
              <Text style={[styles.tagText, selectedTag === 'Music' && styles.selectedTagText]}>
                Music
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.tag, selectedTag === 'Podcasts' && styles.selectedTag]} 
              onPress={() => setSelectedTag('Podcasts')}
            >
              <Text style={[styles.tagText, selectedTag === 'Podcasts' && styles.selectedTagText]}>
                Podcasts
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome to {selectedTag}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#252424ff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedTag: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tagText: {
    color: '#9BA1A6',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});


