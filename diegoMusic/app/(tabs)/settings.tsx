import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Locale, useLanguage } from '@/context/LanguageContext';

const LANGUAGES: { locale: Locale; label: string; nativeLabel: string; flag: ImageSourcePropType }[] = [
  { locale: 'en', label: 'English', nativeLabel: 'English', flag: require('../../assets/images/english.png') },
  { locale: 'es', label: 'Español', nativeLabel: 'Español', flag: require('../../assets/images/spanish.png') },
  { locale: 'ja', label: '日本語', nativeLabel: '日本語', flag: require('../../assets/images/japanese.png') },
];

export default function SettingsScreen() {
  const { t, locale, setLocale } = useLanguage();

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
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
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
  },
  optionFlag: {
    width: 30,
    height: 20,
    borderRadius: 4,
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
