import React, { useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { usePlayer } from "@/context/PlayerContext";
import { useLanguage } from "@/context/LanguageContext";
import { SleepTimerModalProps } from "@/interfaces/player";
import { styles } from './styles/SleepTimerModal.styles';

const { height: SCREEN_HEIGHT } = Dimensions.get("window");


export default function SleepTimerModal({
  visible,
  onClose,
}: SleepTimerModalProps) {

  const { sleepTimer, setSleepTimer } = usePlayer();
  const { t } = useLanguage();
  const overlayOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(SCREEN_HEIGHT * 0.5);
  const startOpenAnimation = () => {
    overlayOpacity.value = withTiming(1, { duration: 300 });
    contentTranslateY.value = withTiming(0, {
      duration: 350,
      easing: Easing.out(Easing.quad),
    });
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const handleClose = () => {
    overlayOpacity.value = withTiming(0, { duration: 200 });
    contentTranslateY.value = withTiming(
      SCREEN_HEIGHT * 0.5,
      { duration: 200 },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      }
    );
  };

  const handleSelectTimer = (minutes: number | null) => {
    setSleepTimer(minutes);
    handleClose();
  };

  useEffect(() => {
    if (!visible) {
      overlayOpacity.value = 0;
      contentTranslateY.value = SCREEN_HEIGHT * 0.5;
    }
  }, [visible]);

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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onShow={startOpenAnimation}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <Pressable style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} onPress={handleClose} />
        </Animated.View>
        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>{t('sleepTimer.title')}</Text>
            {sleepTimer && (
              <Text style={styles.subtitle}>
                {t('sleepTimer.active', { time: formatDuration(sleepTimer) })}
              </Text>
            )}
          </View>

          <View style={styles.optionsList}>
            {timerOptions.map((option) => (
              <TouchableOpacity 
                key={option.label}
                style={styles.option} 
                onPress={() => handleSelectTimer(option.value)}
              >
                <Ionicons 
                  name={sleepTimer === option.value ? "radio-button-on" : "radio-button-off"} 
                  size={24} 
                  color={sleepTimer === option.value ? "#2c5af3ff" : "#fff"} 
                />
                <Text style={[
                  styles.optionText,
                  sleepTimer === option.value && styles.activeOptionText
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
