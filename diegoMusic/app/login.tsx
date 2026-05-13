import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { styles } from '@/styles/LoginScreen.styles';

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

