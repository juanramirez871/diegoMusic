import { Text, StyleSheet, View, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.container}>
          <View>
            <Image
              source={require("@/assets/images/avatar.jpg")}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
              }}
            />
          </View>
          <View>
            <Text style={styles.text}>Search</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#252424ff",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  text: {
    fontSize: 25,
    color: "#fff",
    fontWeight: "bold",
  },
});
