import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, MapPin, Target, Building2, PlusCircle, ShieldCheck, LogOut, User } from 'lucide-react';

export default function Navbar({ currentHash, currentUser, onLogout, onShowLogin, onRequestLocation, userLocation }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = (hash) => {
    window.location.hash = hash;
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'gu' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className={`navbar glass-card ${isScrolled ? 'scrolled' : ''}`} id="navbar">
      <a onClick={() => handleNavClick('#home')} className="logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Home size={22} color="var(--accent)" />
        <span><span className="gradient-text">Mari</span><span style={{ color: 'var(--text)' }}>Milkat</span></span>
      </a>
      <ul className={`nav-links ${isOpen ? 'open' : ''}`} id="navLinks">
        <li>
          <a
            onClick={() => handleNavClick('#home')}
            className={currentHash === '#home' || currentHash === '' ? 'active' : ''}
          >
            {t('nav.home')}
          </a>
        </li>
        <li>
          <a
            onClick={() => handleNavClick('#browse')}
            className={currentHash === '#browse' ? 'active' : ''}
          >
            {t('nav.browse')}
          </a>
        </li>
        {currentUser && (
          <li>
            <a
              onClick={() => handleNavClick('#sell')}
              className={currentHash === '#sell' ? 'active' : ''}
            >
              {t('nav.postAd')}
            </a>
          </li>
        )}
        {currentUser && (
          <li>
            <a
              onClick={() => handleNavClick('#my-listings')}
              className={currentHash === '#my-listings' ? 'active' : ''}
            >
              {t('nav.myListings')}
            </a>
          </li>
        )}
      </ul>

      {/* Right-side: location badge + language toggle + user indicator */}
      <div className="nav-right">
        {userLocation ? (
          <button className="nav-loc-btn active" onClick={onRequestLocation} title="Location active" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} /> Nearby
          </button>
        ) : (
          onRequestLocation && (
            <button className="nav-loc-btn" onClick={onRequestLocation} title="Enable location" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Target size={15} /> Location
            </button>
          )
        )}

        <button className="lang-toggle" onClick={toggleLanguage} title="Switch language">
          {i18n.language === 'en' ? t('lang.gu') : t('lang.en')}
        </button>

        {currentUser ? (
          <div className="user-indicator" ref={userMenuRef}>
            <button
              className="user-avatar-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={currentUser.name}
            >
              <span className="user-avatar-circle">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
              <span className="user-avatar-name">{currentUser.name.split(' ')[0]}</span>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-dropdown-header">
                  <strong>{currentUser.name}</strong>
                  <span>{currentUser.email}</span>
                </div>
                <button onClick={() => handleNavClick('#my-listings')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={16} /> {t('nav.myListings')}
                </button>
                <button onClick={() => handleNavClick('#sell')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircle size={16} /> {t('nav.postAd')}
                </button>
                <button onClick={() => handleNavClick('#admin')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} /> Admin Panel
                </button>
                <hr />
                <button onClick={onLogout} className="logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LogOut size={16} /> {t('nav.signOut')}
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="btn-sell" onClick={() => { window.location.hash = '#login'; }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <User size={16} /> {t('nav.signIn')}
          </button>
        )}
      </div>

      <button className="hamburger" id="hamburger" aria-label="Menu" onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </button>
    </nav>
  );
}
