import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from "react-native";
import { IconSymbol } from "./IconSymbol";


export default function FavoritePodcasts() {

    const items = [1, 2, 3, 4];
    return (
        <View style={styles.container}>
            <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                <View style={styles.gridContainer}>
                    {
                        items.map((item, index) => (
                            <View key={index}>
                                <Image
                                    source={{
                                        uri: "https://avatarfiles.alphacoders.com/182/182640.jpg",
                                    }}
                                    style={styles.image}
                                />
                            </View>
                        ))
                    }

                    <TouchableOpacity style={styles.artistItem} activeOpacity={0.7}>
                        <View style={styles.addButton}>
                        <IconSymbol name="plus" size={30} color="#fff" />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 8,
        paddingBottom: 24,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
        textAlign: "center",
    },
    image: {
        width: 125,
        height: 125,
        borderRadius: 8,
        overflow: "hidden",
    },
    gridContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        gap: 15,
    },
    scrollContent: {
        gap: 16,
        paddingRight: 16,
    },
    artistItem: {
        alignItems: "center",
        width: 100,
        gap: 8,
    },
    addButton: {
        width: 125,
        height: 125,
        marginLeft: 25,
        borderRadius: 8,
        backgroundColor: "#333",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#444",
    },
    artistName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#fff",
        textAlign: "center",
    },
})