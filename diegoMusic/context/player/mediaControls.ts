import Constants, { ExecutionEnvironment } from 'expo-constants';

let MediaControl: any = null;
export let PlaybackState: any = {};
export let Command: any = {};

if (Constants.executionEnvironment !== ExecutionEnvironment.StoreClient) {
  try {
    const MediaControlModule = require('expo-media-control');
    MediaControl = MediaControlModule.MediaControl;
    PlaybackState = MediaControlModule.PlaybackState;
    Command = MediaControlModule.Command;
  } catch (e) {
    console.warn('MediaControl module not found');
  }
}

export const SafeMediaControl = {
  isAvailable: () => {
    return Boolean(MediaControl);
  },
  isEnabled: async () => {
    try {
      if (!MediaControl) return false;
      return await MediaControl.isEnabled();
    }
    catch (e) {
      return false;
    }
  },
  enableMediaControls: async (options: any) => {
    try {
      if (!MediaControl) return;
      return await MediaControl.enableMediaControls(options);
    } catch (e: any) {
      console.warn('[MediaControl] enableMediaControls failed:', e?.message ?? e);
    }
  },
  disableMediaControls: async () => {
    try {
      if (!MediaControl) return;
      return await MediaControl.disableMediaControls();
    } catch (e: any) {
      console.warn('[MediaControl] disableMediaControls failed:', e?.message ?? e);
    }
  },
  updateMetadata: async (metadata: any) => {
    try {
      if (!MediaControl) return;
      return await MediaControl.updateMetadata(metadata);
    } catch (e: any) {
      console.warn('[MediaControl] updateMetadata failed:', e?.message ?? e);
    }
  },
  updatePlaybackState: async (state: any, position?: number) => {
    try {
      if (!MediaControl) return;
      return await MediaControl.updatePlaybackState(state, position);
    } catch (e: any) {
      console.warn('[MediaControl] updatePlaybackState failed:', e?.message ?? e);
    }
  },
  addListener: (listener: (event: any) => void) => {
    try {
      if (MediaControl && typeof MediaControl.addListener === 'function') {
        return MediaControl.addListener(listener);
      }
    } catch (e) {}
    return () => {};
  }
};
