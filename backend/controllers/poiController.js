// ============================================================
// backend/controllers/poiController.js
// Overpass API + DB Fallback with Smart Priority Merge
// ============================================================
const axios = require("axios");
const {
  mergeWithFallback,
  needsFallback,
  findNearestSeededCity,
  normaliseApiPlace,
  fetchFromOverpass,
} = require("../services/placeService");

// ── In-memory cache for Overpass API results ────────────────
const poiCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

// ── Haversine distance for sorting by proximity ─────────────
const calculateHaversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// ── Map custom place types to Overpass query tags ───────────
const PLACE_TYPES = {
  cafe: '"amenity"="cafe"',
  restaurant: '"amenity"="restaurant"',
  fast_food: '"amenity"="fast_food"',
  bus_station: '"amenity"="bus_station"',
  station: '"railway"="station"',
  mall: '"shop"="mall"',
  park: '"leisure"="park"',
  hotel: '"tourism"="hotel"',
};

// ── Maximum total results to return (smart merge target) ────
const MAX_RESULTS = 20;
const FALLBACK_THRESHOLD = 3; // min valid API results before triggering fallback

exports.getNearbyPlaces = async (req, res) => {
  try {
    const { latitude, longitude, lat, lng, category = "cafe", radius = 5000, city } = req.body;

    const finalLat = latitude || lat;
    const finalLon = longitude || lng;

    console.log(`\n[NearbySearch] Starting search for '${category}' near (${finalLat}, ${finalLon}) with radius ${radius}m...`);

    if (!finalLat || !finalLon) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required." });
    }

    const typeQuery = PLACE_TYPES[category] || PLACE_TYPES["cafe"];
    const cacheKey = `${finalLat}_${finalLon}_${category}_${radius}`;

    // ──────────────────────────────────────────────────────────
    // 1. Check database first (Dynamic Fallback Logic)
    // ──────────────────────────────────────────────────────────
    const resolvedCity = city || (await require("../services/placeService").findNearestSeededCity(finalLat, finalLon)) || "Unknown City";
    console.log(`[NearbySearch] Resolved City: ${resolvedCity}`);
    
    const { ensureCityPlaces } = require("../services/placeService");
    
    // Check if we have sufficient stable data in DB
    const dbResults = await ensureCityPlaces(resolvedCity, finalLat, finalLon, category);
    
    if (dbResults && dbResults.length >= 5) {
      console.log(`[NearbySearch] Sufficient stable data found in DB. Returning ${Math.min(dbResults.length, MAX_RESULTS)} items (Source: db_dynamic).`);
      return res.status(200).json({
        places: dbResults.slice(0, MAX_RESULTS),
        cached: true,
        source: "db_dynamic",
        city: resolvedCity
      });
    }

    // ──────────────────────────────────────────────────────────
    // 2. Fetch from Overpass (Step 2 of the flow)
    // ──────────────────────────────────────────────────────────
    // If we are here, DB was insufficient.
    let apiPlaces = [];
    let apiError = false;

    try {
      const query = `
        [out:json][timeout:15];
        (
          node[${typeQuery}](around:${radius},${finalLat},${finalLon});
          way[${typeQuery}](around:${radius},${finalLat},${finalLon});
          relation[${typeQuery}](around:${radius},${finalLat},${finalLon});
        );
        out center 50;
      `;

      console.log(`[NearbySearch] Fetching from Overpass API (Radius: ${radius}m, Category: ${category})...`);
      const data = await fetchFromOverpass(query);

      const elements = data?.elements || [];

      apiPlaces = elements
        .filter((p) => {
          const pLat = p.lat || p.center?.lat;
          const pLon = p.lon || p.center?.lon;
          return pLat && pLon && p.tags?.name; // Only allow places with names
        })
        .map((p) => {
          const pLat = p.lat || p.center?.lat;
          const pLon = p.lon || p.center?.lon;
          const distance = calculateHaversine(finalLat, finalLon, pLat, pLon);

          return {
            id: p.id,
            name: p.tags?.name || "Unnamed Place",
            latitude: pLat,
            longitude: pLon,
            type:
              p.tags?.amenity ||
              p.tags?.railway ||
              p.tags?.shop ||
              p.tags?.leisure ||
              p.tags?.tourism ||
              "place",
            distance: parseFloat(distance.toFixed(2)),
          };
        });

      // Sort by proximity
      apiPlaces.sort((a, b) => a.distance - b.distance);
      console.log(`[NearbySearch] Overpass API returned ${apiPlaces.length} raw valid results.`);
    } catch (err) {
      console.warn("⚠️  [NearbySearch] Overpass API call failed:", err.message);
      apiError = true;
    }

    // ──────────────────────────────────────────────────────────
    // 3. Determine if fallback is needed
    // ──────────────────────────────────────────────────────────
    const fallbackNeeded = apiError || needsFallback(apiPlaces);
    console.log(`[NearbySearch] Fallback condition met? ${fallbackNeeded ? "Yes (Merging with DB/Fallback)" : "No (Sufficient API data)"}`);
    let finalPlaces = [];
    let resultSource = "api";

    if (fallbackNeeded) {
      // Resolve the nearest seeded city for this coordinate
      const resolvedCity =
        city || (await findNearestSeededCity(finalLat, finalLon));

      if (resolvedCity) {
        // Smart priority merge: use API results + fill from DB
        finalPlaces = await mergeWithFallback(
          apiPlaces,
          resolvedCity,
          category,
          MAX_RESULTS
        );
        resultSource =
          apiPlaces.length > 0 ? "merged" : "db";
      } else {
        // No seeded city nearby — return whatever the API gave us
        finalPlaces = apiPlaces
          .slice(0, MAX_RESULTS)
          .map(normaliseApiPlace);
        resultSource = "api";
      }
    } else {
      // API returned sufficient results — use them directly
      finalPlaces = apiPlaces
        .slice(0, MAX_RESULTS)
        .map(normaliseApiPlace);
      resultSource = "api";
    }

    // ──────────────────────────────────────────────────────────
    // 4. Update cache
    // ──────────────────────────────────────────────────────────
    poiCache.set(cacheKey, {
      timestamp: Date.now(),
      data: finalPlaces,
    });

    console.log(`[NearbySearch] FINAL POIs DELIVERED: ${finalPlaces.length} places (Source: ${resultSource})`);

    return res.status(200).json({
      places: finalPlaces,
      cached: false,
      source: resultSource,
      apiCount: apiPlaces.length,
      fallback: fallbackNeeded,
    });
  } catch (error) {
    console.error("POI Controller Error:", error.message);

    // ──────────────────────────────────────────────────────────
    // 5. Last-resort fallback — pure DB results
    // ──────────────────────────────────────────────────────────
    try {
      const { latitude, longitude, lat, lng, category = "cafe", city } = req.body;
      const finalLat = latitude || lat;
      const finalLon = longitude || lng;
      const resolvedCity =
        city || (await findNearestSeededCity(finalLat, finalLon));

      if (resolvedCity) {
        const { getFallbackPlaces } = require("../services/placeService");
        const dbPlaces = await getFallbackPlaces(resolvedCity, category);
        return res.status(200).json({
          places: dbPlaces,
          cached: false,
          source: "db",
          apiCount: 0,
          fallback: true,
        });
      }
    } catch (dbErr) {
      console.error("DB Fallback also failed:", dbErr.message);
    }

    return res
      .status(500)
      .json({ message: "Failed to fetch nearby places", error: error.message });
  }
};

/**
 * Endpoint to add a place (Administrative / Seeding)
 * POST /api/poi/places
 */
exports.addPlace = async (req, res) => {
  try {
    const { name, category, city, latitude, longitude } = req.body;

    if (!name || !category || !city || !latitude || !longitude) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Pass data through service layer (which handles idempotency)
    const { place, created } = await require("../services/placeService").createPlace({
      name,
      category,
      city,
      latitude,
      longitude,
    });

    return res.status(created ? 201 : 200).json({
      message: created ? "Place added successfully." : "Place already exists.",
      place,
    });
  } catch (error) {
    console.error("Add Place Error:", error.message);
    return res.status(500).json({ message: "Failed to add place.", error: error.message });
  }
};

/**
 * Endpoint to retrieve all places (Administrative / Monitoring)
 * GET /api/poi/places
 */
exports.getAllPlaces = async (req, res) => {
  try {
    const { city, category } = req.query;
    const places = await require("../services/placeService").getAllPlaces({ city, category });
    return res.status(200).json({ total: places.length, places });
  } catch (error) {
    console.error("Get All Places Error:", error.message);
    return res.status(500).json({ message: "Failed to get places.", error: error.message });
  }
};
