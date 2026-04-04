import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../config/firebase';
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
    let unsubscribeFCM: () => void = () => {};

    if (messaging) {
      const setupFCM = async () => {
        try {
          const token = await getToken(messaging, { 
            vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
          });
          if (token) {
            console.log('FCM Token:', token);
            // In a real app, send this token to your backend to associate with the user
          }
        } catch (error) {
          console.error('Error setting up FCM:', error);
        }
      };

      setupFCM();

      unsubscribeFCM = onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        toast.success(payload.notification?.title || 'New Notification');
        setNotifications(prev => [payload, ...prev]);
      });
    }

    // 2. WebSocket (STOMP) Setup
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
      unsubscribeFCM();
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
