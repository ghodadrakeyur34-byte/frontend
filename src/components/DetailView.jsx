import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Frown, Pencil, AlertTriangle, CheckCircle2, MapPin, Home, Building2, Phone, Eye, Lock, Share2, Clock, Trash2, Tag, PhoneCall, Shield, Loader2, AlertCircle } from 'lucide-react';
import { formatPrice, timeAgo, canChangePrice, getRemainingPriceChanges, isListingOwner, apiFetch } from '../utils';
import PropertyCard from './PropertyCard';
import PropertyMap from './PropertyMap';
import ReportButton from './ReportButton';
import PhoneVerificationModal from './PhoneVerificationModal';

export default function DetailView({ id, listings, onUpdatePrice, onDeleteListing, onEditListing, currentUser, onRequireLogin, userLocation }) {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editPriceValue, setEditPriceValue] = useState('');
  const [priceMessage, setPriceMessage] = useState(null); // { type: 'success' | 'error', text }
  const [showNumber, setShowNumber] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Seller Privacy & Lead Dispatch states
  const [detailData, setDetailData] = useState(null);
  const [revealedPhone, setRevealedPhone] = useState(null);
  const [isRevealingPhone, setIsRevealingPhone] = useState(false);
  const [phoneRevealError, setPhoneRevealError] = useState(null);
  const [hasRequestedCallback, setHasRequestedCallback] = useState(false);
  const [isRequestingCallback, setIsRequestingCallback] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [callbackError, setCallbackError] = useState(null);
  const [showPhoneVerifyModal, setShowPhoneVerifyModal] = useState(false);

  // Fetch single listing details on mount to get callback status and sanitize contact info
  useEffect(() => {
    let isMounted = true;
    async function loadFreshListing() {
      try {
        const res = await apiFetch(`/api/listings/${id}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setDetailData(data);
          if (data.hasRequestedCallback) {
            setHasRequestedCallback(true);
          }
          if (data.contact?.phone) {
            setRevealedPhone(data.contact.phone);
          }
        }
      } catch (e) {}
    }
    loadFreshListing();
    return () => { isMounted = false; };
  }, [id, currentUser]);

  // Reset active image index and close price editor when viewing a new property
  useEffect(() => {
    setActiveIdx(0);
    setIsEditingPrice(false);
    setPriceMessage(null);
    setShowNumber(false);
    setRevealedPhone(null);
    setPhoneRevealError(null);
    setCallbackSuccess(false);
    setCallbackError(null);
  }, [id]);

  const baseListing = listings.find((l) => String(l.id) === String(id));
  const listing = detailData || baseListing;

  const isOwner = isListingOwner(listing, currentUser);
  const isAdmin = currentUser?.role === 'admin' || currentUser?.isAdmin;
  const canEditPrice = Boolean(isOwner || isAdmin);
  const isApproved = (listing?.status === 'active' || listing?.status === 'sold') && listing?.status !== 'pending' && listing?.status !== 'rejected';
  const isPending = listing?.status === 'pending';

  if (!listing || (!isApproved && !isOwner && !isAdmin)) {
    return (
      <main id="page-detail" className="page active">
        <section className="detail-page">
          <button className="back-btn" onClick={() => window.history.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> {t('detail.back')}
          </button>
          <div className="empty-state">
            <div className="icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <Frown size={48} color="var(--text3)" />
            </div>
            <h2>{t('detail.notFound')}</h2>
            <p>{t('detail.notFound')}</p>
          </div>
        </section>
      </main>
    );
  }

  const { type, title, desc, price, size, unit, area, city, images, date, priceChangeLog } = listing;
  const contact = listing.contact || {};

  const imgs = images && Array.isArray(images) && images.length > 0 ? images : [];
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
    if (!canEditPrice) return;
    setEditPriceValue(String(price));
    setPriceMessage(null);
    setIsEditingPrice(true);
  };

  const handleCancelPriceEdit = () => {
    setIsEditingPrice(false);
    setPriceMessage(null);
  };

  const handleSavePrice = async () => {
    if (!canEditPrice) return;
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
    const result = await onUpdatePrice(id, newPrice);

    if (result && result.success) {
      setPriceMessage({ type: 'success', text: result.message });
      setIsEditingPrice(false);
      // Auto-clear the success banner after 3 seconds
      setTimeout(() => setPriceMessage(null), 3000);
    } else {
      setPriceMessage({ type: 'error', text: result?.message || 'Failed to update price.' });
    }
  };

  const handleRevealDirectNumber = async () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    setIsRevealingPhone(true);
    setPhoneRevealError(null);
    try {
      const res = await apiFetch(`/api/listings/${id}/contact`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reveal contact number.');
      }
      setRevealedPhone(data.phone || contact?.phone);
      setShowNumber(true);
    } catch (err) {
      setPhoneRevealError(err.message);
    } finally {
      setIsRevealingPhone(false);
    }
  };

  const submitCallbackRequest = async () => {
    setIsRequestingCallback(true);
    setCallbackError(null);
    try {
      const res = await apiFetch(`/api/listings/${id}/request-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.code === 'PHONE_VERIFICATION_REQUIRED') {
          setShowPhoneVerifyModal(true);
          return;
        }
        throw new Error(data.error || 'Failed to request callback.');
      }
      setHasRequestedCallback(true);
      setCallbackSuccess(true);
      setTimeout(() => setCallbackSuccess(false), 5000);
    } catch (err) {
      setCallbackError(err.message);
    } finally {
      setIsRequestingCallback(false);
    }
  };

  const handleRequestCallbackClick = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    const isPhoneVerified = Boolean(
      currentUser.is_phone_verified ||
      currentUser.isPhoneVerified ||
      currentUser.verified?.phone
    );
    if (!isPhoneVerified) {
      setShowPhoneVerifyModal(true);
      return;
    }
    submitCallbackRequest();
  };

  const contactPref = listing?.contact_preference || 'notify';

  // Mask phone: show first 4 chars + asterisks
  const getMaskedPhone = (phone) => {
    if (!phone) return '••••-•••••••';
    const visible = phone.slice(0, 4);
    const hidden = phone.slice(4).replace(/[^\s-]/g, '•');
    return visible + hidden;
  };

  // Find up to 3 similar properties (same type, excluding current, must be admin-approved)
  const similarProperties = listings
    .filter((x) => x.type === type && x.id !== id && (x.status === 'active' || x.status === 'sold') && x.status !== 'pending' && x.status !== 'rejected')
    .slice(0, 3);

  return (
    <main id="page-detail" className="page active">
      <section className="detail-page">
        <button className="back-btn" onClick={() => window.history.back()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={16} /> {t('detail.back')}
        </button>

        {isPending && (
          <div style={{
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.5)',
            borderRadius: 'var(--r-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}>
            <Clock size={28} color="#eab308" />
            <div>
              <strong style={{ display: 'block', color: '#facc15', fontSize: '1rem', marginBottom: '2px' }}>
                {t('common.pendingApproval', 'Pending Approval')}
              </strong>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
                {t('common.pendingNotice', 'This property is pending admin approval and will be publicly visible once approved.')}
              </span>
            </div>
          </div>
        )}

        {imgs.length > 0 ? (
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
        ) : (
          <div className="gallery" style={{ marginBottom: '2rem' }}>
            <div className="gallery-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', minHeight: '260px', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              {type === 'house' ? <Home size={56} style={{ color: 'var(--text3)', marginBottom: '12px', opacity: 0.6 }} /> : <Building2 size={56} style={{ color: 'var(--text3)', marginBottom: '12px', opacity: 0.6 }} />}
              <span style={{ color: 'var(--text3)', fontSize: '0.95rem' }}>No preview images available</span>
            </div>
          </div>
        )}

        <div className="detail-layout">
          <div className="detail-info">
            {/* ===== PRICE SECTION WITH EDIT CAPABILITY (UPLOADER ONLY) ===== */}
            <div className="price-section">
              {canEditPrice ? (
                <>
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
                      <div className="detail-price">
                        {formatPrice(price)}
                        {listing.purpose === 'rent' && (
                          <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text2)', marginLeft: '6px' }}>
                            / {t('common.month', 'mo')}
                          </span>
                        )}
                      </div>
                      <div className="price-actions-group" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <button
                          className={`btn-edit-price ${!allowed ? 'disabled' : ''}`}
                          onClick={allowed ? handleOpenPriceEdit : undefined}
                          disabled={!allowed}
                          title={
                            allowed
                              ? t('detail.editPriceTooltip', { remaining, s: remaining !== 1 ? 's' : '' })
                              : t('detail.limitReached')
                          }
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Pencil size={15} /> {t('detail.editPrice')}
                        </button>
                        {onEditListing && (
                          <button
                            className="btn-edit-details"
                            onClick={() => onEditListing(listing)}
                            title={t('detail.editProperty', 'Edit Property Details')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '0.45rem 0.9rem',
                              borderRadius: 'var(--r-sm)',
                              background: 'var(--accent)',
                              color: '#0f172a',
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <Pencil size={14} /> {t('detail.editProperty', 'Edit Property Details')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Remaining changes indicator - only visible to uploader */}
                  <div className={`price-limit-info ${remaining === 0 ? 'exhausted' : remaining === 1 ? 'warning' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} />
                    {remaining === 0
                      ? t('detail.noChangesLeft')
                      : t('detail.changesRemaining', { remaining, s: remaining !== 1 ? 's' : '' })}
                  </div>

                  {/* Feedback message */}
                  {priceMessage && (
                    <div className={`price-message ${priceMessage.type}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {priceMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {priceMessage.text}
                    </div>
                  )}
                </>
              ) : (
                /* Regular viewer/buyer only sees the price */
                <div className="price-display-row">
                  <div className="detail-price">
                    {formatPrice(price)}
                    {listing.purpose === 'rent' && (
                      <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text2)', marginLeft: '6px' }}>
                        / {t('common.month', 'mo')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="detail-title">{title}</div>
            <div className="detail-location" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={16} color="var(--accent)" /> {area}, {city}
            </div>
            
            <div className="specs-grid">
              <div className="spec-item">
                <div className="spec-label">{t('sell.purpose', 'Purpose')}</div>
                <div className="spec-value" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: listing.purpose === 'rent' ? '#34d399' : 'inherit', fontWeight: 600 }}>
                  <Tag size={16} />
                  {listing.purpose === 'rent' ? t('hero.rent', 'Rent') : t('hero.sale', 'Sale')}
                </div>
              </div>
              <div className="spec-item">
                <div className="spec-label">{t('detail.type')}</div>
                <div className="spec-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {type === 'house' ? <Home size={16} /> : <Building2 size={16} />}
                  {type === 'house' ? t('common.house') : t('common.plot')}
                </div>
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
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-h)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="var(--accent)" /> {t('detail.locationMap', 'Property Location on Map')}
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
              <div className="seller-avatar">{contact?.name ? contact.name.charAt(0) : '?'}</div>
              <div>
                <div className="seller-name">{contact?.name || 'Seller'}</div>
                <div className="seller-date">{t('detail.posted', { time: timeAgo(date) })}</div>
              </div>
            </div>

            {/* ===== DUAL-MODE SELLER CONTACT SECTION ===== */}
            {isOwner ? (
              <div
                style={{
                  background: 'rgba(226, 184, 87, 0.1)',
                  border: '1px solid rgba(226, 184, 87, 0.3)',
                  borderRadius: 'var(--r-md, 8px)',
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>
                  <Shield size={16} /> {t('detail.ownerListingBadge', 'Your Property Listing')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>
                  Contact Mode: <strong>{contactPref === 'direct' ? 'Direct Contact' : 'Request Callback (Private)'}</strong>
                </div>
                {contact?.phone && (
                  <div style={{ marginTop: '6px', fontWeight: 600, color: 'var(--text)' }}>
                    Phone: {contact.phone}
                  </div>
                )}
              </div>
            ) : contactPref === 'notify' ? (
              /* ===== MODE B: NOTIFY / REQUEST CALLBACK (PRIVATE) ===== */
              <div className="contact-notify-mode" style={{ marginBottom: '1rem' }}>
                {hasRequestedCallback ? (
                  <button
                    className="btn-callback-requested"
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--r-md, 8px)',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34d399',
                      border: '1.5px solid rgba(16, 185, 129, 0.4)',
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'default',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    <span>{t('detail.callbackRequested', '✓ Callback Requested')}</span>
                  </button>
                ) : (
                  <button
                    className="btn-request-callback"
                    onClick={handleRequestCallbackClick}
                    disabled={isRequestingCallback}
                    style={{
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--r-md, 8px)',
                      background: 'var(--accent, #e2b857)',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: isRequestingCallback ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(226, 184, 87, 0.3)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isRequestingCallback ? (
                      <Loader2 size={18} className="spin" />
                    ) : (
                      <PhoneCall size={18} />
                    )}
                    <span>{t('detail.requestCallback', 'Request Callback')}</span>
                  </button>
                )}

                {callbackSuccess && (
                  <div style={{ marginTop: '8px', color: '#34d399', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} /> Lead sent to seller! They will call you back.
                  </div>
                )}

                {callbackError && (
                  <div style={{ marginTop: '8px', color: '#f87171', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={15} /> {callbackError}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '10px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border)',
                    fontSize: '0.78rem',
                    color: 'var(--text3, #94a3b8)',
                  }}
                >
                  <Shield size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
                  <span>
                    {hasRequestedCallback
                      ? t('detail.callbackDispatchedHint', 'The seller has received your verified number and will contact you directly.')
                      : t('detail.privacyProtectedHint', 'Seller number is protected from spam. Your verified mobile number is sent securely.')}
                  </span>
                </div>
              </div>
            ) : (
              /* ===== MODE A: DIRECT CONTACT (PHONE REVEAL) ===== */
              <div className="contact-direct-mode" style={{ marginBottom: '1rem' }}>
                {isLoggedIn && showNumber && revealedPhone ? (
                  /* Fully revealed */
                  <a
                    href={`tel:${revealedPhone}`}
                    className="btn-call"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      width: '100%',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--r-md, 8px)',
                      background: '#10b981',
                      color: '#ffffff',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                    }}
                  >
                    <Phone size={18} /> {t('detail.call', { phone: revealedPhone })}
                  </a>
                ) : isLoggedIn && !showNumber ? (
                  /* Logged in, ready to reveal */
                  <>
                    <button
                      className="btn-reveal-number"
                      onClick={handleRevealDirectNumber}
                      disabled={isRevealingPhone}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        width: '100%',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--r-md, 8px)',
                        background: 'var(--accent, #e2b857)',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        border: 'none',
                        cursor: isRevealingPhone ? 'wait' : 'pointer',
                      }}
                    >
                      {isRevealingPhone ? <Loader2 size={18} className="spin" /> : <Eye size={18} />}
                      <span>{t('detail.showContact', 'Show Contact Number')}</span>
                    </button>
                    {phoneRevealError && (
                      <div style={{ marginTop: '8px', color: '#f87171', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={15} /> {phoneRevealError}
                      </div>
                    )}
                  </>
                ) : (
                  /* Not logged in */
                  <div className="contact-locked">
                    <div className="locked-phone-preview" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <Lock size={16} color="var(--text3)" />
                      <span className="phone-blurred">••••-•••••••</span>
                    </div>
                    <button
                      className="btn-login-to-view"
                      onClick={onRequireLogin}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%' }}
                    >
                      <Lock size={16} />
                      {t('detail.loginToView')}
                    </button>
                    <p className="locked-hint">{t('detail.loginHint')}</p>
                  </div>
                )}
              </div>
            )}

            <button className="btn-share" onClick={handleShare} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Share2 size={16} /> {t('detail.shareListing')}
            </button>
            {/* Owner-only Edit & Delete Options */}
            {isOwner && onEditListing && (
              <button
                className="btn-edit-property-detail"
                onClick={() => onEditListing(listing)}
                title={t('detail.editProperty', 'Edit Property Details')}
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--r-md, 8px)',
                  background: 'var(--accent)',
                  color: '#0f172a',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(226, 184, 87, 0.25)',
                }}
              >
                <Pencil size={16} /> {t('detail.editProperty', 'Edit Property Details')}
              </button>
            )}

            {isOwner && onDeleteListing && (
              <button
                className="btn-delete-detail"
                onClick={() => setShowDeleteModal(true)}
                title="Delete this property"
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--r-md, 8px)',
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Trash2 size={16} /> {t('myListings.delete', 'Delete Listing')}
              </button>
            )}
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

      {/* Owner Delete Confirmation Modal */}
      {isOwner && onDeleteListing && (
        <div className={`modal-overlay ${showDeleteModal ? 'show' : ''}`}>
          <div className="modal">
            <div className="checkmark" style={{ background: 'rgba(248,113,113,0.15)', borderColor: '#f87171', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Trash2 size={32} color="#f87171" />
            </div>
            <h2>{t('myListings.deleteTitle', 'Delete Property')}</h2>
            <p>
              {t('myListings.deleteConfirmPrefix', 'Are you sure you want to remove')} <strong>"{title}"</strong>?
              {' '}{t('myListings.deleteConfirmSuffix', 'This action cannot be undone.')}
            </p>
            <div className="modal-actions">
              <button
                className="btn-submit btn-danger"
                disabled={isDeleting}
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    await onDeleteListing(id);
                    setShowDeleteModal(false);
                    window.location.hash = '#my-listings';
                  } catch (err) {
                    setIsDeleting(false);
                  }
                }}
                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Trash2 size={16} /> {isDeleting ? 'Deleting...' : t('myListings.yesDelete', 'Yes, Delete')}
              </button>
              <button className="btn-submit btn-cancel-modal" onClick={() => setShowDeleteModal(false)}>
                {t('detail.cancel', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inline Phone Verification Modal for Unverified Buyers */}
      <PhoneVerificationModal
        isOpen={showPhoneVerifyModal}
        onClose={() => setShowPhoneVerifyModal(false)}
        currentUser={currentUser}
        onVerified={(updatedUser) => {
          setShowPhoneVerifyModal(false);
          if (currentUser) {
            currentUser.is_phone_verified = true;
            currentUser.phone = updatedUser.phone || currentUser.phone;
            if (currentUser.verified) currentUser.verified.phone = true;
            try {
              localStorage.setItem('propbazaar_user', JSON.stringify(currentUser));
            } catch (e) {}
          }
          submitCallbackRequest();
        }}
      />
    </main>
  );
}
