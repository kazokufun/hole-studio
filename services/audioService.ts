let isAudioUnlocked = false;

/**
 * Unlocks the browser's audio context.
 * This MUST be called as a direct result of a user interaction (e.g., a click event).
 * It attempts to play a silent sound to "prime" the audio system.
 */
export const unlockAudio = () => {
    if (isAudioUnlocked) {
        return;
    }

    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a buffer source
        const source = audioContext.createBufferSource();
        source.buffer = audioContext.createBuffer(1, 1, 22050); // 1-sample buffer, 1 channel, 22050Hz sample rate
        source.connect(audioContext.destination);

        // Play the silent sound
        // Some browsers require a user gesture to start the audio context.
        if (typeof source.start === 'function') {
            source.start(0);
        }
        
        // Resume context if it's suspended, which can happen if it was created before a user gesture.
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        isAudioUnlocked = true;
        console.log("Audio Context has been unlocked.");
    } catch (e) {
        console.error("Failed to unlock audio context:", e);
    }
};


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
      console.warn(`Audio playback for "${soundUrl}" was prevented. Ensure audio is unlocked via a user gesture.`, error);
    });
  }
};
