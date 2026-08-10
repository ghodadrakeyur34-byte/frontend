import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { PlusCircle, Home, Building2, Trash2, Inbox, AlertTriangle } from 'lucide-react';
import { formatPrice, timeAgo } from '../utils';
import PropertyCard from './PropertyCard';

export default function MyListingsView({ listings, currentUser, onDeleteListing }) {
  const { t } = useTranslation();
  const [deleteTarget, setDeleteTarget] = useState(null); // listing to confirm delete
  const [filterType, setFilterType] = useState('all');

  // Filter listings owned by the current user
  const myListings = listings.filter((l) => l.ownerId === currentUser.phone);

  const houses = myListings.filter((l) => l.type === 'house');
  const plots = myListings.filter((l) => l.type === 'plot');

  const totalValue = myListings.reduce((sum, l) => sum + l.price, 0);

  // Apply type filter
  const displayedListings = filterType === 'all'
    ? myListings
    : myListings.filter((l) => l.type === filterType);

  const handleDeleteClick = (e, listing) => {
    e.stopPropagation();
    setDeleteTarget(listing);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDeleteListing(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  return (
    <main id="page-mylistings" className="page active">
      <section className="mylistings-page">
        <div className="mylistings-header">
          <div>
            <h1>{t('myListings.title')}</h1>
            <Trans i18nKey="myListings.welcomeBack" values={{ name: currentUser.name }}>
              <p className="mylistings-subtitle">
                Welcome back, <strong>{currentUser.name}</strong> — manage your posted properties here.
              </p>
            </Trans>
          </div>
          <button
            className="btn-sell"
            onClick={() => (window.location.hash = '#sell')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <PlusCircle size={16} /> {t('myListings.postNew')}
          </button>
        </div>

        {/* Stats Row */}
        <div className="mylistings-stats">
          <div className="ml-stat">
            <div className="ml-stat-num">{myListings.length}</div>
            <div className="ml-stat-label">{t('myListings.totalListings')}</div>
          </div>
          <div className="ml-stat">
            <div className="ml-stat-num">{houses.length}</div>
            <div className="ml-stat-label">{t('myListings.houses')}</div>
          </div>
          <div className="ml-stat">
            <div className="ml-stat-num">{plots.length}</div>
            <div className="ml-stat-label">{t('myListings.plots')}</div>
          </div>
          <div className="ml-stat">
            <div className="ml-stat-num">{formatPrice(totalValue)}</div>
            <div className="ml-stat-label">{t('myListings.portfolioValue')}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        {myListings.length > 0 && (
          <div className="mylistings-filters">
            <button
              className={`ml-filter-btn ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              {t('myListings.all')} ({myListings.length})
            </button>
            <button
              className={`ml-filter-btn ${filterType === 'house' ? 'active' : ''}`}
              onClick={() => setFilterType('house')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Home size={14} /> {t('myListings.houses')} ({houses.length})
            </button>
            <button
              className={`ml-filter-btn ${filterType === 'plot' ? 'active' : ''}`}
              onClick={() => setFilterType('plot')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Building2 size={14} /> {t('myListings.plots')} ({plots.length})
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {displayedListings.length > 0 ? (
          <div className="mylistings-grid">
            {displayedListings.map((listing) => (
              <div key={listing.id} className="ml-card-wrapper">
                <PropertyCard listing={listing} />
                <button
                  className="ml-delete-btn"
                  onClick={(e) => handleDeleteClick(e, listing)}
                  title="Delete this listing"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Trash2 size={14} /> {t('myListings.delete')}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="icon" style={{ display: 'flex', justifyContent: 'center' }}>
              <Inbox size={48} color="var(--text3)" />
            </div>
            {myListings.length === 0 ? (
              <>
                <p>{t('myListings.noListings')}</p>
                <button
                  className="btn-submit"
                  style={{ maxWidth: '260px', margin: '1.5rem auto 0', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => (window.location.hash = '#sell')}
                >
                  <PlusCircle size={18} /> {t('myListings.postFirst')}
                </button>
              </>
            ) : (
              <p>{filterType === 'house' ? t('myListings.noHouses') : t('myListings.noPlots')}</p>
            )}
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      <div className={`modal-overlay ${deleteTarget ? 'show' : ''}`}>
        <div className="modal">
          <div className="checkmark" style={{ background: 'rgba(248,113,113,0.15)', borderColor: '#f87171', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Trash2 size={32} color="#f87171" />
          </div>
          <h2>{t('myListings.deleteTitle')}</h2>
          <Trans i18nKey="myListings.deleteConfirm" values={{ title: deleteTarget?.title }}>
            <p>
              Are you sure you want to remove <strong>"{deleteTarget?.title}"</strong>?
              This action cannot be undone.
            </p>
          </Trans>
          <div className="modal-actions">
            <button className="btn-submit btn-danger" onClick={confirmDelete} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Trash2 size={16} /> {t('myListings.yesDelete')}
            </button>
            <button className="btn-submit btn-cancel-modal" onClick={cancelDelete}>
              {t('detail.cancel')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
