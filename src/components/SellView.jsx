import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { genId } from '../utils';

export default function SellView({ onAddListing, currentUser, onRequireLogin }) {
  const { t } = useTranslation();
  const [propType, setPropType] = useState('house');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [unit, setUnit] = useState('sqft');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  // Sync fields when user logs in mid-form
  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.name);
      if (!phone) setPhone(currentUser.phone);
    }
  }, [currentUser]);
  
  const [uploadedImages, setUploadedImages] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [createdId, setCreatedId] = useState(null);

  const fileInputRef = useRef(null);

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

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = true;
    if (!price || parseFloat(price) <= 0) newErrors.price = true;
    if (!size || parseFloat(size) <= 0) newErrors.size = true;
    if (!area.trim()) newErrors.area = true;
    if (!city.trim()) newErrors.city = true;
    if (!name.trim()) newErrors.name = true;
    if (!phone.trim()) newErrors.phone = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Require login before posting
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (!validate()) return;

    const cityCoords = {
      Veraval: { lat: 20.9082, lng: 70.3703 },
      Una: { lat: 20.8227, lng: 71.0421 },
      Junagadh: { lat: 21.5222, lng: 70.4579 },
    };

    const defaultCoord = cityCoords[city.trim()] || (userLocation || { lat: 20.9082, lng: 70.3703 });

    const id = genId();
    const newListing = {
      id,
      type: propType,
      title: title.trim(),
      desc: desc.trim(),
      price: parseFloat(price),
      size: parseFloat(size),
      unit,
      area: area.trim(),
      city: city.trim(),
      lat: defaultCoord.lat,
      lng: defaultCoord.lng,
      images: uploadedImages,
      contact: {
        name: name.trim(),
        phone: phone.trim(),
      },
      date: new Date().toISOString().split('T')[0],
      ownerId: currentUser.phone,
    };

    onAddListing(newListing);
    setCreatedId(id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (createdId) {
      window.location.hash = `#detail/${createdId}`;
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <main id="page-sell" className="page active">
      <section className="sell-page">
        <h1>{t('sell.title')}</h1>
        <p>{t('sell.subtitle')}</p>
        <div className="form-card">
          <form id="sellForm" onSubmit={handleSubmit}>
            {/* Category Toggle */}
            <div className="form-group">
              <label>{t('sell.propertyType')}</label>
              <div className="toggle-group">
                <button
                  type="button"
                  className={`toggle-btn ${propType === 'house' ? 'active' : ''}`}
                  onClick={() => setPropType('house')}
                >
                  🏠 {t('common.house')}
                </button>
                <button
                  type="button"
                  className={`toggle-btn ${propType === 'plot' ? 'active' : ''}`}
                  onClick={() => setPropType('plot')}
                >
                  📐 {t('common.plot')}
                </button>
              </div>
            </div>

            {/* Title */}
            <div className={`form-group ${errors.title ? 'has-error' : ''}`}>
              <label htmlFor="propTitle">{t('sell.titleLabel')}</label>
              <input
                type="text"
                id="propTitle"
                placeholder={t('sell.titlePlaceholder')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="error-msg">{t('sell.titleError')}</div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="propDesc">{t('sell.description')}</label>
              <textarea
                id="propDesc"
                placeholder={t('sell.descPlaceholder')}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              ></textarea>
            </div>

            {/* Price & Size */}
            <div className="form-row">
              <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
                <label htmlFor="propPrice">{t('sell.price')}</label>
                <input
                  type="number"
                  id="propPrice"
                  placeholder={t('sell.pricePlaceholder')}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="1"
                />
                <div className="error-msg">{t('sell.priceError')}</div>
              </div>
              <div className={`form-group ${errors.size ? 'has-error' : ''}`}>
                <label>{t('sell.size')}</label>
                <div className="form-row" style={{ gridTemplateColumns: '1fr auto', gap: '0.5rem' }}>
                  <input
                    type="number"
                    id="propSize"
                    placeholder={t('sell.sizePlaceholder')}
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    min="1"
                  />
                  <select
                    id="propUnit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="sqft">{t('common.sqft')}</option>
                    <option value="sqyd">{t('common.sqyd')}</option>
                  </select>
                </div>
                <div className="error-msg">{t('sell.sizeError')}</div>
              </div>
            </div>

            {/* Location */}
            <div className="form-row">
              <div className={`form-group ${errors.area ? 'has-error' : ''}`}>
                <label htmlFor="propArea">{t('sell.area')}</label>
                <input
                  type="text"
                  id="propArea"
                  placeholder={t('sell.areaPlaceholder')}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
                <div className="error-msg">{t('sell.areaError')}</div>
              </div>
              <div className={`form-group ${errors.city ? 'has-error' : ''}`}>
                <label htmlFor="propCity">{t('sell.cityLabel')}</label>
                <select
                  id="propCity"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  <option value="">{t('sell.selectCity')}</option>
                  <option value="Veraval">Veraval(વેરાવળ)</option>
                  <option value="Una">Una(ઉના)</option>
                  <option value="Junagadh">Junagadh(જુનાગઢ)</option>
                </select>
                <div className="error-msg">{t('sell.cityError')}</div>
              </div>
            </div>

            {/* Photos */}
            <div className="form-group">
              <label>{t('sell.photos')}</label>
              <div
                className={`upload-zone ${isDragOver ? 'dragover' : ''}`}
                id="uploadZone"
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="icon">📷</div>
                <p>{t('sell.dragDrop')} <span>{t('sell.clickBrowse')}</span></p>
              </div>
              <input
                type="file"
                id="fileInput"
                multiple
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div className="preview-grid" id="previewGrid">
                {uploadedImages.map((src, idx) => (
                  <div key={idx} className="preview-item">
                    <img src={src} alt={`Preview ${idx + 1}`} />
                    <button
                      type="button"
                      className="remove-img"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImg(idx);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="form-row">
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="propName">{t('sell.yourName')}</label>
                <input
                  type="text"
                  id="propName"
                  placeholder={t('sell.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="error-msg">{t('sell.nameError')}</div>
              </div>
              <div className={`form-group ${errors.phone ? 'has-error' : ''}`}>
                <label htmlFor="propPhone">{t('sell.phoneNumber')}</label>
                <input
                  type="tel"
                  id="propPhone"
                  placeholder={t('sell.phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <div className="error-msg">{t('sell.phoneError')}</div>
              </div>
            </div>

            <button type="submit" className="btn-submit">{t('sell.submit')}</button>
          </form>
        </div>
      </section>

      {/* SUCCESS MODAL */}
      <div className={`modal-overlay ${showModal ? 'show' : ''}`} id="successModal">
        <div className="modal">
          <div className="checkmark">✅</div>
          <h2>{t('sell.successTitle')}</h2>
          <p>{t('sell.successMessage')}</p>
          <button className="btn-submit" onClick={handleCloseModal}>{t('sell.viewListing')}</button>
        </div>
      </div>
    </main>
  );
}
