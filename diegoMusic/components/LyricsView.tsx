import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LoadingSpinner } from './LoadingSpinner';
import { LyricsPanelProps, LyricsViewProps } from '@/interfaces/Song';
import { COMPACT_LINE_HEIGHT, full, panel, searchStyles } from './styles/LyricsView.styles';

const ManualSearchInput = ({ defaultQuery, onSearch }: { defaultQuery?: string; onSearch: (q: string) => void }) => {

  const [query, setQuery] = useState(defaultQuery ?? '');
  const { t } = useLanguage();
  return (
    <View style={searchStyles.row}>
      <TextInput
        style={searchStyles.input}
        value={query}
        onChangeText={setQuery}
        placeholder={t('lyrics.searchPlaceholder')}
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
  const { t } = useLanguage();

  return (
    <View style={panel.container}>
      <View style={panel.header}>
        <Text style={panel.label}>{t('lyrics.title')}</Text>
        <View style={panel.headerActions}>
          <TouchableOpacity onPress={onExpand} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="expand-outline" size={16} color="#b3b3b3" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && (
        <View style={panel.center}>
          <LoadingSpinner />
        </View>
      )}

      {!loading && !isOnline && (
        <View style={panel.center}>
          <Text style={panel.emptyText}>{t('lyrics.offline')}</Text>
        </View>
      )}

      {!loading && isOnline && notFound && (
        <View style={panel.center}>
          <Text style={panel.emptyText}>{t('lyrics.notFound')}</Text>
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
  const { t } = useLanguage();

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
        <Text style={full.heading}>{t('lyrics.title')}</Text>
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
          <Text style={full.emptyText}>{t('lyrics.noConnection')}</Text>
        </View>
      )}

      {!loading && isOnline && notFound && (
        <View style={full.center}>
          <Ionicons name="musical-notes-outline" size={36} color="#b3b3b3" />
          <Text style={full.emptyText}>{t('lyrics.notAvailable')}</Text>
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
