import { StyleSheet } from 'react-native';

export const SHEET_HEIGHT = 480;

export const styles = StyleSheet.create({
  root: {
    position: 'fixed' as any,
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 2000,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#282828',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    height: SHEET_HEIGHT,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    color: '#fff', fontSize: 20, fontWeight: 'bold', textAlign: 'center',
  },
  subtitle: {
    color: '#2c5af3', fontSize: 14, marginTop: 4,
  },
  optionsList: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  activeOptionText: {
    color: '#2c5af3',
    fontWeight: 'bold',
  },
});
