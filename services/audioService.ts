
/**
 * A simple utility to play audio files from a given URL.
 * It creates a new Audio object for each playback to allow for overlapping sounds.
 * Includes basic error handling for browser autoplay policies.
 * @param soundUrl The path to the audio file (e.g., '/tombol.mp3').
 */
export const playAudio = (soundUrl: string) => {
  const audio = new Audio(soundUrl);
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.catch(error => {
      // Autoplay was prevented. This is a common browser policy,
      // especially before the user has interacted with the page.
      // We log this for debugging but it's not a critical user-facing error.
      console.warn(`Audio playback for "${soundUrl}" was prevented.`, error);
    });
  }
};
