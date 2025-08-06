// Global audio context
let audioContext: AudioContext | null = null;
// Global sound enabled flag
let isSoundEnabled = true;

/**
 * Sets whether sounds should be played.
 * @param enabled true to enable sound, false to disable.
 */
export const setSoundEnabled = (enabled: boolean) => {
    isSoundEnabled = enabled;
};


const initAudioContext = () => {
    if (!audioContext) {
        try {
            // Standard AudioContext with fallback for older browsers
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContext = new AudioContext();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.", e);
        }
    }
    return audioContext;
};

/**
 * Unlocks the audio context. Must be called from a user-initiated event (like a click).
 * This is necessary because browsers block audio from playing until the user interacts with the page.
 */
export const unlockAudio = () => {
    const context = initAudioContext();
    // Resume the context if it's in a suspended state (common in modern browsers before user interaction)
    if (context && context.state === 'suspended') {
        context.resume().then(() => {
             console.log("AudioContext resumed successfully.");
        }).catch(e => {
            console.error("Error resuming AudioContext:", e);
        });
    }
};


/**
 * A simple utility to play audio files from a given URL.
 * It creates a new Audio object for each playback to allow for overlapping sounds.
 * Includes basic error handling for browser autoplay policies.
 * @param soundUrl The path to the audio file (e.g., '/tombol.mp3').
 */
export const playAudio = (soundUrl: string) => {
  // If sound is disabled, do nothing.
  if (!isSoundEnabled) {
      return;
  }
  
  // Ensure the context is initialized, though unlockAudio should have been called first.
  initAudioContext();
  
  const audio = new Audio(soundUrl);
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.catch(error => {
      // Autoplay was prevented. This is a common browser policy,
      // especially before the user has interacted with the page.
      // We log this for debugging but it's not a critical user-facing error.
      console.warn(`Audio playback for "${soundUrl}" was prevented. This is often fixed after the first user interaction.`, error);
    });
  }
};
