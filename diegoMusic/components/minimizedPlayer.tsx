import { View, StyleSheet, Image, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const MinimizedPlayer = () => {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://thicc-uwu.mywaifulist.moe/waifus/rukia-kuchiki-bleach/hzirfGgp2zlBCB4OCnGo37EwGyMoVdM9J8BDFGcU.webp" }}
        style={styles.cover}
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>El muchacho de los ojos tristes</Text>
        <Text style={styles.artist} numberOfLines={1}>Rukia Kuchiki</Text>
      </View>
      <View style={styles.controls}>
        <Ionicons name="play-circle" size={40} color="#fff" />
      </View>
      <View style={styles.progressContainer}>
        <View style={[styles.bgBar, { width: '100%' }]} />
        <View style={[styles.progressBar, { width: '35%' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#141414ff',
        padding: 8,
        borderRadius: 8,
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 65 : 75,
        zIndex: 1000,
        width: '100%',
    },
    cover: {
        width: 48,
        height: 48,
        borderRadius: 4,
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#fff",
    },
    artist: {
        fontSize: 12,
        color: "#b3b3b3",
    },
    controls: {
        paddingHorizontal: 8,
    },
    progressContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: 'hidden',
    },
    bgBar: {
        height: '100%',
        backgroundColor: '#8a8a8aff',
    },
    progressBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        zIndex: 1000,
        backgroundColor: '#fff',
    }
    
});
