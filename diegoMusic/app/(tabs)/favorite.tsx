import { Text, StyleSheet, View } from 'react-native';

export default function FavoriteScreen() {

  return (
    <View style={styles.container}>
      <Text>Welcome to Favorite</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#252424ff",
  },
});

