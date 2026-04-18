import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingSpinner } from './LoadingSpinner';
import { LyricsPanelProps, LyricsViewProps } from '@/interfaces/Song';



const COMPACT_LINE_HEIGHT = 50;
const PANEL_VISIBLE_HEIGHT = COMPACT_LINE_HEIGHT * 9;

export function LyricsPanel({
  syncedLyrics,
  plainLyrics,
  loading,
  notFound,
  isOnline,
  currentLineIndex,
  onSeek,
  onExpand,
}: LyricsPanelProps) {

  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);

  useEffect(() => {
    if (!syncedLyrics || currentLineIndex < 0) return;
    const lineTop = currentLineIndex * COMPACT_LINE_HEIGHT;
    const lineBottom = lineTop + COMPACT_LINE_HEIGHT;
    const visibleTop = scrollOffsetRef.current;
    const visibleBottom = visibleTop + PANEL_VISIBLE_HEIGHT;
    if (lineTop < visibleTop || lineBottom > visibleBottom)
    {
      const y = Math.max(0, currentLineIndex - 4) * COMPACT_LINE_HEIGHT;
      scrollRef.current?.scrollTo({ y, animated: true });
    }
  }, [currentLineIndex, syncedLyrics]);

  return (
    <View style={panel.container}>
      <View style={panel.header}>
        <Text style={panel.label}>LYRICS</Text>
        <TouchableOpacity onPress={onExpand} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="expand-outline" size={16} color="#b3b3b3" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={panel.center}>
          <LoadingSpinner />
        </View>
      )}

      {!loading && !isOnline && (
        <View style={panel.center}>
          <Text style={panel.emptyText}>Offline</Text>
        </View>
      )}

      {!loading && isOnline && notFound && (
        <View style={panel.center}>
          <Text style={panel.emptyText}>Lyrics not found</Text>
        </View>
      )}

      {!loading && syncedLyrics && syncedLyrics.length > 0 && (
        <ScrollView
          ref={scrollRef}
          style={{ maxHeight: COMPACT_LINE_HEIGHT * 5 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled
          nestedScrollEnabled
          scrollEventThrottle={16}
          onScroll={(e) => { scrollOffsetRef.current = e.nativeEvent.contentOffset.y; }}
        >
          {syncedLyrics.map((item, index) => {
            const isActive = index === currentLineIndex;
            return (
              <TouchableOpacity key={index} onPress={() => onSeek(item.time)} activeOpacity={0.7}>
                <Text style={[panel.line, isActive && panel.lineActive]} numberOfLines={2}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {!loading && plainLyrics && !syncedLyrics && (
        <ScrollView
          style={{ maxHeight: COMPACT_LINE_HEIGHT * 5 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <Text style={panel.plain}>{plainLyrics}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const panel = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    color: '#b3b3b3',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  center: {
    height: COMPACT_LINE_HEIGHT * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 13,
  },
  line: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: COMPACT_LINE_HEIGHT,
  },
  lineActive: {
    color: '#fff',
    fontSize: 22,
  },
  plain: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    lineHeight: 24,
  },
});


const FULL_LINE_HEIGHT = 38 + 8;
export function LyricsView({
  syncedLyrics,
  plainLyrics,
  loading,
  notFound,
  isOnline,
  currentLineIndex,
  onSeek,
  onClose,
}: LyricsViewProps) {

  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);
  const visibleHeightRef = useRef(0);

  useEffect(() => {
    if (!syncedLyrics || currentLineIndex < 0 || visibleHeightRef.current === 0) return;
    const lineTop = currentLineIndex * FULL_LINE_HEIGHT;
    const lineBottom = lineTop + FULL_LINE_HEIGHT;
    const visibleTop = scrollOffsetRef.current;
    const visibleBottom = visibleTop + visibleHeightRef.current;
    if (lineTop < visibleTop || lineBottom > visibleBottom)
    {
      const y = Math.max(0, currentLineIndex - 2) * FULL_LINE_HEIGHT;
      scrollRef.current?.scrollTo({ y, animated: true });
    }
  }, [currentLineIndex, syncedLyrics]);

  return (
    <View style={full.overlay}>
      <TouchableOpacity style={full.closeBtn} onPress={onClose}>
        <Ionicons name="chevron-down" size={28} color="#fff" />
      </TouchableOpacity>

      <Text style={full.heading}>LYRICS</Text>

      {loading && (
        <View style={full.center}>
          <ActivityIndicator color="#fff" />
        </View>
      )}

      {!loading && !isOnline && (
        <View style={full.center}>
          <Ionicons name="cloud-offline-outline" size={36} color="#b3b3b3" />
          <Text style={full.emptyText}>Sin conexión a internet</Text>
        </View>
      )}

      {!loading && isOnline && notFound && (
        <View style={full.center}>
          <Ionicons name="musical-notes-outline" size={36} color="#b3b3b3" />
          <Text style={full.emptyText}>Letra no disponible</Text>
        </View>
      )}

      {!loading && syncedLyrics && syncedLyrics.length > 0 && (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={full.listContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={(e) => { scrollOffsetRef.current = e.nativeEvent.contentOffset.y; }}
          onLayout={(e) => { visibleHeightRef.current = e.nativeEvent.layout.height; }}
        >
          {syncedLyrics.map((item, index) => {
            const isActive = index === currentLineIndex;
            return (
              <TouchableOpacity key={index} onPress={() => onSeek(item.time)} activeOpacity={0.7}>
                <Text style={[full.line, isActive && full.lineActive]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {!loading && plainLyrics && !syncedLyrics && (
        <ScrollView
          contentContainerStyle={full.listContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={full.plain}>{plainLyrics}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const full = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d0d0dfa',
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 54 : 24,
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 24,
    left: 16,
    padding: 8,
    zIndex: 11,
  },
  heading: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 15,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 80,
  },
  line: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 8,
  },
  lineActive: {
    color: '#fff',
    fontSize: 24,
  },
  plain: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    lineHeight: 26,
  },
});
