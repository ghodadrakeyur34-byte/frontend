import React from 'react';
import { Bed, Sofa, CookingPot, Sun, Bath, Minus, Plus, Home } from 'lucide-react';

export default function ResidentialSteppers({
  values = {},
  onChange,
}) {
  const {
    bedrooms = 1,
    halls = 1,
    kitchens = 1,
    balconies = 0,
    toilets = 1,
  } = values;

  const updateField = (field, delta) => {
    const current = Number(values[field] ?? (field === 'balconies' ? 0 : 1));
    const next = Math.max(0, Math.min(10, current + delta));
    if (onChange) {
      onChange(field, next);
    }
  };

  const setDirectValue = (field, val) => {
    const parsed = parseInt(val, 10);
    const next = isNaN(parsed) ? 0 : Math.max(0, Math.min(10, parsed));
    if (onChange) {
      onChange(field, next);
    }
  };

  const items = [
    {
      key: 'bedrooms',
      en: 'Bedroom',
      gu: 'બેડરૂમ',
      icon: Bed,
      value: bedrooms,
    },
    {
      key: 'halls',
      en: 'Hall - Living Room',
      gu: 'હોલ',
      icon: Sofa,
      value: halls,
    },
    {
      key: 'kitchens',
      en: 'Kitchen',
      gu: 'રસોડું',
      icon: CookingPot,
      value: kitchens,
    },
    {
      key: 'balconies',
      en: 'Balcony',
      gu: 'બાલ્કની',
      icon: Sun,
      value: balconies,
    },
    {
      key: 'toilets',
      en: 'Toilet',
      gu: 'ટોઇલેટ',
      icon: Bath,
      value: toilets,
    },
  ];

  // Quick summary string (e.g., 2 BHK)
  const bhkSummary = bedrooms > 0
    ? `${bedrooms}${halls > 0 ? 'B' : ''}${halls > 0 ? 'HK' : ' Bed'}`
    : null;

  return (
    <div className="residential-steppers-container">
      <div className="residential-steppers-header">
        <div className="residential-header-title">
          <div className="residential-header-icon-box">
            <Home size={18} color="var(--accent)" />
          </div>
          <div>
            <h3 className="residential-title">Residential (રેસિડેન્શિયલ)</h3>
            <p className="residential-subtitle">Rooms & Spaces Configuration</p>
          </div>
        </div>
        {bhkSummary && (
          <span className="residential-bhk-badge">
            {bhkSummary}
          </span>
        )}
      </div>

      <div className="residential-grid">
        {items.map((item) => {
          const Icon = item.icon;
          const val = Number(item.value) || 0;
          return (
            <div key={item.key} className="stepper-card">
              <div className="stepper-label-section">
                <div className="stepper-icon-wrapper">
                  <Icon size={18} />
                </div>
                <div className="stepper-texts">
                  <span className="stepper-en-label">{item.en}</span>
                  <span className="stepper-gu-label">({item.gu})</span>
                </div>
              </div>

              <div className="stepper-control-box">
                <button
                  type="button"
                  className="stepper-btn stepper-btn-dec"
                  onClick={() => updateField(item.key, -1)}
                  disabled={val <= 0}
                  aria-label={`Decrease ${item.en}`}
                >
                  <Minus size={15} />
                </button>

                <div className="stepper-value-display">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={val}
                    onChange={(e) => setDirectValue(item.key, e.target.value)}
                    className="stepper-input"
                    aria-label={`${item.en} count`}
                  />
                </div>

                <button
                  type="button"
                  className="stepper-btn stepper-btn-inc"
                  onClick={() => updateField(item.key, 1)}
                  disabled={val >= 10}
                  aria-label={`Increase ${item.en}`}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
