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
        <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {type === 'house' ? <Home size={12} /> : <Building2 size={12} />}
          {type === 'house' ? t('common.house') : t('common.plot')}
        </span>
      </div>
      <div className="card-body">
        <div className="price gradient-text">{formatPrice(price)}</div>
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
