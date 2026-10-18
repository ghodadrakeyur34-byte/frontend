import React from 'react';
import { useTranslation } from 'react-i18next';
import { animate } from 'animejs';
import { Home, Building2, MapPin, Maximize2, Calendar } from 'lucide-react';
import { formatPrice, timeAgo } from '../utils';

export default function PropertyCard({ listing }) {
  const { t } = useTranslation();
  const { id, type, title, price, size, unit, area, city, images, date } = listing;

  const handleCardClick = () => {
    window.location.hash = `#detail/${id}`;
  };

  const handleMouseEnter = (e) => {
    animate(e.currentTarget, {
      translateY: -6,
      scale: 1.02,
      duration: 350,
      ease: 'outCubic',
    });
  };

  const handleMouseLeave = (e) => {
    animate(e.currentTarget, {
      translateY: 0,
      scale: 1.0,
      duration: 350,
      ease: 'outCubic',
    });
  };

  const imgElement = images && images.length > 0 ? (
    <img src={images[0]} alt={title} loading="lazy" decoding="async" />
  ) : (
    <div className="no-img-placeholder">
      <Home size={32} color="var(--text3)" />
    </div>
  );

  return (
    <div
      className="prop-card glass-card"
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="card-img">
        {imgElement}
        <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          {type === 'house' ? <Home size={12} /> : <Building2 size={12} />}
          {type === 'house' ? t('common.house') : t('common.plot')}
          <span style={{ opacity: 0.6 }}>•</span>
          <span style={{ color: listing.purpose === 'rent' ? '#34d399' : 'inherit', fontWeight: 600 }}>
            {listing.purpose === 'rent' ? t('hero.rent', 'Rent') : t('hero.sale', 'Sale')}
          </span>
        </span>
        {listing.status === 'pending' && (
          <span
            className="status-badge"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(234, 179, 8, 0.95)',
              color: '#0f172a',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.02em',
            }}
          >
            ⏳ {t('common.pendingApproval', 'Pending Approval')}
          </span>
        )}
        {listing.status === 'rejected' && (
          <span
            className="status-badge"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(239, 68, 68, 0.95)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.02em',
            }}
          >
            ✗ {t('common.rejected', 'Rejected')}
          </span>
        )}
        {listing.status === 'sold' && (
          <span
            className="status-badge"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'rgba(59, 130, 246, 0.95)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              letterSpacing: '0.02em',
            }}
          >
            💰 {t('common.sold', 'Sold')}
          </span>
        )}
      </div>
      <div className="card-body">
        <div className="price gradient-text">
          {formatPrice(price)}
          {listing.purpose === 'rent' && (
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text2)', marginLeft: '4px' }}>
              / {t('common.month', 'mo')}
            </span>
          )}
        </div>
        <div className="title">{title}</div>
        <div className="location" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={14} color="var(--accent)" /> {area}, {city}
        </div>
        <div className="meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Maximize2 size={13} /> {size} {unit}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} /> {timeAgo(date)}
          </span>
        </div>
      </div>
    </div>
  );
}
