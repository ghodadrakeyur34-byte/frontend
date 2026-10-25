import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Home,
  Building2,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Pencil,
  Loader2,
  KeyRound,
  Tag,
  Shield,
  PhoneCall,
  Phone,
  Eye,
  Star,
  RotateCw,
  PlusCircle,
} from 'lucide-react';
import { getRemainingPriceChanges, canChangePrice, formatPrice } from '../utils';
import LocationPickerMap from './LocationPickerMap';
import DescriptionTips from './DescriptionTips';
import PhotoPreviewModal from './PhotoPreviewModal';

export default function EditListingModal({
  isOpen,
  listing,
  onClose,
  onSave,
  userLocation,
  onRequestLocation,
}) {
  const { t } = useTranslation();

  const [purpose, setPurpose] = useState('sale');
  const [propType, setPropType] = useState('house');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [unit, setUnit] = useState('sqft');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPreference, setContactPreference] = useState('notify'); // 'notify' | 'direct'
  const [listingCoords, setListingCoords] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewStartIndex, setPreviewStartIndex] = useState(0);

  const fileInputRef = useRef(null);

  const cityCoords = {
    Veraval: { lat: 20.9082, lng: 70.3703 },
    Una: { lat: 20.8227, lng: 71.0421 },
    Junagadh: { lat: 21.5222, lng: 70.4579 },
  };

  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Populate form with current listing data when listing changes or modal opens
  useEffect(() => {
    if (listing && isOpen) {
      setPurpose(listing.purpose || 'sale');
      setPropType(listing.type || 'house');
      setTitle(listing.title || '');
      setDesc(listing.desc || '');
      setPrice(listing.price !== undefined && listing.price !== null ? String(listing.price) : '');
      setSize(listing.size !== undefined && listing.size !== null ? String(listing.size) : '');
      setUnit(listing.unit || 'sqft');
      setArea(listing.area || '');
      setCity(listing.city || '');

      const initialLat = listing.lat ?? listing.latitude;
      const initialLng = listing.lng ?? listing.longitude;
      if (initialLat !== undefined && initialLat !== null && initialLng !== undefined && initialLng !== null) {
        setListingCoords({ lat: Number(initialLat), lng: Number(initialLng) });
      } else if (cityCoords[listing.city]) {
        setListingCoords(cityCoords[listing.city]);
      } else {
        setListingCoords(null);
      }

      setUploadedImages(Array.isArray(listing.images) ? [...listing.images] : []);
      setName(listing.contact?.name || '');
      setPhone(listing.contact?.phone || '');
      setContactPreference(listing.contact_preference || 'notify');
      setErrors({});
      setServerError('');
      setShowSuccess(false);
      setIsSaving(false);
    }
  }, [listing, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isSaving) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !listing) return null;

  const originalPrice = Number(listing.price);
  const currentEnteredPrice = parseFloat(price);
  const isPriceModified = !isNaN(currentEnteredPrice) && currentEnteredPrice !== originalPrice;
  const priceChangeLog = listing.priceChangeLog || [];
  const remainingChanges = getRemainingPriceChanges(priceChangeLog);
  const isPriceChangeAllowed = canChangePrice(priceChangeLog);

  const handleMapCoordsChange = (newCoords) => {
    setListingCoords(newCoords);

    if (!city) {
      let nearestCity = 'Veraval';
      let minDistance = Infinity;

      Object.entries(cityCoords).forEach(([cityName, coords]) => {
        const dist = getDistanceKm(newCoords.lat, newCoords.lng, coords.lat, coords.lng);
        if (dist < minDistance) {
          minDistance = dist;
          nearestCity = cityName;
        }
      });

      setCity(nearestCity);
      setErrors((prev) => ({ ...prev, city: false }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
    if (e.target) e.target.value = '';
  };

  const processFiles = (files) => {
    Array.from(files).forEach((file) => {
      if (uploadedImages.length >= 5 || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 600;
          let w = img.width;
          let h = img.height;
          if (w > MAX) {
            h = (h * MAX) / w;
            w = MAX;
          }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

          setUploadedImages((prev) => {
            if (prev.length >= 5) return prev;
            return [...prev, dataUrl];
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImg = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleOpenPhotoPreview = (index = 0) => {
    setPreviewStartIndex(index);
    setPreviewModalOpen(true);
  };

  const handleUpdateImages = (newImages) => {
    setUploadedImages(newImages);
  };

  const quickRotateImg = (e, index) => {
    e.stopPropagation();
    const src = uploadedImages[index];
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.height;
      canvas.height = img.width;
      const ctx = canvas.getContext('2d');
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const rotated = canvas.toDataURL('image/jpeg', 0.8);
      const updated = [...uploadedImages];
      updated[index] = rotated;
      handleUpdateImages(updated);
    };
    img.src = src;
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = true;
    if (!price || parseFloat(price) <= 0) newErrors.price = true;
    if (!size || parseFloat(size) <= 0) newErrors.size = true;
    if (!area.trim()) newErrors.area = true;
    if (!city.trim()) newErrors.city = true;
    if (!name.trim()) newErrors.name = true;
    if (!phone.trim()) newErrors.phone = true;

    if (isPriceModified && !isPriceChangeAllowed) {
      newErrors.priceLimit = true;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    const defaultCoord =
      listingCoords ||
      cityCoords[city.trim()] ||
      (userLocation || { lat: 20.9082, lng: 70.3703 });

    const finalLat =
      listingCoords?.lat !== undefined && listingCoords?.lat !== null
        ? Number(listingCoords.lat)
        : defaultCoord.lat;
    const finalLng =
      listingCoords?.lng !== undefined && listingCoords?.lng !== null
        ? Number(listingCoords.lng)
        : defaultCoord.lng;

    const updatedData = {
      purpose,
      type: propType,
      title: title.trim(),
      desc: desc.trim(),
      price: parseFloat(price),
      size: parseFloat(size),
      unit,
      area: area.trim(),
      city: city.trim(),
      lat: finalLat,
      lng: finalLng,
      latitude: finalLat,
      longitude: finalLng,
      images: uploadedImages,
      contact: {
        name: name.trim(),
        phone: phone.trim(),
        email: listing.contact?.email || '',
      },
      contact_preference: contactPreference,
    };

    try {
      setIsSaving(true);
      await onSave(listing.id, updatedData);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to update listing details:', err);
      setServerError(err.message || 'Failed to update property details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="modal-overlay show edit-property-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-property-modal-title"
    >
      <div
        className="modal edit-property-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          width: '95%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--r-lg, 16px)',
        }}
      >
        {/* Modal Header */}
        <div className="edit-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="edit-modal-icon-badge">
              <Pencil size={20} color="var(--accent)" />
            </div>
            <div>
              <h2 id="edit-property-modal-title" style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
                {t('editModal.title', 'Edit Entire Property Details')}
              </h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text3)' }}>
                {t('editModal.subtitle', 'Update all specifications, location, photos, and contact information')}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="edit-modal-close-btn"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Scrollable Form */}
        <div className="edit-modal-body">
          {serverError && (
            <div className="edit-modal-alert error">
              <AlertTriangle size={18} />
              <span>{serverError}</span>
            </div>
          )}

          {showSuccess && (
            <div className="edit-modal-alert success">
              <CheckCircle2 size={18} />
              <span>{t('editModal.successMessage', 'Property details updated successfully!')}</span>
            </div>
          )}

          <form id="editPropertyForm" onSubmit={handleSubmit}>
            {/* Purpose Toggle: For Sale vs For Rent */}
            <div className="form-group">
              <label>{t('sell.purpose', 'Purpose')}</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${purpose === 'sale' ? 'active' : ''}`}
                  onClick={() => setPurpose('sale')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Tag size={16} /> {t('sell.forSale', 'For Sale')}
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${purpose === 'rent' ? 'active' : ''}`}
                  onClick={() => setPurpose('rent')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <KeyRound size={16} /> {t('sell.forRent', 'For Rent')}
                </button>
              </div>
            </div>

            {/* Category Toggle */}
            <div className="form-group">
              <label>{t('sell.propertyType', 'Property Type')}</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${propType === 'house' ? 'active' : ''}`}
                  onClick={() => setPropType('house')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Home size={16} /> {t('common.house', 'House')}
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${propType === 'plot' ? 'active' : ''}`}
                  onClick={() => setPropType('plot')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Building2 size={16} /> {t('common.plot', 'Plot')}
                </button>
              </div>
            </div>

            {/* Title */}
            <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
              <label htmlFor="editPropTitle">{t('sell.titleLabel', 'Property Title')}</label>
              <input
                type="text"
                id="editPropTitle"
                placeholder={t('sell.titlePlaceholder', 'e.g. Beautiful 3-BHK House')}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: false }));
                }}
              />
              {errors.title && <div className="error-msg">{t('sell.titleError', 'Please enter a property title')}</div>}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="editPropDesc">{t('sell.description', 'Description')}</label>
              <textarea
                id="editPropDesc"
                rows={3}
                placeholder={t('sell.descPlaceholder', 'Provide comprehensive details about property features, nearby facilities, condition...')}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              ></textarea>
              <DescriptionTips
                onApplyTemplate={(tpl) =>
                  setDesc((prev) => (prev && prev.trim() ? `${prev}\n\n${tpl}` : tpl))
                }
              />
            </div>

            {/* Price & Size */}
            <div className="form-row">
              <div className={`form-group ${errors.price || errors.priceLimit ? 'has-error' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="editPropPrice">{t('sell.price', 'Price')}</label>
                  {isPriceModified && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: remainingChanges === 0 ? '#f87171' : 'var(--accent)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <AlertTriangle size={12} />
                      {remainingChanges} change{remainingChanges !== 1 ? 's' : ''} left this month
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  id="editPropPrice"
                  placeholder={t('sell.pricePlaceholder', 'e.g. 4500000')}
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price || errors.priceLimit) {
                      setErrors((prev) => ({ ...prev, price: false, priceLimit: false }));
                    }
                  }}
                  min="1"
                />
                {errors.price && <div className="error-msg">{t('sell.priceError', 'Please enter a valid price')}</div>}
                {errors.priceLimit && (
                  <div className="error-msg">
                    {t('detail.limitReached', 'Monthly price change limit reached (4/4 used)')}
                  </div>
                )}
              </div>

              <div className={`form-group ${errors.size ? 'has-error' : ''}`}>
                <label htmlFor="editPropSize">{t('sell.size', 'Size')}</label>
                <div className="form-row" style={{ gridTemplateColumns: '1fr auto', gap: '0.5rem', marginBottom: 0 }}>
                  <input
                    type="number"
                    id="editPropSize"
                    placeholder={t('sell.sizePlaceholder', 'e.g. 1200')}
                    value={size}
                    onChange={(e) => {
                      setSize(e.target.value);
                      if (errors.size) setErrors((prev) => ({ ...prev, size: false }));
                    }}
                    min="1"
                  />
                  <select
                    id="editPropUnit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="sqft">{t('common.sqft', 'Sq. Ft.')}</option>
                    <option value="sqyd">{t('common.sqyd', 'Sq. Yards')}</option>
                  </select>
                </div>
                {errors.size && <div className="error-msg">{t('sell.sizeError', 'Please enter a valid size')}</div>}
              </div>
            </div>

            {/* Location */}
            <div className="form-row">
              <div className={`form-group ${errors.area ? 'has-error' : ''}`}>
                <label htmlFor="editPropArea">{t('sell.area', 'Area / Locality')}</label>
                <input
                  type="text"
                  id="editPropArea"
                  placeholder={t('sell.areaPlaceholder', 'e.g. Rajendra Bhuvan Road')}
                  value={area}
                  onChange={(e) => {
                    setArea(e.target.value);
                    if (errors.area) setErrors((prev) => ({ ...prev, area: false }));
                  }}
                />
                {errors.area && <div className="error-msg">{t('sell.areaError', 'Please enter area / locality')}</div>}
              </div>

              <div className={`form-group ${errors.city ? 'has-error' : ''}`}>
                <label htmlFor="editPropCity">{t('sell.cityLabel', 'City')}</label>
                <select
                  id="editPropCity"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) setErrors((prev) => ({ ...prev, city: false }));
                  }}
                >
                  <option value="">{t('sell.selectCity', 'Select City')}</option>
                  <option value="Veraval">Veraval (વેરાવળ)</option>
                  <option value="Una">Una (ઉના)</option>
                  <option value="Junagadh">Junagadh (જુનાગઢ)</option>
                </select>
                {errors.city && <div className="error-msg">{t('sell.cityError', 'Please select a city')}</div>}
              </div>
            </div>

            {/* Interactive Location Map Picker */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <MapPin size={16} color="var(--accent)" />
                  {t('detail.locationMap', 'Property Location on Map')}
                </label>
                <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                  Drag marker or click map to reposition
                </span>
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                <LocationPickerMap
                  coords={listingCoords}
                  onChange={handleMapCoordsChange}
                  selectedCity={city}
                  onRequestLocation={onRequestLocation}
                />
              </div>
            </div>

            {/* Photos Management */}
            <div className="form-group">
              <div className="photos-label-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ margin: 0 }}>{t('sell.photos', 'Property Photos')}</label>
                  <span style={{ fontSize: '0.78rem', color: uploadedImages.length >= 5 ? '#f87171' : 'var(--text3)' }}>
                    ({uploadedImages.length}/5)
                  </span>
                </div>
                {uploadedImages.length > 0 && (
                  <button
                    type="button"
                    className="btn-preview-photos-header"
                    onClick={() => handleOpenPhotoPreview(0)}
                    title={t('sell.previewPhotosDesc', 'Verify how photos look on buyer cards, rotate, crop, or reorder')}
                  >
                    <Eye size={15} />
                    <span>{t('sell.previewPhotos', 'Preview & Adjust Photos')}</span>
                    <span className="photos-count-chip">{uploadedImages.length}/5</span>
                  </button>
                )}
              </div>

              {uploadedImages.length < 5 && (
                <div
                  className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{ padding: '1.25rem', marginBottom: '0.75rem' }}
                >
                  <div className="icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                    <UploadCloud size={32} color="var(--accent)" />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    {t('sell.dragDrop', 'Drag and drop photos here, or')} <span>{t('sell.clickBrowse', 'browse')}</span>
                  </p>
                </div>
              )}

              <input
                type="file"
                multiple
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              {uploadedImages.length > 0 && (
                <div className="preview-grid" style={{ marginTop: '0.5rem' }}>
                  {uploadedImages.map((src, idx) => (
                    <div
                      key={idx}
                      className={`preview-item ${idx === 0 ? 'is-cover-item' : ''}`}
                      onClick={() => handleOpenPhotoPreview(idx)}
                      title="Click to preview & adjust"
                    >
                      <img src={src} alt={`Preview ${idx + 1}`} />

                      {idx === 0 && (
                        <span className="cover-tag">
                          <Star size={10} fill="currentColor" /> {t('sell.coverBadge', 'Cover')}
                        </span>
                      )}

                      <div className="preview-item-overlay">
                        <button
                          type="button"
                          className="preview-item-action-btn view"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenPhotoPreview(idx);
                          }}
                          title={t('sell.previewPhoto', 'Preview & Adjust')}
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          type="button"
                          className="preview-item-action-btn rotate"
                          onClick={(e) => quickRotateImg(e, idx)}
                          title={t('sell.quickRotate', 'Rotate 90°')}
                        >
                          <RotateCw size={13} />
                        </button>
                        <button
                          type="button"
                          className="remove-img"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImg(idx);
                          }}
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}

                  {uploadedImages.length < 5 && (
                    <button
                      type="button"
                      className="add-more-photos-btn"
                      onClick={() => fileInputRef.current?.click()}
                      title="Add more photos"
                    >
                      <PlusCircle size={22} />
                      <span>+ Add</span>
                    </button>
                  )}
                </div>
              )}

              {uploadedImages.length > 0 && (
                <div className="photos-preview-action-banner" style={{ marginTop: '0.75rem' }}>
                  <div className="banner-left">
                    <Eye size={16} color="var(--accent)" />
                    <span>{t('sell.previewPhotosDesc', 'Verify how photos look on buyer cards, rotate, crop, or reorder')}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-preview-photos-banner"
                    onClick={() => handleOpenPhotoPreview(0)}
                  >
                    <Eye size={14} />
                    <span>{t('sell.previewPhotos', 'Preview & Adjust Photos')} →</span>
                  </button>
                </div>
              )}
            </div>

            {/* Contact Person */}
            <div className="form-row">
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="editPropName">{t('sell.yourName', 'Contact Person Name')}</label>
                <input
                  type="text"
                  id="editPropName"
                  placeholder={t('sell.namePlaceholder', 'Enter Your Name')}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: false }));
                  }}
                />
                {errors.name && <div className="error-msg">{t('sell.nameError', 'Contact name is required')}</div>}
              </div>

              <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
                <label htmlFor="editPropPhone">{t('sell.phoneNumber', 'Contact Phone Number')}</label>
                <input
                  type="tel"
                  id="editPropPhone"
                  placeholder={t('sell.phonePlaceholder', 'Enter Your Phone Number')}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors((prev) => ({ ...prev, phone: false }));
                  }}
                />
                {errors.phone && <div className="error-msg">{t('sell.phoneError', 'Valid phone number is required')}</div>}
              </div>
            </div>

            {/* Contact Privacy Mode */}
            <div className="form-group contact-privacy-selector" style={{ marginTop: '1rem', marginBottom: '1.25rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.65rem', color: 'var(--text)' }}>
                <Shield size={16} color="var(--accent)" />
                {t('sell.contactPrivacyTitle', 'Contact Privacy & Buyer Inquiries')}
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {/* Option B: Request Callback */}
                <div
                  onClick={() => setContactPreference('notify')}
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: 'var(--r-md, 10px)',
                    border: `1.5px solid ${contactPreference === 'notify' ? 'var(--accent, #e2b857)' : 'var(--border, #334155)'}`,
                    background: contactPreference === 'notify' ? 'rgba(226, 184, 87, 0.08)' : 'var(--surface, #1e293b)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', color: contactPreference === 'notify' ? 'var(--accent, #e2b857)' : 'var(--text, #f8fafc)' }}>
                      <PhoneCall size={15} />
                      {t('sell.requestCallbackOption', 'Request Callback (Private)')}
                    </div>
                    <input
                      type="radio"
                      name="editContactPreference"
                      value="notify"
                      checked={contactPreference === 'notify'}
                      onChange={() => setContactPreference('notify')}
                      style={{ accentColor: 'var(--accent, #e2b857)' }}
                    />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text2, #94a3b8)', lineHeight: '1.35' }}>
                    {t('sell.requestCallbackDesc', 'Keep your number hidden from scrapers. Serious buyers send their verified mobile number for you to call them.')}
                  </p>
                </div>

                {/* Option A: Direct Contact */}
                <div
                  onClick={() => setContactPreference('direct')}
                  style={{
                    padding: '0.9rem 1rem',
                    borderRadius: 'var(--r-md, 10px)',
                    border: `1.5px solid ${contactPreference === 'direct' ? 'var(--accent, #e2b857)' : 'var(--border, #334155)'}`,
                    background: contactPreference === 'direct' ? 'rgba(226, 184, 87, 0.08)' : 'var(--surface, #1e293b)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.88rem', color: contactPreference === 'direct' ? 'var(--accent, #e2b857)' : 'var(--text, #f8fafc)' }}>
                      <Phone size={15} />
                      {t('sell.directContactOption', 'Direct Contact')}
                    </div>
                    <input
                      type="radio"
                      name="editContactPreference"
                      value="direct"
                      checked={contactPreference === 'direct'}
                      onChange={() => setContactPreference('direct')}
                      style={{ accentColor: 'var(--accent, #e2b857)' }}
                    />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text2, #94a3b8)', lineHeight: '1.35' }}>
                    {t('sell.directContactDesc', 'Allow verified, logged-in buyers to click "Show Number" to reveal and call your phone number directly.')}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Footer Actions */}
        <div className="edit-modal-footer">
          <button
            type="button"
            className="btn-submit btn-cancel-modal"
            onClick={onClose}
            disabled={isSaving}
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <button
            type="submit"
            form="editPropertyForm"
            className="btn-submit"
            disabled={isSaving}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', minWidth: '160px' }}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {t('editModal.saving', 'Saving Changes...')}
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                {t('editModal.saveChanges', 'Save Changes')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* PHOTO PREVIEW & ADJUST MODAL */}
      <PhotoPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        images={uploadedImages}
        initialIndex={previewStartIndex}
        listingInfo={{
          purpose,
          propType,
          title,
          price,
          size,
          unit,
          area,
          city,
        }}
        onUpdateImages={handleUpdateImages}
      />
    </div>
  );
}
