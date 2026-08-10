import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { animate, stagger } from 'animejs';
import { Search, Building2, PlusCircle, MapPin, Home } from 'lucide-react';
import PropertyCard from './PropertyCard';
import PropertyMap from './PropertyMap';

export default function HomeView({ listings, onSearch, userLocation, onRequestLocation, currentUser }) {
  const { t } = useTranslation();
  const [parent] = useAutoAnimate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    // Anime.js v4 staggered entrance animation for Hero elements
    animate('.hero-content > *', {
      translateY: [35, 0],
      opacity: [0, 1],
      ease: 'outExpo',
      duration: 1100,
      delay: stagger(160),
    });

    // Anime.js v4 animation for section headers
    animate('.section-header', {
      translateY: [25, 0],
      opacity: [0, 1],
      ease: 'outCubic',
      duration: 900,
      delay: 200,
    });

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

    return () => {
      observer.disconnect();
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
              <option value="house">{t('common.house')}</option>
              <option value="plot">{t('common.plot')}</option>
            </select>
            <button type="submit" className="btn-search btn-shimmer" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Search size={18} /> {t('hero.search')}
            </button>
          </form>
          <div className="action-btns">
            <button className="action-btn buy btn-shimmer" onClick={() => window.location.hash = '#browse'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Search size={18} /> {t('hero.wantToBuy')}
            </button>
            {currentUser && (
              <button className="action-btn sell btn-shimmer" onClick={() => window.location.hash = '#sell'} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <PlusCircle size={18} /> {t('hero.wantToSell')}
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
          <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <MapPin color="var(--accent)" size={28} /> {t('map.sectionTitle', 'Explore Map Locations')}
          </h2>
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
