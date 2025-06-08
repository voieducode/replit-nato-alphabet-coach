// Utility for calculating speech recognition restart delay
export function calculateRestartDelay(lastStartTime: number): number {
  const now = Date.now();
  const runningTime = now - lastStartTime;

  if (runningTime < 1000) {
    return 2000; // 2 seconds for very short sessions
  } else if (runningTime < 5000) {
    return 1000; // 1 second for short sessions
  } else {
    return 300; // 300ms for normal sessions
  }
}
