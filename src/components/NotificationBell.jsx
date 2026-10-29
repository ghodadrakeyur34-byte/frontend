import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, Check, Send, X, Shield, BellOff } from 'lucide-react';
import {
  isPushNotificationSupported,
  getNotificationPermission,
  subscribeToPushNotifications,
  sendTestPushNotification,
  unsubscribeFromPush,
} from '../pushNotifications';

export default function NotificationBell({ currentUser }) {
  const [supported, setSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const isSupp = isPushNotificationSupported();
    setSupported(isSupp);
    if (!isSupp) return;

    const perm = getNotificationPermission();
    const hasFlag = localStorage.getItem('mari_milkat_push_enabled') === 'true';
    setIsSubscribed(perm === 'granted' || hasFlag);

    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSubscribe = async () => {
    setLoading(true);
    setFeedback('');
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
        setFeedback('Notifications disabled.');
      } else {
        const res = await subscribeToPushNotifications(currentUser);
        if (res.success) {
          setIsSubscribed(true);
          setFeedback('Notifications enabled! Sending test alert...');
          await sendTestPushNotification();
        } else {
          setFeedback(res.error || 'Permission denied or dismissed.');
        }
      }
    } catch (err) {
      setFeedback(err.message || 'Error updating notifications');
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(''), 4500);
    }
  };

  const handleSendTest = async () => {
    setLoading(true);
    setFeedback('Sending push alert...');
    try {
      const res = await sendTestPushNotification();
      if (res.success) {
        setFeedback('Push sent! Works even if you close this tab.');
      } else {
        setFeedback(res.error || 'Failed to send test push.');
      }
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => setFeedback(''), 5000);
    }
  };

  if (!supported) return null;

  return (
    <div className="notification-bell-container" ref={menuRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={isSubscribed ? 'Notifications Active (Click to manage)' : 'Enable Web Push Notifications'}
        aria-label="Manage web push notifications"
        style={{
          background: isSubscribed ? 'rgba(226, 184, 87, 0.12)' : 'rgba(255, 255, 255, 0.06)',
          border: isSubscribed ? '1px solid var(--accent)' : '1px solid rgba(255, 255, 255, 0.12)',
          color: isSubscribed ? 'var(--accent)' : 'var(--text2)',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
      >
        {isSubscribed ? <BellRing size={18} /> : <Bell size={18} />}
        {isSubscribed && (
          <span
            style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              boxShadow: '0 0 8px #22c55e',
            }}
          />
        )}
      </button>

      {isOpen && (
        <div
          className="notification-dropdown glass-card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '310px',
            background: '#111827',
            border: '1px solid rgba(226, 184, 87, 0.3)',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 14px 30px rgba(0, 0, 0, 0.6)',
            zIndex: 9999,
            color: '#fff',
            animation: 'fadeInDown 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={16} color="var(--accent)" /> Web Push Notifications
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{
              fontSize: '0.8rem',
              color: '#cbd5e1',
              marginBottom: '14px',
              lineHeight: 1.45,
            }}
          >
            {isSubscribed ? (
              <span style={{ color: '#86efac', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                <Check size={14} /> Active — works even when tab is closed!
              </span>
            ) : (
              <span>
                Zero contact info needed! Receive instant alerts for leads and property price updates by clicking <strong>Allow</strong>.
              </span>
            )}
          </div>

          {feedback && (
            <div
              style={{
                fontSize: '0.78rem',
                color: feedback.includes('denied') || feedback.includes('Failed') ? '#f87171' : '#86efac',
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '8px',
                borderRadius: '6px',
                marginBottom: '12px',
              }}
            >
              {feedback}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isSubscribed ? (
              <>
                <button
                  onClick={handleSendTest}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--accent)',
                    color: '#090d16',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Send size={14} /> Send Test Alert (Try closing tab!)
                </button>
                <button
                  onClick={handleToggleSubscribe}
                  disabled={loading}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#94a3b8',
                    fontSize: '0.76rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <BellOff size={13} /> Turn off notifications
                </button>
              </>
            ) : (
              <button
                onClick={handleToggleSubscribe}
                disabled={loading}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: 'var(--accent)',
                  color: '#090d16',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Bell size={15} /> {loading ? 'Enabling...' : 'Enable Alerts (Instant)'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

