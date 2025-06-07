// Helper functions for Android detection and speech context validation

export function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

export function isSecureContext(): boolean {
  return (
    window.isSecureContext ||
    location.protocol === 'https:' ||
    location.hostname === 'localhost'
  );
}

export function hasUserGesture(): boolean {
  return (
    document.hasFocus() &&
    Date.now() - (window as any).__lastUserInteraction < 5000
  );
}
