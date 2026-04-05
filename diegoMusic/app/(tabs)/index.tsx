import HeaderHome from '@/components/HeaderHome';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {

  return (
    <SafeAreaView style={styles.safeArea}>
      <HeaderHome />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#252424ff',
  },
});


