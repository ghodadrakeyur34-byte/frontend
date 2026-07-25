import React from 'react';
import { useTranslation } from 'react-i18next';
import { animate } from 'animejs';
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
    <img src={images[0]} alt={title} />
  ) : (
    <div className="no-img-placeholder">🏠</div>
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
        <span className="badge">
          {type === 'house' ? `🏠 ${t('common.house')}` : `📐 ${t('common.plot')}`}
        </span>
      </div>
      <div className="card-body">
        <div className="price gradient-text">{formatPrice(price)}</div>
        <div className="title">{title}</div>
        <div className="location">📍 {area}, {city}</div>
        <div className="meta">
          <span>{size} {unit}</span>
          <span>{timeAgo(date)}</span>
        </div>
      </div>
    </div>
  );
}
