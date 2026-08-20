import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../utils';

// Google Multicolor SVG Icon
export function GoogleIcon({ className = 'google-icon-svg' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function GoogleSignInButton({ onAuthSuccess, onError, text = 'signin_with', disabled = false }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1005206059754-gm6a2dggt2r96ktnru4vhlj717n86dvi.apps.googleusercontent.com';

  const handleCredentialResponse = useCallback(async (response) => {
    if (!response || !response.credential) {
      if (onError) onError(t('login.googleFailed', 'Google Sign-In failed to return credentials.'));
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || t('login.googleFailed', 'Google verification failed.'));
      }

      if (onAuthSuccess && data.user) {
        onAuthSuccess(data.user);
      }
    } catch (err) {
      console.error('Google Sign-In backend verification error:', err);
      if (onError) onError(err.message || t('login.googleFailed', 'Google verification failed.'));
    } finally {
      setLoading(false);
    }
  }, [t, onAuthSuccess, onError]);

  useEffect(() => {
    let isMounted = true;

    // Set current active callback for GIS
    window._gsiActiveCallback = handleCredentialResponse;

    const setupGoogle = () => {
      if (!isMounted || !containerRef.current || !window.google?.accounts?.id) return;

      try {
        if (!window._gsiInitialized) {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (res) => {
              if (window._gsiActiveCallback) {
                window._gsiActiveCallback(res);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          window._gsiInitialized = true;
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(containerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'rectangular',
            text: text === 'signup_with' ? 'signup_with' : 'signin_with',
            logo_alignment: 'left',
            width: Math.min(360, containerRef.current.parentElement?.offsetWidth || 340),
          });
        }
      } catch (e) {
        console.warn('Google Identity Services button init error:', e);
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          setupGoogle();
        }
      }, 150);
      return () => {
        clearInterval(timer);
        isMounted = false;
      };
    }

    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [googleClientId, text, handleCredentialResponse]);

  return (
    <div className="google-auth-section">
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', gap: '8px', fontSize: '0.9rem', color: 'var(--text2)' }}>
          <span className="spinner-sm" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'var(--accent)' }} />
          {t('login.verifyingWithGoogle', 'Verifying with Google...')}
        </div>
      )}
      
      <div
        className="google-btn-wrapper"
        style={{ display: loading ? 'none' : 'flex', justifyContent: 'center', width: '100%', minHeight: '44px' }}
      >
        <div
          ref={containerRef}
          style={{ width: '100%', maxWidth: '360px', display: 'flex', justifyContent: 'center', minHeight: '44px' }}
        />
      </div>
    </div>
  );
}
