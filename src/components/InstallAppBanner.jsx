import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Share2, PlusSquare, Check } from 'lucide-react';

export default function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone mode (installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    // Check if dismissed recently (e.g. within 3 days)
    const lastDismissed = localStorage.getItem('mari_milkat_pwa_dismissed');
    if (lastDismissed && Date.now() - Number(lastDismissed) < 3 * 24 * 60 * 60 * 1000) {
      setDismissed(true);
    }

    // Check if device is iOS (iPhone/iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) && !window.MSStream;
    setIsIOS(isAppleDevice);

    // Chrome/Edge/Android beforeinstallprompt event
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      window._mariMilkatInstallPrompt = e;
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('[PWA] App installed successfully');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback for browsers without beforeinstallprompt support
      alert("To install Mari Milkat on your device: open your browser's menu (⋮) and tap 'Install app' or 'Add to Home screen'.");
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Install prompt outcome: ${outcome}`);
      if (outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error('[PWA] Prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('mari_milkat_pwa_dismissed', String(Date.now()));
  };

  // If already installed, don't show prompt banner
  if (isStandalone) return null;

  return (
    <>
      {/* Floating or bottom install banner (shown if not dismissed) */}
      {!dismissed && (isInstallable || isIOS) && (
        <aside
          role="region"
          aria-label="App installation banner"
          className="pwa-install-banner"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '380px',
            width: 'calc(100% - 40px)',
            background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
            border: '1px solid var(--accent)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(226, 184, 87, 0.2)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'slideUp 0.35s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: '#090d16',
                  border: '1px solid rgba(226, 184, 87, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src="/icons/icon-192.png"
                  alt="Mari Milkat Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                  Install Mari Milkat App
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                  Fast access, offline mode & instant alerts on all devices.
                </p>
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
                lineHeight: 1,
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleInstallClick}
              className="btn btn-primary"
              style={{
                flex: 1,
                padding: '9px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderRadius: '8px',
                background: 'var(--accent)',
                color: '#090d16',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Download size={16} /> Install Now
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

      {/* iOS Safari Instructions Modal */}
      {showIOSModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowIOSModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '16px',
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#111827',
              border: '1px solid var(--accent)',
              borderRadius: '16px',
              maxWidth: '400px',
              width: '100%',
              padding: '24px',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Smartphone size={20} color="var(--accent)" /> Install on iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '16px' }}>
              Follow these simple steps in Safari to add Mari Milkat to your home screen:
            </p>

            <ol style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>1. Tap the <strong>Share</strong> button</span>
                <span style={{ display: 'inline-flex', padding: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                  <Share2 size={16} color="var(--accent)" />
                </span>
                <span>at the bottom of Safari.</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>2. Scroll down and tap <strong>Add to Home Screen</strong></span>
                <span style={{ display: 'inline-flex', padding: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                  <PlusSquare size={16} color="var(--accent)" />
                </span>
              </li>
              <li>
                <span>3. Tap <strong>Add</strong> in the top right corner.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '10px',
                borderRadius: '8px',
                background: 'var(--accent)',
                color: '#090d16',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
