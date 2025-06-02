import { useCallback, useEffect, useState } from 'react';

interface VoiceSettings {
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
      setAvailableVoices(voices);
    }
  }, []);

  // Initialize voices
  useEffect(() => {
    handleVoicesChanged();
    speechSynthesis.onvoiceschanged = handleVoicesChanged;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [handleVoicesChanged]);

  // Set default voice if none selected
  useEffect(() => {
    if (availableVoices.length > 0 && !voiceSettings.voiceName) {
      setVoiceSettings((prev) => ({
        ...prev,
        voiceName: availableVoices[0].name,
      }));
    }
  }, [availableVoices, voiceSettings.voiceName]);

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
