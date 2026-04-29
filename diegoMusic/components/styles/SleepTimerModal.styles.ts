import { Dimensions, StyleSheet } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  content: {
    backgroundColor: '#282828',
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    zIndex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: { marginBottom: 20, alignItems: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { color: '#2c5af3ff', fontSize: 14, marginTop: 4 },
  optionsList: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  optionText: { color: '#fff', fontSize: 16, marginLeft: 15 },
  activeOptionText: { color: '#2c5af3ff', fontWeight: 'bold' },
});
