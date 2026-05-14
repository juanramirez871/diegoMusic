<div align="center">

<img src="/assets/icon.jpeg" width="140" alt="DiegoMusic icon" style="border-radius: 24px;" />

# DiegoMusic

**A music app for iOS, Android and Web — inspired by Spotify, but no premium plans needed.**

Listen to whatever you want, whenever you want.

![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-blueviolet)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.76-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs)

</div>

Below you'll find every screen of the app, both on mobile and on the web, with a quick rundown of what each one does.

## Sign in

<p align="center">
  <img src="/assets/login-pc.png" width="820" alt="Login screen on web" />
</p>
<p align="center">
  <img src="/assets/login-movil.PNG" width="240" alt="Login screen on mobile" />
</p>

Sign in with your Google account so your data sticks around between sessions. No forms, no passwords to remember, no "verify your email" hoops — one tap and you're in. The next time you open the app, your favorites, history and queue are still there waiting for you, even if you switched devices.

> **Under the hood:** Google OAuth handles the auth flow, and the session token is stored locally so the app can rehydrate your profile on startup. All user-specific state (favorites, history, queue, top tracks) is keyed by the account so you can sign out and back in without losing anything.

---

## Home

<p align="center">
  <img src="/assets/home-pc.png" width="820" alt="Home screen on web" />
</p>
<p align="center">
  <img src="/assets/home-2-pc.png" width="820" alt="Home screen on web, scrolled" />
</p>
<p align="center">
  <img src="/assets/home-movil.PNG" width="240" alt="Home screen on mobile" />
  <img src="/assets/home-2-movil.PNG" width="240" alt="Home screen on mobile, scrolled" />
</p>

The idea of the home screen is that you open the app and instantly find something to play — no scrolling forever, no "what should I listen to today?" paralysis. Everything you see here is built around your own taste. You'll find:

- The **last 8 songs** you played, so you can pick up right where you left off
- The **artists you've saved**, each one with fresh song recommendations pulled from their channel
- Your **most-played tracks**, in case you want to keep the catchy stuff going
- All your **favorite artists** in one spot for quick access

> **Under the hood:** Recently played and most-played counters are persisted in `AsyncStorage` (`@last_music_played`, `@most_played_songs`) and updated by the playback hook every time a song finishes. The artist recommendation rows hit `GET /api/youtube/search/channel/videos` on the backend, which uses Innertube to pull the latest uploads from each saved channel.

---

## Favorites

<p align="center">
  <img src="/assets/favorites-pc.png" width="820" alt="Favorites screen on web" />
</p>
<p align="center">
  <img src="/assets/favorites-movil.PNG" width="240" alt="Favorites screen on mobile" />
</p>

Every song you mark as a favorite lands here, and this is the screen that turns DiegoMusic into a real on-the-go player. You can:

- **Shuffle** your favorites so the next song is a fun surprise
- **Filter** to find a specific track quickly when the list gets long
- Listen **offline** — super useful when you've got no signal, no data, or you're on a plane
- Check the download icon: if it's blue, the song is already saved on your device. If it's white, just hit the button to download it

> **Under the hood:** Favorites live under the `@favorites_songs` key in `AsyncStorage`. When you trigger a download, the backend streams MP3 audio through `GET /api/youtube/audio/download` (yt-dlp + ffmpeg), and the file is written to the Expo cache directory. Thumbnails are cached locally too, so the offline experience stays visually intact. The `NetworkProvider` watches connectivity in the background and silently falls back to the local file when the network drops.

---

## Player

<p align="center">
  <img src="/assets/player-pc.png" width="820" alt="Player screen on web" />
</p>
<p align="center">
  <img src="/assets/player-movil.PNG" width="240" alt="Player screen on mobile" />
</p>

The player is the heart of the app. Expand it and you get a bunch of options:

1. Play / pause
2. Skip to the next or previous song
3. Watch the song's video
4. Share it
5. Save it to favorites
6. View the play queue
7. Set a sleep timer
8. Toggle shuffle mode
9. Save the artist to your favorites
10. Open the original video on YouTube

> **Under the hood:** Playback is split across four hooks composed by `PlayerContext`: `useAudioPlayer` (the engine, built on `expo-audio`), `usePlayerQueue` (queue, shuffle, repeat), `usePreloader` (preloads the next 2 tracks into separate `expo-audio` instances to make skips feel instant), and `usePlayerStorage` (hydrates and persists everything to `AsyncStorage`). Skipping doesn't wait for the network — it swaps to the already-buffered next instance.

### Options & queue

<p align="center">
  <img src="/assets/player-options-pc.png" width="780" alt="Player options on web" />
</p>
<p align="center">
  <img src="/assets/player-queue-pc.png" width="780" alt="Play queue on web" />
</p>
<p align="center">
  <img src="/assets/player-options-movil.PNG" width="220" alt="Player options on mobile" />
  <img src="/assets/player-queue-movil.PNG" width="220" alt="Play queue on mobile" />
</p>

The options panel keeps every player action one tap away — share, favorite, save the artist, jump to YouTube — without crowding the main view. The queue lets you see what's coming next, reorder it, or kick the whole list out if you've changed your mind.

> **Under the hood:** The queue lives in `usePlayerQueue` and is mirrored to `AsyncStorage` (`@player_*_queue`) so the list survives app restarts. Shuffle keeps a separate "original order" array so toggling it off restores the queue exactly as it was instead of leaving you in a random state.

### Sleep timer & video mode

<p align="center">
  <img src="/assets/player-timer-pc.png" width="780" alt="Sleep timer on web" />
</p>
<p align="center">
  <img src="/assets/player-video-pc.png" width="780" alt="Video mode on web" />
</p>
<p align="center">
  <img src="/assets/player-timer-movil.PNG" width="220" alt="Sleep timer on mobile" />
  <img src="/assets/player-video-movil.PNG" width="220" alt="Video mode on mobile" />
</p>

The **sleep timer** is great for putting on music before bed without having it play all night — pick a duration and the player fades out when the time is up. **Video mode** swaps the album art for the actual music video, so you can switch between "audio in your pocket" and "full music-video experience" without leaving the player.

> **Under the hood:** The sleep timer is a simple `setTimeout` tracked inside the player context so it survives navigation and gets cleared automatically if you start a new track or skip it manually. Video mode mounts an `expo-video` view backed by `GET /api/youtube/video/stream`, which proxies the YouTube video stream through the backend — that means no extra YouTube SDK on the client and the same cookie-protected pipeline used for audio.

### Lyrics

<p align="center">
  <img src="/assets/player-lyrics-pc.png" width="820" alt="Lyrics view on web" />
</p>
<p align="center">
  <img src="/assets/player-2-movil.PNG" width="240" alt="Lyrics view on mobile" />
</p>

You can also see the lyrics of the song right inside the player. And if the algorithm can't find them automatically, you can search for them manually — and once you do, they get saved for next time, so nobody else (or future you) has to do the work again.

> **Under the hood:** Lyrics are fetched on-demand and cached locally per song id. Manual lookups use the same cache key, so a manual fix becomes the canonical version for that track on your device.

---

## Search

<p align="center">
  <img src="/assets/search-pc.png" width="820" alt="Search screen on web" />
</p>
<p align="center">
  <img src="/assets/search-movil.PNG" width="240" alt="Search screen on mobile" />
</p>

Discover new music or look up something specific:

- Browse by **genre** when you don't know what you want
- Search **songs or artists** directly when you do

<p align="center">
  <img src="/assets/genres-pc.png" width="820" alt="Genres screen on web" />
</p>
<p align="center">
  <img src="/assets/genres-movil.PNG" width="240" alt="Genres screen on mobile" />
</p>

> **Under the hood:** Search calls `GET /api/youtube/search/video` on the backend, which uses Innertube as the primary source and falls back to `@distube/ytdl-core` / `yt-search` if Innertube fails. The client keeps a 50-entry LRU cache of recent queries (`services/api.ts`) so repeat searches are instant and don't hammer the backend. Requests time out at 8 seconds so a slow YouTube response doesn't block the UI.

---

## Profile & stats

<p align="center">
  <img src="/assets/stats-pc.png" width="820" alt="Listening stats on web" />
</p>
<p align="center">
  <img src="/assets/profile-movil.PNG" width="240" alt="Profile screen on mobile" />
  <img src="/assets/stats-movil.PNG" width="240" alt="Listening stats on mobile" />
</p>

Check your profile and dig into your listening stats — see what you've been playing the most, which artists own your week, and how your taste has been moving over time. It's the closest thing to a personal "Wrapped" you get whenever you want, not just once a year.

> **Under the hood:** Stats are computed client-side from the same play counters that feed the home screen (`@most_played_songs`, listening history). No analytics service is involved — the data never leaves your device, which keeps things fast and private.

---

## Settings

<p align="center">
  <img src="/assets/settings-pc.png" width="820" alt="Settings screen on web" />
</p>
<p align="center">
  <img src="/assets/settings-movil.PNG" width="240" alt="Settings screen on mobile" />
</p>

In settings you can switch the language between **English, Spanish and Japanese**, and also pick the video quality you want for the song videos. Heads up: the higher the quality, the slower the video loads, so if you're on mobile data you'll probably want to drop a notch.

> **Under the hood:** Language and video-quality preferences are persisted in `AsyncStorage` and applied at app start. The video quality preference is forwarded to the backend on each `GET /api/youtube/video/stream` call so yt-dlp picks the matching format on the server side instead of downloading the highest one and downscaling.

---

## Lock screen

<p align="center">
  <img src="/assets/lockScreen.PNG" width="240" alt="Lock screen player controls" />
</p>

The player works straight from the lock screen too, so you can:

- Pause or play without unlocking your phone
- Skip songs while your phone is in your pocket
- See what's currently playing with the cover art front and center

> **Under the hood:** Lock-screen controls are wired through `expo-media-control` from `context/player/mediaControls.ts`, and iOS background audio is enabled via `UIBackgroundModes: ["audio"]` in `app.json`. That same setup feeds the now-playing metadata to AirPods controls, Android Auto and CarPlay-style surfaces.

## Tech stack

- **Expo** (SDK 54, New Architecture)
- **React Native** + **TypeScript**
- **Node.js** + **Express**
- **Docker**

## How it works

The app pulls music and videos from YouTube using a scraping system. From there it grabs:

- Song info
- Music videos

> **Heads up:** to avoid getting blocked by YouTube, you need to set up the **cookies** properly so it looks like a real browser session.

## Demo

Want to see it in action?

<p align="center">
  <a href="/assets/demo.mp4"><strong>▶ Watch the demo</strong></a>
</p>
