import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropertyCard from './PropertyCard';
import PropertyMap from './PropertyMap';

export default function BrowseView({ listings, initialFilters, clearInitialFilters, userLocation, onRequestLocation }) {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState('');
  const [filterMin, setFilterMin] = useState('');
  const [filterMax, setFilterMax] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // Sync state with parent-provided filters (e.g. from Hero search)
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.type !== undefined) setFilterType(initialFilters.type);
      if (initialFilters.area !== undefined) setFilterArea(initialFilters.area);
      // Once applied, clear them from the parent state so they don't lock the inputs
      clearInitialFilters();
    }
  }, [initialFilters, clearInitialFilters]);

  const handleClearAll = () => {
    setFilterType('');
    setFilterMin('');
    setFilterMax('');
    setFilterArea('');
    setSortBy('newest');
  };

  // Perform filtering and sorting
  const minPrice = parseFloat(filterMin) || 0;
  const maxPrice = parseFloat(filterMax) || Infinity;
  const areaQuery = filterArea.toLowerCase().trim();

  let filteredListings = listings.filter((l) => {
    const matchesType = !filterType || l.type === filterType;
    const matchesMinPrice = l.price >= minPrice;
    const matchesMaxPrice = l.price <= maxPrice;
    const matchesArea = !areaQuery || 
      l.area.toLowerCase().includes(areaQuery) || 
      l.city.toLowerCase().includes(areaQuery);

    return matchesType && matchesMinPrice && matchesMaxPrice && matchesArea;
  });

  // Sorting logic
  filteredListings.sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    } else {
      // default: newest first
      return new Date(b.date) - new Date(a.date);
    }
  });

  return (
    <main id="page-browse" className="page active">
      <section className="browse-page">
        <div className="browse-header">
          <div>
            <h1>{t('browse.title')}</h1>
            <div className="results-count" id="resultsCount">
              {t('browse.propertyFound', { count: filteredListings.length })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="view-mode-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                📱 Grid
              </button>
              <button
                className={`view-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                🗺️ Map
              </button>
            </div>

            <select
              className="sort-select"
              id="sortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">{t('browse.newestFirst')}</option>
              <option value="price-low">{t('browse.priceLowHigh')}</option>
              <option value="price-high">{t('browse.priceHighLow')}</option>
            </select>
          </div>
        </div>

        <div className="browse-layout">
          <aside className="filter-panel">
            <h3>{t('browse.filters')}</h3>
            <div className="filter-group">
              <label htmlFor="filterType">{t('browse.propertyType')}</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">{t('hero.allTypes')}</option>
                <option value="house">🏠 {t('common.house')}</option>
                <option value="plot">📐 {t('common.plot')}</option>
              </select>
            </div>
            <div className="filter-group">
              <label>{t('browse.priceRange')}</label>
              <div className="price-range">
                <input
                  type="number"
                  id="filterMin"
                  placeholder={t('browse.min')}
                  value={filterMin}
                  onChange={(e) => setFilterMin(e.target.value)}
                />
                <input
                  type="number"
                  id="filterMax"
                  placeholder={t('browse.max')}
                  value={filterMax}
                  onChange={(e) => setFilterMax(e.target.value)}
                />
              </div>
            </div>
            <div className="filter-group">
              <label htmlFor="filterArea">{t('browse.city')}</label>
              <select
                id="filterArea"
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
              >
                <option value="">{t('browse.allCities')}</option>
                <option value="Veraval">Veraval(વેરાવળ)</option>
                <option value="Una">Una(ઉના)</option>
                <option value="Junagadh">Junagadh(જુનાગઢ)</option>
              </select>
            </div>
            <button className="btn-clear" onClick={handleClearAll}>{t('browse.clearAll')}</button>
          </aside>

          <div style={{ flex: 1, width: '100%' }}>
            {viewMode === 'map' ? (
              <div style={{ width: '100%', height: '580px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <PropertyMap
                  listings={filteredListings}
                  userLocation={userLocation}
                  onRequestLocation={onRequestLocation}
                  height="100%"
                />
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="results-grid" id="resultsGrid">
                {filteredListings.map((listing) => (
                  <PropertyCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="empty-state" id="emptyState">
                <div className="icon">🏚️</div>
                <p>{t('browse.noResults')}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
