import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
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
import { SleepTimerModalProps } from "@/interfaces/player";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");


export default function SleepTimerModal({
  visible,
  onClose,
}: SleepTimerModalProps) {

  const { sleepTimer, setSleepTimer } = usePlayer();
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

  const timerOptions = [
    { label: "Desactivar", value: null },
    { label: "5 minutos", value: 5 },
    { label: "15 minutos", value: 15 },
    { label: "30 minutos", value: 30 },
    { label: "45 minutos", value: 45 },
    { label: "1 hora", value: 60 },
    { label: "2 horas", value: 120 },
    { label: "3 horas", value: 180 },
    { label: "4 horas", value: 240 },
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
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Temporizador de apagado</Text>
            {sleepTimer && (
              <Text style={styles.subtitle}>
                Activo: {sleepTimer >= 60 ? `${Math.floor(sleepTimer / 60)}h ${sleepTimer % 60}m` : `${sleepTimer}m`}
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

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    backgroundColor: "#282828",
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    zIndex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#555",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#2c5af3ff",
    fontSize: 14,
    marginTop: 4,
  },
  optionsList: {
    gap: 8,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 15,
  },
  activeOptionText: {
    color: "#2c5af3ff",
    fontWeight: "bold",
  },
});
