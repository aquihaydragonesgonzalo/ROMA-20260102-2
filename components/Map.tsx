import React, { useEffect, useRef } from 'react';
import { Activity } from '../types.ts';
import { ROMAN_WALK_TRACK, GPX_WAYPOINTS } from '../constants.ts';
import L from 'leaflet';

const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

interface MapProps {
  activities: Activity[];
  userLocation: { lat: number, lng: number } | null;
  focusedLocation: { lat: number, lng: number } | null;
}

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

    activities.forEach(act => {
      const marker = L.marker([act.coords.lat, act.coords.lng], { icon: defaultIcon }).addTo(map);
      marker.bindPopup(`<h3 style="font-weight:bold;margin:0">${act.title}</h3><p style="margin:4px 0">${act.locationName}</p>`);
      layersRef.current.push(marker);
    });

    GPX_WAYPOINTS.forEach(wpt => {
      const circleMarker = L.circleMarker([wpt.lat, wpt.lng], {
        radius: 5, fillColor: "#991B1B", color: "#fff", weight: 2, fillOpacity: 0.8
      }).addTo(map);
      circleMarker.bindPopup(`<div style="font-weight:bold">${wpt.name}</div>`);
      layersRef.current.push(circleMarker);
    });

    if (ROMAN_WALK_TRACK && ROMAN_WALK_TRACK.length > 0) {
      const trackLine = L.polyline(ROMAN_WALK_TRACK, {
        color: '#991B1B', weight: 3, opacity: 0.6, dashArray: '5, 10'
      }).addTo(map);
      layersRef.current.push(trackLine);
    }

    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-marker',
        html: '<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [16, 16]
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