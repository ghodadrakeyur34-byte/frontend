import React from 'react';
import { useTranslation } from 'react-i18next';
import { Headphones } from 'lucide-react';

export default function Footer({ currentUser }) {
  const { t } = useTranslation();

  const handleNavClick = (hash) => {
    window.location.hash = hash;
  };

  return (
    <footer>
      <div className="footer-links">
        <a onClick={() => handleNavClick('#home')} style={{ cursor: 'pointer' }}>{t('nav.home')}</a>
        <a onClick={() => handleNavClick('#browse')} style={{ cursor: 'pointer' }}>{t('nav.browse')}</a>
        <a onClick={() => handleNavClick('#help')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Headphones size={15} /> {t('nav.helpDesk', 'Help Desk')}
        </a>
        {currentUser && (
          <a onClick={() => handleNavClick('#sell')} style={{ cursor: 'pointer' }}>{t('nav.postAd')}</a>
        )}
        {currentUser && (
          <a onClick={() => handleNavClick('#my-listings')} style={{ cursor: 'pointer' }}>{t('nav.myListings')}</a>
        )}
      </div>
      <p>{t('footer.copyright')}</p>
    </footer>
  );
}
