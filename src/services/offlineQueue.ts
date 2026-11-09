const STORAGE_KEY = 'jarvis_offline_queue';

export interface OfflineQueueEntry {
  id: string;
  text: string;
  createdAt: string;
  attempts: number;
}

export function getOfflineQueue(): OfflineQueueEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueueEntry[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function addOfflineQueuedCommand(text: string): OfflineQueueEntry {
  const item: OfflineQueueEntry = {
    id: `offline-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  const queue = getOfflineQueue();
  queue.push(item);
  saveOfflineQueue(queue);
  return item;
}

export function removeOfflineQueuedCommand(id: string) {
  const queue = getOfflineQueue().filter((entry) => entry.id !== id);
  saveOfflineQueue(queue);
}

export function clearOfflineQueue() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function flushOfflineQueue(processor: (text: string) => Promise<void>): Promise<number> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 0;
  }

  const queue = getOfflineQueue();
  if (!queue.length) return 0;

  let flushed = 0;

  for (const entry of [...queue]) {
    try {
      await processor(entry.text);
      removeOfflineQueuedCommand(entry.id);
      flushed += 1;
    } catch {
      break;
    }
  }

  return flushed;
}
