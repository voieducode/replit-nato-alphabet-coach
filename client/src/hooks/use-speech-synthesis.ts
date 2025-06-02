import { useCallback, useEffect, useState } from 'react';

export interface VoiceSettings {
  voiceName: string | null;
  rate: number;
  pitch: number;
  volume: number;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  voiceName: null,
  rate: 0.8,
  pitch: 1.0,
  volume: 1.0,
};

export function useSpeechSynthesis() {
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const stored = localStorage.getItem('voice-settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  });

  // Handle voice loading
  const handleVoicesChanged = useCallback(() => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setAvailableVoices(voices);
    }
  }, []);

  // Set default voice if none selected
  const initializeDefaultVoice = useCallback(() => {
    if (availableVoices.length > 0 && !voiceSettings.voiceName) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setVoiceSettings((prev) => ({
        ...prev,
        voiceName: availableVoices[0].name,
      }));
    }
  }, [availableVoices, voiceSettings.voiceName]);

  // Initialize voices
  useEffect(() => {
    handleVoicesChanged();
    speechSynthesis.onvoiceschanged = handleVoicesChanged;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [handleVoicesChanged]);

  // Call the voice initialization in a separate useEffect
  useEffect(() => {
    initializeDefaultVoice();
  }, [initializeDefaultVoice]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('voice-settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  const speak = useCallback(
    (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Find and apply selected voice
      const voice = availableVoices.find(
        (v) => v.name === voiceSettings.voiceName
      );
      if (voice) {
        utterance.voice = voice;
      }

      // Apply settings
      utterance.rate = voiceSettings.rate;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;

      speechSynthesis.speak(utterance);
    },
    [availableVoices, voiceSettings]
  );

  return {
    availableVoices,
    voiceSettings,
    setVoiceSettings,
    speak,
  };
}
