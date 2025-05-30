import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'

// Cleanup after each test case
afterEach(() => {
  cleanup()
})

// Mock Web Speech API for tests
Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: class MockSpeechRecognition {
    continuous = false
    interimResults = false
    maxAlternatives = 1
    lang = 'en-US'
    onstart: ((event: any) => void) | null = null
    onresult: ((event: any) => void) | null = null
    onerror: ((event: any) => void) | null = null
    onend: ((event: any) => void) | null = null
    
    start() {
      if (this.onstart) this.onstart({})
    }
    
    stop() {
      if (this.onend) this.onend({})
    }
    
    abort() {
      if (this.onend) this.onend({})
    }
  }
})

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: window.SpeechRecognition
})

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    store: {} as Record<string, string>,
    getItem(key: string) {
      return this.store[key] || null
    },
    setItem(key: string, value: string) {
      this.store[key] = value
    },
    removeItem(key: string) {
      delete this.store[key]
    },
    clear() {
      this.store = {}
    }
  }
})