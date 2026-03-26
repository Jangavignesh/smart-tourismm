// ============================================================
// src/components/common/MapBudgetSection.js - V2
// Full width large map + travel cost sent to budget calculator
// ============================================================

import React, { useState, useEffect, useRef, useMemo } from "react";

const CITY_COORDINATES = {
  "Taj Mahal":               { lat: 27.1751, lng: 78.0421 },
  "Agra Fort":               { lat: 27.1800, lng: 78.0219 },
  "Hawa Mahal":              { lat: 26.9239, lng: 75.8267 },
  "Amber Fort":              { lat: 26.9855, lng: 75.8513 },
  "Baga Beach":              { lat: 15.5554, lng: 73.7519 },
  "Calangute Beach":         { lat: 15.5440, lng: 73.7553 },
  "Anjuna Beach":            { lat: 15.5738, lng: 73.7404 },
  "Palolem Beach":           { lat: 15.0100, lng: 74.0230 },
  "Old Goa Churches":        { lat: 15.5007, lng: 73.9117 },
  "Qutub Minar":             { lat: 28.5245, lng: 77.1855 },
  "India Gate":              { lat: 28.6129, lng: 77.2295 },
  "Red Fort":                { lat: 28.6562, lng: 77.2410 },
  "Humayun Tomb":            { lat: 28.5933, lng: 77.2507 },
  "Ganga Aarti":             { lat: 25.3176, lng: 83.0100 },
  "Kashi Vishwanath Temple": { lat: 25.3109, lng: 83.0107 },
  "City Palace Udaipur":     { lat: 24.5764, lng: 73.6836 },
  "Lake Pichola":            { lat: 24.5724, lng: 73.6802 },
  "Gateway of India":        { lat: 18.9220, lng: 72.8347 },
  "Marine Drive":            { lat: 18.9438, lng: 72.8230 },
  "Elephanta Caves":         { lat: 18.9633, lng: 72.9315 },
  "Mysore Palace":           { lat: 12.3052, lng: 76.6551 },
  "Golden Temple":           { lat: 31.6200, lng: 74.8765 },
  "Laxman Jhula":            { lat: 30.1270, lng: 78.3226 },
  "Rohtang Pass":            { lat: 32.3720, lng: 77.2406 },
  "Ooty Lake":               { lat: 11.4064, lng: 76.6932 },
  "Tiger Hill Darjeeling":   { lat: 27.0196, lng: 88.2627 },
  "Victoria Memorial":       { lat: 22.5448, lng: 88.3426 },
  "Marina Beach":            { lat: 13.0500, lng: 80.2824 },
  "Virupaksha Temple":       { lat: 15.3350, lng: 76.4600 },
  "Mehrangarh Fort":         { lat: 26.2980, lng: 73.0185 },
  "Munnar Tea Gardens":      { lat: 10.0889, lng: 77.0595 },
  "Kerala Backwaters":       { lat: 9.4981,  lng: 76.3388 },
  "Brahma Temple Pushkar":   { lat: 26.4897, lng: 74.5511 },
  "Ranthambore Tiger Reserve":{ lat: 26.0173, lng: 76.5026 },
  "Jim Corbett National Park":{ lat: 29.5300, lng: 78.7747 },
  "Coorg Coffee Estates":    { lat: 12.3375, lng: 75.8069 },
  "Spiti Valley":            { lat: 32.2396, lng: 78.0143 },
  "Rishikesh River Rafting": { lat: 30.0869, lng: 78.2676 },
  "Darjeeling Toy Train":    { lat: 27.0410, lng: 88.2663 },
  "Fort Kochi":              { lat: 9.9658,  lng: 76.2421 },
};

const CITY_CENTERS = {
  "Agra":       { lat: 27.1767, lng: 78.0081 },
  "Jaipur":     { lat: 26.9124, lng: 75.7873 },
  "Goa":        { lat: 15.2993, lng: 74.1240 },
  "Delhi":      { lat: 28.6139, lng: 77.2090 },
  "Varanasi":   { lat: 25.3176, lng: 82.9739 },
  "Udaipur":    { lat: 24.5854, lng: 73.7125 },
  "Mumbai":     { lat: 19.0760, lng: 72.8777 },
  "Mysore":     { lat: 12.2958, lng: 76.6394 },
  "Amritsar":   { lat: 31.6340, lng: 74.8723 },
  "Rishikesh":  { lat: 30.0869, lng: 78.2676 },
  "Manali":     { lat: 32.2396, lng: 77.1887 },
  "Ooty":       { lat: 11.4064, lng: 76.6932 },
  "Darjeeling": { lat: 27.0410, lng: 88.2663 },
  "Kolkata":    { lat: 22.5726, lng: 88.3639 },
  "Chennai":    { lat: 13.0827, lng: 80.2707 },
  "Hampi":      { lat: 15.3350, lng: 76.4600 },
  "Jodhpur":    { lat: 26.2389, lng: 73.0243 },
  "Munnar":     { lat: 10.0889, lng: 77.0595 },
  "Kochi":      { lat: 9.9312,  lng: 76.2673 },
  "Pushkar":    { lat: 26.4897, lng: 74.5511 },
};

const TRAVEL_MODES = [
  { id: "bus",    label: "Bus",    emoji: "🚌", costPerKm: 1.5,  speed: 60  },
  { id: "train",  label: "Train",  emoji: "🚂", costPerKm: 2.0,  speed: 80  },
  { id: "car",    label: "Car",    emoji: "🚗", costPerKm: 8.0,  speed: 70  },
  { id: "flight", label: "Flight", emoji: "✈️", costPerKm: 6.0,  speed: 800 },
];

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const MapBudgetSection = ({ destination, onTravelInfoChange }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const lineRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [distance, setDistance] = useState(null);
  const [selectedMode, setSelectedMode] = useState("train");
  const [mapLoaded, setMapLoaded] = useState(false);

  const destCoords = useMemo(() =>
    CITY_COORDINATES[destination?.name] ||
    CITY_CENTERS[destination?.citySource] ||
    CITY_CENTERS[destination?.location?.city] ||
    { lat: 20.5937, lng: 78.9629 }
  , [destination]);

  // Load Leaflet
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Init map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([destCoords.lat, destCoords.lng], 8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);

    const destIcon = L.divIcon({
      html: `<div style="background:#2563eb;color:white;padding:6px 12px;border-radius:10px;font-size:13px;font-weight:bold;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.3)">📍 ${destination?.name || "Destination"}</div>`,
      className: "", iconAnchor: [0, 0],
    });
    L.marker([destCoords.lat, destCoords.lng], { icon: destIcon }).addTo(map);
    mapInstanceRef.current = map;
  }, [mapLoaded, destCoords, destination]);

  // Update map with user location
  useEffect(() => {
    if (!mapLoaded || !userLocation || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Remove old user marker and line
    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);
    if (lineRef.current) map.removeLayer(lineRef.current);

    const userIcon = L.divIcon({
      html: `<div style="background:#16a34a;color:white;padding:6px 12px;border-radius:10px;font-size:13px;font-weight:bold;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,0.3)">🏠 You</div>`,
      className: "", iconAnchor: [0, 0],
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map);

    lineRef.current = L.polyline([
      [userLocation.lat, userLocation.lng],
      [destCoords.lat, destCoords.lng]
    ], { color: "#2563eb", weight: 4, dashArray: "10, 8", opacity: 0.85 }).addTo(map);

    map.fitBounds(lineRef.current.getBounds(), { padding: [60, 60] });

    const dist = getDistance(userLocation.lat, userLocation.lng, destCoords.lat, destCoords.lng);
    setDistance(dist);
  }, [userLocation, mapLoaded, destCoords]);

  // Notify parent when travel info changes
  useEffect(() => {
    if (!distance || !onTravelInfoChange) return;
    const mode = TRAVEL_MODES.find(m => m.id === selectedMode);
    onTravelInfoChange({
      distance,
      costPerKm: mode.costPerKm,
      travelCost: Math.round(distance * mode.costPerKm),
      mode: mode.label,
      emoji: mode.emoji,
    });
  }, [distance, selectedMode, onTravelInfoChange]);

  const getUserLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported.");
      setLoadingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoadingLocation(false);
      },
      () => {
        setLocationError("Could not get location. Please allow location access.");
        setLoadingLocation(false);
      },
      { timeout: 10000 }
    );
  };

  const mode = TRAVEL_MODES.find(m => m.id === selectedMode);
  const travelCost = distance ? Math.round(distance * mode.costPerKm) : 0;
  const travelTime = distance ? Math.round(distance / mode.speed * 60) : 0;
  const travelTimeStr = travelTime > 60 ? `${Math.floor(travelTime/60)}h ${travelTime%60}m` : `${travelTime}m`;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white">
        <h3 className="font-bold text-xl">🗺️ Location & Travel Distance</h3>
        <p className="text-blue-200 text-sm mt-1">
          Click "Get My Location" to see route from your location to {destination?.name}
        </p>
      </div>

      {/* FULL WIDTH LARGE MAP */}
      <div
        ref={mapRef}
        style={{ height: "450px", width: "100%" }}
      />

      <div className="p-6 space-y-5">
        {/* Get location button */}
        {!userLocation && (
          <button
            onClick={getUserLocation}
            disabled={loadingLocation}
            className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-base shadow-md"
          >
            {loadingLocation ? (
              <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Getting your location...</>
            ) : (
              <>📍 Get My Location & Show Route</>
            )}
          </button>
        )}

        {locationError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 text-center">
            ⚠️ {locationError}
          </div>
        )}

        {/* Distance + travel info */}
        {distance && (
          <>
            {/* Distance */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
              <p className="text-sm text-blue-500 mb-1 font-medium">📏 Distance from your location</p>
              <p className="text-5xl font-bold text-blue-700">{distance.toLocaleString()}</p>
              <p className="text-blue-500 font-medium">kilometers</p>
            </div>

            {/* Travel mode */}
            <div>
              <p className="text-sm font-bold text-slate-600 mb-3">🚦 Select Travel Mode</p>
              <div className="grid grid-cols-4 gap-3">
                {TRAVEL_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    className={`py-4 rounded-2xl border-2 text-center transition-all ${
                      selectedMode === m.id
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{m.emoji}</div>
                    <div className="text-sm font-bold">{m.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">₹{m.costPerKm}/km</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cost breakdown */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
              <p className="text-sm font-bold text-slate-700 mb-4">💰 Travel Cost Breakdown</p>
              <div className="space-y-3">
                {[
                  { label: "Distance", value: `${distance.toLocaleString()} km` },
                  { label: `Cost per km (${mode.label})`, value: `₹${mode.costPerKm}` },
                  { label: "Estimated travel time", value: travelTimeStr },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-700">{item.value}</span>
                  </div>
                ))}
                <div className="border-t border-green-300 pt-3 flex justify-between items-center">
                  <span className="font-bold text-green-800 text-base">One-way travel cost</span>
                  <span className="font-bold text-green-700 text-2xl">{fmt(travelCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-800 text-base">Return journey total</span>
                  <span className="font-bold text-green-600 text-xl">{fmt(travelCost * 2)}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                * This travel cost is now included in your budget estimate below ↓
              </p>
            </div>

            {/* Destination coordinates */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
              <p className="text-xs text-slate-400">
                📍 {destination?.name} — {destCoords.lat.toFixed(4)}°N, {destCoords.lng.toFixed(4)}°E
              </p>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setUserLocation(null); setDistance(null); if (onTravelInfoChange) onTravelInfoChange(null); }}
              className="w-full py-2 text-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              🔄 Reset location
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MapBudgetSection;
