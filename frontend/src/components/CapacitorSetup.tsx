'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

export default function CapacitorSetup() {
  useEffect(() => {
    const setupNativeEnvironment = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Dark style means light text on dark background
          await StatusBar.setStyle({ style: Style.Dark });
          // Optional: You can also set the background color to match your app
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: '#0a0a0f' });
          }
        } catch (error) {
          console.error('Failed to configure Status Bar:', error);
        }
      }
    };

    setupNativeEnvironment();
  }, []);

  return null;
}
