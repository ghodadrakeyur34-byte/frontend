import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice, timeAgo } from '../utils';

export default function PropertyCard({ listing }) {
  const { t } = useTranslation();
  const { id, type, title, price, size, unit, area, city, images, date } = listing;

  const handleCardClick = () => {
    window.location.hash = `#detail/${id}`;
  };

  const imgElement = images && images.length > 0 ? (
    <img src={images[0]} alt={title} />
  ) : (
    <div className="no-img-placeholder">🏠</div>
  );

  return (
    <div className="prop-card" onClick={handleCardClick}>
      <div className="card-img">
        {imgElement}
        <span className="badge">
          {type === 'house' ? `🏠 ${t('common.house')}` : `📐 ${t('common.plot')}`}
        </span>
      </div>
      <div className="card-body">
        <div className="price">{formatPrice(price)}</div>
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
