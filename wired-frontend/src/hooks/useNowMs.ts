import { useSyncExternalStore } from 'react';

const TICK_MS = 60_000;

type Listener = () => void;
const listeners = new Set<Listener>();
let timeMs = Date.now();
let intervalId: ReturnType<typeof setInterval> | undefined;

function startTicking() {
  if (intervalId !== undefined) return;
  intervalId = setInterval(() => {
    timeMs = Date.now();
    listeners.forEach((l) => l());
  }, TICK_MS);
}

function stopTickingIfIdle() {
  if (listeners.size > 0) return;
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}

function subscribe(onStoreChange: Listener) {
  timeMs = Date.now();
  listeners.add(onStoreChange);
  startTicking();
  return () => {
    listeners.delete(onStoreChange);
    stopTickingIfIdle();
  };
}

function getSnapshot() {
  return timeMs;
}

function getServerSnapshot() {
  return 0;
}

/** Monotonic “now” for relative labels; updates every minute (matches edit-label granularity). */
export function useNowMs() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
