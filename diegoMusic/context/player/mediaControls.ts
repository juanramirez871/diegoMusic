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
      if (MediaControl && await SafeMediaControl.isEnabled()) {
        return await MediaControl.enableMediaControls(options);
      }
    } catch (e) {}
  },
  updateMetadata: async (metadata: any) => {
    try {
      if (MediaControl && await SafeMediaControl.isEnabled()) {
        return await MediaControl.updateMetadata(metadata);
      }
    } catch (e) {}
  },
  updatePlaybackState: async (state: any, position?: number) => {
    try {
      if (MediaControl && await SafeMediaControl.isEnabled()) {
        return await MediaControl.updatePlaybackState(state, position);
      }
    } catch (e) {}
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
