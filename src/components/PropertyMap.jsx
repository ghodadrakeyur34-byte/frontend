import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatPrice } from '../utils';

export default function PropertyMap({
  listings = [],
  userLocation = null,
  height = '480px',
  selectedListingId = null,
  onRequestLocation = null
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const userMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around Gujarat coast (Veraval / Junagadh region)
      const defaultCenter = [21.15, 70.60];
      const defaultZoom = 10;

      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: defaultZoom,
        scrollWheelZoom: false
      });

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markersGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update property markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const bounds = [];

    listings.forEach((listing) => {
      // Fallback coordinates if missing
      const lat = listing.lat || (listing.city === 'Una' ? 20.8227 : listing.city === 'Junagadh' ? 21.5222 : 20.9082);
      const lng = listing.lng || (listing.city === 'Una' ? 71.0421 : listing.city === 'Junagadh' ? 70.4579 : 70.3703);

      bounds.push([lat, lng]);

      const isSelected = selectedListingId === listing.id;
      const isHouse = listing.type === 'house';
      const iconSymbol = isHouse ? '🏠' : '📐';
      const formattedPrice = formatPrice(listing.price);

      // Custom marker HTML icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin-container',
        html: `
          <div class="map-pin ${isHouse ? 'pin-house' : 'pin-plot'} ${isSelected ? 'pin-selected' : ''}">
            <span class="pin-icon">${iconSymbol}</span>
            <span class="pin-price">${formattedPrice}</span>
          </div>
        `,
        iconSize: [110, 36],
        iconAnchor: [55, 36],
        popupAnchor: [0, -36]
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Create rich HTML content for Popup on Hover
      const thumb = listing.images && listing.images.length > 0
        ? listing.images[0]
        : (isHouse ? '/assets/sample_house.png' : '/assets/sample_plot.png');

      const popupContent = `
        <div class="map-hover-card">
          <div class="map-hover-card-img">
            <img src="${thumb}" alt="${listing.title}" />
            <span class="map-hover-badge ${isHouse ? 'badge-house' : 'badge-plot'}">
              ${iconSymbol} ${isHouse ? 'House' : 'Plot'}
            </span>
          </div>
          <div class="map-hover-card-body">
            <div class="map-hover-price">${formattedPrice}</div>
            <div class="map-hover-title">${listing.title}</div>
            <div class="map-hover-location">📍 ${listing.area}, ${listing.city}</div>
            <div class="map-hover-meta">
              <span>📏 ${listing.size} ${listing.unit}</span>
            </div>
            <a href="#detail/${listing.id}" class="map-hover-btn">
              View Details →
            </a>
          </div>
        </div>
      `;

      const popup = L.popup({
        offset: [0, -10],
        closeButton: false,
        className: 'custom-map-popup'
      }).setContent(popupContent);

      marker.bindPopup(popup);

      // Hover Interaction: Open on mouseover, stay open or close on mouseout
      marker.on('mouseover', function () {
        this.openPopup();
      });

      marker.on('click', function () {
        window.location.hash = `#detail/${listing.id}`;
      });

      markersGroup.addLayer(marker);
    });

    // Add User Location Pin if available
    if (userLocation && userLocation.lat && userLocation.lng) {
      const userLat = userLocation.lat;
      const userLng = userLocation.lng;
      bounds.push([userLat, userLng]);

      if (userMarkerRef.current) {
        map.removeLayer(userMarkerRef.current);
      }

      const userIcon = L.divIcon({
        className: 'user-location-pin-wrapper',
        html: `
          <div class="user-location-pulse">
            <div class="user-dot"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const userMarker = L.marker([userLat, userLng], { icon: userIcon });
      userMarker.bindTooltip('📍 You are here', { permanent: true, direction: 'top' });
      userMarker.addTo(map);
      userMarkerRef.current = userMarker;
    }

    // Fit bounds if we have markers
    if (bounds.length > 0 && !selectedListingId) {
      try {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
      } catch (err) {
        console.error('Fit bounds error:', err);
      }
    }
  }, [listings, userLocation, selectedListingId]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (userLocation && userLocation.lat && userLocation.lng) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13, { animate: true });
    } else if (listings.length > 0) {
      const bounds = listings.map(l => [l.lat || 20.9082, l.lng || 70.3703]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  };

  return (
    <div className="property-map-wrapper" style={{ height, position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

      <div className="map-controls-bar">
        {userLocation ? (
          <button className="map-ctrl-btn active" onClick={handleRecenter} title="Center to My Location">
            📍 My Location
          </button>
        ) : (
          onRequestLocation && (
            <button className="map-ctrl-btn" onClick={onRequestLocation} title="Enable Location">
              🎯 Enable Location
            </button>
          )
        )}
        <button className="map-ctrl-btn" onClick={handleRecenter} title="Reset View">
          🔄 Fit All Properties
        </button>
      </div>
    </div>
  );
}
