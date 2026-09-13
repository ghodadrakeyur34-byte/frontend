import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useTranslation } from 'react-i18next';
import { Locate, MapPin, CheckCircle2 } from 'lucide-react';

export default function LocationPickerMap({
  coords,
  onChange,
  selectedCity = '',
  onRequestLocation = null,
}) {
  const { t } = useTranslation();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cityDefaults = {
    Veraval: { lat: 20.9082, lng: 70.3703 },
    Una: { lat: 20.8227, lng: 71.0421 },
    Junagadh: { lat: 21.5222, lng: 70.4579 },
  };

  // Custom stylish draggable pin icon
  const createPinIcon = () => {
    return L.divIcon({
      className: 'picker-map-pin-container',
      html: `
        <div class="picker-map-pin">
          <div class="picker-pin-head">
            <div class="picker-pin-inner-dot"></div>
          </div>
          <div class="picker-pin-point"></div>
          <div class="picker-pin-pulse"></div>
        </div>
      `,
      iconSize: [32, 42],
      iconAnchor: [16, 42],
      popupAnchor: [0, -42],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Sensible default fallback center
      const initialLat = coords?.lat || cityDefaults[selectedCity]?.lat || 20.9082;
      const initialLng = coords?.lng || cityDefaults[selectedCity]?.lng || 70.3703;
      const initialZoom = coords ? 15 : 12;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialZoom,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Place initial marker if coordinates are present
      if (coords?.lat && coords?.lng) {
        const marker = L.marker([coords.lat, coords.lng], {
          icon: createPinIcon(),
          draggable: true,
          autoPan: true,
        }).addTo(map);

        marker.on('dragend', (e) => {
          const latLng = e.target.getLatLng();
          onChange({ lat: latLng.lat, lng: latLng.lng });
        });

        markerRef.current = marker;
      }

      // Interactive Click: Click anywhere on map to drop or move marker
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          const marker = L.marker([lat, lng], {
            icon: createPinIcon(),
            draggable: true,
            autoPan: true,
          }).addTo(map);

          marker.on('dragend', (dragEvt) => {
            const latLng = dragEvt.target.getLatLng();
            onChange({ lat: latLng.lat, lng: latLng.lng });
          });

          markerRef.current = marker;
        }
        onChange({ lat, lng });
      });

      mapInstanceRef.current = map;

      // Invalidate size to ensure proper layout after CSS renders
      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  // Update marker position when external coords change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (coords?.lat && coords?.lng) {
      if (markerRef.current) {
        const cur = markerRef.current.getLatLng();
        if (Math.abs(cur.lat - coords.lat) > 0.00001 || Math.abs(cur.lng - coords.lng) > 0.00001) {
          markerRef.current.setLatLng([coords.lat, coords.lng]);
        }
      } else {
        const marker = L.marker([coords.lat, coords.lng], {
          icon: createPinIcon(),
          draggable: true,
          autoPan: true,
        }).addTo(map);

        marker.on('dragend', (e) => {
          const latLng = e.target.getLatLng();
          onChange({ lat: latLng.lat, lng: latLng.lng });
        });

        markerRef.current = marker;
      }
    }
  }, [coords]);

  // Recenter/pan map when city changes (if no manual marker set yet)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedCity || !cityDefaults[selectedCity]) return;

    // Only pan if coordinates haven't been customized yet or match a city default
    const cityCoord = cityDefaults[selectedCity];
    if (!coords) {
      map.flyTo([cityCoord.lat, cityCoord.lng], 13, { duration: 1 });
    }
  }, [selectedCity]);

  // Handle "Use My Current Location" button using Geolocation API
  const handleUseCurrentLocation = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLocating(true);
    setErrorMsg('');

    try {
      let position = null;

      if (onRequestLocation) {
        position = await onRequestLocation();
      } else if (navigator.geolocation) {
        position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
          );
        });
      }

      if (position && position.lat && position.lng) {
        const { lat, lng } = position;
        const map = mapInstanceRef.current;

        if (map) {
          map.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            const marker = L.marker([lat, lng], {
              icon: createPinIcon(),
              draggable: true,
              autoPan: true,
            }).addTo(map);

            marker.on('dragend', (dragEvt) => {
              const latLng = dragEvt.target.getLatLng();
              onChange({ lat: latLng.lat, lng: latLng.lng });
            });

            markerRef.current = marker;
          }
        }

        onChange({ lat, lng });
      } else {
        throw new Error('Location coordinates unavailable');
      }
    } catch (err) {
      console.warn('Geolocation error:', err);
      setErrorMsg(t('sell.locationPermDenied', 'Location access was blocked or timed out. Please allow location access or click on the map.'));
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="location-picker-card">
      <div className="location-picker-header">
        <div className="location-picker-title">
          <MapPin size={18} color="var(--accent)" />
          <span>{t('sell.mapPickerTitle', 'Set Property Location on Map')}</span>
        </div>

        {/* 'Use My Current Location' Button */}
        <button
          type="button"
          id="btnUseCurrentLocation"
          className={`btn-current-location ${isLocating ? 'loading' : ''} ${coords ? 'has-coords' : ''}`}
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          title={t('sell.useLocationTooltip', 'Center map and drop marker at your current GPS location')}
        >
          <Locate size={15} className={isLocating ? 'spin-icon' : ''} />
          <span>{isLocating ? t('sell.detecting', 'Locating...') : t('sell.useMyCurrentLocation', 'Use My Current Location')}</span>
        </button>
      </div>

      <p className="location-picker-instruction">
        {t('sell.mapInstruction', 'Click anywhere on the map to place a pin, or drag the marker to fine-tune the exact property position.')}
      </p>

      {errorMsg && (
        <div className="location-picker-error">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Map Canvas */}
      <div className="location-picker-map-box">
        <div ref={mapContainerRef} className="location-picker-leaflet-map" />
        <div className="location-picker-map-badge">
          <span>{coords ? t('sell.markerDraggable', 'Marker is draggable') : t('sell.clickToPin', 'Click to drop pin')}</span>
        </div>
      </div>

      {/* Coordinates feedback bar */}
      <div className="location-picker-footer">
        <div className="location-picker-coords">
          <span className="coord-chip">
            <span className="coord-chip-name">LAT:</span>
            <span className="coord-chip-val">{coords?.lat ? Number(coords.lat).toFixed(5) : '--'}</span>
          </span>
          <span className="coord-chip">
            <span className="coord-chip-name">LNG:</span>
            <span className="coord-chip-val">{coords?.lng ? Number(coords.lng).toFixed(5) : '--'}</span>
          </span>
        </div>

        {coords && (
          <div className="location-picker-success-tag">
            <CheckCircle2 size={14} color="#10b981" />
            <span>{t('sell.coordsBound', 'GPS coordinates linked')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
