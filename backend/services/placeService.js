// ============================================================
// backend/services/placeService.js - Dynamic Fallback System
// ============================================================

const axios = require("axios");
const Place = require("../models/Place");

// ── Overpass Config ──────────────────────────────────────────
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://z.overpass-api.de/api/interpreter"
];
const MAX_TO_STORE = 10; // Cache limit per city/category

/**
 * Resilient Overpass API fetcher with automatic mirror failover.
 */
const fetchFromOverpass = async (query, timeout = 15000) => {
  let lastError;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const response = await axios.post(url, query, {
        headers: { "Content-Type": "text/plain" },
        timeout
      });
      return response.data;
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      // Log silently and rotate if it's a rate limit (429) or timeout (504, etc)
      if (status === 429 || status === 504 || err.code === 'ECONNABORTED') {
        console.warn(`    [Overpass Mirror] ${url} failed (${status || 'timeout'}). Trying next...`);
        continue;
      }
      throw err; // Throw immediately for hard errors (e.g. bad request)
    }
  }
  throw lastError; // All mirrors failed
};

// ── Place type to Overpass tag mapping ───────────────────────
const CATEGORY_TAGS = {
  cafe: '"amenity"="cafe"',
  restaurant: '"amenity"="restaurant"',
  fast_food: '"amenity"="fast_food"',
  bus_station: '"amenity"="bus_station"',
  station: '"railway"="station"',
  railway_station: '"railway"="station"',
  mall: '"shop"="mall"',
  park: '"leisure"="park"',
  hotel: '"tourism"="hotel"',
};

// ── In-memory cache for DB results (per city) ───────────────
const dbCache = new Map();
const DB_CACHE_TTL = 1000 * 60 * 60; // 1 hour

// ── Category alias map ──────────────────────────────────────
// Maps Overpass category ids → Place model category values.
// "station" in the POI controller maps to "railway_station" in DB.
const CATEGORY_ALIAS = {
  station: "railway_station",
};

/**
 * Resolve the canonical DB category for a given POI category id.
 */
const resolveCategory = (category) => CATEGORY_ALIAS[category] || category;

/**
 * Fetch fallback places from MongoDB for a given city + category.
 * Results are cached per city+category key to avoid repeated queries.
 *
 * @param {string} city     - City name (e.g. "Mysore", "Chennai")
 * @param {string} category - POI category id (e.g. "cafe", "station")
 * @returns {Array}         - Array of normalised place objects
 */
const getFallbackPlaces = async (city, category) => {
  const dbCategory = resolveCategory(category);
  const cacheKey = `${city}_${dbCategory}`;

  // Check cache
  if (dbCache.has(cacheKey)) {
    const cached = dbCache.get(cacheKey);
    if (Date.now() - cached.timestamp < DB_CACHE_TTL) {
      return cached.data;
    }
    dbCache.delete(cacheKey);
  }

  // Query DB — case-insensitive city match
  const places = await Place.find({
    city: { $regex: new RegExp(`^${city}$`, "i") },
    category: dbCategory,
  }).lean();

  // Normalise to the unified structure
  const normalised = places.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    latitude: p.latitude,
    longitude: p.longitude,
    type: p.category,
    distance: null, // Distance can be computed by caller if needed
    source: "db",
  }));

  // Cache it
  dbCache.set(cacheKey, { timestamp: Date.now(), data: normalised });
  return normalised;
};

/**
 * Normalise an Overpass API result into the unified structure.
 * Adds `source: "api"` so consumers can differentiate.
 *
 * @param {Object} place - Raw parsed Overpass place
 * @returns {Object}     - Normalised place
 */
const normaliseApiPlace = (place) => ({
  id: place.id,
  name: place.name,
  latitude: place.latitude,
  longitude: place.longitude,
  type: place.type,
  distance: place.distance,
  source: "api",
});

/**
 * Smart Priority Merge
 *
 * Strategy:
 *   1. Prefer API results over DB results.
 *   2. If API returns >= `maxSlots` valid places, use only API data.
 *   3. If API returns fewer, fill remaining slots from DB.
 *   4. Deduplicate by name (case-insensitive).
 *
 * @param {Array}  apiPlaces  - Places from Overpass API (already parsed)
 * @param {string} city       - City for DB lookup
 * @param {string} category   - POI category id
 * @param {number} maxSlots   - Max total results to return (default 5)
 * @returns {Array}           - Merged, deduplicated places
 */
const mergeWithFallback = async (apiPlaces, city, category, maxSlots = 5) => {
  // Normalise API results
  const normalisedApi = apiPlaces.map(normaliseApiPlace);

  // Determine how many valid API results we have
  const validApi = normalisedApi.filter(
    (p) => p.name && p.name !== "Unnamed Place" && p.latitude && p.longitude
  );

  // If we already have enough from the API, just return them
  if (validApi.length >= maxSlots) {
    return validApi.slice(0, maxSlots);
  }

  // Otherwise, fetch DB fallback for the remaining slots
  const needed = maxSlots - validApi.length;
  const dbPlaces = await getFallbackPlaces(city, category);

  // Deduplicate — collect names we already have (lowercase for comparison)
  const existingNames = new Set(validApi.map((p) => p.name.toLowerCase()));

  const fillers = dbPlaces
    .filter((p) => !existingNames.has(p.name.toLowerCase()))
    .slice(0, needed);

  return [...validApi, ...fillers];
};

/**
 * Determine whether the API response warrants a fallback.
 * Criteria:
 *   - Response is empty
 *   - Less than 3 valid places
 *   - Too many places missing the `name` field
 *
 * @param {Array} apiPlaces - Parsed Overpass places
 * @returns {boolean}
 */
const needsFallback = (apiPlaces) => {
  if (!apiPlaces || apiPlaces.length === 0) return true;
  const validCount = apiPlaces.filter(
    (p) => p.name && p.name !== "Unnamed Place" && p.latitude && p.longitude
  ).length;
  return validCount < 3;
};

/**
 * Try to find the nearest matching city from our DB seed data
 * for a given lat/lng coordinate.
 *
 * @param {number} lat
 * @param {number} lng
 * @returns {string|null} - City name or null
 */
const findNearestSeededCity = async (latitude, longitude) => {
  // Get distinct cities from DB
  const cities = await Place.distinct("city");
  if (!cities.length) return null;

  // For each seeded city, grab one record to compare coords
  let nearestCity = null;
  let nearestDist = Infinity;

  for (const city of cities) {
    const sample = await Place.findOne({ city }).lean();
    if (!sample) continue;
    const dist = haversine(latitude, longitude, sample.latitude, sample.longitude);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestCity = city;
    }
  }

  // Only match if within 100 km radius
  return nearestDist <= 100 ? nearestCity : null;
};

/**
 * Resolve city name to coordinates using a local mapping.
 */
const getCityCoordinates = (cityName) => {
  const mapping = {
    "Mumbai":    { latitude: 19.0760, longitude: 72.8777 },
    "Delhi":     { latitude: 28.6139, longitude: 77.2090 },
    "Bangalore": { latitude: 12.9716, longitude: 77.5946 },
    "Chennai":   { latitude: 13.0827, longitude: 80.2707 },
    "Kolkata":   { latitude: 22.5726, longitude: 88.3639 },
    "Hyderabad": { latitude: 17.3850, longitude: 78.4867 },
    "Jaipur":    { latitude: 26.9124, longitude: 75.7873 },
    "Mysore":    { latitude: 12.2958, longitude: 76.6394 },
    "Pune":      { latitude: 18.5204, longitude: 73.8567 },
    "Ahmedabad": { latitude: 23.0225, longitude: 72.5714 },
    "Surat":     { latitude: 21.1702, longitude: 72.8311 },
    "Kochi":     { latitude: 9.9312,  longitude: 76.2673 },
    "Goa":       { latitude: 15.2993, longitude: 74.1240 },
    "Agra":      { latitude: 27.1767, longitude: 78.0081 },
  };
  return mapping[cityName] || null;
};

/**
 * Haversine distance (km)
 */
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Clear the in-memory DB cache (useful after re-seeding).
 */
const clearCache = () => {
  dbCache.clear();
};

/**
 * getAllPlaces - Returns fallback places with optional filtering.
 */
const getAllPlaces = async (filter = {}) => {
  const query = {};
  if (filter.city) query.city = { $regex: new RegExp(`^${filter.city}$`, "i") };
  if (filter.category) query.category = filter.category;
  
  return await Place.find(query).sort({ city: 1, category: 1 });
};

/**
 * createPlace - Adds a new fallback place to the database.
 * Ensures idempotency by checking for existing name + city combination.
 *
 * @param {Object} placeData - { name, category, city, latitude, longitude }
 * @returns {Object}         - Created or existing place
 */
const createPlace = async (placeData) => {
  const { name, city, category, latitude, longitude } = placeData;

  // 1. Check for existing entry (Idempotency)
  const existing = await Place.findOne({
    name: { $regex: new RegExp(`^${name}$`, "i") },
    city: { $regex: new RegExp(`^${city}$`, "i") },
  });

  if (existing) {
    return { place: existing, created: false };
  }

  // 2. Create new place
  const newPlace = await Place.create({
    name,
    city,
    category,
    latitude,
    longitude,
  });

  // 3. Clear cache to reflect new data
  clearCache();

  return { place: newPlace, created: true };
};

/**
 * Fetch real POI data from Overpass and store it in our DB for future use.
 * This makes the fallback system dynamic for ANY city.
 */
const fetchAndStorePlaces = async (city, latitude, longitude, category) => {
  // 1. Resolve coordinates if missing (using internal mapping)
  let actualLat = latitude;
  let actualLng = longitude;
  
  if (!actualLat || !actualLng) {
    const resolved = getCityCoordinates(city);
    if (resolved) {
      actualLat = resolved.latitude;
      actualLng = resolved.longitude;
    } else {
      console.warn(`  ⚠️ Could not resolve coordinates for city: ${city}`);
      return [];
    }
  }

  if (city === "Unknown City") {
    console.warn("  ⚠️  Skipping dynamic fetch for Unknown City");
    return [];
  }

  // 2. Generate Bounding Box (delta = 0.05)
  const delta = 0.05;
  const lat1 = actualLat - delta;
  const lon1 = actualLng - delta;
  const lat2 = actualLat + delta;
  const lon2 = actualLng + delta;
  const bbox = `${lat1},${lon1},${lat2},${lon2}`;

  // 3. Construct Query (Regex for restaurant|fast_food|cafe as requested)
  // Note: For categories like park/hotel/station, we fallback to specific tags if needed,
  // but the prompt emphasized the unified eating/drinking query.
  const amenityRegex = "restaurant|fast_food|cafe";
  const typeTag = (category === "cafe" || category === "restaurant" || category === "fast_food")
    ? `["amenity"~"${amenityRegex}"]`
    : `[${CATEGORY_TAGS[category] || CATEGORY_TAGS["cafe"]}]`;

  const query = `
    [out:json][timeout:25];
    (
      node${typeTag}(${bbox});
      way${typeTag}(${bbox});
      relation${typeTag}(${bbox});
    );
    out center;
  `;

  try {
    const data = await fetchFromOverpass(query);

    const elements = data?.elements || [];
    
    // 4. Normalize (Do NOT filter out results without name as requested)
    const placesToInsert = elements
      .filter(el => el.tags && el.tags.name) // Filter out unnamed places
      .map(el => ({
        name: el.tags.name,
        category: category === "station" ? "railway_station" : category,
        city: city,
        latitude: el.lat || el.center?.lat,
        longitude: el.lon || el.center?.lon,
      }))
      .filter(p => p.latitude && p.longitude)
      .slice(0, MAX_TO_STORE);

    // Bulk create (idempotency handled by the createPlace logic or unique constraints)
    // For simplicity and to reuse the existing createPlace logic:
    const results = [];
    for (const pData of placesToInsert) {
      results.push(await createPlace(pData));
    }

    return results.map(r => r.place);
  } catch (error) {
    console.error(`  ❌ Overpass dynamic fetch error for ${city}/${category}: ${error.message}`);
    return [];
  }
};

/**
 * ensureCityPlaces - The core dynamic fallback orchestrator.
 * Checks DB count, fetches from Overpass if low, and returns results.
 */
const ensureCityPlaces = async (city, latitude, longitude, category) => {
  // 1. Check DB count
  const existing = await getAllPlaces({ city, category });
  
  if (existing.length >= 5) {
    return existing.map(p => ({
      id: p._id,
      name: p.name,
      latitude: p.latitude,
      longitude: p.longitude,
      type: p.category,
      source: "db_cache"
    }));
  }

// 2. Fetch, store, and return
  const fresh = await fetchAndStorePlaces(city, latitude, longitude, category);
  
  return fresh.map(p => ({
    id: p._id,
    name: p.name,
    latitude: p.latitude,
    longitude: p.longitude,
    type: p.category,
    source: "api_stored"
  }));
};

module.exports = {
  getFallbackPlaces,
  normaliseApiPlace,
  mergeWithFallback,
  needsFallback,
  findNearestSeededCity,
  clearCache,
  createPlace,
  getAllPlaces,
  fetchAndStorePlaces,
  ensureCityPlaces,
  fetchFromOverpass,
};
