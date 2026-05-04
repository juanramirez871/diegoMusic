import React, { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from '@/components/IconSymbol';
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { SleepTimerModalProps } from "@/interfaces/player";

const SHEET_HEIGHT = 480;

export default function SleepTimerModal({ visible, onClose }: SleepTimerModalProps) {
  const { sleepTimer, setSleepTimer } = usePlayer();
  const { t } = useLanguage();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SHEET_HEIGHT);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const handleSelectTimer = (minutes: number | null) => {
    setSleepTimer(minutes);
    handleClose();
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = minutes / 60;
      return hours === 1
        ? t('sleepTimer.hourOption', { count: hours })
        : t('sleepTimer.hoursOption', { count: hours });
    }
    return t('sleepTimer.minutesOption', { count: minutes });
  };

  const timerOptions = [
    { label: t('sleepTimer.disable'), value: null },
    { label: formatDuration(5), value: 5 },
    { label: formatDuration(15), value: 15 },
    { label: formatDuration(30), value: 30 },
    { label: formatDuration(45), value: 45 },
    { label: formatDuration(60), value: 60 },
    { label: formatDuration(120), value: 120 },
    { label: formatDuration(180), value: 180 },
    { label: formatDuration(240), value: 240 },
  ];

  if (!visible) return null;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />
      </Animated.View>
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title}>{t('sleepTimer.title')}</Text>
          {sleepTimer && (
            <Text style={styles.subtitle}>{t('sleepTimer.active', { time: formatDuration(sleepTimer) })}</Text>
          )}
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.optionsList}>
            {timerOptions.map((option) => (
              <TouchableOpacity key={option.label} style={styles.option} onPress={() => handleSelectTimer(option.value)}>
                <IconSymbol
                  name={sleepTimer === option.value ? "radio-button-on" : "radio-button-off"}
                  size={24}
                  color={sleepTimer === option.value ? "#2c5af3" : "#fff"}
                />
                <Text style={[styles.optionText, sleepTimer === option.value && styles.activeOptionText]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'fixed' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#282828',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    height: SHEET_HEIGHT,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center',
  },
  subtitle: {
    color: '#2c5af3', fontSize: 14, marginTop: 4,
  },
  optionsList: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  activeOptionText: {
    color: '#2c5af3',
    fontWeight: 'bold',
  },
});
