// Simple singleton in-memory logger for debugging (speech, etc.)
const debugLog: string[] = [];

export function logDebug(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  let logEntry = `[${timestamp}] ${message}`;

  // If additional data is provided, append it as JSON
  if (data !== undefined) {
    try {
      logEntry += ` | Data: ${JSON.stringify(data)}`;
    } catch (error) {
      logEntry += ` | Data: [Unable to serialize: ${String(error)}]`;
    }
  }

  debugLog.push(logEntry);
}

export function getDebugLog(): string[] {
  return debugLog;
}

export function clearDebugLog() {
  debugLog.length = 0;
}
