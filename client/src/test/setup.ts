import { expect, afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock Web Speech API for tests
Object.defineProperty(window, "SpeechRecognition", {
  writable: true,
  value: class MockSpeechRecognition {
    continuous = false;
    interimResults = false;
    maxAlternatives = 1;
    lang = "en-US";
    onstart: ((event: any) => void) | null = null;
    onresult: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onend: ((event: any) => void) | null = null;

    start() {
      if (this.onstart) this.onstart({});
    }

    stop() {
      if (this.onend) this.onend({});
    }

    abort() {
      if (this.onend) this.onend({});
    }
  },
});

Object.defineProperty(window, "webkitSpeechRecognition", {
  writable: true,
  value: window.SpeechRecognition,
});

// Mock speechSynthesis for voice testing
Object.defineProperty(window, "speechSynthesis", {
  writable: true,
  value: {
    getVoices: () => [],
    speak: () => {},
    cancel: () => {},
    pause: () => {},
    resume: () => {},
    pending: false,
    speaking: false,
    paused: false,
    onvoiceschanged: null,
  },
});

// Mock SpeechSynthesisUtterance
Object.defineProperty(window, "SpeechSynthesisUtterance", {
  writable: true,
  value: class MockSpeechSynthesisUtterance {
    text = "";
    lang = "en-US";
    voice: SpeechSynthesisVoice | null = null;
    volume = 1;
    rate = 1;
    pitch = 1;
    onstart: ((event: any) => void) | null = null;
    onend: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onpause: ((event: any) => void) | null = null;
    onresume: ((event: any) => void) | null = null;
    onmark: ((event: any) => void) | null = null;
    onboundary: ((event: any) => void) | null = null;

    constructor(text?: string) {
      this.text = text || "";
    }
  },
});

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: (() => {
    const store: Record<string, string> = {};
    return {
      getItem(key: string) {
        return key in store ? store[key] : null;
      },
      setItem(key: string, value: string) {
        store[key] = value;
      },
      removeItem(key: string) {
        delete store[key];
      },
      clear() {
        Object.keys(store).forEach((key) => delete store[key]);
      },
    };
  })(),
});
