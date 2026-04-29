import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useVideoPlayer } from 'expo-video';
import { useEventListener } from 'expo';
import { youtubeService } from '@/services/api';
import { AudioStateBeforeVideo, UseVideoPlaybackArgs } from '@/interfaces/player';

export const useVideoPlayback = ({ currentSong, isOnline, videoOfflineTitle, videoOfflineMessage, videoQuality, audio }: UseVideoPlaybackArgs) => {

  const [showVideo, setShowVideo] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoDidFinishHandledRef = useRef(false);
  const pendingVideoSeekRef = useRef<number | null>(null);
  const audioStateBeforeVideoRef = useRef<AudioStateBeforeVideo | null>(null);
  const showVideoRef = useRef(false);
  const isVideoReadyRef = useRef(false);
  const isVideoPlayingRef = useRef(false);

  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 0.5;
  });

  useEventListener(player, 'statusChange', ({ status, error }: any) => {
    if (status === 'readyToPlay') {
      setIsVideoLoading(false);
      setIsVideoReady(true);
      isVideoReadyRef.current = true;
      if (player.duration) setVideoDuration(player.duration * 1000);
      const pending = pendingVideoSeekRef.current;
      if (pending !== null) {
        pendingVideoSeekRef.current = null;
        player.currentTime = pending / 1000;
        setVideoProgress(pending);
      }
    } else if (status === 'error') {
      console.error('[Video] Error de carga/reproducción:', error);
      setIsVideoLoading(false);
      setIsVideoReady(false);
      isVideoReadyRef.current = false;
      setShowVideo(false);
      showVideoRef.current = false;
      const restore = audioStateBeforeVideoRef.current;
      if (restore) {
        audio.seekTo(restore.position);
        if (restore.wasPlaying) audio.togglePlayPause();
      }
    }
  });

  useEventListener(player, 'playingChange', ({ isPlaying }: any) => {
    setIsVideoPlaying(isPlaying);
    isVideoPlayingRef.current = isPlaying;
  });

  useEventListener(player, 'timeUpdate', ({ currentTime }: any) => {
    if (!showVideoRef.current) return;
    setVideoProgress(currentTime * 1000);
    if (player.duration) setVideoDuration(player.duration * 1000);
  });

  useEventListener(player, 'playToEnd', () => {
    if (!videoDidFinishHandledRef.current) {
      videoDidFinishHandledRef.current = true;
      audio.playNext();
    }
  });

  useEffect(() => {
    setVideoProgress(0);
    player.pause();
    setShowVideo(false);
    showVideoRef.current = false;
    setIsVideoLoading(false);
    setIsVideoReady(false);
    isVideoReadyRef.current = false;
    setIsVideoPlaying(false);
    isVideoPlayingRef.current = false;
    pendingVideoSeekRef.current = null;
    audioStateBeforeVideoRef.current = null;
    setVideoDuration(0);
    videoDidFinishHandledRef.current = false;
  }, [currentSong?.id]);

  const seek = (position: number) => {
    if (showVideoRef.current) {
      if (!isVideoReadyRef.current) {
        pendingVideoSeekRef.current = position;
        return;
      }
      player.currentTime = position / 1000;
      return;
    }
    audio.seekTo(position);
  };

  const toggle = async () => {
    if (!currentSong) return;

    if (!showVideoRef.current) {
      if (!isOnline) {
        Alert.alert(videoOfflineTitle, videoOfflineMessage);
        return;
      }

      videoDidFinishHandledRef.current = false;
      audioStateBeforeVideoRef.current = { wasPlaying: audio.isPlaying, position: audio.progress };
      pendingVideoSeekRef.current = audio.progress;
      setIsVideoLoading(true);
      setIsVideoReady(false);
      isVideoReadyRef.current = false;
      setIsVideoPlaying(false);
      isVideoPlayingRef.current = false;
      await audio.pause();
      await player.replaceAsync({ uri: youtubeService.getVideoStreamUrl(currentSong.url, videoQuality) });
      player.play();
      setShowVideo(true);
      showVideoRef.current = true;
      return;
    }

    const position = isVideoReadyRef.current
      ? player.currentTime * 1000
      : (pendingVideoSeekRef.current ?? audioStateBeforeVideoRef.current?.position ?? 0);

    const shouldResumeAudio = Boolean(audioStateBeforeVideoRef.current?.wasPlaying || isVideoPlayingRef.current);
    player.pause();
    setShowVideo(false);
    showVideoRef.current = false;
    setIsVideoLoading(false);
    setIsVideoReady(false);
    isVideoReadyRef.current = false;
    setIsVideoPlaying(false);
    isVideoPlayingRef.current = false;
    videoDidFinishHandledRef.current = false;
    audio.seekTo(position);

    if (shouldResumeAudio) audio.togglePlayPause();
  };

  const closeIfOpen = async () => {
    if (showVideoRef.current) await toggle();
  };

  return {
    showVideo,
    isVideoLoading,
    isVideoReady,
    videoProgress,
    videoDuration,
    isVideoPlaying,
    player,
    toggle,
    closeIfOpen,
    seek,
  };
};
