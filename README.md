# DiegoMusic

<p align="center">
  <img src="/assets/icon.jpeg" width="120">
</p>

**DiegoMusic** es una aplicación móvil de música para **iOS y Android**, inspirada en Spotify, pero sin las limitaciones de suscripciones premium.

## Home

<p align="center">
  <img src="/assets/home.PNG" width="300">
</p>

La pantalla principal está diseñada para ofrecer acceso rápido a tu contenido más relevante:

* **Recientes**: muestra las últimas 8 canciones reproducidas.
* **Artistas favoritos**: lista de artistas guardados por el usuario junto con recomendaciones de sus canciones.

<p align="center">
  <img src="/assets/home2.PNG" width="300">
</p>

Además, incluye:

* Una lista completa de **artistas favoritos**.
* Un ranking de las **canciones más escuchadas** por el usuario.

## Favoritos

<p align="center">
  <img src="/assets/favorites.PNG" width="300">
</p>

En esta sección encontrarás todas las canciones marcadas como favoritas.

**Características clave:**

* Acceso sin conexión: las canciones guardadas pueden reproducirse sin internet.

## Reproductor

<p align="center">
  <img src="/assets/player.PNG" width="300">
</p>

Al expandir el reproductor, tendrás acceso a múltiples funcionalidades:

1. Reproducir / pausar canciones
2. Navegar entre canción anterior y siguiente
3. Ver el video de la canción
4. Compartir en redes sociales
5. Guardar en favoritos
6. Ver y gestionar la cola de reproducción
7. Configurar temporizador de reproducción
8. Activar modo aleatorio (shuffle)
9. Agregar artista a favoritos
10. Abrir el video original en YouTube

<p align="center">
  <img src="/assets/optionsPlayer.PNG" width="250">
  <img src="/assets/queueSongs.PNG" width="250">
  <img src="/assets/temporizador.PNG" width="250">
</p>

## Búsqueda

<p align="center">
  <img src="/assets/search.PNG" width="300">
</p>

La pantalla de búsqueda permite:

* Explorar música por **géneros**
* Buscar **canciones o artistas específicos**

<p align="center">
  <img src="/assets/resultSearch2.PNG" width="300">
  <img src="/assets/resultSearch.PNG" width="300">
</p>

## Pantalla de bloqueo

<p align="center">
  <img src="/assets/lockScreen.PNG" width="300">
</p>

El reproductor se integra con la pantalla de bloqueo del dispositivo, permitiendo:

* Reproducir / pausar
* Cambiar de canción

## Tecnologías

* Expo
* React Native
* Node.js + TypeScript
* Docker

## Funcionamiento

La aplicación reproduce música y video gracias a un **core basado en scraping de YouTube**, desde donde se obtiene:

* Información de canciones
* Videos musicales

**Nota importante:**
Para evitar bloqueos por parte de YouTube, es necesario configurar correctamente las **cookies**, simulando el comportamiento de un navegador real.

## Demo

podras encontrar una demo en

<p align="center">
  <a href="/assets/demo.mp4">Ver demo</a>
</p>