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
 * Returns the number of price changes the user can still make this month.
 */
export function getRemainingPriceChanges(priceChangeLog = []) {
  return MAX_PRICE_CHANGES_PER_MONTH - getPriceChangesThisMonth(priceChangeLog).length;
}
