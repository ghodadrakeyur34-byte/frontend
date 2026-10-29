import { apiFetch } from './utils';

/**
 * Convert VAPID base64 public key to Uint8Array for PushManager
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if the current browser/device supports Web Push and Service Workers
 */
export function isPushNotificationSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Get existing push subscription if already subscribed
 */
export async function getExistingSubscription() {
  if (!isPushNotificationSupported()) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch (err) {
    console.warn('[Push] Error getting existing subscription:', err);
    return null;
  }
}

/**
 * Subscribe user/device to Web Push Notifications
 * Zero contact info required - user only clicks 'Allow' on the browser prompt!
 */
export async function subscribeToPushNotifications(currentUser = null) {
  if (!isPushNotificationSupported()) {
    return {
      success: false,
      error: 'Push notifications are not supported on this browser or device.',
    };
  }

  try {
    // 1. Request permission from user (shows browser modal)
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return {
        success: false,
        error: permission === 'denied'
          ? 'Notification permission was denied. You can re-enable notifications in your browser site settings.'
          : 'Notification permission was dismissed.',
      };
    }

    // 2. Fetch VAPID public key from backend
    const keyRes = await apiFetch('/api/push/vapid-public-key');
    const { publicKey } = await keyRes.json();
    if (!publicKey) {
      throw new Error('Could not retrieve VAPID public key from server.');
    }

    // 3. Register push subscription with the browser's Push Service
    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      const convertedVapidKey = urlBase64ToUint8Array(publicKey);
      subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      });
    }

    // 4. Send subscription to our backend database
    const subRes = await apiFetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        user: currentUser ? {
          id: currentUser.id || currentUser.email,
          email: currentUser.email,
          phone: currentUser.phone,
        } : null,
      }),
    });

    const subData = await subRes.json();
    if (!subRes.ok) {
      throw new Error(subData.error || 'Failed to register subscription on server.');
    }

    // Save flag in localStorage so UI knows notifications are enabled
    localStorage.setItem('mari_milkat_push_enabled', 'true');

    return {
      success: true,
      subscription,
      message: 'Subscribed to notifications successfully!',
    };
  } catch (err) {
    console.error('[Push] Subscription failed:', err);
    return {
      success: false,
      error: err.message || 'Failed to enable push notifications.',
    };
  }
}

/**
 * Send an immediate test notification to verify it works (even when tab is closed!)
 */
export async function sendTestPushNotification() {
  try {
    const sub = await getExistingSubscription();
    const res = await apiFetch('/api/push/send-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: sub ? sub.toJSON() : null,
        title: '🔔 Property Alert Active!',
        body: 'Mari Milkat Web Push works even with this tab closed! You will receive instant alerts for inquiries and new listings.',
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('[Push] Error sending test notification:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush() {
  if (!isPushNotificationSupported()) return { success: false };
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await apiFetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      });
      await sub.unsubscribe();
    }
    localStorage.removeItem('mari_milkat_push_enabled');
    return { success: true };
  } catch (err) {
    console.error('[Push] Unsubscribe error:', err);
    return { success: false, error: err.message };
  }
}

