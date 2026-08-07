import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils';

const ADMIN_KEY = 'marimilkat_admin';

function getStoredAdmin() {
  try {
    const stored = localStorage.getItem(ADMIN_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// ===== ADMIN LOGIN GATE =====
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">🛡️</div>
        <h1>Admin Panel</h1>
        <p className="admin-login-sub">MariMilkat Administration</p>
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="admin-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marimilkatadmin@gmail.com" required />
          </div>
          <div className="admin-field">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="admin-login-btn" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ===== DASHBOARD =====
function Dashboard({ token, onUnauthorized }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiFetch('/api/admin/stats', { headers: { 'x-admin-token': token } })
      .then(async r => {
        if (r.status === 401) {
          if (onUnauthorized) onUnauthorized();
          return;
        }
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Failed to load stats');
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token, onUnauthorized]);

  if (loading) return <div className="admin-loading">Loading dashboard…</div>;
  if (error || !stats) return <div className="admin-loading">{error || 'Failed to load stats.'}</div>;

  const statCards = [
    { label: 'Total Listings', value: stats.totalListings || 0, icon: '🏘️', color: '#38bdf8' },
    { label: 'Active Listings', value: stats.activeListings || 0, icon: '✅', color: '#34d399' },
    { label: 'Pending Approval', value: stats.pendingListings || 0, icon: '⏳', color: '#0ea5e9' },
    { label: "Today's New", value: stats.todayNewListings || 0, icon: '🆕', color: '#818cf8' },
    { label: 'Total Users', value: stats.totalUsers || 0, icon: '👥', color: '#06b6d4' },
    { label: 'Active Users', value: stats.activeUsers || 0, icon: '🟢', color: '#22c55e' },
    { label: 'Banned Users', value: stats.bannedUsers || 0, icon: '🚫', color: '#f87171' },
    { label: 'Open Reports', value: stats.pendingReports || 0, icon: '🚩', color: '#fb923c' },
  ];

  const typeEntries = Object.entries(stats.listingsByType || {});
  const cityEntries = Object.entries(stats.listingsByCity || {});
  const maxCity = Math.max(...cityEntries.map(([, v]) => v), 1);

  return (
    <div className="admin-dashboard">
      <h2 className="admin-page-title">Dashboard Overview</h2>
      <div className="admin-stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="admin-stat-card" style={{ '--card-accent': s.color }}>
            <div className="admin-stat-icon">{s.icon}</div>
            <div className="admin-stat-info">
              <div className="admin-stat-value">{s.value}</div>
              <div className="admin-stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-charts-row">
        <div className="admin-chart-card">
          <h3>Listings by Type</h3>
          <div className="admin-donut-legend">
            {typeEntries.length === 0 ? (
              <p className="admin-muted">No data available</p>
            ) : (
              typeEntries.map(([type, count]) => (
                <div key={type} className="admin-legend-item">
                  <span className="admin-legend-dot" style={{ background: type === 'house' ? '#38bdf8' : type === 'plot' ? '#34d399' : type === 'apartment' ? '#818cf8' : type === 'commercial' ? '#0ea5e9' : '#06b6d4' }}></span>
                  <span className="admin-legend-label">{type}</span>
                  <span className="admin-legend-count">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="admin-chart-card">
          <h3>Listings by City</h3>
          <div className="admin-bar-chart">
            {cityEntries.length === 0 ? (
              <p className="admin-muted">No data available</p>
            ) : (
              cityEntries.map(([city, count]) => (
                <div key={city} className="admin-bar-row">
                  <span className="admin-bar-label">{city}</span>
                  <div className="admin-bar-track">
                    <div className="admin-bar-fill" style={{ width: `${(count / maxCity) * 100}%` }}></div>
                  </div>
                  <span className="admin-bar-value">{count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== LISTINGS MODERATION =====
function Listings({ token, onUnauthorized }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    type: 'house', title: '', desc: '', price: '', size: '', unit: 'sqft',
    area: '', city: '', contactName: '', contactPhone: '', status: 'active'
  });
  const [addImages, setAddImages] = useState([]);
  const [addErrors, setAddErrors] = useState({});
  const [addSaving, setAddSaving] = useState(false);
  const addFileRef = React.useRef(null);

  const fetchListings = useCallback(() => {
    const params = new URLSearchParams();
    if (tab !== 'all') params.set('status', tab);
    if (search) params.set('search', search);

    apiFetch(`/api/admin/listings?${params}`, { headers: { 'x-admin-token': token } })
      .then(async r => {
        if (r.status === 401 && onUnauthorized) return onUnauthorized();
        const d = await r.json();
        setListings(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, tab, search, onUnauthorized]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const updateStatus = async (id, status) => {
    await apiFetch(`/api/admin/listings/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ status }),
    });
    fetchListings();
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Permanently delete this listing?')) return;
    await apiFetch(`/api/admin/listings/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token },
    });
    fetchListings();
  };

  const openEdit = (listing) => {
    setEditForm({ title: listing.title, desc: listing.desc, price: listing.price, type: listing.type, area: listing.area, city: listing.city });
    setEditModal(listing);
  };

  const saveEdit = async () => {
    await apiFetch(`/api/admin/listings/${editModal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(editForm),
    });
    setEditModal(null);
    fetchListings();
  };

  // ---- Add Listing Logic ----
  const resetAddForm = () => {
    setAddForm({
      type: 'house', title: '', desc: '', price: '', size: '', unit: 'sqft',
      area: '', city: '', contactName: '', contactPhone: '', status: 'active'
    });
    setAddImages([]);
    setAddErrors({});
  };

  const openAddModal = () => {
    resetAddForm();
    setAddModal(true);
  };

  const handleAddImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (addImages.length >= 5 || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 600;
          let w = img.width, h = img.height;
          if (w > MAX) { h = (h * MAX) / w; w = MAX; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setAddImages(prev => prev.length >= 5 ? prev : [...prev, dataUrl]);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
  };

  const removeAddImage = (idx) => {
    setAddImages(prev => prev.filter((_, i) => i !== idx));
  };

  const validateAddForm = () => {
    const errs = {};
    if (!addForm.title.trim()) errs.title = true;
    if (!addForm.price || Number(addForm.price) <= 0) errs.price = true;
    if (!addForm.area.trim()) errs.area = true;
    if (!addForm.city.trim()) errs.city = true;
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSubmit = async () => {
    if (!validateAddForm()) return;
    setAddSaving(true);
    try {
      const res = await apiFetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({
          type: addForm.type,
          title: addForm.title,
          desc: addForm.desc,
          price: Number(addForm.price),
          size: Number(addForm.size) || 0,
          unit: addForm.unit,
          area: addForm.area,
          city: addForm.city,
          images: addImages,
          contact: { name: addForm.contactName || 'Admin', phone: addForm.contactPhone || '' },
          status: addForm.status,
        }),
      });
      if (res.ok) {
        setAddModal(false);
        resetAddForm();
        fetchListings();
      }
    } catch (err) {
      console.error('Error adding listing:', err);
    } finally {
      setAddSaving(false);
    }
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'active', label: 'Active' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'sold', label: 'Sold' },
  ];

  const formatPrice = (n) => {
    if (n >= 10000000) return '₨ ' + (n / 10000000).toFixed(2) + ' Cr';
    if (n >= 100000) return '₨ ' + (n / 100000).toFixed(2) + ' Lac';
    return '₨ ' + n.toLocaleString();
  };

  return (
    <div className="admin-listings">
      <div className="admin-page-title-row">
        <h2 className="admin-page-title">Listing Moderation</h2>
        <button className="admin-btn primary" onClick={openAddModal}>
          ➕ Add New Listing
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="admin-tabs">
          {tabs.map(t => (
            <button key={t.key} className={`admin-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="admin-search"
          placeholder="Search listings…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="admin-loading">Loading listings…</div>
      ) : listings.length === 0 ? (
        <div className="admin-empty">No listings found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Price</th>
                <th>City</th>
                <th>Owner</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map(l => (
                <tr key={l.id}>
                  <td>
                    <div className="admin-listing-cell">
                      <div className="admin-listing-thumb">
                        {l.images?.[0] ? <img src={l.images[0]} alt="" /> : <span>🏠</span>}
                      </div>
                      <div>
                        <div className="admin-listing-title">{l.title}</div>
                        <div className="admin-listing-area">{l.area}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="admin-type-badge">{l.type}</span></td>
                  <td className="admin-price">{formatPrice(l.price)}</td>
                  <td>{l.city}</td>
                  <td>{l.contact?.name || '—'}</td>
                  <td>{l.date}</td>
                  <td><span className={`admin-status-badge status-${l.status || 'active'}`}>{l.status || 'active'}</span></td>
                  <td>
                    <div className="admin-actions">
                      {(l.status === 'pending') && (
                        <>
                          <button className="admin-act-btn approve" title="Approve" onClick={() => updateStatus(l.id, 'active')}>✓</button>
                          <button className="admin-act-btn reject" title="Reject" onClick={() => updateStatus(l.id, 'rejected')}>✗</button>
                        </>
                      )}
                      {(l.status === 'active') && (
                        <button className="admin-act-btn sold" title="Mark Sold" onClick={() => updateStatus(l.id, 'sold')}>💰</button>
                      )}
                      <button className="admin-act-btn edit" title="Edit" onClick={() => openEdit(l)}>✏️</button>
                      <button className="admin-act-btn delete" title="Delete" onClick={() => deleteListing(l.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="admin-modal-overlay" onClick={() => setEditModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Listing</h3>
              <button className="admin-modal-close" onClick={() => setEditModal(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-field">
                <label>Title</label>
                <input value={editForm.title || ''} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Description</label>
                <textarea rows={3} value={editForm.desc || ''} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} />
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Price (₨)</label>
                  <input type="number" value={editForm.price || ''} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} />
                </div>
                <div className="admin-field">
                  <label>Type</label>
                  <select value={editForm.type || ''} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                    <option value="house">House</option>
                    <option value="plot">Plot</option>
                    <option value="apartment">Apartment</option>
                    <option value="commercial">Commercial</option>
                    <option value="farmhouse">Farm House</option>
                  </select>
                </div>
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Area</label>
                  <input value={editForm.area || ''} onChange={e => setEditForm({ ...editForm, area: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>City</label>
                  <input value={editForm.city || ''} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn secondary" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="admin-btn primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Listing Modal */}
      {addModal && (
        <div className="admin-modal-overlay" onClick={() => setAddModal(false)}>
          <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>➕ Add New Listing</h3>
              <button className="admin-modal-close" onClick={() => setAddModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              {/* Property Type */}
              <div className="admin-field">
                <label>Property Type</label>
                <div className="admin-type-toggle">
                  {[
                    { val: 'house', label: '🏠 House' },
                    { val: 'plot', label: '📐 Plot' },
                    { val: 'apartment', label: '🏢 Apartment' },
                    { val: 'commercial', label: '🏪 Commercial' },
                    { val: 'farmhouse', label: '🌾 Farm House' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      className={`admin-type-toggle-btn ${addForm.type === opt.val ? 'active' : ''}`}
                      onClick={() => setAddForm({ ...addForm, type: opt.val })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className={`admin-field ${addErrors.title ? 'has-error' : ''}`}>
                <label>Title *</label>
                <input
                  placeholder="e.g. 3BHK Villa in Prime Location"
                  value={addForm.title}
                  onChange={e => setAddForm({ ...addForm, title: e.target.value })}
                />
                {addErrors.title && <span className="admin-field-error">Title is required</span>}
              </div>

              {/* Description */}
              <div className="admin-field">
                <label>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the property…"
                  value={addForm.desc}
                  onChange={e => setAddForm({ ...addForm, desc: e.target.value })}
                />
              </div>

              {/* Price & Size */}
              <div className="admin-field-row">
                <div className={`admin-field ${addErrors.price ? 'has-error' : ''}`}>
                  <label>Price (₨) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000000"
                    value={addForm.price}
                    onChange={e => setAddForm({ ...addForm, price: e.target.value })}
                    min="1"
                  />
                  {addErrors.price && <span className="admin-field-error">Valid price is required</span>}
                </div>
                <div className="admin-field">
                  <label>Size</label>
                  <div className="admin-field-inline">
                    <input
                      type="number"
                      placeholder="e.g. 1200"
                      value={addForm.size}
                      onChange={e => setAddForm({ ...addForm, size: e.target.value })}
                      min="0"
                    />
                    <select value={addForm.unit} onChange={e => setAddForm({ ...addForm, unit: e.target.value })}>
                      <option value="sqft">sq ft</option>
                      <option value="sqyd">sq yd</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Area & City */}
              <div className="admin-field-row">
                <div className={`admin-field ${addErrors.area ? 'has-error' : ''}`}>
                  <label>Area / Locality *</label>
                  <input
                    placeholder="e.g. Satellite Road"
                    value={addForm.area}
                    onChange={e => setAddForm({ ...addForm, area: e.target.value })}
                  />
                  {addErrors.area && <span className="admin-field-error">Area is required</span>}
                </div>
                <div className={`admin-field ${addErrors.city ? 'has-error' : ''}`}>
                  <label>City *</label>
                  <select value={addForm.city} onChange={e => setAddForm({ ...addForm, city: e.target.value })}>
                    <option value="">Select City</option>
                    <option value="Veraval">Veraval</option>
                    <option value="Una">Una</option>
                    <option value="Junagadh">Junagadh</option>
                  </select>
                  {addErrors.city && <span className="admin-field-error">City is required</span>}
                </div>
              </div>

              {/* Contact */}
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Contact Name</label>
                  <input
                    placeholder="Owner / Agent name"
                    value={addForm.contactName}
                    onChange={e => setAddForm({ ...addForm, contactName: e.target.value })}
                  />
                </div>
                <div className="admin-field">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={addForm.contactPhone}
                    onChange={e => setAddForm({ ...addForm, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="admin-field">
                <label>Status</label>
                <select value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value })}>
                  <option value="active">Active (Live immediately)</option>
                  <option value="pending">Pending (Needs approval)</option>
                </select>
              </div>

              {/* Images */}
              <div className="admin-field">
                <label>Photos (up to 5)</label>
                <div className="admin-upload-area" onClick={() => addFileRef.current?.click()}>
                  <span className="admin-upload-icon">📷</span>
                  <span>Click to upload images</span>
                </div>
                <input
                  ref={addFileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAddImageUpload}
                />
                {addImages.length > 0 && (
                  <div className="admin-image-preview-grid">
                    {addImages.map((src, idx) => (
                      <div key={idx} className="admin-image-preview-item">
                        <img src={src} alt={`Preview ${idx + 1}`} />
                        <button className="admin-image-remove" onClick={() => removeAddImage(idx)}>×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn secondary" onClick={() => setAddModal(false)}>Cancel</button>
              <button className="admin-btn primary" onClick={handleAddSubmit} disabled={addSaving}>
                {addSaving ? 'Creating…' : '✅ Create Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== USER MANAGEMENT =====
function Users({ token, onUnauthorized }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [userListings, setUserListings] = useState([]);

  const fetchUsers = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter) params.set('status', statusFilter);

    fetch(`/api/admin/users?${params}`, { headers: { 'x-admin-token': token } })
      .then(async r => {
        if (r.status === 401 && onUnauthorized) return onUnauthorized();
        const d = await r.json();
        setUsers(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, search, statusFilter, onUnauthorized]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateUserStatus = async (email, status) => {
    const confirmMsg = status === 'banned' ? 'Ban this user?' : status === 'suspended' ? 'Suspend this user?' : 'Activate this user?';
    if (!window.confirm(confirmMsg)) return;

    await fetch(`/api/admin/users/${encodeURIComponent(email)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ status }),
    });
    fetchUsers();
  };

  const toggleVerify = async (email, field, currentValue) => {
    await fetch(`/api/admin/users/${encodeURIComponent(email)}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ verified: { [field]: !currentValue } }),
    });
    fetchUsers();
  };

  const viewUserListings = async (email) => {
    if (expandedUser === email) {
      setExpandedUser(null);
      return;
    }
    const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}`, { headers: { 'x-admin-token': token } });
    const data = await res.json();
    setUserListings(data.listings || []);
    setExpandedUser(email);
  };

  return (
    <div className="admin-users">
      <h2 className="admin-page-title">User Management</h2>

      <div className="admin-toolbar">
        <input
          type="text"
          className="admin-search"
          placeholder="Search users…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="admin-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="admin-empty">No users found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Listings</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <React.Fragment key={u.email}>
                  <tr>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-user-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <button className="admin-link-btn" onClick={() => viewUserListings(u.email)}>
                        {u.listingCount || 0} {expandedUser === u.email ? '▲' : '▼'}
                      </button>
                    </td>
                    <td><span className={`admin-status-badge status-${u.status || 'active'}`}>{u.status || 'active'}</span></td>
                    <td>
                      <div className="admin-verify-badges">
                        <button
                          className={`admin-verify-badge ${u.verified?.phone ? 'verified' : ''}`}
                          title={u.verified?.phone ? 'Phone verified — click to unverify' : 'Click to verify phone'}
                          onClick={() => toggleVerify(u.email, 'phone', u.verified?.phone)}
                        >📱</button>
                        <button
                          className={`admin-verify-badge ${u.verified?.email ? 'verified' : ''}`}
                          title={u.verified?.email ? 'Email verified — click to unverify' : 'Click to verify email'}
                          onClick={() => toggleVerify(u.email, 'email', u.verified?.email)}
                        >✉️</button>
                        <button
                          className={`admin-verify-badge ${u.verified?.id ? 'verified' : ''}`}
                          title={u.verified?.id ? 'ID verified — click to unverify' : 'Click to verify ID'}
                          onClick={() => toggleVerify(u.email, 'id', u.verified?.id)}
                        >🪪</button>
                      </div>
                    </td>
                    <td>
                      <div className="admin-actions">
                        {(u.status || 'active') === 'active' && (
                          <>
                            <button className="admin-act-btn reject" title="Ban" onClick={() => updateUserStatus(u.email, 'banned')}>🚫</button>
                            <button className="admin-act-btn sold" title="Suspend" onClick={() => updateUserStatus(u.email, 'suspended')}>⏸️</button>
                          </>
                        )}
                        {(u.status === 'banned' || u.status === 'suspended') && (
                          <button className="admin-act-btn approve" title="Activate" onClick={() => updateUserStatus(u.email, 'active')}>✓</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedUser === u.email && (
                    <tr className="admin-expanded-row">
                      <td colSpan={8}>
                        <div className="admin-user-listings">
                          <strong>Listings by {u.name}:</strong>
                          {userListings.length === 0 ? (
                            <p className="admin-muted">No listings.</p>
                          ) : (
                            <div className="admin-mini-list">
                              {userListings.map(l => (
                                <div key={l.id} className="admin-mini-listing">
                                  <span className={`admin-status-badge status-${l.status || 'active'}`}>{l.status || 'active'}</span>
                                  <span>{l.title}</span>
                                  <span className="admin-muted">— {l.city}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===== REPORTS =====
function Reports({ token, onUnauthorized }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [resolveModal, setResolveModal] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const fetchReports = useCallback(() => {
    const params = tab !== 'all' ? `?status=${tab}` : '';
    fetch(`/api/admin/reports${params}`, { headers: { 'x-admin-token': token } })
      .then(async r => {
        if (r.status === 401 && onUnauthorized) return onUnauthorized();
        const d = await r.json();
        setReports(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, tab, onUnauthorized]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleResolve = async (status) => {
    await fetch(`/api/admin/reports/${resolveModal.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ status, adminNote }),
    });
    setResolveModal(null);
    setAdminNote('');
    fetchReports();
  };

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'resolved', label: 'Resolved' },
    { key: 'dismissed', label: 'Dismissed' },
  ];

  return (
    <div className="admin-reports">
      <h2 className="admin-page-title">Reports & Flags</h2>

      <div className="admin-toolbar">
        <div className="admin-tabs">
          {tabs.map(t => (
            <button key={t.key} className={`admin-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading reports…</div>
      ) : reports.length === 0 ? (
        <div className="admin-empty">No reports found.</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Target ID</th>
                <th>Reporter</th>
                <th>Reason</th>
                <th>Details</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td><span className={`admin-type-badge type-${r.type}`}>{r.type === 'listing' ? '🏠 Listing' : '👤 User'}</span></td>
                  <td className="admin-mono">{r.targetId}</td>
                  <td>{r.reporterEmail}</td>
                  <td><strong>{r.reason}</strong></td>
                  <td className="admin-truncate">{r.details || '—'}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td><span className={`admin-status-badge status-${r.status}`}>{r.status}</span></td>
                  <td>
                    {r.status === 'pending' ? (
                      <div className="admin-actions">
                        <button className="admin-act-btn approve" title="Resolve" onClick={() => { setResolveModal(r); setAdminNote(''); }}>✓</button>
                        <button className="admin-act-btn reject" title="Dismiss" onClick={() => { setResolveModal(r); setAdminNote(''); }}>✗</button>
                      </div>
                    ) : (
                      <span className="admin-muted">{r.adminNote || '—'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="admin-modal-overlay" onClick={() => setResolveModal(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Handle Report</h3>
              <button className="admin-modal-close" onClick={() => setResolveModal(null)}>×</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-report-detail">
                <p><strong>Type:</strong> {resolveModal.type}</p>
                <p><strong>Target:</strong> {resolveModal.targetId}</p>
                <p><strong>Reason:</strong> {resolveModal.reason}</p>
                <p><strong>Details:</strong> {resolveModal.details || 'None'}</p>
              </div>
              <div className="admin-field">
                <label>Admin Note</label>
                <textarea rows={3} value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="Add a note about the action taken…" />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn secondary" onClick={() => setResolveModal(null)}>Cancel</button>
              <button className="admin-btn reject-btn" onClick={() => handleResolve('dismissed')}>Dismiss</button>
              <button className="admin-btn primary" onClick={() => handleResolve('resolved')}>Resolve</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== CATEGORIES =====
function Categories({ token, onUnauthorized }) {
  const [categories, setCategories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({});

  useEffect(() => {
    fetch('/api/admin/categories', { headers: { 'x-admin-token': token } })
      .then(async r => {
        if (r.status === 401 && onUnauthorized) return onUnauthorized();
        const d = await r.json();
        setCategories(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, onUnauthorized]);

  const save = async () => {
    setSaving(true);
    await fetch('/api/admin/categories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify(categories),
    });
    setSaving(false);
  };

  const addItem = (section) => {
    const val = newItem[section];
    if (!val?.trim()) return;

    const updated = { ...categories };
    if (section === 'propertyTypes') {
      updated.propertyTypes = [...updated.propertyTypes, { id: val.toLowerCase().replace(/\s+/g, '-'), label: val, icon: '🏗️' }];
    } else if (section === 'cities') {
      updated.cities = [...updated.cities, { id: val.toLowerCase().replace(/\s+/g, '-'), label: val, lat: 0, lng: 0 }];
    } else if (section === 'amenities') {
      updated.amenities = [...updated.amenities, { id: val.toLowerCase().replace(/\s+/g, '-'), label: val, icon: '✨' }];
    }
    setCategories(updated);
    setNewItem({ ...newItem, [section]: '' });
  };

  const removeItem = (section, id) => {
    const updated = { ...categories };
    updated[section] = updated[section].filter(item => item.id !== id);
    setCategories(updated);
  };

  if (loading) return <div className="admin-loading">Loading categories…</div>;
  if (!categories) return <div className="admin-loading">Failed to load categories.</div>;

  const sections = [
    { key: 'propertyTypes', title: 'Property Types', icon: '🏠' },
    { key: 'cities', title: 'Cities / Locations', icon: '📍' },
    { key: 'amenities', title: 'Amenities', icon: '✨' },
  ];

  return (
    <div className="admin-categories">
      <div className="admin-page-title-row">
        <h2 className="admin-page-title">Categories & Filters</h2>
        <button className="admin-btn primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save All Changes'}
        </button>
      </div>

      <div className="admin-categories-grid">
        {sections.map(s => (
          <div key={s.key} className="admin-category-card">
            <h3>{s.icon} {s.title}</h3>
            <div className="admin-category-list">
              {categories[s.key]?.map(item => (
                <div key={item.id} className="admin-category-item">
                  <span>{item.icon || ''} {item.label}</span>
                  <button className="admin-remove-btn" onClick={() => removeItem(s.key, item.id)} title="Remove">×</button>
                </div>
              ))}
            </div>
            <div className="admin-add-row">
              <input
                placeholder={`Add ${s.title.toLowerCase()}…`}
                value={newItem[s.key] || ''}
                onChange={e => setNewItem({ ...newItem, [s.key]: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && addItem(s.key)}
              />
              <button className="admin-btn small primary" onClick={() => addItem(s.key)}>+</button>
            </div>
          </div>
        ))}

        {/* Price Ranges — display only for now */}
        <div className="admin-category-card">
          <h3>💰 Price Ranges</h3>
          <div className="admin-category-list">
            {categories.priceRanges?.map(item => (
              <div key={item.id} className="admin-category-item">
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== SITE & HELP DESK SETTINGS =====
function Settings({ token, onUnauthorized }) {
  const [settings, setSettings] = useState({
    helpMobile: '',
    helpEmail: '',
    helpHours: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    apiFetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching settings:', err);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await apiFetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.status === 401 || res.status === 403) {
        onUnauthorized();
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setSettings(data.settings);
      setMsg({ type: 'success', text: '✓ Help desk contact details updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="admin-loading">Loading site settings…</div>;

  return (
    <div className="admin-settings-view">
      <h2 className="admin-page-title">📞 Help Desk & Contact Settings</h2>
      <p className="admin-muted" style={{ marginBottom: '2rem' }}>
        Change the mobile helpline number, support email, and operating hours shown on the Help Desk page.
      </p>

      {msg.text && (
        <div className={`admin-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--r-md)' }}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="admin-field">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Helpline Mobile Number</label>
          <input
            type="text"
            required
            value={settings.helpMobile || ''}
            onChange={e => setSettings({ ...settings, helpMobile: e.target.value })}
            placeholder="+91 98765 43210"
            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: '#fff' }}
          />
        </div>

        <div className="admin-field">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Support Email Address</label>
          <input
            type="email"
            required
            value={settings.helpEmail || ''}
            onChange={e => setSettings({ ...settings, helpEmail: e.target.value })}
            placeholder="support@marimilkat.com"
            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: '#fff' }}
          />
        </div>

        <div className="admin-field">
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Support Operating Hours</label>
          <input
            type="text"
            required
            value={settings.helpHours || ''}
            onChange={e => setSettings({ ...settings, helpHours: e.target.value })}
            placeholder="Mon - Sat: 9:00 AM - 8:00 PM"
            style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: '#fff' }}
          />
        </div>

        <button
          type="submit"
          className="admin-login-btn"
          disabled={saving}
          style={{ padding: '0.9rem', width: '220px', background: 'var(--accent)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          {saving ? 'Saving Changes…' : '💾 Save Contact Number'}
        </button>
      </form>
    </div>
  );
}

// ===== HELP DESK WRITTEN INQUIRIES =====
function Inquiries({ token, onUnauthorized }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const loadInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/inquiries', {
        headers: { 'x-admin-token': token }
      });
      if (res.status === 401 || res.status === 403) {
        onUnauthorized();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load inquiries');
      setInquiries(data);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  }, [token, onUnauthorized]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await apiFetch(`/api/admin/inquiries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token,
        },
        body: JSON.stringify({ status: newStatus, adminNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setInquiries(prev => prev.map(i => i.id === id ? data.inquiry : i));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(data.inquiry);
      }
      setMsg({ type: 'success', text: `✓ Inquiry marked as ${newStatus}` });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/admin/inquiries/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-token': token
        },
      });
      if (!res.ok) throw new Error('Failed to delete inquiry');
      setInquiries(prev => prev.filter(i => i.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      setMsg({ type: 'success', text: '✓ Inquiry deleted' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = inquiries.filter(i => {
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus;
    const matchesSearch = !search.trim() || 
      i.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.phone?.includes(search) ||
      i.email?.toLowerCase().includes(search.toLowerCase()) ||
      i.message?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = inquiries.filter(i => i.status === 'pending').length;
  const resolvedCount = inquiries.filter(i => i.status === 'resolved').length;

  if (loading) return <div className="admin-loading">Loading Help Desk Inquiries…</div>;

  return (
    <div className="admin-inquiries-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="admin-page-title">📩 Help Desk Written Inquiries</h2>
          <p className="admin-muted">Manage messages & contact requests submitted from the Help Desk page.</p>
        </div>
        <button onClick={loadInquiries} className="admin-login-btn" style={{ padding: '0.5rem 1rem', width: 'auto' }}>
          🔄 Refresh
        </button>
      </div>

      {msg.text && (
        <div className={`admin-${msg.type === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: 'var(--r-md)' }}>
          {msg.text}
        </div>
      )}

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--bg2)', padding: '1.2rem', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          <div style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Total Inquiries</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginTop: '0.3rem' }}>{inquiries.length}</div>
        </div>
        <div style={{ background: 'var(--bg2)', padding: '1.2rem', borderRadius: 'var(--r-md)', border: '1px solid #eab308' }}>
          <div style={{ color: '#eab308', fontSize: '0.85rem' }}>⏳ Pending Response</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#eab308', marginTop: '0.3rem' }}>{pendingCount}</div>
        </div>
        <div style={{ background: 'var(--bg2)', padding: '1.2rem', borderRadius: 'var(--r-md)', border: '1px solid #22c55e' }}>
          <div style={{ color: '#22c55e', fontSize: '0.85rem' }}>✅ Resolved</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#22c55e', marginTop: '0.3rem' }}>{resolvedCount}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name, phone, email, or message..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '240px', padding: '0.7rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg2)', color: '#fff' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'pending', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: filterStatus === status ? 'var(--accent)' : 'var(--bg2)',
                color: filterStatus === status ? '#000' : '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      {filtered.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', color: 'var(--text3)' }}>
          📭 No inquiries found matching your filters.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg2)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', color: 'var(--text3)', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Sender</th>
                <th style={{ padding: '1rem' }}>Contact</th>
                <th style={{ padding: '1rem' }}>Message</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inq => (
                <tr key={inq.id} style={{ borderTop: '1px solid var(--border)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap', color: 'var(--text3)' }}>
                    {new Date(inq.date).toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>
                    {inq.name}
                  </td>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                    <div>📱 <a href={`tel:${inq.phone}`} style={{ color: 'var(--accent)' }}>{inq.phone}</a></div>
                    {inq.email && <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>✉️ {inq.email}</div>}
                  </td>
                  <td style={{ padding: '1rem', maxWidth: '300px' }}>
                    <div style={{ whiteSpace: 'pre-wrap', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {inq.message}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      background: inq.status === 'resolved' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                      color: inq.status === 'resolved' ? '#4ade80' : '#facc15',
                      border: `1px solid ${inq.status === 'resolved' ? '#22c55e' : '#eab308'}`
                    }}>
                      {inq.status === 'resolved' ? '✅ Resolved' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => { setSelectedInquiry(inq); setAdminNote(inq.adminNote || ''); }}
                      style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg3)', color: '#fff', cursor: 'pointer' }}
                    >
                      👁️ View Details
                    </button>
                    {inq.status === 'pending' ? (
                      <button
                        onClick={() => handleUpdateStatus(inq.id, 'resolved')}
                        disabled={actionLoading}
                        style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem', borderRadius: '6px', border: 'none', background: '#22c55e', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        ✓ Mark Resolved
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(inq.id, 'pending')}
                        disabled={actionLoading}
                        style={{ padding: '0.4rem 0.8rem', marginRight: '0.5rem', borderRadius: '6px', border: '1px solid #eab308', background: 'transparent', color: '#eab308', cursor: 'pointer' }}
                      >
                        ↩️ Reopen
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(inq.id)}
                      disabled={actionLoading}
                      style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: 'rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer' }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg1)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', maxWidth: '600px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.3rem' }}>📩 Inquiry Details</h3>
              <button onClick={() => setSelectedInquiry(null)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Sender Name:</strong>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{selectedInquiry.name}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Phone Number:</strong>
                <div>
                  <a href={`tel:${selectedInquiry.phone}`} style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{selectedInquiry.phone}</a>
                  {' '}
                  <a href={`https://wa.me/${selectedInquiry.phone.replace(/[^\d]/g, '')}`} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', color: '#25D366' }}>💬 WhatsApp</a>
                </div>
              </div>
              {selectedInquiry.email && (
                <div>
                  <strong style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Email Address:</strong>
                  <div><a href={`mailto:${selectedInquiry.email}`} style={{ color: 'var(--accent)' }}>{selectedInquiry.email}</a></div>
                </div>
              )}
              <div>
                <strong style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Submission Date:</strong>
                <div style={{ color: 'var(--text2)' }}>{new Date(selectedInquiry.date).toLocaleString()}</div>
              </div>
              <div>
                <strong style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Written Message:</strong>
                <div style={{ background: 'var(--bg2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '0.4rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {selectedInquiry.message}
                </div>
              </div>
              <div>
                <strong style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>Admin Reply / Note:</strong>
                <textarea
                  rows="3"
                  placeholder="Add private note or resolution details..."
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem 1rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', marginTop: '0.4rem', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedInquiry(null)}
                style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: '#fff', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => handleUpdateStatus(selectedInquiry.id, selectedInquiry.status === 'resolved' ? 'pending' : 'resolved')}
                disabled={actionLoading}
                style={{ padding: '0.7rem 1.2rem', borderRadius: '8px', border: 'none', background: selectedInquiry.status === 'resolved' ? '#eab308' : '#22c55e', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {selectedInquiry.status === 'resolved' ? 'Mark as Pending' : 'Mark as Resolved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== MAIN ADMIN PANEL COMPONENT =====
export default function AdminPanel() {
  const [admin, setAdmin] = useState(getStoredAdmin);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogin = (adminData) => {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_KEY);
    setAdmin(null);
  };

  if (!admin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'listings', icon: '🏘️', label: 'Listings' },
    { key: 'users', icon: '👥', label: 'Users' },
    { key: 'reports', icon: '🚩', label: 'Reports' },
    { key: 'inquiries', icon: '📩', label: 'Help Desk Inquiries' },
    { key: 'categories', icon: '📂', label: 'Categories' },
    { key: 'settings', icon: '📞', label: 'Help Desk Settings' },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard token={admin.token} onUnauthorized={handleLogout} />;
      case 'listings': return <Listings token={admin.token} onUnauthorized={handleLogout} />;
      case 'users': return <Users token={admin.token} onUnauthorized={handleLogout} />;
      case 'reports': return <Reports token={admin.token} onUnauthorized={handleLogout} />;
      case 'inquiries': return <Inquiries token={admin.token} onUnauthorized={handleLogout} />;
      case 'categories': return <Categories token={admin.token} onUnauthorized={handleLogout} />;
      case 'settings': return <Settings token={admin.token} onUnauthorized={handleLogout} />;
      default: return <Dashboard token={admin.token} onUnauthorized={handleLogout} />;
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-logo">
            🛡️ <span>Admin</span>
          </div>
          <button className="admin-sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`admin-nav-item ${activeView === item.key ? 'active' : ''}`}
              onClick={() => { setActiveView(item.key); setSidebarOpen(false); }}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <span className="admin-nav-icon">🚪</span>
            <span className="admin-nav-label">Logout</span>
          </button>
          <button className="admin-nav-item" onClick={() => { window.location.hash = '#home'; }}>
            <span className="admin-nav-icon">🌐</span>
            <span className="admin-nav-label">View Site</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span></span><span></span><span></span>
          </button>
          <h1 className="admin-topbar-title">MariMilkat Admin</h1>
          <div className="admin-topbar-user">
            <span className="admin-topbar-avatar">A</span>
            <span>Admin</span>
          </div>
        </header>
        <div className="admin-content">
          {renderView()}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
