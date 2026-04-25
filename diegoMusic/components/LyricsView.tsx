import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingSpinner } from './LoadingSpinner';
import { LyricsPanelProps, LyricsViewProps } from '@/interfaces/Song';

const ManualSearchInput = ({ defaultQuery, onSearch }: { defaultQuery?: string; onSearch: (q: string) => void }) => {
  const [query, setQuery] = useState(defaultQuery ?? '');
  return (
    <View style={searchStyles.row}>
      <TextInput
        style={searchStyles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Artista - Canción"
        placeholderTextColor="#555"
        onSubmitEditing={() => query.trim() && onSearch(query.trim())}
        returnKeyType="search"
        selectTextOnFocus
      />
      <TouchableOpacity
        onPress={() => query.trim() && onSearch(query.trim())}
        style={searchStyles.btn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="search" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const searchStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
    width: '100%',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    paddingVertical: 6,
  },
  btn: {
    marginLeft: 8,
    padding: 4,
  },
});



const COMPACT_LINE_HEIGHT = 50;

export function LyricsPanel({
  syncedLyrics,
  plainLyrics,
  loading,
  notFound,
  isOnline,
  currentLineIndex,
  onSeek,
  onExpand,
  onManualSearch,
  manualSearchDefaultQuery,
}: LyricsPanelProps) {

  const scrollRef = useRef<ScrollView>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (loading) setShowEdit(false);
  }, [loading]);

  useEffect(() => {
    if (syncedLyrics || plainLyrics) setShowEdit(false);
  }, [syncedLyrics, plainLyrics]);

  const showSearchInput = onManualSearch && (showEdit || (!loading && isOnline && notFound));

  return (
    <View style={panel.container}>
      <View style={panel.header}>
        <Text style={panel.label}>LYRICS</Text>
        <View style={panel.headerActions}>
          {onManualSearch && (
            <TouchableOpacity
              onPress={() => setShowEdit(s => !s)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="pencil-outline" size={14} color={showEdit ? '#fff' : '#b3b3b3'} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onExpand} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="expand-outline" size={16} color="#b3b3b3" />
          </TouchableOpacity>
        </View>
      </View>

      {showSearchInput && (
        <ManualSearchInput
          key={manualSearchDefaultQuery}
          defaultQuery={manualSearchDefaultQuery}
          onSearch={onManualSearch}
        />
      )}

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
          <Text style={panel.emptyText}>Letra no encontrada</Text>
        </View>
      )}

      {!loading && syncedLyrics && syncedLyrics.length > 0 && (
        <ScrollView
          ref={scrollRef}
          style={{ maxHeight: COMPACT_LINE_HEIGHT * 5 }}
          showsVerticalScrollIndicator={false}
          scrollEnabled
          nestedScrollEnabled
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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


export function LyricsView({
  syncedLyrics,
  plainLyrics,
  loading,
  notFound,
  isOnline,
  currentLineIndex,
  onSeek,
  onClose,
  onManualSearch,
  manualSearchDefaultQuery,
}: LyricsViewProps) {

  const scrollRef = useRef<ScrollView>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (loading) setShowEdit(false);
  }, [loading]);

  useEffect(() => {
    if (syncedLyrics || plainLyrics) setShowEdit(false);
  }, [syncedLyrics, plainLyrics]);

  const showSearchInput = onManualSearch && (showEdit || (!loading && isOnline && notFound));

  return (
    <View style={full.overlay}>
      <TouchableOpacity style={full.closeBtn} onPress={onClose}>
        <Ionicons name="chevron-down" size={28} color="#fff" />
      </TouchableOpacity>

      <View style={full.headingRow}>
        <Text style={full.heading}>LYRICS</Text>
        {onManualSearch && (
          <TouchableOpacity
            onPress={() => setShowEdit(s => !s)}
            style={full.editBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="pencil-outline" size={16} color={showEdit ? '#fff' : '#b3b3b3'} />
          </TouchableOpacity>
        )}
      </View>

      {showSearchInput && (
        <ManualSearchInput
          key={manualSearchDefaultQuery}
          defaultQuery={manualSearchDefaultQuery}
          onSearch={onManualSearch}
        />
      )}

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
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  heading: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  editBtn: {
    position: 'absolute',
    right: 0,
    padding: 4,
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
