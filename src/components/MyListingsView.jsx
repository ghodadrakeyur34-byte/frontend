import React, { useState, useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
  PlusCircle,
  Home,
  Building2,
  Trash2,
  Inbox,
  AlertTriangle,
  Pencil,
  Phone,
  PhoneCall,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  Loader2,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { formatPrice, timeAgo, isListingOwner, apiFetch } from '../utils';
import PropertyCard from './PropertyCard';

export default function MyListingsView({ listings, currentUser, onDeleteListing, onEditListing }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('listings'); // 'listings' | 'leads'
  const [deleteTarget, setDeleteTarget] = useState(null); // listing to confirm delete
  const [filterType, setFilterType] = useState('all');

  // Leads Inbox state
  const [leads, setLeads] = useState([]);
  const [leadsStats, setLeadsStats] = useState({ total: 0, pending: 0, contacted: 0, dismissed: 0 });
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [leadsFilter, setLeadsFilter] = useState('all'); // 'all' | 'pending' | 'contacted' | 'dismissed'
  const [updatingLeadId, setUpdatingLeadId] = useState(null);

  const fetchLeads = async () => {
    if (!currentUser) return;
    setLoadingLeads(true);
    try {
      const res = await apiFetch('/api/seller/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        if (data.stats) {
          setLeadsStats(data.stats);
        }
      }
    } catch (err) {
      console.warn('Failed to load seller leads:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [currentUser]);

  const handleUpdateLeadStatus = async (leadId, newStatus) => {
    setUpdatingLeadId(leadId);
    try {
      const res = await apiFetch(`/api/seller/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        setLeadsStats((prev) => {
          const oldLead = leads.find((l) => l.id === leadId);
          const oldStatus = oldLead?.status || 'pending';
          return {
            ...prev,
            [oldStatus]: Math.max(0, (prev[oldStatus] || 1) - 1),
            [newStatus]: (prev[newStatus] || 0) + 1,
          };
        });
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
    } finally {
      setUpdatingLeadId(null);
    }
  };

  // Filter listings owned by the current user (includes both approved and pending listings)
  const myListings = listings.filter((l) => isListingOwner(l, currentUser));

  const houses = myListings.filter((l) => l.type === 'house');
  const plots = myListings.filter((l) => l.type === 'plot');
  const pendingListings = myListings.filter((l) => l.status === 'pending');
  const approvedListings = myListings.filter((l) => (l.status || 'active') === 'active' || l.status === 'sold');

  const totalValue = myListings.reduce((sum, l) => sum + l.price, 0);

  // Apply type/status filter
  const displayedListings = filterType === 'all'
    ? myListings
    : filterType === 'pending'
    ? pendingListings
    : filterType === 'active'
    ? approvedListings
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

        {/* Navigation Tabs: My Properties vs Leads Inbox */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('listings')}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'listings' ? 'var(--accent, #e2b857)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'listings' ? '#0f172a' : 'var(--text2, #94a3b8)',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <Home size={16} /> {t('myListings.myProperties', 'My Properties')} ({myListings.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('leads');
              fetchLeads();
            }}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'leads' ? 'var(--accent, #e2b857)' : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === 'leads' ? '#0f172a' : 'var(--text2, #94a3b8)',
              fontWeight: 700,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <PhoneCall size={16} /> {t('myListings.inquiriesAndLeads', 'Buyer Inquiries & Leads')}
            {leadsStats.pending > 0 ? (
              <span
                style={{
                  background: activeTab === 'leads' ? '#0f172a' : '#eab308',
                  color: activeTab === 'leads' ? '#ffffff' : '#0f172a',
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 800,
                }}
              >
                {leadsStats.pending} new
              </span>
            ) : (
              <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>({leads.length})</span>
            )}
          </button>
        </div>

        {activeTab === 'listings' ? (
          <>
            {/* Stats Row */}
            <div className="mylistings-stats">
              <div className="ml-stat">
                <div className="ml-stat-num">{myListings.length}</div>
                <div className="ml-stat-label">{t('myListings.totalListings')}</div>
              </div>
              <div className="ml-stat">
                <div className="ml-stat-num" style={{ color: '#10b981' }}>{approvedListings.length}</div>
                <div className="ml-stat-label">{t('myListings.approvedLive')}</div>
              </div>
              <div className="ml-stat">
                <div className="ml-stat-num" style={{ color: pendingListings.length > 0 ? '#eab308' : 'inherit' }}>
                  {pendingListings.length}
                </div>
                <div className="ml-stat-label">{t('myListings.pendingApproval')}</div>
              </div>
              <div className="ml-stat">
                <div className="ml-stat-num">{formatPrice(totalValue)}</div>
                <div className="ml-stat-label">{t('myListings.portfolioValue')}</div>
              </div>
            </div>

            {/* Pending Approval Notice Banner */}
            {pendingListings.length > 0 && (
              <div
                className="mylistings-pending-banner"
                style={{
                  background: 'rgba(234, 179, 8, 0.12)',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  borderRadius: 'var(--r-md, 12px)',
                  padding: '1rem 1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>⏳</span>
                <div>
                  <strong style={{ display: 'block', color: '#facc15', fontSize: '0.95rem', marginBottom: '2px' }}>
                    {t('myListings.pendingBannerTitle')} ({pendingListings.length})
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text2, #cbd5e1)' }}>
                    {t('myListings.pendingBannerText')}
                  </span>
                </div>
              </div>
            )}

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
                {pendingListings.length > 0 && (
                  <button
                    className={`ml-filter-btn ${filterType === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilterType('pending')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: filterType === 'pending' ? '#0f172a' : '#eab308',
                      borderColor: filterType === 'pending' ? '#eab308' : undefined,
                      background: filterType === 'pending' ? '#eab308' : undefined,
                    }}
                  >
                    ⏳ {t('myListings.pendingApproval')} ({pendingListings.length})
                  </button>
                )}
                {approvedListings.length > 0 && pendingListings.length > 0 && (
                  <button
                    className={`ml-filter-btn ${filterType === 'active' ? 'active' : ''}`}
                    onClick={() => setFilterType('active')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: filterType === 'active' ? '#0f172a' : '#10b981',
                      borderColor: filterType === 'active' ? '#10b981' : undefined,
                      background: filterType === 'active' ? '#10b981' : undefined,
                    }}
                  >
                    ✓ {t('myListings.approvedLive')} ({approvedListings.length})
                  </button>
                )}
              </div>
            )}

            {/* Listings Grid */}
            {displayedListings.length > 0 ? (
              <div className="mylistings-grid">
                {displayedListings.map((listing) => (
                  <div key={listing.id} className="ml-card-wrapper">
                    <PropertyCard listing={listing} />
                    <div className="ml-card-actions">
                      <button
                        className="ml-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditListing?.(listing);
                        }}
                        title={t('myListings.edit', 'Edit Property Details')}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <Pencil size={13} /> {t('myListings.edit', 'Edit')}
                      </button>
                      <button
                        className="ml-delete-btn"
                        onClick={(e) => handleDeleteClick(e, listing)}
                        title={t('myListings.delete', 'Delete this listing')}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                      >
                        <Trash2 size={13} /> {t('myListings.delete', 'Delete')}
                      </button>
                    </div>
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
                  <p>
                    {filterType === 'house'
                      ? t('myListings.noHouses')
                      : filterType === 'plot'
                      ? t('myListings.noPlots')
                      : filterType === 'pending'
                      ? t('myListings.noPending')
                      : filterType === 'active'
                      ? t('myListings.noApproved')
                      : t('myListings.noListings')}
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          /* ======================================================== */
          /* ===== SELLER LEADS INBOX (BUYER CALLBACK REQUESTS) ===== */
          /* ======================================================== */
          <div className="seller-leads-section">
            {/* Leads Stats Cards */}
            <div className="mylistings-stats" style={{ marginBottom: '1.5rem' }}>
              <div className="ml-stat">
                <div className="ml-stat-num">{leadsStats.total}</div>
                <div className="ml-stat-label">Total Leads Received</div>
              </div>
              <div className="ml-stat">
                <div className="ml-stat-num" style={{ color: '#eab308' }}>{leadsStats.pending}</div>
                <div className="ml-stat-label">Pending Callbacks</div>
              </div>
              <div className="ml-stat">
                <div className="ml-stat-num" style={{ color: '#10b981' }}>{leadsStats.contacted}</div>
                <div className="ml-stat-label">Contacted Buyers</div>
              </div>
              <div className="ml-stat">
                <div className="ml-stat-num" style={{ color: '#94a3b8' }}>{leadsStats.dismissed}</div>
                <div className="ml-stat-label">Dismissed</div>
              </div>
            </div>

            {/* Filter Chips & Refresh Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '1.25rem' }}>
              <div className="mylistings-filters" style={{ margin: 0 }}>
                <button
                  className={`ml-filter-btn ${leadsFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setLeadsFilter('all')}
                >
                  All ({leads.length})
                </button>
                <button
                  className={`ml-filter-btn ${leadsFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setLeadsFilter('pending')}
                  style={{
                    color: leadsFilter === 'pending' ? '#0f172a' : '#eab308',
                    borderColor: leadsFilter === 'pending' ? '#eab308' : undefined,
                    background: leadsFilter === 'pending' ? '#eab308' : undefined,
                  }}
                >
                  ⏳ Pending ({leads.filter((l) => l.status === 'pending').length})
                </button>
                <button
                  className={`ml-filter-btn ${leadsFilter === 'contacted' ? 'active' : ''}`}
                  onClick={() => setLeadsFilter('contacted')}
                  style={{
                    color: leadsFilter === 'contacted' ? '#0f172a' : '#10b981',
                    borderColor: leadsFilter === 'contacted' ? '#10b981' : undefined,
                    background: leadsFilter === 'contacted' ? '#10b981' : undefined,
                  }}
                >
                  ✓ Contacted ({leads.filter((l) => l.status === 'contacted').length})
                </button>
                <button
                  className={`ml-filter-btn ${leadsFilter === 'dismissed' ? 'active' : ''}`}
                  onClick={() => setLeadsFilter('dismissed')}
                >
                  Dismissed ({leads.filter((l) => l.status === 'dismissed').length})
                </button>
              </div>

              <button
                onClick={fetchLeads}
                disabled={loadingLeads}
                style={{
                  background: 'var(--surface2, #0f172a)',
                  border: '1px solid var(--border)',
                  color: 'var(--text2)',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: loadingLeads ? 'wait' : 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                }}
              >
                <RefreshCw size={13} className={loadingLeads ? 'spin' : ''} />
                Refresh Leads
              </button>
            </div>

            {/* Leads List */}
            {loadingLeads ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text3)' }}>
                <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px' }} />
                <p>Loading your buyer inquiries...</p>
              </div>
            ) : leads.filter((l) => leadsFilter === 'all' || l.status === leadsFilter).length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {leads
                  .filter((l) => leadsFilter === 'all' || l.status === leadsFilter)
                  .map((lead) => {
                    const isPending = lead.status === 'pending';
                    const isContacted = lead.status === 'contacted';
                    const isDismissed = lead.status === 'dismissed';
                    const isUpdating = updatingLeadId === lead.id;

                    return (
                      <div
                        key={lead.id}
                        style={{
                          background: 'var(--surface, #1e293b)',
                          border: `1px solid ${isPending ? 'rgba(234, 179, 8, 0.35)' : 'var(--border, #334155)'}`,
                          borderRadius: 'var(--r-md, 12px)',
                          padding: '1.25rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          boxShadow: isPending ? '0 4px 15px rgba(234, 179, 8, 0.08)' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {/* Header: Title & Status Badge */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          <div>
                            <a
                              href={`#detail/${lead.listing_id}`}
                              style={{
                                color: 'var(--text, #f8fafc)',
                                fontWeight: 700,
                                fontSize: '0.98rem',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              {lead.listing_title || 'Property Listing'} <ExternalLink size={13} color="var(--accent)" />
                            </a>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text3, #64748b)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> Received {timeAgo(lead.created_at)}
                            </div>
                          </div>

                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '999px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              background: isPending
                                ? 'rgba(234, 179, 8, 0.15)'
                                : isContacted
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(148, 163, 184, 0.12)',
                              color: isPending
                                ? '#facc15'
                                : isContacted
                                ? '#34d399'
                                : '#94a3b8',
                              border: `1px solid ${
                                isPending
                                  ? 'rgba(234, 179, 8, 0.4)'
                                  : isContacted
                                  ? 'rgba(16, 185, 129, 0.4)'
                                  : 'rgba(148, 163, 184, 0.3)'
                              }`,
                            }}
                          >
                            {lead.status}
                          </span>
                        </div>

                        {/* Buyer Details Box */}
                        <div
                          style={{
                            background: 'var(--surface2, #0f172a)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '10px 12px',
                          }}
                        >
                          <div style={{ fontSize: '0.78rem', color: 'var(--text3, #94a3b8)', marginBottom: '2px' }}>
                            Interested Buyer
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text, #f8fafc)', marginBottom: '6px' }}>
                            {lead.buyer_name || 'Verified Buyer'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent, #e2b857)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.5px' }}>
                            <Phone size={15} /> {lead.buyer_phone}
                          </div>
                        </div>

                        {/* Direct Call & WhatsApp Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <a
                            href={`tel:${lead.buyer_phone}`}
                            style={{
                              background: 'var(--accent, #e2b857)',
                              color: '#0f172a',
                              textDecoration: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <Phone size={14} /> Call Buyer
                          </a>

                          <a
                            href={`https://wa.me/${String(lead.buyer_phone).replace(/\D/g, '')}?text=${encodeURIComponent(
                              `Hello ${lead.buyer_name || ''}, I am reaching out regarding your callback request for my property "${lead.listing_title || ''}" on Mari Milkat.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#25D366',
                              color: '#ffffff',
                              textDecoration: 'none',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <MessageCircle size={14} /> WhatsApp
                          </a>
                        </div>

                        {/* Status Change Buttons */}
                        <div style={{ display: 'flex', gap: '8px', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
                          {!isContacted && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateLeadStatus(lead.id, 'contacted')}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid rgba(16, 185, 129, 0.4)',
                                background: 'rgba(16, 185, 129, 0.12)',
                                color: '#34d399',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '5px',
                              }}
                            >
                              <CheckCircle2 size={13} /> Mark Contacted
                            </button>
                          )}

                          {isContacted && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateLeadStatus(lead.id, 'pending')}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--text2)',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Reset to Pending
                            </button>
                          )}

                          {!isDismissed ? (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateLeadStatus(lead.id, 'dismissed')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--text3)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                              }}
                            >
                              Dismiss
                            </button>
                          ) : (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleUpdateLeadStatus(lead.id, 'pending')}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--accent)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                              }}
                            >
                              Reopen Lead
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <PhoneCall size={48} color="var(--text3)" />
                </div>
                <h3 style={{ margin: '0.5rem 0 0.25rem 0', color: 'var(--text)' }}>No Inquiries Found</h3>
                <p style={{ maxWidth: '440px', margin: '0 auto', fontSize: '0.88rem', color: 'var(--text3)' }}>
                  {leadsFilter !== 'all'
                    ? `No leads found with status "${leadsFilter}".`
                    : 'When interested buyers request a callback on your properties, their verified mobile numbers will appear here instantly.'}
                </p>
              </div>
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
