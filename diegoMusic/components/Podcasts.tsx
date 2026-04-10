import { View, StyleSheet, Image, Text } from "react-native";


export default function Podcasts() {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    return (
        <View style={styles.container}>
            {items.map((item, index) => (
                <View key={index} style={styles.item}>
                    <View>
                        <Image 
                            source={{uri: `https://media.vandalsports.com/i/1200x675/7-2024/2024723135957_1.jpg`}}
                            style={styles.image}
                        />
                    </View>
                    <View style={styles.textContainer}>
                        <Image
                            source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6vc7cTYnAtr8t4-lJ1KvVCFHGDmp2lQWTzQ&s" }}
                            style={styles.imageChannel}
                        />
                        <View style={styles.titleContainer}>
                            <Text style={styles.title} numberOfLines={2}>
                                Psychology of people Who Don’t post their Photos on Social Media
                            </Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    )
}
 

const styles = StyleSheet.create({
    container: {
        width: "100%",
        paddingTop: 10,
    },
    item: {
        marginBottom: 24,
        width: "100%",
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        backgroundColor: "#333",
    },
    imageChannel: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    titleContainer: {
        flex: 1,
        flexShrink: 1,
    },
    title: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        lineHeight: 20,
    },
    textContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginTop: 12,
        width: "100%",
    },
})
