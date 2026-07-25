import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LocationModal({ isOpen, onClose, onRequestLocation, locationStatus }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAllow = async () => {
    setLoading(true);
    await onRequestLocation();
    setLoading(false);
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="modal-content location-modal-card">
        <div className="location-modal-icon-glow">
          <span className="location-icon">📍</span>
        </div>
        
        <h2>{t('location.modalTitle', 'Enable Location Permission')}</h2>
        
        <p className="location-modal-desc">
          {t(
            'location.modalDesc',
            'Mari Milkat uses your location to show nearby properties, houses, and plots directly on the map around you.'
          )}
        </p>

        {locationStatus === 'denied' && (
          <div className="location-status-warning">
            ⚠️ {t('location.deniedWarning', 'Location access was blocked in browser settings. Showing default region map.')}
          </div>
        )}

        <div className="location-modal-actions">
          <button
            className="btn-enable-location"
            onClick={handleAllow}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-inline"></span>
            ) : (
              <span>🎯 {t('location.enableBtn', 'Allow Location Access')}</span>
            )}
          </button>

          <button
            className="btn-skip-location"
            onClick={onClose}
            disabled={loading}
          >
            {t('location.skipBtn', 'Not Now / Skip')}
          </button>
        </div>
      </div>
    </div>
  );
}
