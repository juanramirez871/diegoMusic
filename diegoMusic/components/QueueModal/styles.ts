import { Dimensions, Platform, StyleSheet } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  content: {
    height: SCREEN_HEIGHT * 0.8,
    backgroundColor: "#141414",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  headerGradient: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
  },
  headerHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  controls: {
    flexDirection: "row",
    width: "100%",
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  activeControl: {
    backgroundColor: "#2c5af3ff",
  },
  controlText: {
    color: "#b3b3b3",
    fontSize: 14,
    fontWeight: "600",
  },
  activeControlText: {
    color: "#fff",
  },
  listContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingLeft: 20,
  },
  songPressArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  currentSongItem: {
    backgroundColor: "rgba(44, 90, 243, 0.1)",
  },
  selectedItem: {
    backgroundColor: "rgba(44, 90, 243, 0.15)",
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  songInfo: {
    flex: 1,
    marginLeft: 16,
    marginRight: 16,
  },
  songTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  currentSongTitle: {
    color: "#2c5af3ff",
  },
  songArtist: {
    color: "#b3b3b3",
    fontSize: 14,
    marginTop: 2,
  },
  reorderHandle: {
    padding: 12,
    paddingRight: 20,
  },
});
