// ============================================================
// src/components/common/MeetingPointTab.js - FINAL
// Smart Meeting Point with 100+ cities + place type filter
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import api, { poiAPI } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { getSocket } from "../../utils/socketService";
import toast from "react-hot-toast";

// ── Haversine distance ───────────────────────────────────────
const HAVERSINE = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

// ── Weighted midpoint with optional destination bias ────────
const calcWeightedCenter = (locations, destination = null, destWeight = 0.3) => {
  if (!locations || locations.length === 0) return destination;
  
  const avgLat = locations.reduce((s, l) => s + (l.latitude || 0), 0) / locations.length;
  const avgLon = locations.reduce((s, l) => s + (l.longitude || 0), 0) / locations.length;
  
  if (!destination) return { latitude: avgLat, longitude: avgLon };

  // Shift toward destination by destWeight
  return {
    latitude:  avgLat * (1 - destWeight) + destination.latitude * destWeight,
    longitude: avgLon * (1 - destWeight) + destination.longitude * destWeight,
  };
};

// ── Place type config ────────────────────────────────────────
const PLACE_TYPES = [
  { id: "cafe",        label: "Cafes",         emoji: "☕", query: `"amenity"="cafe"` },
  { id: "restaurant",  label: "Restaurants",   emoji: "🍽️", query: `"amenity"="restaurant"` },
  { id: "fast_food",   label: "Fast Food",     emoji: "🍔", query: `"amenity"="fast_food"` },
  { id: "bus_station", label: "Bus Stations",  emoji: "🚌", query: `"amenity"="bus_station"` },
  { id: "station",     label: "Train Stations",emoji: "🚉", query: `"railway"="station"` },
  { id: "mall",        label: "Shopping Malls",emoji: "🏬", query: `"shop"="mall"` },
  { id: "park",        label: "Parks",         emoji: "🌳", query: `"leisure"="park"` },
  { id: "hotel",       label: "Hotels",        emoji: "🏨", query: `"tourism"="hotel"` },
];

// ── Fetch nearby places (Backend API) ────────────────────────
const fetchNearbyPlaces = async (city, latitude, longitude, placeType, radius = 5000) => {
  try {
    const res = await poiAPI.getNearbyPlaces({ city, latitude, longitude, category: placeType, radius });
    return res.data.places || [];
  } catch (err) {
    console.error("Failed to fetch nearby places", err);
    return [];
  }
};

// ── Best place algorithm (Closest to Meeting Point) ────────────
const findBestPlace = (places, bestMeetingPoint, userLocations = []) => {
  if (!places || !places.length || !bestMeetingPoint?.latitude || !bestMeetingPoint?.longitude) return null;
  let winner = null;
  let bestScore = Infinity;

  console.log(`[MeetingPoint] Scoring ${places.length} places around BMP: ${bestMeetingPoint.name}...`);

  for (const place of places) {
    if (!place?.latitude || !place?.longitude) continue;
    const dist = HAVERSINE(bestMeetingPoint.latitude, bestMeetingPoint.longitude, place.latitude, place.longitude);

    if (dist < bestScore) {
      bestScore = dist;
      const dists = userLocations.map(u => HAVERSINE(u.latitude || 0, u.longitude || 0, place.latitude, place.longitude));
      const maxDist = dists.length > 0 ? Math.max(...dists) : dist;
      const avgDist = dists.length > 0 ? Math.round(dists.reduce((a, b) => a + b, 0) / dists.length) : dist;

      winner = {
        ...place,
        latitude: place.latitude,
        longitude: place.longitude,
        maxDist,
        avgDist,
        distances: dists,
        name: place.name || "Meeting Point",
        type: place.type || "place",
      };
    }
  }
  return winner;
};

const getPlaceEmoji = (type) => {
  const map = { cafe:"☕", restaurant:"🍽️", fast_food:"🍔", bus_station:"🚌", station:"🚉", mall:"🏬", park:"🌳", hotel:"🏨" };
  return map[type] || "📍";
};

// ── 100+ Indian Cities ───────────────────────────────────────
const CITY_COORDS = {
  // Major Metro Cities
  "Mumbai":          { latitude: 19.0760, longitude: 72.8777, state: "Maharashtra" },
  "Delhi":           { latitude: 28.6139, longitude: 77.2090, state: "Delhi" },
  "Bangalore":       { latitude: 12.9716, longitude: 77.5946, state: "Karnataka" },
  "Chennai":         { latitude: 13.0827, longitude: 80.2707, state: "Tamil Nadu" },
  "Kolkata":         { latitude: 22.5726, longitude: 88.3639, state: "West Bengal" },
  "Hyderabad":       { latitude: 17.3850, longitude: 78.4867, state: "Telangana" },
  // Rajasthan
  "Jaipur":          { latitude: 26.9124, longitude: 75.7873, state: "Rajasthan" },
  "Jodhpur":         { latitude: 26.2389, longitude: 73.0243, state: "Rajasthan" },
  "Udaipur":         { latitude: 24.5854, longitude: 73.7125, state: "Rajasthan" },
  "Ajmer":           { latitude: 26.4499, longitude: 74.6399, state: "Rajasthan" },
  "Bikaner":         { latitude: 28.0229, longitude: 73.3119, state: "Rajasthan" },
  "Kota":            { latitude: 25.2138, longitude: 75.8648, state: "Rajasthan" },
  "Pushkar":         { latitude: 26.4897, longitude: 74.5511, state: "Rajasthan" },
  "Alwar":           { latitude: 27.5530, longitude: 76.6346, state: "Rajasthan" },
  // Uttar Pradesh
  "Agra":            { latitude: 27.1767, longitude: 78.0081, state: "Uttar Pradesh" },
  "Lucknow":         { latitude: 26.8467, longitude: 80.9462, state: "Uttar Pradesh" },
  "Varanasi":        { latitude: 25.3176, longitude: 82.9739, state: "Uttar Pradesh" },
  "Kanpur":          { latitude: 26.4499, longitude: 80.3319, state: "Uttar Pradesh" },
  "Allahabad":       { latitude: 25.4358, longitude: 81.8463, state: "Uttar Pradesh" },
  "Mathura":         { latitude: 27.4924, longitude: 77.6737, state: "Uttar Pradesh" },
  "Vrindavan":       { latitude: 27.5700, longitude: 77.6700, state: "Uttar Pradesh" },
  "Ayodhya":         { latitude: 26.7922, longitude: 82.1998, state: "Uttar Pradesh" },
  // Maharashtra
  "Pune":            { latitude: 18.5204, longitude: 73.8567, state: "Maharashtra" },
  "Nagpur":          { latitude: 21.1458, longitude: 79.0882, state: "Maharashtra" },
  "Nashik":          { latitude: 20.0059, longitude: 73.7897, state: "Maharashtra" },
  "Aurangabad":      { latitude: 19.8762, longitude: 75.3433, state: "Maharashtra" },
  "Solapur":         { latitude: 17.6599, longitude: 75.9064, state: "Maharashtra" },
  "Kolhapur":        { latitude: 16.7050, longitude: 74.2433, state: "Maharashtra" },
  // Gujarat
  "Ahmedabad":       { latitude: 23.0225, longitude: 72.5714, state: "Gujarat" },
  "Surat":           { latitude: 21.1702, longitude: 72.8311, state: "Gujarat" },
  "Vadodara":        { latitude: 22.3072, longitude: 73.1812, state: "Gujarat" },
  "Rajkot":          { latitude: 22.3039, longitude: 70.8022, state: "Gujarat" },
  "Bhavnagar":       { latitude: 21.7645, longitude: 72.1519, state: "Gujarat" },
  "Gandhinagar":     { latitude: 23.2156, longitude: 72.6369, state: "Gujarat" },
  // Karnataka
  "Mysore":          { latitude: 12.2958, longitude: 76.6394, state: "Karnataka" },
  "Mangalore":       { latitude: 12.9141, longitude: 74.8560, state: "Karnataka" },
  "Hubli":           { latitude: 15.3647, longitude: 75.1240, state: "Karnataka" },
  "Hampi":           { latitude: 15.3350, longitude: 76.4600, state: "Karnataka" },
  "Belgaum":         { latitude: 15.8497, longitude: 74.4977, state: "Karnataka" },
  "Coorg":           { latitude: 12.3375, longitude: 75.8069, state: "Karnataka" },
  // Tamil Nadu
  "Coimbatore":      { latitude: 11.0168, longitude: 76.9558, state: "Tamil Nadu" },
  "Madurai":         { latitude: 9.9252,  longitude: 78.1198, state: "Tamil Nadu" },
  "Ooty":            { latitude: 11.4064, longitude: 76.6932, state: "Tamil Nadu" },
  "Salem":           { latitude: 11.6643, longitude: 78.1460, state: "Tamil Nadu" },
  "Trichy":          { latitude: 10.7905, longitude: 78.7047, state: "Tamil Nadu" },
  "Vellore":         { latitude: 12.9165, longitude: 79.1325, state: "Tamil Nadu" },
  "Kanyakumari":     { latitude: 8.0883,  longitude: 77.5385, state: "Tamil Nadu" },
  // Kerala
  "Kochi":           { latitude: 9.9312,  longitude: 76.2673, state: "Kerala" },
  "Munnar":          { latitude: 10.0889, longitude: 77.0595, state: "Kerala" },
  "Thiruvananthapuram":{ latitude: 8.5241, longitude: 76.9366, state: "Kerala" },
  "Kozhikode":       { latitude: 11.2588, longitude: 75.7804, state: "Kerala" },
  "Alleppey":        { latitude: 9.4981,  longitude: 76.3388, state: "Kerala" },
  "Thrissur":        { latitude: 10.5276, longitude: 76.2144, state: "Kerala" },
  "Wayanad":         { latitude: 11.6854, longitude: 76.1320, state: "Kerala" },
  // Goa
  "Goa":             { latitude: 15.2993, longitude: 74.1240, state: "Goa" },
  "Panaji":          { latitude: 15.4909, longitude: 73.8278, state: "Goa" },
  "Margao":          { latitude: 15.2832, longitude: 74.0185, state: "Goa" },
  // Madhya Pradesh
  "Indore":          { latitude: 22.7196, longitude: 75.8577, state: "Madhya Pradesh" },
  "Bhopal":          { latitude: 23.2599, longitude: 77.4126, state: "Madhya Pradesh" },
  "Gwalior":         { latitude: 26.2183, longitude: 78.1828, state: "Madhya Pradesh" },
  "Jabalpur":        { latitude: 23.1815, longitude: 79.9864, state: "Madhya Pradesh" },
  "Khajuraho":       { latitude: 24.8318, longitude: 79.9199, state: "Madhya Pradesh" },
  "Ujjain":          { latitude: 23.1828, longitude: 75.7772, state: "Madhya Pradesh" },
  // West Bengal
  "Darjeeling":      { latitude: 27.0410, longitude: 88.2663, state: "West Bengal" },
  "Siliguri":        { latitude: 26.7271, longitude: 88.3953, state: "West Bengal" },
  "Durgapur":        { latitude: 23.5204, longitude: 87.3119, state: "West Bengal" },
  // Andhra Pradesh
  "Visakhapatnam":   { latitude: 17.6868, longitude: 83.2185, state: "Andhra Pradesh" },
  "Vijayawada":      { latitude: 16.5062, longitude: 80.6480, state: "Andhra Pradesh" },
  "Tirupati":        { latitude: 13.6288, longitude: 79.4192, state: "Andhra Pradesh" },
  // Telangana
  "Warangal":        { latitude: 17.9784, longitude: 79.5941, state: "Telangana" },
  // Punjab
  "Amritsar":        { latitude: 31.6340, longitude: 74.8723, state: "Punjab" },
  "Chandigarh":      { latitude: 30.7333, longitude: 76.7794, state: "Punjab" },
  "Ludhiana":        { latitude: 30.9010, longitude: 75.8573, state: "Punjab" },
  "Jalandhar":       { latitude: 31.3260, longitude: 75.5762, state: "Punjab" },
  // Himachal Pradesh
  "Shimla":          { latitude: 31.1048, longitude: 77.1734, state: "Himachal Pradesh" },
  "Manali":          { latitude: 32.2396, longitude: 77.1887, state: "Himachal Pradesh" },
  "Dharamsala":      { latitude: 32.2190, longitude: 76.3234, state: "Himachal Pradesh" },
  "Kullu":           { latitude: 31.9581, longitude: 77.1095, state: "Himachal Pradesh" },
  "Kasauli":         { latitude: 30.8990, longitude: 76.9665, state: "Himachal Pradesh" },
  // Uttarakhand
  "Dehradun":        { latitude: 30.3165, longitude: 78.0322, state: "Uttarakhand" },
  "Rishikesh":       { latitude: 30.0869, longitude: 78.2676, state: "Uttarakhand" },
  "Haridwar":        { latitude: 29.9457, longitude: 78.1642, state: "Uttarakhand" },
  "Nainital":        { latitude: 29.3919, longitude: 79.4542, state: "Uttarakhand" },
  "Mussoorie":       { latitude: 30.4598, longitude: 78.0664, state: "Uttarakhand" },
  "Jim Corbett":     { latitude: 29.5300, longitude: 78.7747, state: "Uttarakhand" },
  // Bihar & Jharkhand
  "Patna":           { latitude: 25.5941, longitude: 85.1376, state: "Bihar" },
  "Gaya":            { latitude: 24.7955, longitude: 84.9994, state: "Bihar" },
  "Ranchi":          { latitude: 23.3441, longitude: 85.3096, state: "Jharkhand" },
  "Jamshedpur":      { latitude: 22.8046, longitude: 86.2029, state: "Jharkhand" },
  // Odisha
  "Bhubaneswar":     { latitude: 20.2961, longitude: 85.8245, state: "Odisha" },
  "Puri":            { latitude: 19.8135, longitude: 85.8312, state: "Odisha" },
  "Cuttack":         { latitude: 20.4625, longitude: 85.8830, state: "Odisha" },
  // Assam & NE
  "Guwahati":        { latitude: 26.1445, longitude: 91.7362, state: "Assam" },
  "Shillong":        { latitude: 25.5788, longitude: 91.8933, state: "Meghalaya" },
  "Imphal":          { latitude: 24.8170, longitude: 93.9368, state: "Manipur" },
  "Agartala":        { latitude: 23.8315, longitude: 91.2868, state: "Tripura" },
  // Jammu & Kashmir
  "Srinagar":        { latitude: 34.0837, longitude: 74.7973, state: "J&K" },
  "Jammu":           { latitude: 32.7266, longitude: 74.8570, state: "J&K" },
  "Leh":             { latitude: 34.1526, longitude: 77.5771, state: "Ladakh" },
  // Chhattisgarh
  "Raipur":          { latitude: 21.2514, longitude: 81.6296, state: "Chhattisgarh" },
  // Haryana
  "Gurugram":        { latitude: 28.4595, longitude: 77.0266, state: "Haryana" },
  "Faridabad":       { latitude: 28.4089, longitude: 77.3178, state: "Haryana" },
  "Ambala":          { latitude: 30.3782, longitude: 76.7767, state: "Haryana" },
};

// Group cities by state for dropdown
const CITIES_BY_STATE = Object.entries(CITY_COORDS).reduce((acc, [city, data]) => {
  const state = data.state;
  if (!acc[state]) acc[state] = [];
  acc[state].push(city);
  return acc;
}, {});

// Function to refine meeting coordinate with offsets to minimize max distance
const refineMeetingCoordinate = (cityLat, cityLon, userLocations) => {
  const offsets = [-0.05, -0.025, 0, 0.025, 0.05];
  let bestCoord = { latitude: cityLat, longitude: cityLon };
  let minMaxDist = Infinity;

  console.log(`[MeetingPoint] Original Midpoint (City): ${cityLat}, ${cityLon}`);

  if (!userLocations || userLocations.length === 0) return bestCoord;

  for (const latOffset of offsets) {
    for (const lonOffset of offsets) {
      const candLat = cityLat + latOffset;
      const candLon = cityLon + lonOffset;
      
      const distances = userLocations.map(u => 
        HAVERSINE(u.latitude || 0, u.longitude || 0, candLat, candLon)
      );
      
      const maxDist = Math.max(...distances);
      
      console.log(`[MeetingPoint] Candidate offset (${latOffset}, ${lonOffset}): (${candLat.toFixed(4)}, ${candLon.toFixed(4)}) - MaxDist: ${maxDist}km`);

      if (maxDist < minMaxDist) {
        minMaxDist = maxDist;
        bestCoord = { latitude: candLat, longitude: candLon };
      }
    }
  }

  console.log(`[MeetingPoint] Final Refined Coordinate: ${bestCoord.latitude.toFixed(4)}, ${bestCoord.longitude.toFixed(4)} (MinMaxDist: ${minMaxDist}km)`);
  return bestCoord;
};


const MeetingPointTab = ({ tripId, tripMembers }) => {
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [locationMode, setLocationMode] = useState("gps");
  const [sharingManual, setSharingManual] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [bestPlace, setBestPlace] = useState(null);
  const [fetchingPlaces, setFetchingPlaces] = useState(false);
  const [selectedPlaceType, setSelectedPlaceType] = useState("cafe");
  // eslint-disable-next-line no-unused-vars
  const [destCity, setDestCity] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [destWeight, setDestWeight] = useState(0.3);
  // eslint-disable-next-line no-unused-vars
  const [showBiasInfo, setShowBiasInfo] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const myId = (user?._id || user?.id || "").toString();

  // Admin = ONLY the trip creator (first member = creator)
  // tripMembers[0] is always the creator since they're added first
  const tripCreatorId = tripMembers?.[0]?.user?.toString() || "";
  const isAdmin = tripCreatorId === myId;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPoll(); }, [tripId]);

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

  // Map initialization
  useEffect(() => {
    if (!mapLoaded || !poll?.result?.latitude || !mapRef.current) return;
    const timer = setTimeout(() => {
      if (!mapRef.current) return;
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
      const L = window.L;
      if (!L) return;
      const map = L.map(mapRef.current).setView([poll.result.latitude, poll.result.longitude], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map);

      // Meeting city marker
      const cityIcon = L.divIcon({
        html: `<div style="background:#7c3aed;color:white;padding:8px 12px;border-radius:12px;font-size:13px;font-weight:bold;white-space:nowrap;box-shadow:0 4px 12px rgba(124,58,237,0.4)">⭐ ${poll.result.city}</div>`,
        className: "", iconAnchor: [0, 0],
      });
      L.marker([poll.result.latitude, poll.result.longitude], { icon: cityIcon }).addTo(map);
      const allPoints = [[poll.result.latitude, poll.result.longitude]];

      // Best place marker
      if (bestPlace?.latitude) {
        const placeIcon = L.divIcon({
          html: `<div style="background:#f59e0b;color:white;padding:8px 12px;border-radius:12px;font-size:13px;font-weight:bold;white-space:nowrap;box-shadow:0 4px 12px rgba(245,158,11,0.5)">${getPlaceEmoji(bestPlace.type)} ${bestPlace.name}</div>`,
          className: "", iconAnchor: [0, 0],
        });
        L.marker([bestPlace.latitude, bestPlace.longitude], { icon: placeIcon }).addTo(map);
        allPoints.push([bestPlace.latitude, bestPlace.longitude]);
      }
      
      // Other nearby places markers
      (nearbyPlaces || []).forEach((place, i) => {
        if (!place.latitude || !place.longitude || place.name === bestPlace?.name) return;
        const placeIcon = L.divIcon({
          html: `<div style="background:#fbbf24;color:white;padding:5px 8px;border-radius:8px;font-size:11px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 6px rgba(251,191,36,0.3);opacity:0.8">${getPlaceEmoji(place.type)} ${place.name}</div>`,
          className: "", iconAnchor: [0, 0],
        });
        L.marker([place.latitude, place.longitude], { icon: placeIcon }).addTo(map);
        allPoints.push([place.latitude, place.longitude]);
      });

      // Member markers
      (poll.locations || []).forEach(loc => {
        if (!loc.latitude || !loc.longitude) return;
        const memberIcon = L.divIcon({
          html: `<div style="background:#2563eb;color:white;padding:6px 10px;border-radius:10px;font-size:12px;font-weight:bold;white-space:nowrap;box-shadow:0 3px 8px rgba(37,99,235,0.3)">📍 ${loc.userName}${loc.city ? ` (${loc.city})` : ""}</div>`,
          className: "", iconAnchor: [0, 0],
        });
        L.marker([loc.latitude, loc.longitude], { icon: memberIcon }).addTo(map);
        L.polyline([[loc.latitude, loc.longitude], [poll.result.latitude, poll.result.longitude]], {
          color: "#7c3aed", weight: 2, dashArray: "6,4", opacity: 0.7
        }).addTo(map);
        allPoints.push([loc.latitude, loc.longitude]);
      });

      if (allPoints.length > 1) {
        try { map.fitBounds(allPoints, { padding: [50, 50] }); } catch(e) {}
      }
      mapInstanceRef.current = map;
    }, 300);
    return () => clearTimeout(timer);
  }, [mapLoaded, poll, bestPlace, tripMembers, nearbyPlaces]);

  const fetchPoll = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/meeting-polls/trip/${tripId}`);
      setPoll(res.data.poll);
    } catch { setPoll(null); }
    finally { setLoading(false); }
  };

  const handleStartPoll = async () => {
    if (!isAdmin) {
      toast.error("Only the trip creator can start a meeting poll!");
      return;
    }
    try {
      const res = await api.post("/meeting-polls", { tripId });
      setPoll(res.data.poll);
      setBestPlace(null);
      setNearbyPlaces([]);
      toast.success("Meeting poll started! 📍");
      const socket = getSocket();
      if (socket?.connected) socket.emit("group_updated", { tripId, updatedBy: user?.name, changes: "started a meeting point poll 📍" });
    } catch (err) { toast.error(err.response?.data?.message || "Could not start poll."); }
  };

  const handleShareGPS = () => {
    if (!navigator.geolocation) { toast.error("Geolocation not supported."); return; }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await api.post(`/meeting-polls/${poll._id}/location`, { latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setPoll(res.data.poll);
          toast.success("GPS location shared! ✅");
          const socket = getSocket();
          if (socket?.connected) socket.emit("group_updated", { tripId, updatedBy: user?.name, changes: `shared GPS location (${res.data.locationsCount} members done)` });
        } catch (err) { toast.error(err.response?.data?.message || "Could not share."); }
        finally { setGettingLocation(false); }
      },
      () => { toast.error("Could not get location. Allow location access."); setGettingLocation(false); },
      { timeout: 10000 }
    );
  };

  const handleShareManual = async () => {
    if (!selectedCity) { toast.error("Please select a city!"); return; }
    const coords = CITY_COORDS[selectedCity];
    if (!coords) { toast.error("City not found!"); return; }
    setSharingManual(true);
    try {
      const res = await api.post(`/meeting-polls/${poll._id}/location`, { latitude: coords.latitude, longitude: coords.longitude, city: selectedCity });
      setPoll(res.data.poll);
      toast.success(`✅ Location set to ${selectedCity}!`);
      const socket = getSocket();
      if (socket?.connected) socket.emit("group_updated", { tripId, updatedBy: user?.name, changes: `shared location from ${selectedCity} (${res.data.locationsCount} members done)` });
    } catch (err) { toast.error(err.response?.data?.message || "Could not share."); }
    finally { setSharingManual(false); }
  };

  const handleCalculate = async () => {
    if (!poll?._id) return;
    if ((poll.locations?.length || 0) < 2) {
      toast.error("⚠️ At least 2 users must share their location first!");
      return;
    }
    if (!isAdmin) {
      toast.error("Only the poll creator can calculate the meeting point!");
      return;
    }
    setCalculating(true);
    try {
      const destCoords = destCity ? CITY_COORDS[destCity] : null;

      if (destCoords) {
        // ── BIASED CALCULATION (frontend only) ──────────────
        // Don't use backend result — calculate with weighted center
        const weightedCenter = calcWeightedCenter(poll.locations, destCoords, destWeight);

        // Find nearest Indian city to weighted center
        const INDIAN_CITIES = Object.entries(CITY_COORDS).map(([name, c]) => ({
          city: name, state: c.state, latitude: c.latitude, longitude: c.longitude
        }));
        let nearest = null;
        let minDist = Infinity;
        for (const city of INDIAN_CITIES) {
          const d = HAVERSINE(weightedCenter.latitude, weightedCenter.longitude, city.latitude, city.longitude);
          if (d < minDist) { minDist = d; nearest = city; }
        }

        const avgDist = nearest
          ? Math.round(poll.locations.reduce((s, l) => s + HAVERSINE(l.latitude || 0, l.longitude || 0, nearest.latitude, nearest.longitude), 0) / (poll.locations.length || 1))
          : 0;

        // Update poll result locally (don't save to backend)
        const biasedPoll = {
          ...poll,
          status: "completed",
          result: { city: nearest.city, state: nearest.state, latitude: nearest.latitude, longitude: nearest.longitude, avgDist },
        };
        setPoll(biasedPoll);
        toast.success(`🎯 Biased meeting point: ${nearest.city} (shifted ${Math.round(destWeight * 100)}% toward ${destCity})!`);

        // FETCH PLACES AT THE CITY COORDINATES
        setFetchingPlaces(true);
        const refinedCoord = refineMeetingCoordinate(nearest.latitude, nearest.longitude, poll.locations);
        const bestMeetingPoint = {
          name: nearest.city,
          latitude: refinedCoord.latitude,
          longitude: refinedCoord.longitude
        };
        console.log(`[MeetingPoint] BMP Name: ${bestMeetingPoint.name}`);
        console.log(`[MeetingPoint] BMP Coords: ${bestMeetingPoint.latitude}, ${bestMeetingPoint.longitude}`);
        console.log(`[MeetingPoint] Fetching nearby using coords: ${bestMeetingPoint.latitude}, ${bestMeetingPoint.longitude}`);

        const places = await fetchNearbyPlaces(bestMeetingPoint.name, bestMeetingPoint.latitude, bestMeetingPoint.longitude, selectedPlaceType, 10000);
        console.log(`[MeetingPoint] BIASED: Fetched ${places?.length || 0} places.`);
        if (places && places.length > 0) {
          const best = findBestPlace(places, bestMeetingPoint, poll.locations);
          setBestPlace(best);
          setNearbyPlaces(places.slice(0, 6));
        }
        setFetchingPlaces(false);


      } else {
        // ── NORMAL CALCULATION (backend) ─────────────────────
        const res = await api.post(`/meeting-polls/${poll._id}/calculate`);
        setPoll(res.data.poll);
        toast.success(`🎯 Best meeting point: ${res.data.result.city}!`);

        setFetchingPlaces(true);
        const meetingResult = res.data?.poll?.result;
        const refinedCoord = refineMeetingCoordinate(meetingResult.latitude, meetingResult.longitude, res.data?.poll?.locations);
        const bestMeetingPoint = {
          name: meetingResult.city,
          latitude: refinedCoord.latitude,
          longitude: refinedCoord.longitude
        };
        console.log(`[MeetingPoint] BMP Name: ${bestMeetingPoint.name}`);
        console.log(`[MeetingPoint] BMP Coords: ${bestMeetingPoint.latitude}, ${bestMeetingPoint.longitude}`);
        console.log(`[MeetingPoint] Fetching nearby using coords: ${bestMeetingPoint.latitude}, ${bestMeetingPoint.longitude}`);

        const places = await fetchNearbyPlaces(bestMeetingPoint.name, bestMeetingPoint.latitude, bestMeetingPoint.longitude, selectedPlaceType, 10000);
        console.log(`[MeetingPoint] NORMAL: Fetched ${places?.length || 0} places.`);
        if (places && places.length > 0) {
          const best = findBestPlace(places, bestMeetingPoint, res.data?.poll?.locations || poll.locations);
          setBestPlace(best);
          setNearbyPlaces(places.slice(0, 6));
        }
        setFetchingPlaces(false);
      }

      const socket = getSocket();
      if (socket?.connected) socket.emit("group_updated", {
        tripId, updatedBy: user?.name,
        changes: destCity
          ? `calculated biased meeting point toward ${destCity}`
          : `calculated meeting point`,
      });
    } catch (err) { toast.error(err.response?.data?.message || "Could not calculate."); }
    finally { setCalculating(false); }
  };

  const handleSearchPlaces = async () => {
    if (!poll?.result?.latitude) return;
    setFetchingPlaces(true);
    setBestPlace(null);
    setNearbyPlaces([]);
    
    console.log(`[MeetingPoint] SEARCH: Selected City: ${poll.result.city}`);
    const refinedCoord = refineMeetingCoordinate(poll.result.latitude, poll.result.longitude, poll.locations);
    const bestMeetingPoint = {
      name: poll.result.city,
      latitude: refinedCoord.latitude,
      longitude: refinedCoord.longitude
    };
    console.log(`[MeetingPoint] BMP Name: ${bestMeetingPoint.name}`);
    console.log(`[MeetingPoint] BMP Coords: ${bestMeetingPoint.latitude}, ${bestMeetingPoint.longitude}`);
    console.log(`[MeetingPoint] Fetching nearby using coords: ${bestMeetingPoint.latitude}, ${bestMeetingPoint.longitude}`);

    const places = await fetchNearbyPlaces(bestMeetingPoint.name, bestMeetingPoint.latitude, bestMeetingPoint.longitude, selectedPlaceType, 10000);
    console.log(`[MeetingPoint] SEARCH: Fetched ${places?.length || 0} places.`);
    
    if (places && places.length > 0) {
      const best = findBestPlace(places, bestMeetingPoint, poll.locations);
      setBestPlace(best);
      setNearbyPlaces(places.slice(0, 6));
      toast.success(`Found ${places.length} places!`);
    } else {
      toast.error("No places found nearby. Try a different type.");
    }
    setFetchingPlaces(false);
  };

  // Debounced search when place type changes
  useEffect(() => {
    if (!poll?.result?.latitude) return;
    const timer = setTimeout(() => {
      handleSearchPlaces();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlaceType]);

  const handleCancelPoll = async () => {
    if (!window.confirm("Cancel this meeting poll?")) return;
    try {
      await api.delete(`/meeting-polls/${poll._id}`);
      setPoll(null); setBestPlace(null); setNearbyPlaces([]);
      toast.success("Poll cancelled.");
    } catch { toast.error("Could not cancel."); }
  };

  const hasShared = poll?.locations?.some(l => l.userId === myId);
  const totalMembers = tripMembers?.length || 1;

  if (loading) return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
      <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );

  return (
    <div className="space-y-4">

      {/* No active poll */}
      {!poll && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
            <h3 className="font-bold text-xl">📌 Meeting Point Calculator</h3>
            <p className="text-violet-200 text-sm mt-1">Find the best place for everyone to meet!</p>
          </div>
          <div className="p-8 text-center space-y-4">
            <div className="text-6xl">📍</div>
            <h4 className="font-bold text-slate-700 text-lg">No active poll</h4>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Start a poll — members share their location and the system finds the best meeting place!
            </p>
            {isAdmin ? (
              <button onClick={handleStartPoll}
                className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-500/25">
                📍 Start Meeting Poll
              </button>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 text-slate-500 text-sm">
                ⏳ Waiting for group admin to start the poll...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active poll */}
      {poll && poll.status === "active" && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xl">📌 Meeting Poll Active</h3>
                <p className="text-violet-200 text-sm mt-0.5">
                  {poll.locations?.length || 0}/{totalMembers} shared · By {poll.createdByName}
                  {isAdmin && <span className="ml-2 bg-amber-400/30 text-amber-200 text-xs px-2 py-0.5 rounded-full">👑 You're Admin</span>}
                </p>
              </div>
              <div className="bg-green-400/20 border border-green-400/30 rounded-full px-3 py-1">
                <span className="text-green-300 text-xs font-bold">● LIVE</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="bg-white/20 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((poll.locations?.length || 0) / totalMembers) * 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {!hasShared ? (
              <div className="space-y-3">
                {/* Mode toggle */}
                <div className="flex gap-2 bg-slate-100 rounded-xl p-1">
                  <button onClick={() => setLocationMode("gps")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${locationMode === "gps" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}>
                    📡 Use GPS
                  </button>
                  <button onClick={() => setLocationMode("manual")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${locationMode === "manual" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}>
                    🏙️ Select City
                  </button>
                </div>

                {/* GPS */}
                {locationMode === "gps" && (
                  <button onClick={handleShareGPS} disabled={gettingLocation}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                    {gettingLocation ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Getting location...</> : <>📡 Share My GPS Location</>}
                  </button>
                )}

                {/* Manual — with state grouped dropdown */}
                {locationMode === "manual" && (
                  <div className="space-y-2">
                    <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400 bg-white">
                      <option value="">📍 Select your current city...</option>
                      {Object.entries(CITIES_BY_STATE).sort(([a], [b]) => a.localeCompare(b)).map(([state, cities]) => (
                        <optgroup key={state} label={`— ${state} —`}>
                          {cities.sort().map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <button onClick={handleShareManual} disabled={sharingManual || !selectedCity}
                      className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                      {sharingManual ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sharing...</> : <>🏙️ Share as {selectedCity || "Selected City"}</>}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full py-4 bg-green-50 border-2 border-green-200 text-green-700 font-bold rounded-xl text-center">
                ✅ You shared your location!
                <p className="text-xs font-normal text-green-600 mt-1">
                  {poll.locations?.find(l => l.userId === myId)?.city
                    ? `📍 ${poll.locations.find(l => l.userId === myId).city}`
                    : "GPS location shared"}
                </p>
              </div>
            )}

            {/* Members list */}
            {poll.locations?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Shared locations:</p>
                {poll.locations.map((loc, i) => (
                  <div key={i} className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-2.5 border border-green-100">
                    <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center font-bold text-green-800 text-sm">
                      {loc.userName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        {loc.userName}
                        {loc.userId === myId && <span className="text-xs text-blue-500 ml-1">(You)</span>}
                        {loc.userId !== myId && <span className="text-xs text-slate-300 ml-1">#{loc.userId?.slice(-4)}</span>}
                      </p>
                      <p className="text-xs text-slate-400">
                        {loc.city ? `📍 ${loc.city}` : `${loc.latitude?.toFixed(3) || 0}°N, ${loc.longitude?.toFixed(3) || 0}°E`}
                      </p>
                      {loc.sharedAt && (
                        <p className="text-xs text-slate-300">
                          Updated: {new Date(loc.sharedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </p>
                      )}
                    </div>
                    <span className="text-green-500 text-lg">✅</span>
                  </div>
                ))}
                {tripMembers?.filter(m => !poll.locations.find(l => l.userId === (m.user?._id || m.user)?.toString())).map((m, i) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100 opacity-60">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm">{m.name?.charAt(0).toUpperCase()}</div>
                    <p className="text-sm text-slate-500">{m.name}</p>
                    <span className="ml-auto text-slate-400 text-xs">Waiting...</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── DESTINATION BIAS — ADMIN ONLY ── */}
            {isAdmin && poll.locations?.length >= 1 && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-blue-700">
                    🎯 Destination Bias
                    <span className="text-xs font-normal text-blue-400 ml-1">(optional)</span>
                  </p>
                  <button
                    onClick={() => setShowBiasInfo(s => !s)}
                    className="text-xs text-blue-400 hover:text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    {showBiasInfo ? "hide" : "what's this?"}
                  </button>
                </div>

                {showBiasInfo && (
                  <p className="text-xs text-blue-500 bg-blue-100 rounded-lg p-2">
                    Shift the meeting point toward a preferred destination. Higher weight = closer to that city. Leave empty for fair center point.
                  </p>
                )}

                <select
                  value={destCity}
                  onChange={e => setDestCity(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-blue-200 text-sm outline-none focus:border-blue-400 bg-white">
                  <option value="">No bias — find fair center</option>
                  {Object.entries(CITIES_BY_STATE).sort(([a],[b]) => a.localeCompare(b)).map(([state, cities]) => (
                    <optgroup key={state} label={`— ${state} —`}>
                      {cities.sort().map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>

                {destCity && (
                  <div>
                    <div className="flex justify-between text-xs text-blue-600 mb-1.5">
                      <span>Shift toward {destCity}</span>
                      <span className="font-bold">{Math.round(destWeight * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0.1" max="0.7" step="0.1"
                      value={destWeight}
                      onChange={e => setDestWeight(parseFloat(e.target.value))}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-blue-400 mt-1">
                      <span>Slight (10%)</span>
                      <span>Moderate (40%)</span>
                      <span>Strong (70%)</span>
                    </div>
                    <p className="text-xs text-blue-500 mt-2 text-center bg-blue-100 rounded-lg py-1.5">
                      📍 Meeting point will shift {Math.round(destWeight * 100)}% toward {destCity}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Place type selector + calculate */}
            {poll.locations?.length >= 1 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Find meeting place type:</p>
                <div className="grid grid-cols-4 gap-2">
                  {PLACE_TYPES.map(type => (
                    <button key={type.id} onClick={() => setSelectedPlaceType(type.id)}
                      className={`py-3 rounded-xl text-center border-2 transition-all ${selectedPlaceType === type.id ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"}`}>
                      <div className="text-xl">{type.emoji}</div>
                      <div className="text-xs font-medium mt-1">{type.label}</div>
                    </button>
                  ))}
                </div>
                {/* Min 2 users warning */}
                {(poll.locations?.length || 0) < 2 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-amber-700 font-medium">
                      ⚠️ {poll.locations?.length || 0}/2 users shared location
                    </p>
                    <p className="text-xs text-amber-500 mt-0.5">At least 2 users required to calculate</p>
                  </div>
                )}

                {/* Calculate — admin only */}
                {isAdmin ? (
                  <button
                    onClick={handleCalculate}
                    disabled={calculating || (poll.locations?.length || 0) < 2}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    {calculating
                      ? <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Calculating...</>
                      : <>🎯 Find Best Meeting Point ({poll.locations?.length || 0}/{totalMembers} shared)</>}
                  </button>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <p className="text-sm text-slate-500">⏳ Waiting for admin to calculate meeting point...</p>
                    <p className="text-xs text-slate-400 mt-0.5">{poll.locations?.length || 0}/{totalMembers} members shared location</p>
                  </div>
                )}
              </div>
            )}

            {isAdmin && (
              <button onClick={handleCancelPoll} className="w-full py-2 text-sm text-slate-400 hover:text-red-500 transition-colors">
                Cancel Poll
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed poll results */}
      {poll && poll.status === "completed" && poll.result && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-5 text-white">
              <h3 className="font-bold text-xl">🎯 Meeting Point Found!</h3>
              <p className="text-violet-200 text-sm mt-0.5">Based on {poll.locations?.length} member locations</p>
            </div>
            <div className="p-5 space-y-4">

              {/* Best city */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100 text-center">
                <p className="text-xs text-violet-500 font-medium mb-1">Best Meeting City</p>
                <p className="text-4xl font-bold text-violet-700">{poll.result.city}</p>
                <p className="text-violet-500 font-medium">{poll.result.state}</p>
                <p className="text-xs text-slate-400 mt-2">Average distance: <span className="font-bold text-slate-600">{poll.result.avgDist} km</span></p>
                {destCity && (
                  <p className="text-xs text-blue-500 mt-1 bg-blue-50 rounded-full px-3 py-1 inline-block">
                    🎯 Shifted {Math.round(destWeight * 100)}% toward {destCity}
                  </p>
                )}
              </div>

              {/* Place type search */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Search for nearby:</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {PLACE_TYPES.map(type => (
                    <button key={type.id} onClick={() => setSelectedPlaceType(type.id)}
                      className={`py-2.5 rounded-xl text-center border-2 transition-all ${selectedPlaceType === type.id ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:border-violet-300"}`}>
                      <div className="text-lg">{type.emoji}</div>
                      <div className="text-xs mt-0.5">{type.label}</div>
                    </button>
                  ))}
                </div>
                <button onClick={handleSearchPlaces} disabled={fetchingPlaces}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm">
                  {fetchingPlaces ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Searching...</> : <>🔍 Search {PLACE_TYPES.find(t => t.id === selectedPlaceType)?.label}</>}
                </button>
              </div>

              {/* Best place result */}
              {bestPlace && !fetchingPlaces && (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-600 uppercase mb-2">🏆 Best Meeting Place</p>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{getPlaceEmoji(bestPlace.type)}</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{bestPlace.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{bestPlace.type?.replace("_", " ")}</p>
                      <div className="flex gap-4 mt-1">
                        <div><p className="text-xs text-slate-400">Max dist</p><p className="text-sm font-bold text-amber-700">{bestPlace.maxDist} km</p></div>
                        <div><p className="text-xs text-slate-400">Avg dist</p><p className="text-sm font-bold text-amber-700">{bestPlace.avgDist} km</p></div>
                      </div>
                    </div>
                  </div>
                  {poll.locations.map((loc, i) => {
                    const dist = bestPlace.distances?.[i] ?? HAVERSINE(loc.latitude || 0, loc.longitude || 0, bestPlace.latitude || 0, bestPlace.longitude || 0);
                    return (
                      <div key={i} className="flex justify-between text-sm py-1 border-b border-amber-100 last:border-0">
                        <span className="text-slate-600">📍 {loc.userName} {loc.city ? `(${loc.city})` : ""}</span>
                        <span className="font-bold text-amber-700">{dist} km</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Nearby places list */}
              {nearbyPlaces.length > 0 && !fetchingPlaces && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">📋 Nearby Options</p>
                  <div className="space-y-2">
                    {nearbyPlaces.map((place, i) => {
                      const dists = (poll.locations || []).map(u => HAVERSINE(u?.latitude || 0, u?.longitude || 0, place?.latitude || 0, place?.longitude || 0));
                      const avgD = Math.round(dists.reduce((a, b) => a + b, 0) / (dists.length || 1));
                      const isWinner = bestPlace?.name === place.name;
                      return (
                        <div key={i} className={`flex items-center justify-between rounded-xl px-4 py-3 border ${isWinner ? "bg-amber-50 border-amber-300" : "bg-slate-50 border-slate-100"}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getPlaceEmoji(place.type)}</span>
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{place.name}</p>
                              <p className="text-xs text-slate-400 capitalize">{place.type?.replace("_", " ") || "place"}</p>
                            </div>
                            {isWinner && <span className="text-xs bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full ml-1">Best ✓</span>}
                          </div>
                          <span className="text-sm font-bold text-violet-700">{avgD} km</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No places found */}
              {!fetchingPlaces && nearbyPlaces.length === 0 && poll.status === "completed" && (
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                  <p className="text-sm text-slate-500">No places found. Try a different type or search again.</p>
                </div>
              )}

              {/* Member distances */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Distance per member:</p>
                {poll.locations.map((loc, i) => {
                  const dist = HAVERSINE(loc.latitude || 0, loc.longitude || 0, poll.result.latitude || 0, poll.result.longitude || 0);
                  return (
                    <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center font-bold text-violet-700 text-sm">
                          {loc.userName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                        {loc.userName}
                        <span className="text-xs text-slate-300 ml-1">#{loc.userId?.slice(-4)}</span>
                      </p>
                          {loc.city && <p className="text-xs text-slate-400">📍 From {loc.city}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-violet-700">{dist === 0 ? "< 1" : dist} km</span>
                        <p className="text-xs text-slate-400">to {poll.result.city}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={handleStartPoll}
                className="w-full py-2.5 border border-violet-200 text-violet-600 text-sm font-semibold rounded-xl hover:bg-violet-50 transition-colors">
                🔄 Start New Poll
              </button>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h4 className="font-bold text-slate-800">🗺️ Meeting Point Map</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                🔵 Members · ⭐ Meeting city · 🟡 Best place
              </p>
            </div>
            <div ref={mapRef} style={{ height: "400px", width: "100%" }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingPointTab;
