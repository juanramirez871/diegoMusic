import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginScreen() {

  const router = useRouter();
  const { login } = useAuth();
  const { t } = useLanguage();
  const handleGoogleLogin = () => {
    login();
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/splash-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}>Diego Music</Text>
      <Text style={styles.subtitle}>{t('login.subtitle')}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} activeOpacity={0.85}>
          <GoogleIcon />
          <Text style={styles.googleText}>{t('login.continueWithGoogle')}</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          {t('login.agreementPrefix')}{' '}
          <Text style={styles.link}>{t('login.termsOfService')}</Text>
          {' '}{t('login.agreementMiddle')}{' '}
          <Text style={styles.link}>{t('login.privacyPolicy')}</Text>.
        </Text>
      </View>
    </View>
  );
}

function GoogleIcon() {
  return (
    <View style={styles.googleIcon}>
      <Text style={styles.googleIconText}>G</Text>
    </View>
  );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isWeb ? '#0d0d0d' : '#252424ff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
    marginBottom: 8,
  },
  appName: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#888',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  actions: {
    width: '100%',
    maxWidth: isWeb ? 360 : undefined,
    alignItems: 'center',
    gap: 16,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    backgroundColor: '#fff',
    borderRadius: 999,
    gap: 12,
  },
  googleIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  googleText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  terms: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#666',
    textDecorationLine: 'underline',
  },
});
