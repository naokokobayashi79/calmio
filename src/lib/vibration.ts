export function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

export function vibrate(pattern: number | number[]): void {
  if (canVibrate()) {
    navigator.vibrate(pattern);
  }
}

export function vibrateBreathTransition(): void {
  vibrate([50, 30, 50]);
}

export function stopVibration(): void {
  if (canVibrate()) {
    navigator.vibrate(0);
  }
}
