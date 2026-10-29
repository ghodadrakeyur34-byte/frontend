import React, { useState, useEffect } from 'react';
import { Bell, BellRing, BellOff, CheckCircle2, Send, X, ShieldCheck } from 'lucide-react';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeToPushNotifications,
  sendTestPushNotification,
  unsubscribeFromPush,
} from '../pushNotifications';

export default function NotificationPromptModal({ currentUser }) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const isSupp = isPushNotificationSupported();
    setSupported(isSupp);
    if (!isSupp) return;

    const currentPerm = getNotificationPermission();
    setPermission(currentPerm);

    const hasEnabled = localStorage.getItem('mari_milkat_push_enabled') === 'true';
    if (currentPerm === 'granted' || hasEnabled) {
      setIsSubscribed(true);
    } else if (currentPerm === 'default') {
      // Check if user dismissed prompt recently
      const dismissedAt = localStorage.getItem('mari_milkat_push_dismissed');
      if (!dismissedAt || Date.now() - Number(dismissedAt) > 2 * 24 * 60 * 60 * 1000) {
        // Show after 3 seconds of browsing
        const timer = setTimeout(() => setShowPrompt(true), 3500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await subscribeToPushNotifications(currentUser);
      if (res.success) {
        setIsSubscribed(true);
        setPermission('granted');
        setShowPrompt(false);
        setTestStatus('Subscribed! Sending test notification...');
        // Send immediate test alert so user experiences it right away
        await sendTestPushNotification();
        setTimeout(() => setTestStatus(''), 4000);
      } else {
        setErrorMessage(res.error || 'Failed to enable notifications.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error subscribing to notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTest = async () => {
    setTestStatus('Sending test push notification...');
    const res = await sendTestPushNotification();
    if (res.success) {
      setTestStatus('Test notification sent! Check your notification tray or lock screen.');
      setTimeout(() => setTestStatus(''), 5000);
    } else {
      setTestStatus(res.error || 'Failed to send test notification');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('mari_milkat_push_dismissed', String(Date.now()));
  };

  if (!supported) return null;

  return (
    <>
      {/* 1. Proactive Web Push Invitation Banner (Zero Contact Info Needed) */}
      {showPrompt && !isSubscribed && permission === 'default' && (
        <aside
          role="region"
          aria-label="Web push notification banner"
          className="push-notification-banner"
          style={{
            position: 'fixed',
            top: '80px',
            right: '20px',
            zIndex: 9998,
            maxWidth: '380px',
            width: 'calc(100% - 40px)',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
            border: '1px solid rgba(226, 184, 87, 0.4)',
            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.6), 0 0 25px rgba(226, 184, 87, 0.15)',
            borderRadius: '16px',
            padding: '16px 18px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeInDown 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(226, 184, 87, 0.15)',
                  border: '1px solid var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  flexShrink: 0,
                }}
              >
                <BellRing size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 700, color: '#fff' }}>
                  Enable Real-Time Alerts
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <ShieldCheck size={13} color="#22c55e" />
                  <span style={{ fontSize: '0.72rem', color: '#86efac', fontWeight: 600 }}>Zero contact info needed</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              aria-label="Close"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <p style={{ margin: 0, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.45 }}>
            Get instant alerts when buyers inquire about your listings or when new properties match your search — <strong>works even when this tab is closed</strong>!
          </p>

          {errorMessage && (
            <div style={{ fontSize: '0.78rem', color: '#f87171', background: 'rgba(248,113,113,0.1)', padding: '6px 8px', borderRadius: '6px' }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: '8px',
                background: 'var(--accent)',
                color: '#090d16',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Bell size={16} /> {loading ? 'Enabling...' : 'Allow on Browser'}
            </button>
            <button
              onClick={handleDismiss}
              style={{
                padding: '9px 12px',
                fontSize: '0.82rem',
                color: '#94a3b8',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Later
            </button>
          </div>
        </aside>
      )}

      {/* Status toast for test notifications */}
      {testStatus && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10001,
            background: '#111827',
            border: '1px solid var(--accent)',
            borderRadius: '10px',
            padding: '10px 18px',
            color: '#fff',
            fontSize: '0.85rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle2 size={16} color="#22c55e" />
          <span>{testStatus}</span>
        </div>
      )}
    </>
  );
}

