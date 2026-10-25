import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  Layers,
  Compass,
  Home,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function DescriptionTips({ onApplyTemplate, initialOpen = true }) {
  const { i18n } = useTranslation();
  // Language tab state: 'en' | 'gu' | 'both'
  const currentAppLang = i18n.language && i18n.language.startsWith('gu') ? 'gu' : 'en';
  const [selectedLang, setSelectedLang] = useState(currentAppLang);
  const [isOpen, setIsOpen] = useState(initialOpen);

  // Sync if global site language changes
  useEffect(() => {
    if (selectedLang !== 'both') {
      setSelectedLang(currentAppLang);
    }
  }, [currentAppLang]);

  const enData = {
    title: 'Tip: What to write in the description?',
    subtitle: 'A detailed description helps sell your property faster! Mention:',
    items: [
      {
        label: 'Configuration & Size:',
        desc: '(e.g., 2 BHK flat, 1200 sq. ft. super built-up, carpet area)',
        icon: Layers,
      },
      {
        label: 'Plot/Facing Details:',
        desc: '(e.g., East facing, corner plot, road width)',
        icon: Compass,
      },
      {
        label: 'Furnishing Status:',
        desc: '(Unfurnished, Semi-furnished with modular kitchen, Fully furnished)',
        icon: Home,
      },
      {
        label: 'Key Amenities:',
        desc: '(Lift, 24/7 water, reserved car parking, CCTV, garden)',
        icon: CheckCircle2,
      },
      {
        label: 'Nearby Landmarks:',
        desc: 'Distance to schools, hospitals, bus stand, or main road.',
        icon: MapPin,
      },
      {
        label: 'Legal & Possession:',
        desc: 'Clear title, ready to move, or possession date.',
        icon: ShieldCheck,
      },
    ],
    template: `• Configuration & Size: 
• Plot/Facing Details: 
• Furnishing Status: 
• Key Amenities: 
• Nearby Landmarks: 
• Legal & Possession: `,
  };

  const guData = {
    title: 'ટિપ્સ: વિગતો (Description) માં શું લખવું?',
    subtitle: 'પ્રોપર્ટીની પૂરી વિગતો આપવાથી ગ્રાહક ઝડપથી મળશે! આ બાબતો જરૂર લખો:',
    items: [
      {
        label: 'માપ અને પ્રકાર:',
        desc: '(દા.ત. 2 BHK ફ્લેટ, 1200 ચો.ફૂટ સુપર બિલ્ટ-અપ, કાર્પેટ એરિયા)',
        icon: Layers,
      },
      {
        label: 'દિશા અને લોકેશન:',
        desc: '(પૂર્વ મુખી, કોર્નર પ્લોટ, સામે કેટલા ફૂટનો રોડ છે)',
        icon: Compass,
      },
      {
        label: 'ફર્નિચરની સ્થિતિ:',
        desc: '(સામાન્ય, સેમી-ફર્નિશ્ડ કે ફુલ ફર્નિશ્ડ)',
        icon: Home,
      },
      {
        label: 'સુવિધાઓ (Amenities):',
        desc: '(લિફ્ટ, 24 કલાક પાણી, કાર પાર્કિંગ, CCTV, બગીચો)',
        icon: CheckCircle2,
      },
      {
        label: 'નજીકના સ્થળો:',
        desc: 'સ્કૂલ, હોસ્પિટલ, બસ સ્ટેન્ડ કે મેઈન રોડ કેટલો દૂર છે.',
        icon: MapPin,
      },
      {
        label: 'દસ્તાવેજ અને કબજો:',
        desc: 'ચોખ્ખો દસ્તાવેજ (Clear Title), તાત્કાલિક કબજો મળશે કે નહીં.',
        icon: ShieldCheck,
      },
    ],
    template: `• માપ અને પ્રકાર: 
• દિશા અને લોકેશન: 
• ફર્નિચરની સ્થિતિ: 
• સુવિધાઓ (Amenities): 
• નજીકના સ્થળો: 
• દસ્તાવેજ અને કબજો: `,
  };

  const renderSection = (data, langTag) => (
    <div key={langTag} className="desc-tips-section" style={langTag === 'gu' && selectedLang === 'both' ? { marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' } : {}}>
      <div className="desc-tips-section-header">
        <h4 className="desc-tips-title">{data.title}</h4>
      </div>
      <p className="desc-tips-subtitle">{data.subtitle}</p>
      <div className="desc-tips-grid">
        {data.items.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <div key={idx} className="desc-tips-item">
              <IconComponent size={16} className="desc-tips-item-icon" />
              <div className="desc-tips-item-text">
                <span className="desc-tips-item-label">{item.label}</span>
                <span>{item.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
      {onApplyTemplate && (
        <div className="desc-tips-actions">
          <button
            type="button"
            className="desc-tips-template-btn"
            onClick={() => onApplyTemplate(data.template)}
            title="Insert these points into your description"
          >
            <FileText size={13} />
            {langTag === 'gu' ? 'ટેમ્પલેટ વિગતોમાં ઉમેરો' : 'Use This Template in Description'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="desc-tips-card">
      <div className="desc-tips-header">
        <div className="desc-tips-title-wrap" style={{ cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
          <div className="desc-tips-icon-badge">
            <Sparkles size={16} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
            {selectedLang === 'gu' ? 'મદદરૂપ ટિપ્સ (Description Guide)' : 'Description Guide & Tips'}
          </span>
          <button
            type="button"
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '2px', cursor: 'pointer', display: 'flex' }}
            aria-label={isOpen ? 'Collapse tips' : 'Expand tips'}
          >
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <div className="desc-tips-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={selectedLang === 'en'}
            className={`desc-tips-tab-btn ${selectedLang === 'en' ? 'active' : ''}`}
            onClick={() => { setSelectedLang('en'); setIsOpen(true); }}
          >
            English
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedLang === 'gu'}
            className={`desc-tips-tab-btn ${selectedLang === 'gu' ? 'active' : ''}`}
            onClick={() => { setSelectedLang('gu'); setIsOpen(true); }}
          >
            ગુજરાતી (Gujarati)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedLang === 'both'}
            className={`desc-tips-tab-btn ${selectedLang === 'both' ? 'active' : ''}`}
            onClick={() => { setSelectedLang('both'); setIsOpen(true); }}
          >
            Both / બંને
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="desc-tips-body">
          {(selectedLang === 'en' || selectedLang === 'both') && renderSection(enData, 'en')}
          {(selectedLang === 'gu' || selectedLang === 'both') && renderSection(guData, 'gu')}
        </div>
      )}
    </div>
  );
}
