/* ==========================================================================
   ECHORA site configuration — the ONLY place to edit links, version and file facts.
   Downloads are served straight from this repository (downloads/), so a click
   saves the game file; there is no external file host.
   The game version itself comes from package.json of the game repo (one source);
   this file only mirrors it for the page.
   ========================================================================== */
window.ECHORA_CONFIG = {
  VERSION: "Pre-Alpha 0.5",
  VERSION_NUMBER: "0.5.1",

  // Windows portable game (one .exe) and Android package.
  WIN_URL: "downloads/ECHORA-0.5.1-portable.exe",
  WIN_FILE: "ECHORA-0.5.1-portable.exe",
  WIN_SIZE: "73 MB",
  APK_URL: "downloads/ECHORA-0.5.1.apk",
  APK_FILE: "ECHORA-0.5.1.apk",
  APK_SIZE: "1.9 MB",

  // Teaser MP4: a montage of real in-game captures. Empty = show the in-page slideshow preview.
  TEASER_URL: "assets/media/echora-teaser.mp4",
  TEASER_WEBM: "assets/media/echora-teaser.webm",

  PLATFORM: "Windows x64 · Android 7+",
};
