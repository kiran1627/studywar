import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { getFCMToken } from '../lib/firebase';

export const useNotifications = () => {
  useEffect(() => {
    const registerNotifications = async () => {
      try {
        let fcmToken: string | null = null;

        if (Capacitor.isNativePlatform()) {
          // Native push notifications via Capacitor
          const permStatus = await PushNotifications.checkPermissions();

          if (permStatus.receive === 'prompt') {
            const requested = await PushNotifications.requestPermissions();
            if (requested.receive !== 'granted') {
              console.log('Push notification permission denied');
              return;
            }
          }

          if (permStatus.receive !== 'granted') return;

          await PushNotifications.register();

          // Add listener to get token
          PushNotifications.addListener('registration', async (token) => {
            console.log('Push registration success, token: ' + token.value);
            await sendTokenToBackend(token.value);
          });

          PushNotifications.addListener('registrationError', (error) => {
            console.error('Error on registration: ', error);
          });

        } else {
          // Web push notifications via Firebase JS SDK
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
              fcmToken = await getFCMToken();
              if (fcmToken) {
                console.log('Web FCM Token:', fcmToken);
                await sendTokenToBackend(fcmToken);
              }
            } else {
              console.log('Web Notification permission denied');
            }
          }
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    const sendTokenToBackend = async (token: string) => {
      try {
        const auth = localStorage.getItem('token'); // assuming standard token auth
        if (!auth) return;

        // Using fetch to avoid dependency on specific api wrapper if it doesn't match
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/user/fcm-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth}`,
          },
          body: JSON.stringify({ token }),
        });
        console.log('FCM Token sent to backend successfully');
      } catch (error) {
        console.error('Error sending token to backend:', error);
      }
    };

    // Register after a slight delay to ensure everything is loaded, or trigger on login
    // Here we register on mount if user is logged in
    const isAuth = !!localStorage.getItem('token');
    if (isAuth) {
      registerNotifications();
    }
  }, []);
};
