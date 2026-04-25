import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '@/context/LanguageContext';
import { usePlayer } from '@/context/PlayerContext';
import type { Locale } from '@/interfaces/language';
import type { VideoQuality } from '@/context/player/types';

const LANGUAGES: { locale: Locale; label: string; nativeLabel: string; flag: ImageSourcePropType }[] = [
  { locale: 'en', label: 'English', nativeLabel: 'English', flag: require('../../assets/images/english.png') },
  { locale: 'es', label: 'Español', nativeLabel: 'Español', flag: require('../../assets/images/spanish.png') },
  { locale: 'ja', label: '日本語', nativeLabel: '日本語', flag: require('../../assets/images/japanese.png') },
];

const QUALITY_ICONS: Record<VideoQuality, string> = {
  low: 'cellular-outline',
  medium: 'cellular-outline',
  high: 'cellular',
};

export default function SettingsScreen() {
  const { t, locale, setLocale } = useLanguage();
  const { videoQuality, setVideoQuality } = usePlayer();

  const QUALITIES: { value: VideoQuality; label: string }[] = [
    { value: 'low', label: t('settings.videoQualityLow') },
    { value: 'medium', label: t('settings.videoQualityMedium') },
    { value: 'high', label: t('settings.videoQualityHigh') },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.screenTitle}>{t('settings.title')}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('settings.language')}</Text>
            <View style={styles.optionsContainer}>
              {LANGUAGES.map((lang) => {
                const isActive = locale === lang.locale;
                return (
                  <TouchableOpacity
                    key={lang.locale}
                    style={[styles.option, isActive && styles.optionActive]}
                    onPress={() => setLocale(lang.locale)}
                    activeOpacity={0.7}
                  >
                    <Image style={styles.optionFlag} source={lang.flag} />
                    <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>
                      {lang.nativeLabel}
                    </Text>
                    {isActive && (
                      <Ionicons name="checkmark-circle" size={20} color="#2c5af3" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{t('settings.videoQuality')}</Text>
            <View style={styles.optionsContainer}>
              {QUALITIES.map((q) => {
                const isActive = videoQuality === q.value;
                return (
                  <TouchableOpacity
                    key={q.value}
                    style={[styles.option, isActive && styles.optionActive]}
                    onPress={() => setVideoQuality(q.value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={QUALITY_ICONS[q.value] as any}
                      size={22}
                      color={isActive ? '#2c5af3' : '#b3b3b3'}
                      style={styles.qualityIcon}
                    />
                    <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>
                      {q.label}
                    </Text>
                    {isActive && (
                      <Ionicons name="checkmark-circle" size={20} color="#2c5af3" style={styles.checkIcon} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#252424ff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#b3b3b3',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionActive: {
    backgroundColor: 'rgba(44,90,243,0.12)',
    borderColor: '#2c5af3',
    borderWidth: 0,
  },
  optionFlag: {
    width: 30,
    height: 20,
    borderRadius: 4,
    marginRight: 14,
  },
  qualityIcon: {
    marginRight: 14,
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#b3b3b3',
  },
  optionLabelActive: {
    color: '#fff',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 8,
  },
});
