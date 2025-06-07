import type {
  MediaDevicesInfo,
  PlatformCompatibility,
} from './speech-recognition-types';
// Platform and browser detection utilities
import { logDebug } from '../../lib/debug-logger';

/**
 * Detect if the user is on an Android device
 */
export function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

/**
 * Get information about Android device and browser
 */
export function getAndroidInfo() {
  const isAndroid = /android/i.test(navigator.userAgent);

  // Extract Android version if available
  const androidVersionMatch = navigator.userAgent.match(/Android\s([0-9.]+)/i);
  const androidVersion = androidVersionMatch
    ? androidVersionMatch[1]
    : undefined;

  // Determine browser
  const isChrome = /chrome|chromium|crios/i.test(navigator.userAgent);
  const isFirefox = /firefox|fxios/i.test(navigator.userAgent);
  const isSamsung = /samsungbrowser/i.test(navigator.userAgent);

  // Extract Chrome version if applicable
  const chromeVersionMatch = navigator.userAgent.match(
    /(?:Chrome|CriOS)\/([0-9.]+)/i
  );
  const chromeVersion = chromeVersionMatch ? chromeVersionMatch[1] : undefined;

  // Check if using WebView
  const isWebView =
    /wv/.test(navigator.userAgent.toLowerCase()) ||
    (/version/.test(navigator.userAgent.toLowerCase()) &&
      isChrome &&
      !/chrome/.test(navigator.userAgent.toLowerCase()));

  const browser = isSamsung
    ? 'Samsung'
    : isChrome
      ? 'Chrome'
      : isFirefox
        ? 'Firefox'
        : 'Other';

  return {
    isAndroid,
    androidVersion,
    browser,
    isChrome,
    isFirefox,
    isSamsung,
    chromeVersion,
    isWebView,
  };
}

/**
 * Get information about iOS device and browser
 */
export function getIOSInfo() {
  // Check for iOS
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  // Extract iOS version if available
  const iosVersionMatch = navigator.userAgent.match(/OS\s([0-9_]+)/i);
  const iosVersion = iosVersionMatch
    ? iosVersionMatch[1].replace(/_/g, '.')
    : undefined;

  // Determine browser on iOS
  const isSafari =
    /Safari/i.test(navigator.userAgent) && !/Chrome/i.test(navigator.userAgent);
  const isChrome = /CriOS/i.test(navigator.userAgent);
  const isFirefox = /FxiOS/i.test(navigator.userAgent);
  const isEdge = /EdgiOS/i.test(navigator.userAgent);

  // Extract Safari version if applicable
  const safariVersionMatch = navigator.userAgent.match(/Version\/([0-9.]+)/i);
  const safariVersion = safariVersionMatch ? safariVersionMatch[1] : undefined;

  // Check if using WebView (common in embedded browsers)
  const isWebView = !isSafari && !isChrome && !isFirefox && !isEdge && isIOS;

  return {
    isIOS,
    iosVersion,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    safariVersion,
    isWebView,
  };
}

/**
 * Get information about macOS and browser
 */
export function getMacOSInfo() {
  const isMacOS =
    /Macintosh/.test(navigator.userAgent) && !(window as any).MSStream;

  const platform = navigator.platform || 'unknown';
  const isSiliconMac = isMacOS && /arm/.test(navigator.platform.toLowerCase());
  const isIntelMac = isMacOS && /intel/.test(navigator.platform.toLowerCase());

  // Extract macOS version if available
  const macOSVersionMatch = navigator.userAgent.match(/Mac OS X\s([0-9_]+)/i);
  const macOSVersion = macOSVersionMatch
    ? macOSVersionMatch[1].replace(/_/g, '.')
    : undefined;

  return {
    isMacOS,
    platform,
    isSiliconMac,
    isIntelMac,
    macOSVersion,
  };
}

/**
 * Get information about Chrome running on macOS
 */
export function getChromeOnMacOSInfo() {
  const macOSInfo = getMacOSInfo();
  const desktopInfo = getDesktopBrowserInfo();
  const isChromeOnMacOS = macOSInfo.isMacOS && desktopInfo.isChrome;

  return {
    isChromeOnMacOS,
    confidenceThreshold: isChromeOnMacOS ? 0.7 : 0.85,
  };
}

/**
 * Get information about desktop browser
 */
export function getDesktopBrowserInfo() {
  const userAgent = navigator.userAgent;
  const isDesktop = !isAndroid() && !getIOSInfo().isIOS;

  // Detect browsers
  const isChrome =
    /Chrome|Chromium/.test(userAgent) && !/Edge|Edg/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent) && !/Seamonkey/.test(userAgent);
  const isSafari =
    /Safari/.test(userAgent) && !/Chrome|Chromium|Edge|Edg/.test(userAgent);
  const isEdge = /Edge|Edg/.test(userAgent);

  // Extract versions
  const chromeMatch = userAgent.match(/(?:Chrome|Chromium)\/([0-9.]+)/);
  const firefoxMatch = userAgent.match(/Firefox\/([0-9.]+)/);
  const safariMatch = userAgent.match(/Version\/(\d+(?:\.\d+)*)/);
  const edgeMatch = userAgent.match(/(?:Edge|Edg)\/([0-9.]+)/);

  const chromeVersion = chromeMatch ? chromeMatch[1] : undefined;
  const firefoxVersion = firefoxMatch ? firefoxMatch[1] : undefined;
  const safariVersion = safariMatch ? safariMatch[1] : undefined;
  const edgeVersion = edgeMatch ? edgeMatch[1] : undefined;

  let browser = 'Unknown';
  let version;

  if (isEdge) {
    browser = 'Edge';
    version = edgeVersion;
  } else if (isChrome) {
    browser = 'Chrome';
    version = chromeVersion;
  } else if (isFirefox) {
    browser = 'Firefox';
    version = firefoxVersion;
  } else if (isSafari) {
    browser = 'Safari';
    version = safariVersion;
  }

  return {
    isDesktop,
    browser,
    version,
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    chromeVersion,
    firefoxVersion,
    safariVersion,
    edgeVersion,
  };
}

/**
 * Get information about security context (HTTPS, localhost)
 */
export function getSecurityContext() {
  const isSecure =
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  return {
    isSecure,
    protocol: window.location.protocol,
    host: window.location.hostname,
  };
}

/**
 * Get network information
 */
export function getNetworkInfo() {
  const connection = (navigator as any).connection;

  return {
    online: navigator.onLine,
    connectionInfo: connection
      ? {
          type: connection.type,
          effectiveType: connection.effectiveType,
          downlinkMax: connection.downlinkMax,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }
      : null,
  };
}

/**
 * Get information about user gesture status
 */
export function getUserGestureInfo() {
  // This is a bit imprecise, but can help determine if there was a recent user interaction
  const now = Date.now();
  const lastInteractionTime = (window as any).__lastUserInteraction || 0;
  const timeSinceInteraction = now - lastInteractionTime;
  const hasGesture = timeSinceInteraction < 5000; // Consider user gesture valid for 5 seconds

  return {
    hasGesture,
    lastInteractionTime,
    timeSinceInteraction,
  };
}

/**
 * Get information about media devices
 */
export async function getMediaDevicesInfo(): Promise<MediaDevicesInfo> {
  const info = {
    audioInputDevices: 0,
    videoInputDevices: 0,
    audioOutputDevices: 0,
    permissions: {} as {
      microphone?: PermissionState;
      camera?: PermissionState;
    },
  };

  try {
    // Check permissions if available
    if (navigator.permissions) {
      try {
        const micPermission = await navigator.permissions.query({
          name: 'microphone' as any,
        });
        info.permissions.microphone = micPermission.state;
      } catch (e) {
        logDebug('Error checking microphone permission', e);
      }

      try {
        const cameraPermission = await navigator.permissions.query({
          name: 'camera' as any,
        });
        info.permissions.camera = cameraPermission.state;
      } catch (e) {
        logDebug('Error checking camera permission', e);
      }
    }

    // Check available devices
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      const devices = await navigator.mediaDevices.enumerateDevices();

      devices.forEach((device) => {
        if (device.kind === 'audioinput') {
          info.audioInputDevices++;
        } else if (device.kind === 'videoinput') {
          info.videoInputDevices++;
        } else if (device.kind === 'audiooutput') {
          info.audioOutputDevices++;
        }
      });
    }
  } catch (error) {
    logDebug('Error getting media devices info', error);
  }

  return info;
}

/**
 * Check if speech recognition is compatible with the current platform/browser
 */
export function checkSpeechRecognitionCompatibility(): PlatformCompatibility {
  const androidInfo = getAndroidInfo();
  const iosInfo = getIOSInfo();
  const macOSInfo = getMacOSInfo();
  const desktopInfo = getDesktopBrowserInfo();

  // Create platform info object
  const platformInfo = {
    isAndroid: androidInfo.isAndroid,
    isIOS: iosInfo.isIOS,
    isMacOS: macOSInfo.isMacOS,
    isWindows: /Windows/.test(navigator.userAgent),
    isLinux: /Linux/.test(navigator.userAgent) && !androidInfo.isAndroid,
    isDesktop: desktopInfo.isDesktop,
    isMobile: !desktopInfo.isDesktop,
    browser: desktopInfo.browser,
    isChrome: desktopInfo.isChrome || androidInfo.isChrome || iosInfo.isChrome,
    isFirefox:
      desktopInfo.isFirefox || androidInfo.isFirefox || iosInfo.isFirefox,
    isSafari: desktopInfo.isSafari || iosInfo.isSafari,
    isEdge: desktopInfo.isEdge || iosInfo.isEdge,
    version: desktopInfo.version,
    isWebView: androidInfo.isWebView || iosInfo.isWebView || false,
  };

  // Edge browser on macOS is known to be incompatible with speech recognition
  if (macOSInfo.isMacOS && desktopInfo.isEdge) {
    return {
      supported: false,
      reason: 'Microsoft Edge on macOS does not support speech recognition',
      platformInfo,
    };
  }

  // Some WebView environments have limited speech recognition capabilities
  if (
    (androidInfo.isAndroid || iosInfo.isIOS) &&
    (androidInfo.isWebView || iosInfo.isWebView)
  ) {
    return {
      supported: true, // Still returning true, but with a warning
      reason:
        'WebView environment detected - limited speech recognition support',
      platformInfo,
    };
  }

  // Basic API check - return false if basic SpeechRecognition API isn't available
  if (
    !(window as any).SpeechRecognition &&
    !(window as any).webkitSpeechRecognition
  ) {
    return {
      supported: false,
      reason: 'Speech Recognition API not available in this browser',
      platformInfo,
    };
  }

  // All good!
  return {
    supported: true,
    platformInfo,
  };
}

/**
 * Detect the language for speech recognition based on document or browser settings
 */
export function detectLanguage(): string {
  // First try to get from HTML lang attribute
  const htmlLang = document.documentElement.lang;
  if (htmlLang) {
    return htmlLang;
  }

  // Then try to get from meta tag
  const metaLang = document.querySelector(
    'meta[http-equiv="Content-Language"]'
  );
  if (metaLang && metaLang.getAttribute('content')) {
    return metaLang.getAttribute('content') as string;
  }

  // Finally fall back to browser language
  return navigator.language || 'en-US';
}

/**
 * Get browser information
 */
export function getBrowserInfo() {
  const ua = navigator.userAgent;

  let browser = 'unknown';
  let version;

  if (ua.includes('Edge/') || ua.includes('Edg/')) {
    browser = 'Edge';
    const match = ua.match(/Edge?\/(\d+)/);
    version = match ? match[1] : undefined;
  } else if (ua.includes('Chrome/')) {
    browser = 'Chrome';
    const match = ua.match(/Chrome\/(\d+)/);
    version = match ? match[1] : undefined;
  } else if (ua.includes('Firefox/')) {
    browser = 'Firefox';
    const match = ua.match(/Firefox\/(\d+)/);
    version = match ? match[1] : undefined;
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    browser = 'Safari';
    const match = ua.match(/Version\/(\d+)/);
    version = match ? match[1] : undefined;
  } else if (ua.includes('MSIE ') || ua.includes('Trident/')) {
    browser = 'Internet Explorer';
    const match = ua.match(/MSIE (\d+)/);
    version = match ? match[1] : undefined;
  }

  return { browser, version };
}

/**
 * Check if speech recognition is supported in the current browser
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

/**
 * Check if speech synthesis is supported in the current browser
 */
export function isSpeechSynthesisSupported(): boolean {
  return !!window.speechSynthesis;
}
