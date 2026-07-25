import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatPrice, timeAgo, canChangePrice, getRemainingPriceChanges } from '../utils';
import PropertyCard from './PropertyCard';
import PropertyMap from './PropertyMap';
import ReportButton from './ReportButton';

export default function DetailView({ id, listings, onUpdatePrice, currentUser, onRequireLogin, userLocation }) {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [priceMessage, setPriceMessage] = useState(null); // { type: 'success' | 'error', text }
  const [showNumber, setShowNumber] = useState(false);

  // Reset active image index and close price editor when viewing a new property
  useEffect(() => {
    setActiveIdx(0);
    setIsEditingPrice(false);
    setPriceMessage(null);
    setShowNumber(false);
  }, [id]);

  const listing = listings.find((l) => l.id === id);

  if (!listing) {
    return (
      <main id="page-detail" className="page active">
        <section className="detail-page">
          <button className="back-btn" onClick={() => window.history.back()}>
            {t('detail.back')}
          </button>
          <div className="empty-state">
            <div className="icon">😕</div>
            <p>{t('detail.notFound')}</p>
          </div>
        </section>
      </main>
    );
  }

  const { type, title, desc, price, size, unit, area, city, images, contact, date, priceChangeLog } = listing;

  const imgs = images && images.length > 0 ? images : [];
  const remaining = getRemainingPriceChanges(priceChangeLog);
  const allowed = canChangePrice(priceChangeLog);
  const isLoggedIn = !!currentUser;

  const handlePrevImg = () => {
    if (imgs.length <= 1) return;
    setActiveIdx((prev) => (prev - 1 + imgs.length) % imgs.length);
  };

  const handleNextImg = () => {
    if (imgs.length <= 1) return;
    setActiveIdx((prev) => (prev + 1) % imgs.length);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert('Link copied to clipboard!'))
      .catch(() => alert('Failed to copy link.'));
  };

  const handleOpenPriceEdit = () => {
    setEditPriceValue(String(price));
    setPriceMessage(null);
    setIsEditingPrice(true);
  };

  const handleCancelPriceEdit = () => {
    setIsEditingPrice(false);
    setPriceMessage(null);
  };

  const handleSavePrice = () => {
    const newPrice = parseFloat(editPriceValue);

    // Client-side validation
    if (!newPrice || newPrice <= 0) {
      setPriceMessage({ type: 'error', text: 'Please enter a valid price greater than 0.' });
      return;
    }

    if (newPrice === price) {
      setPriceMessage({ type: 'error', text: 'New price is the same as the current price.' });
      return;
    }

    // Delegate to parent — it enforces the 4-per-month limit
    const result = onUpdatePrice(id, newPrice);

    if (result.success) {
      setPriceMessage({ type: 'success', text: result.message });
      setIsEditingPrice(false);
      // Auto-clear the success banner after 3 seconds
      setTimeout(() => setPriceMessage(null), 3000);
    } else {
      setPriceMessage({ type: 'error', text: result.message });
    }
  };

  const handleRevealNumber = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    setShowNumber(true);
  };

  // Mask phone: show first 4 chars + asterisks
  const getMaskedPhone = (phone) => {
    if (!phone) return '••••-•••••••';
    const visible = phone.slice(0, 4);
    const hidden = phone.slice(4).replace(/[^\s-]/g, '•');
    return visible + hidden;
  };

  // Find up to 3 similar properties (same type, excluding current)
  const similarProperties = listings
    .filter((x) => x.type === type && x.id !== id)
    .slice(0, 3);

  return (
    <main id="page-detail" className="page active">
      <section className="detail-page">
        <button className="back-btn" onClick={() => window.history.back()}>
          {t('detail.back')}
        </button>

        {imgs.length > 0 && (
          <div className="gallery">
            <div className="gallery-main">
              <img src={imgs[activeIdx]} alt={`${title} - view ${activeIdx + 1}`} />
            </div>
            {imgs.length > 1 && (
              <>
                <button className="gallery-nav prev" onClick={handlePrevImg}>
                  ‹
                </button>
                <button className="gallery-nav next" onClick={handleNextImg}>
                  ›
                </button>
                <div className="gallery-thumbs">
                  {imgs.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className={i === activeIdx ? 'active' : ''}
                      onClick={() => setActiveIdx(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="detail-layout">
          <div className="detail-info">
            {/* ===== PRICE SECTION WITH EDIT CAPABILITY ===== */}
            <div className="price-section">
              {isEditingPrice ? (
                <div className="price-edit-form">
                  <label className="price-edit-label">{t('detail.newPrice')}</label>
                  <div className="price-edit-row">
                    <input
                      type="number"
                      className="price-edit-input"
                      value={editPriceValue}
                      onChange={(e) => setEditPriceValue(e.target.value)}
                      min="1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSavePrice();
                        if (e.key === 'Escape') handleCancelPriceEdit();
                      }}
                    />
                    <button className="price-edit-save" onClick={handleSavePrice}>
                      {t('detail.save')}
                    </button>
                    <button className="price-edit-cancel" onClick={handleCancelPriceEdit}>
                      {t('detail.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="price-display-row">
                  <div className="detail-price">{formatPrice(price)}</div>
                  <button
                    className={`btn-edit-price ${!allowed ? 'disabled' : ''}`}
                    onClick={allowed ? handleOpenPriceEdit : undefined}
                    disabled={!allowed}
                    title={
                      allowed
                        ? t('detail.editPriceTooltip', { remaining, s: remaining !== 1 ? 's' : '' })
                        : t('detail.limitReached')
                    }
                  >
                    {t('detail.editPrice')}
                  </button>
                </div>
              )}

              {/* Remaining changes indicator */}
              <div className={`price-limit-info ${remaining === 0 ? 'exhausted' : remaining === 1 ? 'warning' : ''}`}>
                {remaining === 0
                  ? t('detail.noChangesLeft')
                  : t('detail.changesRemaining', { remaining, s: remaining !== 1 ? 's' : '' })}
              </div>

              {/* Feedback message */}
              {priceMessage && (
                <div className={`price-message ${priceMessage.type}`}>
                  {priceMessage.type === 'success' ? '✅' : '⚠️'} {priceMessage.text}
                </div>
              )}
            </div>

            <div className="detail-title">{title}</div>
            <div className="detail-location">📍 {area}, {city}</div>
            
            <div className="specs-grid">
              <div className="spec-item">
                <div className="spec-label">{t('detail.type')}</div>
                <div className="spec-value">{type === 'house' ? `🏠 ${t('common.house')}` : `📐 ${t('common.plot')}`}</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">{t('detail.size')}</div>
                <div className="spec-value">{size} {unit === 'sqft' ? t('common.sqft') : t('common.sqyd')}</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">{t('detail.area')}</div>
                <div className="spec-value">{area}</div>
              </div>
              <div className="spec-item">
                <div className="spec-label">{t('detail.city')}</div>
                <div className="spec-value">{city}</div>
              </div>
            </div>

            <div className="detail-desc">
              <h3>{t('detail.descriptionTitle')}</h3>
              <p>{desc || t('detail.noDescription')}</p>
            </div>

            <div className="detail-map-box" style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-h)', fontSize: '1.2rem' }}>
                📍 {t('detail.locationMap', 'Property Location on Map')}
              </h3>
              <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <PropertyMap
                  listings={[listing]}
                  selectedListingId={listing.id}
                  userLocation={userLocation}
                  height="340px"
                />
              </div>
            </div>
          </div>

          <div className="contact-card">
            <h3>{t('detail.contactSeller')}</h3>
            <div className="seller-info">
              <div className="seller-avatar">{contact.name ? contact.name.charAt(0) : '?'}</div>
              <div>
                <div className="seller-name">{contact.name}</div>
                <div className="seller-date">{t('detail.posted', { time: timeAgo(date) })}</div>
              </div>
            </div>

            {/* ===== GATED CONTACT NUMBER ===== */}
            {isLoggedIn && showNumber ? (
              /* Fully revealed — logged in user clicked "Show Number" */
              <a href={`tel:${contact.phone}`} className="btn-call">
                {t('detail.call', { phone: contact.phone })}
              </a>
            ) : isLoggedIn && !showNumber ? (
              /* Logged in but hasn't clicked reveal yet */
              <button className="btn-reveal-number" onClick={handleRevealNumber}>
                <span className="reveal-icon">👁️</span>
                <span>{t('detail.showContact')}</span>
                <span className="phone-masked">{getMaskedPhone(contact.phone)}</span>
              </button>
            ) : (
              /* Not logged in — locked state */
              <div className="contact-locked">
                <div className="locked-phone-preview">
                  <span className="lock-icon">🔒</span>
                  <span className="phone-blurred">{getMaskedPhone(contact.phone)}</span>
                </div>
                <button className="btn-login-to-view" onClick={onRequireLogin}>
                  <span className="login-icon-sm">🔐</span>
                  {t('detail.loginToView')}
                </button>
                <p className="locked-hint">{t('detail.loginHint')}</p>
              </div>
            )}

            <button className="btn-share" onClick={handleShare}>
              {t('detail.shareListing')}
            </button>
            <ReportButton type="listing" targetId={id} reporterEmail={currentUser?.email} />
          </div>
        </div>

        {similarProperties.length > 0 && (
          <div className="similar-section">
            <div className="section-header">
              <h2>{t('detail.similarProperties')}</h2>
            </div>
            <div className="listings-grid">
              {similarProperties.map((similar) => (
                <PropertyCard key={similar.id} listing={similar} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
