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

/**
 * Wrapper around fetch that automatically includes credentials and attaches
 * the X-XSRF-TOKEN header on state-changing requests (POST, PUT, DELETE).
 */
export async function apiFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = { ...(options.headers || {}) };

  options.credentials = 'include';

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    let token = getCookie('XSRF-TOKEN');
    if (!token) {
      try {
        const csrfRes = await fetch('/api/csrf-token', { credentials: 'include' });
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

  return fetch(url, { ...options, headers });
}
