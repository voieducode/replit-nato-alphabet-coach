// Audio monitoring functionality
import { logDebug } from '../../lib/debug-logger';
import { getIOSInfo } from './platform-detection';

/**
 * Sets up and manages audio monitoring for visualizing microphone input levels
 * @param streamRef Reference to the MediaStream
 * @param audioContextRef Reference to the AudioContext
 * @param analyserRef Reference to the AnalyserNode
 * @param microphoneRef Reference to the MediaStreamAudioSourceNode
 * @param setAudioLevel Function to update the audio level state
 */
export async function setupAudioMonitoring(
  isListening: boolean,
  streamRef: React.MutableRefObject<MediaStream | null>,
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  analyserRef: React.MutableRefObject<AnalyserNode | null>,
  microphoneRef: React.MutableRefObject<MediaStreamAudioSourceNode | null>,
  setAudioLevel: (level: number) => void
): Promise<void> {
  const iosInfo = getIOSInfo();

  // Don't start monitoring if we're not listening
  if (!isListening) {
    return;
  }

  logDebug('Starting audio monitoring');

  try {
    // Clean up any existing instances to prevent memory leaks
    await stopAudioMonitoring(
      streamRef,
      audioContextRef,
      microphoneRef,
      analyserRef,
      setAudioLevel
    );

    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    // Create audio context
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      logDebug('AudioContext not supported');
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    // Configure analyser for optimal performance
    analyser.fftSize = 256; // Keep this small for performance
    analyser.smoothingTimeConstant = 0.8;

    // Connect microphone to analyser
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);

    // iOS-specific: prevent audio context from being garbage collected
    if (iosInfo.isIOS) {
      // Using a tiny silent oscillator to keep the audio context active
      const silentOscillator = audioContext.createOscillator();
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0.001; // Nearly silent
      silentOscillator.connect(silentGain);
      silentGain.connect(audioContext.destination);
      silentOscillator.start();
    }

    // Store references
    streamRef.current = stream;
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    microphoneRef.current = microphone;

    // Create a reference for animation frame ID if needed
    const animationFrameIdRef = { current: null };

    // Start monitoring audio levels with optimized animation frame
    startAudioLevelMonitoring(analyserRef, setAudioLevel, animationFrameIdRef);

    logDebug('Audio monitoring started successfully');
  } catch (error) {
    logDebug('Error setting up audio monitoring:', error);
    setAudioLevel(0);
  }
}

/**
 * Start monitoring audio levels from the microphone
 * @param analyserRef Reference to the AnalyserNode
 * @param setAudioLevel Function to update the audio level state
 * @param animationFrameIdRef Reference to store the animation frame ID
 */
export function startAudioLevelMonitoring(
  analyserRef: React.MutableRefObject<AnalyserNode | null>,
  setAudioLevel: (level: number) => void,
  animationFrameIdRef: React.MutableRefObject<number | null>
): void {
  if (!analyserRef.current) {
    logDebug('Cannot start audio level monitoring: analyser node is null');
    return;
  }

  const analyser = analyserRef.current;
  const dataArray = new Uint8Array(analyser.fftSize);
  let lastUpdate = 0;

  // Function to get and visualize audio levels
  const updateAudioLevel = () => {
    const now = performance.now();

    // Update at most 10 times per second to avoid excessive renders
    if (now - lastUpdate > 100) {
      // Get sound data
      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS (root mean square) for audio level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        // Convert unsigned byte to signed float
        const audioSample = dataArray[i] / 128.0 - 1.0;
        sum += audioSample * audioSample;
      }

      const rms = Math.sqrt(sum / dataArray.length);

      // Scale to 0-100 with logarithmic transform for better visual feedback
      // This makes quiet sounds more visible
      const scaledLevel = Math.min(100, Math.round(rms ** 0.5 * 100));

      // Update state
      setAudioLevel(scaledLevel);
      lastUpdate = now;
    }

    // Continue the animation loop
    const nextFrameId = requestAnimationFrame(updateAudioLevel);
    animationFrameIdRef.current = nextFrameId;
  };

  // Start the monitoring loop
  const initialFrameId = requestAnimationFrame(updateAudioLevel);
  animationFrameIdRef.current = initialFrameId;
}

/**
 * Cleanup audio monitoring
 */
export async function stopAudioMonitoring(
  streamRef: React.MutableRefObject<MediaStream | null>,
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  microphoneRef: React.MutableRefObject<MediaStreamAudioSourceNode | null>,
  analyserRef: React.MutableRefObject<AnalyserNode | null>,
  setAudioLevel: (level: number) => void
): Promise<void> {
  const iosInfo = getIOSInfo();

  // Stop animation frame if active
  if (analyserRef.current && (analyserRef.current as any).__animationFrameId) {
    cancelAnimationFrame((analyserRef.current as any).__animationFrameId);
    (analyserRef.current as any).__animationFrameId = undefined;
  }

  // Stop all audio tracks
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => {
      track.stop();
    });
    streamRef.current = null;
  }

  // Clean up audio context with special handling for iOS
  if (audioContextRef.current) {
    try {
      // Special handling for iOS
      if (iosInfo.isIOS) {
        // First suspend the context to prevent glitches
        await audioContextRef.current.suspend();

        // Additional cleanup steps for iOS
        if (microphoneRef.current) {
          microphoneRef.current.disconnect();
        }
        if (analyserRef.current) {
          analyserRef.current.disconnect();
        }

        // Wait a bit before closing context on iOS
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Now close the context
      await audioContextRef.current.close();
    } catch (error) {
      logDebug('Error closing audio context:', error);
    }

    audioContextRef.current = null;
  }

  // Clear all remaining refs
  microphoneRef.current = null;
  analyserRef.current = null;

  // Reset audio level
  setAudioLevel(0);

  // iOS-specific: Force garbage collection hint
  if (iosInfo.isIOS && (window as any).gc) {
    try {
      (window as any).gc();
    } catch (_) {
      // Ignore if not available
    }
  }

  logDebug('Audio monitoring stopped with enhanced cleanup');
}
