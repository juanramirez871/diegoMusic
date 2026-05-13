import { StyleSheet } from 'react-native';

export const SHEET_HEIGHT_PCT = 0.8;

export const styles = StyleSheet.create({
  root: {
    position: "fixed" as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    height: `${SHEET_HEIGHT_PCT * 100}%` as any,
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
  handle: {
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
    backgroundColor: "#2c5af3",
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
    backgroundColor: "rgba(44,90,243,0.1)",
  },
  selectedItem: {
    backgroundColor: "rgba(44,90,243,0.15)",
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
    color: "#2c5af3",
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
