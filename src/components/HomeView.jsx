import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import PropertyCard from './PropertyCard';
import PropertyMap from './PropertyMap';

export default function HomeView({ listings, onSearch, userLocation, onRequestLocation, currentUser }) {
  const { t } = useTranslation();
  const [parent] = useAutoAnimate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    // Scroll fade-in animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach((el) => observer.observe(el));

    // Force hero items to fade in shortly after render
    const timer = setTimeout(() => {
      const heroFadeElements = document.querySelectorAll('.hero .fade-in');
      heroFadeElements.forEach((el) => el.classList.add('visible'));
    }, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    onSearch({ area: location, type });
    window.location.hash = '#browse';
  };

  const recentListings = listings.slice(0, 6);

  return (
    <main id="page-home" className="page active">
      <section className="hero">
        <div className="hero-bg">
          <img src="/assets/hero_bg.png" alt="Modern Residential Neighborhood" />
        </div>
        <div className="hero-content fade-in">
          <h1 className="gradient-text">
            {t('hero.findYourDream')} <span className="gradient-text">{t('hero.property')}</span>
          </h1>
          <form className="hero-search glass-card" id="heroSearch" onSubmit={handleSearchSubmit}>
            <select
              id="heroLocation"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">{t('hero.allCities')}</option>
              <option value="Veraval">Veraval (વેરાવળ)</option>
              <option value="Una">Una (ઉના)</option>
              <option value="Junagadh">Junagadh (જુનાગઢ)</option>
            </select>
            <div className="divider"></div>
            <select
              id="heroType"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">{t('hero.allTypes')}</option>
              <option value="house">🏠 {t('common.house')}</option>
              <option value="plot">📐 {t('common.plot')}</option>
            </select>
            <button type="submit" className="btn-search btn-shimmer">{t('hero.search')}</button>
          </form>
          <div className="action-btns">
            <button className="action-btn buy btn-shimmer" onClick={() => window.location.hash = '#browse'}>
              {t('hero.wantToBuy')}
            </button>
            {currentUser && (
              <button className="action-btn sell btn-shimmer" onClick={() => window.location.hash = '#sell'}>
                {t('hero.wantToSell')}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="recent" id="recentSection">
        <div className="section-header">
          <h2>{t('recent.title')}</h2>
          <p>{t('recent.subtitle')}</p>
        </div>
        <div className="listings-grid" id="recentGrid" ref={parent}>
          {recentListings.map((listing) => (
            <PropertyCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="map-section" style={{ padding: '0 5% 4rem', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
        <div className="section-header">
          <h2>🗺️ {t('map.sectionTitle', 'Explore Map Locations')}</h2>
          <p>{t('map.sectionSubtitle', 'Hover over any pin to view house and plot details instantly')}</p>
        </div>
        <PropertyMap
          listings={listings}
          userLocation={userLocation}
          onRequestLocation={onRequestLocation}
          height="520px"
        />
      </section>
    </main>
  );
}
