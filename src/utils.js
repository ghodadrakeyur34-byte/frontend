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
export async function apiFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...(options.headers || {}) };

  const targetUrl = url.startsWith('/api') ? `${API_BASE}${url}` : url;

  options.credentials = 'include';

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

  return fetch(targetUrl, { ...options, headers });
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
 * listings persist locally across sessions.
 */
export function saveCreatedListingId(listingId, user) {
  if (!listingId) return;
  try {
    const userKey = `propbazaar_my_listings_${user?.email || user?.phone || 'guest'}`;
    const userList = JSON.parse(localStorage.getItem(userKey) || '[]');
    if (!userList.includes(listingId)) {
      userList.unshift(listingId);
      localStorage.setItem(userKey, JSON.stringify(userList));
    }

    const localList = JSON.parse(localStorage.getItem('propbazaar_my_listings_local') || '[]');
    if (!localList.includes(listingId)) {
      localList.unshift(listingId);
      localStorage.setItem('propbazaar_my_listings_local', JSON.stringify(localList));
    }
  } catch (e) {}
}

/**
 * Checks whether a listing is owned by the given user.
 * Supports email (case-insensitive), normalized phone numbers,
 * contact names, owner IDs, and local storage tracking.
 */
export function isListingOwner(listing, user) {
  if (!listing || !user) return false;

  // 1. Check local storage tracked listings for this user or browser
  try {
    const userKey = `propbazaar_my_listings_${user.email || user.phone || 'guest'}`;
    const userTracked = JSON.parse(localStorage.getItem(userKey) || '[]');
    if (Array.isArray(userTracked) && userTracked.includes(listing.id)) {
      return true;
    }
    const localTracked = JSON.parse(localStorage.getItem('propbazaar_my_listings_local') || '[]');
    if (Array.isArray(localTracked) && localTracked.includes(listing.id)) {
      return true;
    }
  } catch (e) {}

  const cleanStr = (s) => (s ? String(s).trim().toLowerCase() : '');
  const cleanPhone = (p) => (p ? String(p).replace(/\D/g, '').slice(-10) : '');

  const userEmail = cleanStr(user.email);
  const userPhone = cleanPhone(user.phone);
  const userName = cleanStr(user.name);
  const userId = cleanStr(user.id || user._id || user.googleId);

  const ownerId = cleanStr(listing.ownerId);
  const ownerEmail = cleanStr(listing.ownerEmail || listing.contact?.email);
  const ownerPhone = cleanPhone(listing.ownerPhone || (listing.ownerId && !listing.ownerId.includes('@') ? listing.ownerId : ''));
  const contactPhone = cleanPhone(listing.contact?.phone);
  const contactName = cleanStr(listing.contact?.name);
  const contactEmail = cleanStr(listing.contact?.email);

  // 2. Email Match (case-insensitive)
  if (userEmail) {
    if (ownerId === userEmail || ownerEmail === userEmail || contactEmail === userEmail) {
      return true;
    }
    if (ownerId.includes(userEmail)) {
      return true;
    }
  }

  // 3. Direct User ID / Google ID Match
  if (userId) {
    if (ownerId === userId || cleanStr(listing.userId) === userId) {
      return true;
    }
  }

  // 4. Phone Number Match (normalized last 10 digits)
  if (userPhone && userPhone.length >= 7) {
    if (ownerPhone === userPhone || contactPhone === userPhone || cleanPhone(listing.ownerId) === userPhone) {
      return true;
    }
  }

  // 5. Contact Name match fallback (especially useful when user logged in via Google with empty phone)
  if (userName && contactName && userName === contactName) {
    // If ownerId is generic, empty, matches name, or matches user
    if (!ownerId || ownerId === 'user' || ownerId === userName) {
      return true;
    }
    if (userEmail && (ownerId === userEmail || !ownerId.includes('@'))) {
      return true;
    }
    if (userPhone && (ownerPhone === userPhone || contactPhone === userPhone)) {
      return true;
    }
  }

  return false;
}

