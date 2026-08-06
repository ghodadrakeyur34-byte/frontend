import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import BrowseView from './components/BrowseView';
import SellView from './components/SellView';
import DetailView from './components/DetailView';
import MyListingsView from './components/MyListingsView';
import LoginPage from './components/LoginPage';
import LocationModal from './components/LocationModal';
import AdminPanel from './components/AdminPanel';
import HelpDeskView from './components/HelpDeskView';
import { canChangePrice, apiFetch } from './utils';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const USER_KEY = 'propbazaar_user';

export default function App() {
  const { t } = useTranslation();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [currentHash, setCurrentHash] = useState(window.location.hash || '#home');
  const [searchFilters, setSearchFilters] = useState(null);

  // Geolocation & Location Modal state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('prompt');

  // Track where user was before they were redirected to login
  const [loginRedirect, setLoginRedirect] = useState(null);

  // Initialize Lenis smooth scroll animation
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  // On entry: check location permission or show modal
  useEffect(() => {
    const savedLoc = localStorage.getItem('mari_milkat_user_location');
    const dismissed = localStorage.getItem('mari_milkat_location_dismissed');

    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        setUserLocation(parsed);
        setLocationStatus('granted');
      } catch (e) {}
    } else if (!dismissed) {
      // Automatically prompt location permission on entering website
      setShowLocationModal(true);
    }
  }, []);

  const handleRequestLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        setLocationStatus('denied');
        setShowLocationModal(false);
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            granted: true
          };
          setUserLocation(loc);
          setLocationStatus('granted');
          localStorage.setItem('mari_milkat_user_location', JSON.stringify(loc));
          setShowLocationModal(false);
          resolve(loc);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setLocationStatus('denied');
          localStorage.setItem('mari_milkat_location_dismissed', 'true');
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  const handleDismissLocationModal = () => {
    localStorage.setItem('mari_milkat_location_dismissed', 'true');
    setShowLocationModal(false);
  };

  // Load listings on mount
  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        const res = await apiFetch('/api/listings');
        if (!res.ok) throw new Error('Failed to fetch listings from server.');
        const data = await res.json();
        setListings(data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // ===== AUTH =====
  const navigateToLogin = (redirectBack) => {
    if (redirectBack) {
      setLoginRedirect(redirectBack);
    }
    window.location.hash = '#login';
  };

  const handleAuthSuccess = (userData) => {
    if (!userData) return;
    const { password, passwordHash, ...safeUser } = userData;
    setCurrentUser(safeUser);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));

    const redirectTo = loginRedirect || '#home';
    setLoginRedirect(null);
    window.location.hash = redirectTo;
  };

  const handleLogin = async (credentials) => {
    const { email, name, phone, password } = credentials;
    const isSignup = !!name && !!phone;

    const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
    const body = isSignup
      ? { email, name, phone, password }
      : { email, password };

    const res = await apiFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    if (data.requiresVerification) {
      return data;
    }

    if (data.success && data.user) {
      handleAuthSuccess(data.user);
      return data;
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    setCurrentUser(null);
    localStorage.removeItem(USER_KEY);
    window.location.hash = '#home';
  };

  // ===== LISTINGS CRUD =====
  const handleAddListing = async (newListing) => {
    const listingWithOwner = currentUser
      ? { ...newListing, ownerId: currentUser.phone }
      : newListing;

    try {
      const res = await apiFetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingWithOwner),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create listing');
      }
      const created = await res.json();
      setListings((prevListings) => [created, ...prevListings]);
    } catch (err) {
      console.error('Add listing error:', err);
      alert(err.message || 'Failed to save listing to server. Please try again.');
    }
  };

  const handleDeleteListing = async (listingId) => {
    try {
      const res = await apiFetch(`/api/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          'Owner-Phone': currentUser?.phone || '',
        },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to delete listing');
      }
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (err) {
      console.error('Delete listing error:', err);
      alert(err.message);
    }
  };

  const handleUpdatePrice = async (listingId, newPrice) => {
    try {
      const res = await apiFetch(`/api/listings/${listingId}/price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Owner-Phone': currentUser?.phone || '',
        },
        body: JSON.stringify({ price: newPrice }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Failed to update price.' };
      }

      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? data.listing : l))
      );
      return { success: true, message: 'Price updated successfully.' };
    } catch (err) {
      console.error('Update price error:', err);
      return { success: false, message: 'Server connection error.' };
    }
  };

  const handleHeroSearch = (filters) => {
    setSearchFilters(filters);
  };

  const clearInitialFilters = () => {
    setSearchFilters(null);
  };

  // ===== ROUTING =====
  const renderView = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid rgba(0,0,0,0.1)', borderTopColor: '#0070f3', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#666' }}>{t('common.loading')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h2 style={{ color: '#e53e3e' }}>{t('common.errorTitle')}</h2>
          <p style={{ color: '#666', maxWidth: '400px' }}>{t('common.errorMessage', { error })}</p>
          <button onClick={() => window.location.reload()} className="btn-submit" style={{ maxWidth: '200px' }}>{t('common.retry')}</button>
        </div>
      );
    }

    const hash = currentHash || '#home';

    if (hash === '#login') {
      // If already logged in, redirect to home
      if (currentUser) {
        window.location.hash = loginRedirect || '#home';
        setLoginRedirect(null);
        return null;
      }
      return <LoginPage onLogin={handleLogin} onAuthSuccess={handleAuthSuccess} redirectAfter={loginRedirect} />;
    }
    if (hash === '#admin') {
      return <AdminPanel />;
    }
    if (hash === '#home' || hash === '') {
      return (
        <HomeView
          listings={listings}
          onSearch={handleHeroSearch}
          userLocation={userLocation}
          onRequestLocation={handleRequestLocation}
        />
      );
    }
    if (hash === '#sell') {
      if (!currentUser) {
        navigateToLogin('#sell');
        return null;
      }
      return (
        <SellView
          currentUser={currentUser}
          onAddListing={handleAddListing}
          onRequireLogin={() => navigateToLogin('#sell')}
          userLocation={userLocation}
        />
      );
    }
    if (hash === '#help') {
      return <HelpDeskView userLocation={userLocation} />;
    }
    if (hash === '#browse') {
      return (
        <BrowseView
          listings={listings}
          initialFilters={searchFilters}
          clearInitialFilters={clearInitialFilters}
          userLocation={userLocation}
          onRequestLocation={handleRequestLocation}
        />
      );
    }
    if (hash === '#my-listings') {
      if (!currentUser) {
        navigateToLogin('#my-listings');
        return null;
      }
      return (
        <MyListingsView
          listings={listings}
          currentUser={currentUser}
          onDeleteListing={handleDeleteListing}
        />
      );
    }
    if (hash.startsWith('#detail/')) {
      const id = hash.split('/')[1];
      return (
        <DetailView
          id={id}
          listings={listings}
          onUpdatePrice={handleUpdatePrice}
          currentUser={currentUser}
          onRequireLogin={() => navigateToLogin(`#detail/${id}`)}
          userLocation={userLocation}
        />
      );
    }

    return (
      <HomeView
        listings={listings}
        onSearch={handleHeroSearch}
        userLocation={userLocation}
        onRequestLocation={handleRequestLocation}
        currentUser={currentUser}
      />
    );
  };

  // If admin route, render standalone (no Navbar/Footer)
  if (currentHash === '#admin') {
    return <AdminPanel />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        currentHash={currentHash}
        currentUser={currentUser}
        onLogout={handleLogout}
        onShowLogin={() => navigateToLogin(currentHash)}
        onRequestLocation={handleRequestLocation}
        userLocation={userLocation}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderView()}
      </div>
      <Footer currentUser={currentUser} />

      {/* Persistent Floating Help Desk Button on Every Page */}
      {currentHash !== '#help' && (
        <a
          href="#help"
          className="glass-card btn-shimmer"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 18px',
            borderRadius: '9999px',
            background: 'rgba(17, 24, 39, 0.85)',
            border: '1px solid rgba(226, 184, 87, 0.4)',
            color: 'var(--accent)',
            fontWeight: '600',
            fontSize: '0.9rem',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)',
            textDecoration: 'none',
            backdropFilter: 'blur(16px)',
            cursor: 'pointer'
          }}
        >
          <span className="pulse-dot"></span>
          <span>📞 Help Desk</span>
        </a>
      )}

      <LocationModal
        isOpen={showLocationModal}
        onClose={handleDismissLocationModal}
        onRequestLocation={handleRequestLocation}
        locationStatus={locationStatus}
      />
    </div>
  );
}
