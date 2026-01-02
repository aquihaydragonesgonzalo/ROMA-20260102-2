import React, { useEffect, useRef } from 'react';
import { Activity } from '../types';
import { ROMAN_WALK_TRACK, GPX_WAYPOINTS } from '../constants';
import L from 'leaflet';

const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

interface MapProps {
  activities: Activity[];
  userLocation: { lat: number, lng: number } | null;
  focusedLocation: { lat: number, lng: number } | null;
}

// Global bridge for Leaflet buttons to call React functions via events
(window as any).openAudioGuideFromMap = (id: string) => {
  const event = new CustomEvent('open-audio-guide', { detail: id });
  window.dispatchEvent(event);
};

const MapComponent: React.FC<MapProps> = ({ activities, userLocation, focusedLocation }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([41.8902, 12.4922], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    layersRef.current.forEach(layer => layer.remove());
    layersRef.current = [];

    const defaultIcon = L.icon({
      iconUrl, iconRetinaUrl, shadowUrl,
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    });

    const audioIcon = L.divIcon({
      className: 'audio-marker',
      html: `
        <div style="background-color: #991B1B; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; animation: pulse-red 2s infinite;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
        </div>
        <style>
          @keyframes pulse-red {
            0% { box-shadow: 0 0 0 0 rgba(153, 27, 27, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(153, 27, 27, 0); }
            100% { box-shadow: 0 0 0 0 rgba(153, 27, 27, 0); }
          }
        </style>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Render principal markers (activities)
    activities.forEach(act => {
      const marker = L.marker([act.coords.lat, act.coords.lng], { 
        icon: act.audioGuideText ? audioIcon : defaultIcon 
      }).addTo(map);
      
      let popupContent = `
        <div style="padding: 12px; min-width: 180px; font-family: 'Roboto Condensed', sans-serif;">
          <h3 style="margin: 0 0 4px 0; font-weight: bold; color: #7f1d1d; font-size: 14px;">${act.title}</h3>
          <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748b;">${act.locationName}</p>`;
      
      if (act.audioGuideText) {
        popupContent += `
          <button 
            onclick="window.openAudioGuideFromMap('${act.id}')"
            style="width: 100%; background: #991B1B; color: white; border: none; padding: 10px; border-radius: 10px; font-weight: bold; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); active:transform: scale(0.98);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
            </svg>
            REPRODUCIR AUDIOGUÍA
          </button>`;
      }
      popupContent += `</div>`;
      
      marker.bindPopup(popupContent);
      layersRef.current.push(marker);
    });

    // Render secondary waypoints (from GPX)
    GPX_WAYPOINTS.forEach(wpt => {
      const circleMarker = L.circleMarker([wpt.lat, wpt.lng], {
        radius: 6,
        fillColor: "#991B1B",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);
      circleMarker.bindPopup(`<div style="font-family: 'Roboto Condensed', sans-serif; font-size: 12px; font-weight: bold; color: #7f1d1d;">${wpt.name}</div>`);
      layersRef.current.push(circleMarker);
    });

    // Render Walking Track Line
    if (ROMAN_WALK_TRACK && ROMAN_WALK_TRACK.length > 0) {
      const trackLine = L.polyline(ROMAN_WALK_TRACK, {
        color: '#991B1B',
        weight: 4,
        opacity: 0.7,
        dashArray: '8, 12',
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false
      }).addTo(map);
      layersRef.current.push(trackLine);
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div style="background-color: #3b82f6; width: 22px; height: 22px; border-radius: 50%; border: 4px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>',
        iconSize: [22, 22]
      });
      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
      layersRef.current.push(marker);
    }
  }, [activities, userLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !focusedLocation) return;
    map.flyTo([focusedLocation.lat, focusedLocation.lng], 16, { duration: 1.5 });
  }, [focusedLocation]);

  return <div ref={mapContainerRef} className="w-full h-full z-0" />;
};

export default MapComponent;