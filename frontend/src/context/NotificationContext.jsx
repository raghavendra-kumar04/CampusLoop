import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications
  useEffect(() => {
    if (user && token) {
      const fetchNotifications = async () => {
        try {
          const res = await axios.get('/api/notifications');
          setNotifications(res.data);
          setUnreadCount(res.data.filter(n => !n.isRead).length);
        } catch (err) {
          console.error('Error fetching notifications:', err);
        }
      };

      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, token]);

  // Listen for socket notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('new_notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Trigger a browser notification or custom toast if needed
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: notification.sender?.avatar || '/favicon.svg'
        });
      }
    });

    // Ask for permission for native browser notifications
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    return () => {
      socket.off('new_notification');
    };
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all/clear');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
