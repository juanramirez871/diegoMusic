import { Platform, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
    zIndex: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardLabel: {
    color: '#b3b3b3',
    fontSize: 12,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rank: {
    color: '#b3b3b3',
    fontSize: isWeb ? 20 : 16,
    fontWeight: 'bold',
    width: isWeb ? 28 : 20,
    textAlign: 'center',
  },
  songThumb: {
    width: isWeb ? 64 : 44,
    height: isWeb ? 64 : 44,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#fff',
    fontSize: isWeb ? 17 : 14,
    fontWeight: '600',
  },
  songArtist: {
    color: '#b3b3b3',
    fontSize: isWeb ? 14 : 12,
    marginTop: 2,
  },
  playsBadge: {
    backgroundColor: '#2c5af3ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  playsText: {
    color: '#fff',
    fontSize: isWeb ? 14 : 12,
    fontWeight: 'bold',
  },
  artistsRow: {
    flexDirection: 'row',
    gap: isWeb ? 20 : 12,
  },
  artistItem: {
    flex: 1,
    alignItems: 'center',
    gap: isWeb ? 10 : 6,
    position: 'relative',
  },
  crownBadge: {
    position: 'absolute',
    top: -10,
    zIndex: 1,
  },
  crownText: {
    fontSize: isWeb ? 22 : 16,
  },
  artistAvatar: {
    width: isWeb ? 120 : 70,
    height: isWeb ? 120 : 70,
    borderRadius: 999,
    backgroundColor: '#333',
  },
  artistName: {
    color: '#fff',
    fontSize: isWeb ? 17 : 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  artistPlays: {
    color: '#b3b3b3',
    fontSize: isWeb ? 14 : 11,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 18,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  streakFlame: {
    fontSize: 32,
  },
  streakLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  streakSub: {
    color: '#b3b3b3',
    fontSize: 12,
    marginTop: 2,
  },
  streakNumber: {
    color: '#2c5af3ff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    gap: 16,
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 14,
    textAlign: 'center',
  },
  crownImage: {
    width: isWeb ? 140 : 80,
    height: isWeb ? 120 : 80,
    transform: [{ translateY: isWeb ? -30 : -20 }],
  },
});
