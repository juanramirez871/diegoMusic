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
  <img src="/assets/login-movil.PNG" width="220" alt="Login screen on mobile" />
  <img src="/assets/login-pc.png" width="420" alt="Login screen on web" />
</p>

Sign in with your Google account so your data sticks around between sessions. That's it, no extra steps.

## Home

<p align="center">
  <img src="/assets/home-movil.PNG" width="200" alt="Home screen on mobile" />
  <img src="/assets/home-2-movil.PNG" width="200" alt="Home screen on mobile, scrolled" />
</p>
<p align="center">
  <img src="/assets/home-pc.png" width="420" alt="Home screen on web" />
  <img src="/assets/home-2-pc.png" width="420" alt="Home screen on web, scrolled" />
</p>

The idea of the home screen is that you open the app and instantly find something to play. You'll see:

- The **last 8 songs** you played, so you can pick up right where you left off
- The **artists you've saved**, with fresh recommendations from each one
- Your **most-played tracks**, in case you want to keep the catchy stuff going
- All your **favorite artists** in one spot

---

## Favorites

<p align="center">
  <img src="/assets/favorites-movil.PNG" width="220" alt="Favorites screen on mobile" />
  <img src="/assets/favorites-pc.png" width="420" alt="Favorites screen on web" />
</p>

Every song you mark as a favorite lands here. From this screen you can:

- **Shuffle** your favorites so the next song is a fun surprise
- **Filter** to find a specific track quickly
- Listen **offline** — super useful when you've got no signal or no data
- Check the download icon: if it's blue, the song is already saved on your device. If it's white, just hit the button to download it

## Player

<p align="center">
  <img src="/assets/player-movil.PNG" width="220" alt="Player screen on mobile" />
  <img src="/assets/player-pc.png" width="420" alt="Player screen on web" />
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

### Options & queue

<p align="center">
  <img src="/assets/player-options-movil.PNG" width="180" alt="Player options on mobile" />
  <img src="/assets/player-queue-movil.PNG" width="180" alt="Play queue on mobile" />
</p>
<p align="center">
  <img src="/assets/player-options-pc.png" width="380" alt="Player options on web" />
  <img src="/assets/player-queue-pc.png" width="380" alt="Play queue on web" />
</p>

### Sleep timer & video mode

<p align="center">
  <img src="/assets/player-timer-movil.PNG" width="180" alt="Sleep timer on mobile" />
  <img src="/assets/player-video-movil.PNG" width="180" alt="Video mode on mobile" />
</p>
<p align="center">
  <img src="/assets/player-timer-pc.png" width="380" alt="Sleep timer on web" />
  <img src="/assets/player-video-pc.png" width="380" alt="Video mode on web" />
</p>

### Lyrics

<p align="center">
  <img src="/assets/player-2-movil.PNG" width="200" alt="Lyrics view on mobile" />
  <img src="/assets/player-lyrics-pc.png" width="400" alt="Lyrics view on web" />
</p>

You can also see the lyrics of the song right inside the player. If the algorithm can't find them, you can search for them manually and they'll get saved for next time.

## Search

<p align="center">
  <img src="/assets/search-movil.PNG" width="220" alt="Search screen on mobile" />
  <img src="/assets/search-pc.png" width="420" alt="Search screen on web" />
</p>

Discover new music or look up something specific:

- Browse by **genre**
- Search **songs or artists** directly

<p align="center">
  <img src="/assets/genres-movil.PNG" width="220" alt="Genres screen on mobile" />
  <img src="/assets/genres-pc.png" width="420" alt="Genres screen on web" />
</p>

## Profile & stats

<p align="center">
  <img src="/assets/profile-movil.PNG" width="220" alt="Profile screen on mobile" />
  <img src="/assets/stats-movil.PNG" width="220" alt="Listening stats on mobile" />
  <img src="/assets/stats-pc.png" width="420" alt="Listening stats on web" />
</p>

Check your profile and dig into your listening stats — see what you've been playing the most and how your taste has been moving.

## Settings

<p align="center">
  <img src="/assets/settings-movil.PNG" width="220" alt="Settings screen on mobile" />
  <img src="/assets/settings-pc.png" width="420" alt="Settings screen on web" />
</p>

In settings you can switch the language between **English, Spanish and Japanese**, and also pick the video quality you want for the song videos. Heads up: the higher the quality, the slower the video loads.

## Lock screen

<p align="center">
  <img src="/assets/lockScreen.PNG" width="240" alt="Lock screen player controls" />
</p>

The player works straight from the lock screen too, so you can:

- Pause or play
- Skip songs

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
