export function formatPrice(n) {
  if (n >= 10000000) return '₨ ' + (n / 10000000).toFixed(2) + ' Crore';
  if (n >= 100000) return '₨ ' + (n / 100000).toFixed(2) + ' Lac';
  return '₨ ' + n.toLocaleString('en-PK');
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return days + ' days ago';
  return Math.floor(days / 30) + ' months ago';
}

export function genId() {
  return 'p' + Date.now() + Math.random().toString(36).slice(2, 6);
}

// ===== PRICE CHANGE LIMIT =====
const MAX_PRICE_CHANGES_PER_MONTH = 4;

/**
 * Returns only the price change timestamps that fall within the current
 * calendar month (year + month boundary, not a rolling 30-day window).
 */
export function getPriceChangesThisMonth(priceChangeLog = []) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return priceChangeLog.filter((ts) => {
    const d = new Date(ts);
    return d >= monthStart && d < monthEnd;
  });
}

/**
 * Returns true when the listing still has at least one price change
 * remaining in the current calendar month.
 */
export function canChangePrice(priceChangeLog = []) {
  return getPriceChangesThisMonth(priceChangeLog).length < MAX_PRICE_CHANGES_PER_MONTH;
}

/**
 * Returns the number of price changes remaining in the current calendar month.
 */
export function getRemainingPriceChanges(priceChangeLog = []) {
  const used = getPriceChangesThisMonth(priceChangeLog).length;
  return Math.max(0, MAX_PRICE_CHANGES_PER_MONTH - used);
}

/**
 * Utility to extract a cookie by name from document.cookie
 */
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://backend-fkfj.onrender.com' : '');

/**
 * Wrapper around fetch that automatically includes credentials and attaches
 * the X-XSRF-TOKEN header on state-changing requests (POST, PUT, DELETE).
 */
export async function apiFetch(url, options = {}, _isRetry = false) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...(options.headers || {}) };

  const targetUrl = url.startsWith('/api') ? `${API_BASE}${url}` : url;

  options.credentials = 'include';

  const isAdminRequest = url.includes('/api/admin');

  // Handle admin token
  let adminToken = headers['x-admin-token'];
  if (!adminToken) {
    try {
      const adminStored = localStorage.getItem('marimilkat_admin');
      if (adminStored) {
        const a = JSON.parse(adminStored);
        if (a?.token) {
          adminToken = a.token;
          headers['x-admin-token'] = adminToken;
        }
      }
    } catch (e) {}
  }

  // If this is an admin request and we have an admin token, use it as Authorization
  if (isAdminRequest && adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`;
  } else if (!headers['Authorization']) {
    // Automatically attach Bearer token from stored user session for non-admin requests
    try {
      const stored = localStorage.getItem('propbazaar_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u?.token) {
          headers['Authorization'] = `Bearer ${u.token}`;
        }
      }
    } catch (e) {}
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    let token = getCookie('XSRF-TOKEN');
    if (!token) {
      try {
        const csrfRes = await fetch(`${API_BASE}/api/csrf-token`, { credentials: 'include' });
        const data = await csrfRes.json();
        token = data.csrfToken || getCookie('XSRF-TOKEN');
      } catch (e) {
        console.error('Failed to fetch CSRF token:', e);
      }
    }
    if (token) {
      headers['X-XSRF-TOKEN'] = token;
    }
  }

  const res = await fetch(targetUrl, { ...options, headers });

  // If 401 and not already retrying, attempt silent token refresh and retry
  if (res.status === 401 && !_isRetry && !url.includes('/auth/login') && !url.includes('/auth/signup') && !url.includes('/admin/login')) {
    try {
      let refreshToken = null;
      try {
        const stored = localStorage.getItem('propbazaar_user');
        if (stored) {
          const u = JSON.parse(stored);
          refreshToken = u?.refreshToken;
        }
        if (!refreshToken) {
          const adminStored = localStorage.getItem('marimilkat_admin');
          if (adminStored) {
            const a = JSON.parse(adminStored);
            refreshToken = a?.refreshToken;
          }
        }
      } catch (e) {}

      const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(refreshToken ? { 'x-refresh-token': refreshToken } : {}),
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        const newToken = data.accessToken;
        if (newToken) {
          // Persist updated token to user storage
          try {
            const stored = localStorage.getItem('propbazaar_user');
            if (stored) {
              const u = JSON.parse(stored);
              u.token = newToken;
              if (data.refreshToken) u.refreshToken = data.refreshToken;
              localStorage.setItem('propbazaar_user', JSON.stringify(u));
            }
          } catch (e) {}

          // Persist updated token to admin storage if applicable
          try {
            const adminStored = localStorage.getItem('marimilkat_admin');
            if (adminStored) {
              const a = JSON.parse(adminStored);
              a.token = newToken;
              if (data.refreshToken) a.refreshToken = data.refreshToken;
              localStorage.setItem('marimilkat_admin', JSON.stringify(a));
            }
          } catch (e) {}

          // Retry original request with newly refreshed token
          const retryHeaders = { ...headers, Authorization: `Bearer ${newToken}` };
          return apiFetch(url, { ...options, headers: retryHeaders }, true);
        }
      }
    } catch (e) {
      // Refresh failed — return original response
    }
  }

  return res;
}

/**
 * Normalizes a phone string by stripping non-digits and keeping the last 10 digits.
 */
export function normalizePhone(phone) {
  if (!phone) return '';
  return String(phone).replace(/\D/g, '').slice(-10);
}

/**
 * Records created listing IDs in localStorage to ensure user-created
 * listings persist locally across sessions for this specific user.
 */
export function saveCreatedListingId(listingId, user) {
  if (!listingId || !user) return;
  try {
    const userIdentifier = (user.email || user.phone || '').trim().toLowerCase();
    if (userIdentifier) {
      const userKey = `propbazaar_my_listings_${userIdentifier}`;
      const userList = JSON.parse(localStorage.getItem(userKey) || '[]');
      if (!userList.includes(listingId)) {
        userList.unshift(listingId);
        localStorage.setItem(userKey, JSON.stringify(userList));
      }
    }
    // Clean up legacy unauthenticated storage keys that leaked across users
    localStorage.removeItem('propbazaar_my_listings_local');
    localStorage.removeItem('propbazaar_my_listings_guest');
  } catch (e) {}
}

/**
 * Removes a deleted listing ID from user's local tracking list.
 */
export function removeCreatedListingId(listingId, user) {
  if (!listingId || !user) return;
  try {
    const userIdentifier = (user.email || user.phone || '').trim().toLowerCase();
    if (userIdentifier) {
      const userKey = `propbazaar_my_listings_${userIdentifier}`;
      const userList = JSON.parse(localStorage.getItem(userKey) || '[]');
      const updated = userList.filter((id) => id !== listingId);
      localStorage.setItem(userKey, JSON.stringify(updated));
    }
  } catch (e) {}
}

/**
 * Checks whether a listing is owned by the given user.
 * Strictly verifies identity via User ID / Google ID, verified email,
 * normalized phone number, or user-scoped tracking.
 * NEVER returns true for other users' listings or legacy browser-wide keys.
 */
export function isListingOwner(listing, user) {
  if (!listing || !user) return false;

  // Cleanup legacy global storage keys that erroneously assigned ownership to all users
  try {
    if (localStorage.getItem('propbazaar_my_listings_local')) {
      localStorage.removeItem('propbazaar_my_listings_local');
    }
    if (localStorage.getItem('propbazaar_my_listings_guest')) {
      localStorage.removeItem('propbazaar_my_listings_guest');
    }
  } catch (e) {}

  const cleanStr = (s) => (s ? String(s).trim().toLowerCase() : '');
  const cleanPhone = (p) => (p ? String(p).replace(/\D/g, '').slice(-10) : '');

  const userEmail = cleanStr(user.email);
  const userPhone = cleanPhone(user.phone);
  const userId = cleanStr(user.id || user._id || user.googleId || user.sub);

  const ownerId = cleanStr(listing.ownerId);
  const ownerUserId = cleanStr(listing.ownerUserId || listing.userId);
  const ownerEmail = cleanStr(listing.ownerEmail || listing.contact?.email);
  const ownerPhone = cleanPhone(listing.ownerPhone || (listing.ownerId && !listing.ownerId.includes('@') ? listing.ownerId : ''));
  const contactPhone = cleanPhone(listing.contact?.phone);
  const contactEmail = cleanStr(listing.contact?.email);

  // 1. Direct User ID / Google ID Match
  if (userId) {
    if (ownerId === userId || ownerUserId === userId) {
      return true;
    }
  }

  // 2. Email Match (case-insensitive exact match)
  if (userEmail) {
    if (ownerId === userEmail || ownerEmail === userEmail || contactEmail === userEmail) {
      return true;
    }
  }

  // 3. Phone Number Match (normalized last 10 digits, minimum 7 digits)
  if (userPhone && userPhone.length >= 7) {
    if (ownerPhone === userPhone || contactPhone === userPhone || cleanPhone(listing.ownerId) === userPhone) {
      return true;
    }
  }

  // 4. Check user-scoped local storage tracked listings (must match this user's specific identity)
  try {
    const userIdentifier = userEmail || userPhone;
    if (userIdentifier) {
      const userKey = `propbazaar_my_listings_${userIdentifier}`;
      const userTracked = JSON.parse(localStorage.getItem(userKey) || '[]');
      if (Array.isArray(userTracked) && userTracked.includes(listing.id)) {
        return true;
      }
    }
  } catch (e) {}

  return false;
}

