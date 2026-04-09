import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

interface NotificationContextType {
  notifications: any[];
  addNotification: (notification: any) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Real-time notifications over WebSocket only.
    const socket = new SockJS('http://localhost:9090/ws');
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, (frame) => {
      console.log('Connected to WebSocket: ' + frame);
      stompClient.subscribe('/topic/notifications', (message) => {
        const notification = JSON.parse(message.body);
        toast(notification.message || 'Live Update Received', { icon: 'ℹ️' });
        setNotifications(prev => [notification, ...prev]);
      });
    }, (error) => {
      console.error('WebSocket error:', error);
    });

    return () => {
      if (stompClient.connected) {
        stompClient.disconnect(() => {});
      }
    };
  }, []);

  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
