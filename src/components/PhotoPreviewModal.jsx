import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  ZoomIn,
  ZoomOut,
  Sliders,
  Sparkles,
  Check,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Maximize2,
  ArrowUp,
  ArrowDown,
  Move,
  RefreshCw,
  Home,
  Building2,
  MapPin,
  Tag,
  Maximize
} from 'lucide-react';
import { formatPrice } from '../utils';

export default function PhotoPreviewModal({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  listingInfo = {},
  onUpdateImages,
}) {
  const { t } = useTranslation();
  const [activeIdx, setActiveIdx] = useState(initialIndex);
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'detail' | 'adjust'

  // Photo adjustment states for active photo
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [brightness, setBrightness] = useState(0); // -40 to 40
  const [contrast, setContrast] = useState(0); // -40 to 40
  const [aspectRatio, setAspectRatio] = useState('16:9'); // '16:9', '4:3', '1:1', 'free'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Drag-to-pan states
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const containerRef = useRef(null);

  // Reset adjustments when switching active photo or on open
  useEffect(() => {
    setActiveIdx(initialIndex);
    resetAdjustments();
  }, [initialIndex, isOpen]);

  // Lock body scroll when modal is open and handle Escape key
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeIdx, images.length]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImg = images[activeIdx] || images[0];
  const isCover = activeIdx === 0;
  const hasAdjustments =
    rotation !== 0 ||
    flipH ||
    zoom !== 1 ||
    panX !== 0 ||
    panY !== 0 ||
    brightness !== 0 ||
    contrast !== 0;

  function resetAdjustments() {
    setRotation(0);
    setFlipH(false);
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setBrightness(0);
    setContrast(0);
    setSaveSuccess(false);
  }

  const handleRotateCw = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleRotateCcw = () => {
    setRotation((prev) => (prev + 270) % 360);
  };

  const handleFlipH = () => {
    setFlipH((prev) => !prev);
  };

  const handleAutoEnhance = () => {
    setBrightness(12);
    setContrast(15);
  };

  const handleAlign = (position) => {
    if (position === 'center') {
      setPanX(0);
      setPanY(0);
    } else if (position === 'top') {
      setPanY(50);
    } else if (position === 'bottom') {
      setPanY(-50);
    }
  };

  const handlePrev = () => {
    if (images.length <= 1) return;
    resetAdjustments();
    setActiveIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (images.length <= 1) return;
    resetAdjustments();
    setActiveIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Drag-to-pan handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX,
      panY,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.panX + dx);
    setPanY(dragStartRef.current.panY + dy);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        panX,
        panY,
      };
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    const dy = e.touches[0].clientY - dragStartRef.current.y;
    setPanX(dragStartRef.current.panX + dx);
    setPanY(dragStartRef.current.panY + dy);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Make active photo the primary cover photo (index 0)
  const handleSetCover = () => {
    if (activeIdx === 0 || !onUpdateImages) return;
    const selected = images[activeIdx];
    const remaining = images.filter((_, i) => i !== activeIdx);
    const updated = [selected, ...remaining];
    onUpdateImages(updated);
    setActiveIdx(0);
    resetAdjustments();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2200);
  };

  // Delete current photo
  const handleDeletePhoto = () => {
    if (!onUpdateImages) return;
    const updated = images.filter((_, i) => i !== activeIdx);
    if (updated.length === 0) {
      onUpdateImages([]);
      onClose();
      return;
    }
    onUpdateImages(updated);
    setActiveIdx((prev) => (prev >= updated.length ? updated.length - 1 : prev));
    resetAdjustments();
  };

  // Move photo left/right
  const handleMovePhoto = (direction) => {
    const targetIdx = direction === 'left' ? activeIdx - 1 : activeIdx + 1;
    if (targetIdx < 0 || targetIdx >= images.length || !onUpdateImages) return;
    const updated = [...images];
    const temp = updated[activeIdx];
    updated[activeIdx] = updated[targetIdx];
    updated[targetIdx] = temp;
    onUpdateImages(updated);
    setActiveIdx(targetIdx);
    resetAdjustments();
  };

  // Bake adjustments to Canvas and save
  const handleSaveAdjustments = async () => {
    if (!onUpdateImages) return;
    setIsSaving(true);
    try {
      const adjustedDataUrl = await renderAdjustedCanvas();
      const updated = [...images];
      updated[activeIdx] = adjustedDataUrl;
      onUpdateImages(updated);
      resetAdjustments();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to bake adjustments to image:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Canvas adjustment rendering logic
  const renderAdjustedCanvas = () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const is90or270 = rotation === 90 || rotation === 270;
        const naturalW = is90or270 ? img.height : img.width;
        const naturalH = is90or270 ? img.width : img.height;

        let targetW = 900;
        let targetH;

        if (aspectRatio === '16:9') {
          targetH = Math.round((targetW * 9) / 16); // 506
        } else if (aspectRatio === '4:3') {
          targetH = Math.round((targetW * 3) / 4); // 675
        } else if (aspectRatio === '1:1') {
          targetH = targetW; // 900
        } else {
          targetH = Math.round(targetW * (naturalH / naturalW));
        }

        canvas.width = targetW;
        canvas.height = targetH;

        // Background
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(0, 0, targetW, targetH);

        // Apply brightness and contrast filters
        const bVal = 1 + brightness / 100;
        const cVal = 1 + contrast / 100;
        ctx.filter = `brightness(${bVal}) contrast(${cVal})`;

        ctx.save();
        // Translate to canvas center + pan offset (scaled to canvas target dimensions)
        const scaleFactor = targetW / 450; // Reference preview width factor
        ctx.translate(targetW / 2 + panX * scaleFactor, targetH / 2 + panY * scaleFactor);

        // Rotation
        ctx.rotate((rotation * Math.PI) / 180);

        // Flip
        if (flipH) {
          ctx.scale(-1, 1);
        }

        // Calculate cover scaling
        const baseScale = Math.max(targetW / naturalW, targetH / naturalH);
        const finalScale = baseScale * zoom;

        const drawW = img.width * finalScale;
        const drawH = img.height * finalScale;

        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      img.src = currentImg;
    });
  };

  // Listing mockup values
  const mockupTitle = listingInfo.title?.trim() || t('sell.titlePlaceholder', 'Modern Dream Home with Garden');
  const mockupPrice = listingInfo.price ? formatPrice(parseFloat(listingInfo.price)) : '₨ 45.00 Lac';
  const mockupPurpose = listingInfo.purpose || 'sale';
  const mockupType = listingInfo.propType || 'house';
  const mockupLocation = [listingInfo.area, listingInfo.city].filter(Boolean).join(', ') || 'Main Road, Veraval';
  const mockupSize = listingInfo.size ? `${listingInfo.size} ${listingInfo.unit || 'sqft'}` : '1,200 sqft';

  // Real-time transform style for interactive preview
  const previewTransformStyle = {
    transform: `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
    filter: `brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100})`,
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'transform 0.15s ease, filter 0.15s ease',
  };

  return (
    <div
      className="photo-preview-overlay modal-overlay show"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photoModalTitle"
    >
      <div className="photo-preview-modal glass-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="photo-modal-header">
          <div className="header-left">
            <div className="badge-row">
              <span className="photo-counter-badge">
                {t('photoAdjust.photoCounter', { current: activeIdx + 1, total: images.length })}
              </span>
              {isCover ? (
                <span className="cover-badge-pill">
                  <Star size={13} fill="currentColor" /> {t('photoAdjust.isCover')}
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-set-cover-quick"
                  onClick={handleSetCover}
                  title={t('photoAdjust.setAsCover')}
                >
                  <Star size={13} /> {t('photoAdjust.setAsCover')}
                </button>
              )}
            </div>
            <h3 id="photoModalTitle">{t('photoAdjust.modalTitle')}</h3>
          </div>

          {/* View Mode Tabs */}
          <div className="photo-view-tabs">
            <button
              type="button"
              className={`tab-btn ${viewMode === 'card' ? 'active' : ''}`}
              onClick={() => setViewMode('card')}
            >
              <Eye size={15} />
              <span>{t('photoAdjust.cardViewTab')}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${viewMode === 'detail' ? 'active' : ''}`}
              onClick={() => setViewMode('detail')}
            >
              <Maximize2 size={15} />
              <span>{t('photoAdjust.detailViewTab')}</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${viewMode === 'adjust' ? 'active' : ''}`}
              onClick={() => setViewMode('adjust')}
            >
              <Sliders size={15} />
              <span>{t('photoAdjust.adjustTab')}</span>
            </button>
          </div>

          <button
            type="button"
            className="photo-modal-close"
            onClick={onClose}
            aria-label={t('photoAdjust.close')}
            disabled={isSaving}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Main Content */}
        <div className="photo-modal-content">
          {/* Main Visual Display Area */}
          <div className="preview-stage-container">
            {/* Nav Arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="stage-nav-btn prev"
                  onClick={handlePrev}
                  title="Previous Photo"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className="stage-nav-btn next"
                  onClick={handleNext}
                  title="Next Photo"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}

            {/* TAB 1: CARD VIEW MOCKUP */}
            {viewMode === 'card' && (
              <div className="stage-card-view">
                <div className="card-simulation-wrapper">
                  <div className="card-mockup-label">
                    <span className="live-dot" />
                    <span>{t('photoAdjust.cardPreviewNote')}</span>
                  </div>

                  {/* Real-time Property Card Mockup */}
                  <div className="prop-card-mockup glass-card">
                    <div
                      className="mockup-img-frame"
                      ref={containerRef}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <img
                        src={currentImg}
                        alt="Property Card Preview"
                        className="mockup-img"
                        style={previewTransformStyle}
                        draggable={false}
                      />

                      {/* Card Overlay Badge */}
                      <span className="mockup-badge">
                        {mockupType === 'house' ? <Home size={12} /> : <Building2 size={12} />}
                        {mockupType === 'house' ? t('common.house') : t('common.plot')}
                        <span style={{ opacity: 0.6 }}>•</span>
                        <span
                          style={{
                            color: mockupPurpose === 'rent' ? '#34d399' : '#fbbf24',
                            fontWeight: 700,
                          }}
                        >
                          {mockupPurpose === 'rent' ? t('hero.rent', 'Rent') : t('hero.sale', 'Sale')}
                        </span>
                      </span>

                      {/* Drag Hint overlay */}
                      <div className="mockup-drag-hint">
                        <Move size={14} />
                        <span>{t('photoAdjust.dragHint')}</span>
                      </div>
                    </div>

                    <div className="mockup-card-body">
                      <div className="mockup-price">{mockupPrice}</div>
                      <h4 className="mockup-title">{mockupTitle}</h4>
                      <div className="mockup-details">
                        <span>
                          <MapPin size={13} color="var(--accent)" /> {mockupLocation}
                        </span>
                        <span>
                          <Maximize size={13} color="var(--accent)" /> {mockupSize}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: FULL DETAIL GALLERY VIEW */}
            {viewMode === 'detail' && (
              <div className="stage-detail-view">
                <div className="detail-simulation-wrapper">
                  <div className="detail-preview-banner">
                    <h4>{mockupTitle}</h4>
                    <span className="detail-price-pill">{mockupPrice}</span>
                  </div>

                  <div
                    className="detail-gallery-main-frame"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      src={currentImg}
                      alt="Full Detail View"
                      className="detail-img"
                      style={previewTransformStyle}
                      draggable={false}
                    />
                    <div className="mockup-drag-hint">
                      <Move size={14} />
                      <span>{t('photoAdjust.dragHint')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ADJUST & CROP STUDIO VIEW */}
            {viewMode === 'adjust' && (
              <div className="stage-adjust-view">
                <div className={`adjust-canvas-frame aspect-${aspectRatio.replace(':', '-')}`}>
                  <div
                    className="adjust-canvas-inner"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    <img
                      src={currentImg}
                      alt="Adjustment Studio"
                      className="adjust-img"
                      style={previewTransformStyle}
                      draggable={false}
                    />

                    {/* Rule of thirds crop grid */}
                    <div className="crop-rule-of-thirds">
                      <div className="grid-line horizontal h1" />
                      <div className="grid-line horizontal h2" />
                      <div className="grid-line vertical v1" />
                      <div className="grid-line vertical v2" />
                    </div>

                    <div className="mockup-drag-hint">
                      <Move size={14} />
                      <span>{t('photoAdjust.dragHint')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Sidebar / Adjustments Toolbar */}
          <div className="photo-controls-panel">
            {/* Quick Action Badges / Cover Status */}
            <div className="control-section-header">
              <span className="section-title">{t('photoAdjust.adjustTab')}</span>
              {hasAdjustments && (
                <button type="button" className="btn-reset-adjustments" onClick={resetAdjustments}>
                  <RefreshCw size={13} /> {t('photoAdjust.reset')}
                </button>
              )}
            </div>

            {/* Rotation & Orientation */}
            <div className="control-group">
              <label>{t('photoAdjust.rotateLeft')} / {t('photoAdjust.rotateRight')}</label>
              <div className="tool-btn-row">
                <button
                  type="button"
                  className="tool-btn"
                  onClick={handleRotateCcw}
                  title={t('photoAdjust.rotateLeft')}
                >
                  <RotateCcw size={16} />
                  <span>-90°</span>
                </button>
                <button
                  type="button"
                  className="tool-btn"
                  onClick={handleRotateCw}
                  title={t('photoAdjust.rotateRight')}
                >
                  <RotateCw size={16} />
                  <span>+90°</span>
                </button>
                <button
                  type="button"
                  className={`tool-btn ${flipH ? 'active' : ''}`}
                  onClick={handleFlipH}
                  title={t('photoAdjust.flip')}
                >
                  <FlipHorizontal size={16} />
                  <span>{t('photoAdjust.flip')}</span>
                </button>
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="control-group">
              <div className="slider-label-row">
                <label>
                  <ZoomIn size={14} /> {t('photoAdjust.zoom')}
                </label>
                <span className="slider-value">{Math.round(zoom * 100)}%</span>
              </div>
              <div className="slider-row">
                <button
                  type="button"
                  className="slider-step-btn"
                  onClick={() => setZoom((z) => Math.max(1, parseFloat((z - 0.1).toFixed(2))))}
                  disabled={zoom <= 1}
                >
                  <ZoomOut size={14} />
                </button>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="custom-range"
                />
                <button
                  type="button"
                  className="slider-step-btn"
                  onClick={() => setZoom((z) => Math.min(2.5, parseFloat((z + 0.1).toFixed(2))))}
                  disabled={zoom >= 2.5}
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Quick Framing / Alignment */}
            <div className="control-group">
              <label>{t('photoAdjust.dragHint')}</label>
              <div className="align-buttons-row">
                <button
                  type="button"
                  className="tool-btn-sm"
                  onClick={() => handleAlign('top')}
                  title="Shift photo to show top (e.g., roof/facade)"
                >
                  <ArrowUp size={13} /> {t('photoAdjust.alignTop')}
                </button>
                <button
                  type="button"
                  className="tool-btn-sm"
                  onClick={() => handleAlign('center')}
                  title="Center photo framing"
                >
                  <Maximize2 size={13} /> {t('photoAdjust.alignCenter')}
                </button>
                <button
                  type="button"
                  className="tool-btn-sm"
                  onClick={() => handleAlign('bottom')}
                  title="Shift photo to show bottom (e.g., floor/garden)"
                >
                  <ArrowDown size={13} /> {t('photoAdjust.alignBottom')}
                </button>
              </div>
            </div>

            {/* Aspect Ratio (in Adjust Mode) */}
            <div className="control-group">
              <label>{t('photoAdjust.aspectRatio')}</label>
              <div className="aspect-ratio-selector">
                <button
                  type="button"
                  className={`aspect-pill ${aspectRatio === '16:9' ? 'active' : ''}`}
                  onClick={() => setAspectRatio('16:9')}
                >
                  {t('photoAdjust.aspectCard')}
                </button>
                <button
                  type="button"
                  className={`aspect-pill ${aspectRatio === '4:3' ? 'active' : ''}`}
                  onClick={() => setAspectRatio('4:3')}
                >
                  {t('photoAdjust.aspectPhoto')}
                </button>
                <button
                  type="button"
                  className={`aspect-pill ${aspectRatio === '1:1' ? 'active' : ''}`}
                  onClick={() => setAspectRatio('1:1')}
                >
                  {t('photoAdjust.aspectSquare')}
                </button>
                <button
                  type="button"
                  className={`aspect-pill ${aspectRatio === 'free' ? 'active' : ''}`}
                  onClick={() => setAspectRatio('free')}
                >
                  {t('photoAdjust.aspectOriginal')}
                </button>
              </div>
            </div>

            {/* Image Enhancements (Brightness & Contrast) */}
            <div className="control-group">
              <div className="slider-label-row">
                <label>{t('photoAdjust.brightness')}</label>
                <span className="slider-value">{brightness > 0 ? `+${brightness}` : brightness}</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                step="2"
                value={brightness}
                onChange={(e) => setBrightness(parseInt(e.target.value, 10))}
                className="custom-range"
              />

              <div className="slider-label-row" style={{ marginTop: '0.6rem' }}>
                <label>{t('photoAdjust.contrast')}</label>
                <span className="slider-value">{contrast > 0 ? `+${contrast}` : contrast}</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                step="2"
                value={contrast}
                onChange={(e) => setContrast(parseInt(e.target.value, 10))}
                className="custom-range"
              />

              <button
                type="button"
                className="btn-auto-enhance"
                onClick={handleAutoEnhance}
                title="Boost lighting and clarity"
              >
                <Sparkles size={14} color="var(--accent)" />
                <span>{t('photoAdjust.autoEnhance')}</span>
              </button>
            </div>

            {/* Save & Apply Button */}
            <div className="save-action-section">
              <button
                type="button"
                className={`btn-apply-adjustments ${hasAdjustments ? 'highlight' : ''}`}
                onClick={handleSaveAdjustments}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span>{t('photoAdjust.saving')}</span>
                ) : saveSuccess ? (
                  <>
                    <Check size={18} /> <span>{t('photoAdjust.saveChanges')} ✓</span>
                  </>
                ) : (
                  <>
                    <Check size={18} /> <span>{t('photoAdjust.saveChanges')}</span>
                  </>
                )}
              </button>

              {saveSuccess && (
                <div className="save-toast-banner">
                  <Check size={14} color="#34d399" />
                  <span>Adjustments saved and updated!</span>
                </div>
              )}
            </div>

            {/* Reordering & Deletion Actions */}
            <div className="extra-actions-row">
              <button
                type="button"
                className="btn-extra-action"
                onClick={() => handleMovePhoto('left')}
                disabled={activeIdx === 0}
                title={t('photoAdjust.moveEarlier')}
              >
                ← {t('photoAdjust.moveEarlier')}
              </button>
              <button
                type="button"
                className="btn-extra-action"
                onClick={() => handleMovePhoto('right')}
                disabled={activeIdx === images.length - 1}
                title={t('photoAdjust.moveLater')}
              >
                {t('photoAdjust.moveLater')} →
              </button>
              <button
                type="button"
                className="btn-extra-action delete"
                onClick={handleDeletePhoto}
                title={t('photoAdjust.deletePhoto')}
              >
                <Trash2 size={13} /> {t('photoAdjust.deletePhoto')}
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Strip */}
        <div className="photo-modal-footer">
          <div className="thumb-strip-header">
            <span>
              {t('photoAdjust.photoCounter', { current: activeIdx + 1, total: images.length })}
            </span>
            <span className="thumb-tip">
              💡 {isCover ? '🌟 This cover photo is the main image on search cards' : 'Select any thumbnail to view & adjust'}
            </span>
          </div>

          <div className="thumbnails-strip">
            {images.map((img, i) => (
              <div
                key={i}
                className={`strip-thumb ${i === activeIdx ? 'active' : ''} ${i === 0 ? 'is-cover' : ''}`}
                onClick={() => {
                  resetAdjustments();
                  setActiveIdx(i);
                }}
              >
                <img src={img} alt={`Thumb ${i + 1}`} />
                {i === 0 && (
                  <span className="strip-cover-star" title="Cover Photo">
                    <Star size={11} fill="currentColor" />
                  </span>
                )}
                <span className="strip-idx-badge">{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
