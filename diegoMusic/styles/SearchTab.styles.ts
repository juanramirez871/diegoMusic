import { Dimensions, Platform, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 44) / 2;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#121212' : '#252424ff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  containerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  searchSection: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  inputWrapperDisabled: {
    opacity: 0.5,
  },
  placeholderDisabled: {
    color: '#999',
  },
  categoryCardDisabled: {
    opacity: 0.4,
  },
  categoryIconDisabled: {
    opacity: 0.4,
  },
  browseAllSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: ITEM_WIDTH,
    height: 100,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryIcon: {
    width: 70,
    height: 70,
    borderRadius: 8,
    right: 3,
    bottom: 3,
    position: 'absolute',
  },
});
