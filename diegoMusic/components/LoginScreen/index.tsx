import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import styles from './styles';


export function LoginScreen() {
  
  const { login } = useAuth();
  const { t } = useLanguage();

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
        <TouchableOpacity style={styles.googleBtn} onPress={login} activeOpacity={0.85}>
          <View style={styles.googleIcon}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
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


