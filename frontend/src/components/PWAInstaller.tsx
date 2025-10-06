'use client';

import { useEffect } from 'react';

export default function PWAInstaller() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        registerSW();
      });
    }

    // Handle PWA install prompt
    handleInstallPrompt();

    // Handle app updates
    handleAppUpdates();
  }, []);

  const registerSW = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('📱 Service Worker registered successfully:', registration.scope);

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, show update notification
              showUpdateNotification();
            }
          });
        }
      });

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  };

  const handleInstallPrompt = () => {
    let deferredPrompt: any = null;

    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('📱 PWA install prompt available');
      e.preventDefault();
      deferredPrompt = e;
      
      // Show custom install button/banner
      showInstallBanner(deferredPrompt);
    });

    // Handle successful installation
    window.addEventListener('appinstalled', () => {
      console.log('🎉 PWA was installed successfully');
      deferredPrompt = null;
      hideInstallBanner();
      
      // Track installation (optional analytics)
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'pwa_installed'
        });
      }
    });
  };

  const handleAppUpdates = () => {
    // Listen for messages from service worker
    navigator.serviceWorker?.addEventListener('message', (event) => {
      if (event.data?.type === 'NEW_VERSION_AVAILABLE') {
        showUpdateNotification();
      }
    });
  };

  const showInstallBanner = (prompt: any) => {
    // Check if user already dismissed the banner recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissal = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    // Only show if not dismissed in the last 7 days
    if (daysSinceDismissal < 7) return;

    // Create and show install banner
    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: system-ui, -apple-system, sans-serif;
        transform: translateY(100px);
        transition: transform 0.3s ease;
        max-width: 400px;
        margin: 0 auto;
      ">
        <div style="flex: 1; margin-right: 16px;">
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 16px;">
            📱 Install PrepSmart
          </div>
          <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
            Add to your home screen for quick access and offline use!
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="pwa-install-btn" style="
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          ">
            Install
          </button>
          <button id="pwa-dismiss-btn" style="
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            padding: 8px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
          ">
            ✕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Animate in
    setTimeout(() => {
      (banner.firstElementChild as HTMLElement).style.transform = 'translateY(0)';
    }, 100);

    // Handle install button click
    const installBtn = banner.querySelector('#pwa-install-btn');
    installBtn?.addEventListener('click', async () => {
      if (prompt) {
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ User accepted PWA install');
        } else {
          console.log('❌ User dismissed PWA install');
          localStorage.setItem('pwa-install-dismissed', Date.now().toString());
        }
        
        hideInstallBanner();
      }
    });

    // Handle dismiss button click
    const dismissBtn = banner.querySelector('#pwa-dismiss-btn');
    dismissBtn?.addEventListener('click', () => {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      hideInstallBanner();
    });
  };

  const hideInstallBanner = () => {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      (banner.firstElementChild as HTMLElement).style.transform = 'translateY(100px)';
      setTimeout(() => banner.remove(), 300);
    }
  };

  const showUpdateNotification = () => {
    // Create update notification
    const notification = document.createElement('div');
    notification.id = 'pwa-update-notification';
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: #059669;
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(5, 150, 105, 0.3);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: system-ui, -apple-system, sans-serif;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 350px;
      ">
        <div style="flex: 1; margin-right: 16px;">
          <div style="font-weight: 600; margin-bottom: 4px; font-size: 16px;">
            🚀 Update Available
          </div>
          <div style="font-size: 14px; opacity: 0.9;">
            New features and improvements are ready!
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="pwa-update-btn" style="
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          ">
            Update
          </button>
          <button id="pwa-update-dismiss" style="
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            padding: 8px;
            cursor: pointer;
            font-size: 18px;
          ">
            ✕
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      (notification.firstElementChild as HTMLElement).style.transform = 'translateX(0)';
    }, 100);

    // Handle update button click
    const updateBtn = notification.querySelector('#pwa-update-btn');
    updateBtn?.addEventListener('click', () => {
      // Tell service worker to skip waiting and activate
      navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    });

    // Handle dismiss button click
    const dismissBtn = notification.querySelector('#pwa-update-dismiss');
    dismissBtn?.addEventListener('click', () => {
      (notification.firstElementChild as HTMLElement).style.transform = 'translateX(400px)';
      setTimeout(() => notification.remove(), 300);
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (document.getElementById('pwa-update-notification')) {
        (dismissBtn as HTMLButtonElement)?.click();
      }
    }, 10000);
  };

  return null; // This component doesn't render anything
}

// Utility function to check if app is running as PWA
export function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
}

// Utility function to get install status
export function canInstallPWA() {
  return 'serviceWorker' in navigator && 
         'BeforeInstallPromptEvent' in window &&
         !isPWA();
}