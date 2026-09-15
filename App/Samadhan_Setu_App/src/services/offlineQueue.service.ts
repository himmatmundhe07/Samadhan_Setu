/**
 * Samadhan Setu — Offline Queue Service
 * Saves submissions locally when offline, auto-syncs when connectivity returns.
 * RULE: Never show "fail" — always reassuring ("saved, sending when possible").
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { problemService } from './problem.service';

const QUEUE_KEY = '@samadhan_offline_queue';

export interface QueuedSubmission {
  id: string;
  data: {
    images: string[];       // Base64 or local URIs
    voiceNote?: string;
    title?: string;
    description?: string;
    category: string;
    location: {
      latitude: number;
      longitude: number;
      district: string;
      address?: string;
    };
    isEmergency: boolean;
  };
  timestamp: string;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'retry';
  retryCount: number;
}

export const offlineQueueService = {
  /**
   * Add a submission to the offline queue
   */
  enqueue: async (submission: Omit<QueuedSubmission, 'id' | 'timestamp' | 'syncStatus' | 'retryCount'>): Promise<QueuedSubmission> => {
    const queue = await offlineQueueService.getQueue();
    const item: QueuedSubmission = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...submission,
      timestamp: new Date().toISOString(),
      syncStatus: 'pending',
      retryCount: 0,
    };
    queue.push(item);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    return item;
  },

  /**
   * Get all queued submissions
   */
  getQueue: async (): Promise<QueuedSubmission[]> => {
    try {
      const data = await AsyncStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Get count of pending (unsynced) items
   */
  getPendingCount: async (): Promise<number> => {
    const queue = await offlineQueueService.getQueue();
    return queue.filter((item) => item.syncStatus !== 'synced').length;
  },

  /**
   * Update sync status of a queue item
   */
  updateStatus: async (id: string, status: QueuedSubmission['syncStatus']): Promise<void> => {
    const queue = await offlineQueueService.getQueue();
    const updated = queue.map((item) =>
      item.id === id ? { ...item, syncStatus: status } : item
    );
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
  },

  /**
   * Remove a synced item from the queue
   */
  dequeue: async (id: string): Promise<void> => {
    const queue = await offlineQueueService.getQueue();
    const filtered = queue.filter((item) => item.id !== id);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
  },

  /**
   * Clear all synced items
   */
  clearSynced: async (): Promise<void> => {
    const queue = await offlineQueueService.getQueue();
    const pending = queue.filter((item) => item.syncStatus !== 'synced');
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(pending));
  },

  /**
   * Attempt to sync all pending items (called when connectivity returns)
   * In production, this would call problemService.submitProblem for each item.
   */
  syncAll: async (): Promise<{ synced: number; failed: number }> => {
    const queue = await offlineQueueService.getQueue();
    const pending = queue.filter((item) => item.syncStatus === 'pending' || item.syncStatus === 'retry');

    let synced = 0;
    let failed = 0;

    for (const item of pending) {
      try {
        await offlineQueueService.updateStatus(item.id, 'syncing');
        await problemService.submitProblem(item.data as any);
        await offlineQueueService.updateStatus(item.id, 'synced');
        synced++;
      } catch {
        await offlineQueueService.updateStatus(item.id, 'retry');
        failed++;
      }
    }

    return { synced, failed };
  },
};
