import { StyleSheet } from 'react-native';

export const SHEET_HEIGHT = 320;

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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#444',
    paddingBottom: 15,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  optionsList: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    gap: 15,
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
});
