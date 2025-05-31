import voicesData from "./voices.json";

export interface VoiceInfo {
  label: string;
  name: string;
  altNames?: string[];
  language: string;
  gender: "female" | "male";
  quality: string[];
  rate: number;
  pitch?: number;
  pitchControl?: boolean;
  browser?: string[];
  os?: string[];
  preloaded?: boolean;
  children?: boolean;
  multiLingual?: boolean;
  nativeID?: string[];
}

export type VoiceType = "female" | "male" | "robot";

class VoiceSelector {
  private voicesDatabase: VoiceInfo[];
  private systemVoices: SpeechSynthesisVoice[] = [];
  private voiceCache: Map<string, SpeechSynthesisVoice | null> = new Map();

  constructor() {
    this.voicesDatabase = voicesData.voices as VoiceInfo[];
    this.initializeSystemVoices();
  }

  private initializeSystemVoices() {
    // Load system voices
    const loadVoices = () => {
      this.systemVoices = speechSynthesis.getVoices();
      this.voiceCache.clear(); // Clear cache when voices change
    };

    loadVoices();

    // Chrome requires waiting for voices to load
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  private getQualityScore(quality: string[]): number {
    const qualityScores = { veryHigh: 4, high: 3, normal: 2, low: 1 };
    return Math.max(
      ...quality.map((q) => qualityScores[q as keyof typeof qualityScores] || 0)
    );
  }

  private matchSystemVoice(voiceInfo: VoiceInfo): SpeechSynthesisVoice | null {
    const cacheKey = voiceInfo.name;

    if (this.voiceCache.has(cacheKey)) {
      return this.voiceCache.get(cacheKey) || null;
    }

    const potentialNames = [voiceInfo.name, ...(voiceInfo.altNames || [])];

    // Try exact matches first
    for (const name of potentialNames) {
      const exactMatch = this.systemVoices.find((voice) => voice.name === name);
      if (exactMatch) {
        this.voiceCache.set(cacheKey, exactMatch);
        return exactMatch;
      }
    }

    // Try partial matches
    for (const name of potentialNames) {
      const partialMatch = this.systemVoices.find(
        (voice) =>
          voice.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(voice.name.toLowerCase())
      );
      if (partialMatch) {
        this.voiceCache.set(cacheKey, partialMatch);
        return partialMatch;
      }
    }

    // Try matching by label (for simpler names)
    const labelMatch = this.systemVoices.find((voice) =>
      voice.name.toLowerCase().includes(voiceInfo.label.toLowerCase())
    );

    if (labelMatch) {
      this.voiceCache.set(cacheKey, labelMatch);
      return labelMatch;
    }

    this.voiceCache.set(cacheKey, null);
    return null;
  }

  private filterByGender(gender: "female" | "male"): VoiceInfo[] {
    return this.voicesDatabase.filter((voice) => voice.gender === gender);
  }

  private sortByPriority(voices: VoiceInfo[]): VoiceInfo[] {
    return voices.sort((a, b) => {
      // Prioritize by quality
      const qualityDiff =
        this.getQualityScore(b.quality) - this.getQualityScore(a.quality);
      if (qualityDiff !== 0) return qualityDiff;

      // Prefer preloaded voices
      const aPreloaded = a.preloaded ? 1 : 0;
      const bPreloaded = b.preloaded ? 1 : 0;
      const preloadedDiff = bPreloaded - aPreloaded;
      if (preloadedDiff !== 0) return preloadedDiff;

      // Prefer non-children voices for NATO alphabet
      const aChildren = a.children ? 0 : 1;
      const bChildren = b.children ? 0 : 1;
      const childrenDiff = bChildren - aChildren;
      if (childrenDiff !== 0) return childrenDiff;

      // Prefer US English for consistency
      const aUSEnglish = a.language === "en-US" ? 1 : 0;
      const bUSEnglish = b.language === "en-US" ? 1 : 0;
      return bUSEnglish - aUSEnglish;
    });
  }

  public selectVoice(voiceType: VoiceType): SpeechSynthesisVoice | null {
    if (voiceType === "robot") {
      // For robot voice, try to find a male voice that can be modified
      // or fall back to any available voice
      const robotVoice = this.selectVoice("male") || this.selectVoice("female");
      return robotVoice;
    }

    // Get voices of the requested gender
    const candidateVoices = this.filterByGender(voiceType);

    // Sort by priority (quality, preloaded, etc.)
    const sortedVoices = this.sortByPriority(candidateVoices);

    // Try to find the best available voice
    for (const voiceInfo of sortedVoices) {
      const systemVoice = this.matchSystemVoice(voiceInfo);
      if (systemVoice) {
        return systemVoice;
      }
    }

    // Fallback: use simple gender matching on system voices
    const fallbackVoice = this.systemVoices.find((voice) => {
      const nameLower = voice.name.toLowerCase();
      if (voiceType === "female") {
        return (
          nameLower.includes("female") ||
          nameLower.includes("woman") ||
          nameLower.includes("zira") ||
          nameLower.includes("samantha") ||
          nameLower.includes("emma") ||
          nameLower.includes("jenny") ||
          nameLower.includes("aria")
        );
      } else {
        return (
          nameLower.includes("male") ||
          nameLower.includes("man") ||
          nameLower.includes("david") ||
          nameLower.includes("mark") ||
          nameLower.includes("brian") ||
          nameLower.includes("andrew") ||
          nameLower.includes("guy")
        );
      }
    });

    return fallbackVoice || null;
  }

  public getAvailableVoices(): {
    female: SpeechSynthesisVoice[];
    male: SpeechSynthesisVoice[];
    all: SpeechSynthesisVoice[];
  } {
    const femaleVoices: SpeechSynthesisVoice[] = [];
    const maleVoices: SpeechSynthesisVoice[] = [];

    // Get voices from database
    for (const voiceInfo of this.voicesDatabase) {
      const systemVoice = this.matchSystemVoice(voiceInfo);
      if (systemVoice) {
        if (voiceInfo.gender === "female") {
          femaleVoices.push(systemVoice);
        } else {
          maleVoices.push(systemVoice);
        }
      }
    }

    return {
      female: femaleVoices,
      male: maleVoices,
      all: [...femaleVoices, ...maleVoices],
    };
  }

  public getVoiceRecommendation(voiceType: VoiceType): {
    voice: SpeechSynthesisVoice | null;
    settings: { rate: number; pitch: number; volume: number };
  } {
    const voice = this.selectVoice(voiceType);

    let settings = {
      rate: 0.8,
      pitch: 1.0,
      volume: 1.0,
    };

    if (voiceType === "robot") {
      settings = {
        rate: 0.6,
        pitch: 0.3,
        volume: 1.0,
      };
    } else if (voiceType === "male") {
      settings = {
        rate: 0.8,
        pitch: 0.9,
        volume: 1.0,
      };
    } else if (voiceType === "female") {
      settings = {
        rate: 0.8,
        pitch: 1.1,
        volume: 1.0,
      };
    }

    return { voice, settings };
  }
}

// Export singleton instance
export const voiceSelector = new VoiceSelector();

// Export utility functions
export function getBestVoice(
  voiceType: VoiceType
): SpeechSynthesisVoice | null {
  return voiceSelector.selectVoice(voiceType);
}

export function getVoiceSettings(voiceType: VoiceType): {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
} {
  const recommendation = voiceSelector.getVoiceRecommendation(voiceType);
  return { voice: recommendation.voice, ...recommendation.settings };
}
