/**
 * Samadhan Setu — Notification Service
 * Matched 100% with backend controllers/notification.controller.js
 */
import api from './api';
import { Notification } from '../store/notificationStore';

export const notificationService = {
  /**
   * GET /api/notifications
   * Matches getNotifications in controllers/notification.controller.js
   */
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data.map((item: any) => ({
          id: item._id || item.id,
          title: item.type === 'assignment' ? 'टीम सौंपी गई' : item.type === 'funding' ? 'परियोजना फंडिंग' : 'शिकायत स्थिति अपडेट',
          message: item.message || '',
          type: item.type || 'status_update',
          problemId: item.link ? item.link.replace('/problems/', '') : undefined,
          isRead: Boolean(item.read || item.isRead),
          createdAt: item.created_at || item.createdAt || new Date().toISOString(),
        }));
      }
    } catch (err: any) {
      if (err.response?.status !== 401) {
        console.error('[Notification Service] getNotifications error:', err.message);
      }
    }
    return [];
  },

  /**
   * PATCH /api/notifications/:id/read
   * Matches markAsRead in controllers/notification.controller.js
   */
  markAsRead: async (id: string): Promise<void> => {
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch (e) {}
  },

  /**
   * POST /api/notifications/read-all
   * Matches markAllAsRead in controllers/notification.controller.js
   */
  markAllAsRead: async (): Promise<void> => {
    try {
      await api.post('/notifications/read-all');
    } catch (e) {}
  },
};
