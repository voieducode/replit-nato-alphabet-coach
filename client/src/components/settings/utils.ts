export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.error('Notifications not supported by browser');
    return false;
  }

  try {
    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied by user');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export function setNotificationPreference(enabled: boolean): void {
  try {
    localStorage.setItem('notifications-enabled', enabled.toString());
  } catch (error) {
    console.error('Error saving notification preference:', error);
  }
}

export function getNotificationPreference(): boolean {
  try {
    return localStorage.getItem('notifications-enabled') === 'true';
  } catch {
    return false;
  }
}
