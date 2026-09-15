/**
 * Samadhan Setu — Socket.io Real-time Push Event Service
 * Connects to Report_Maro backend Socket.io server with JWT authentication handshake.
 */
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './api';

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL || 'https://report-maro-1.onrender.com';

export type SocketEvent =
  | 'problem_verified'
  | 'problem_assigned'
  | 'new_proposal'
  | 'project_funded'
  | 'problem_resolved_pending_confirmation';

let socket: Socket | null = null;
const eventListeners = new Map<string, Set<(data: any) => void>>();

export const socketService = {
  /**
   * Connect to Socket.io server with JWT auth handshake
   */
  connect: (userId?: string) => {
    if (socket?.connected) {
      console.log('[Socket] Already connected to server');
      return;
    }

    const token = getAuthToken();

    console.log(`[Socket] Connecting to ${SOCKET_URL}...`);

    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token: token || '',
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socket.on('connect', () => {
      console.log(`[Socket] Connected successfully with ID: ${socket?.id}`);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    // Re-attach existing listeners
    eventListeners.forEach((callbacks, event) => {
      callbacks.forEach((cb) => {
        socket?.on(event, cb);
      });
    });
  },

  /**
   * Disconnect from Socket.io server
   */
  disconnect: () => {
    if (socket) {
      console.log('[Socket] Disconnecting socket instance');
      socket.disconnect();
      socket = null;
    }
  },

  /**
   * Register listener for real-time events
   */
  onEvent: (event: SocketEvent, callback: (data: any) => void) => {
    if (!eventListeners.has(event)) {
      eventListeners.set(event, new Set());
    }
    eventListeners.get(event)?.add(callback);

    if (socket) {
      socket.on(event, callback);
    }
  },

  /**
   * Unregister listener
   */
  offEvent: (event: SocketEvent, callback?: (data: any) => void) => {
    if (callback) {
      eventListeners.get(event)?.delete(callback);
      if (socket) {
        socket.off(event, callback);
      }
    } else {
      eventListeners.delete(event);
      if (socket) {
        socket.off(event);
      }
    }
  },
};
