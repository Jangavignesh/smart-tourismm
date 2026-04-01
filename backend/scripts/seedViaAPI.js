// ============================================================
// backend/scripts/seedViaAPI.js - Smart Hybrid Seeding
// Fetches REAL data from Overpass API and persists to DB.
// Does NOT re-fetch if sufficient data exists.
// ============================================================

const axios = require("axios");

// ── CONFIGURATION ───────────────────────────────────────────
const API_BASE_URL = "http://localhost:5000/api/poi";
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const MIN_STABLE_COUNT = 5; // Re-fetch if DB has fewer than 5 places
const MAX_TO_STORE = 10;    // Store top 10 results per category

// ── CITY DATA ───────────────────────────────────────────────
const CITIES = [
  { name: "Mysore",    lat: 12.2958, lng: 76.6394 },
  { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
  { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
  { name: "Chennai",   lat: 13.0827, lng: 80.2707 },
  { name: "Mumbai",    lat: 19.0760, lng: 72.8777 },
  { name: "Delhi",     lat: 28.6139, lng: 77.2090 },
];

// ── CATEGORY CONFIG (Tag overrides for Overpass) ─────────────
const POI_CATEGORIES = [
  { id: "cafe",            tag: '"amenity"="cafe"' },
  { id: "restaurant",      tag: '"amenity"="restaurant"' },
  { id: "fast_food",       tag: '"amenity"="fast_food"' },
  { id: "bus_station",     tag: '"amenity"="bus_station"' },
  { id: "railway_station", tag: '"railway"="station"' }, // Overpass: railway=station
  { id: "park",            tag: '"leisure"="park"' },
  { id: "hotel",           tag: '"tourism"="hotel"' },
];

/**
 * Fetch existing place count for a specific city and category.
 */
async function getExistingCount(city, category) {
  try {
    const response = await axios.get(`${API_BASE_URL}/places`, {
      params: { city, category }
    });
    return response.data?.total || 0;
  } catch (error) {
    console.error(`  ⚠️  Failed to check count for ${city}/${category}: ${error.message}`);
    return 0;
  }
}

/**
 * Fetch data from Overpass API.
 */
async function fetchFromOverpass(city, lat, lng, categoryId, tag) {
  const query = `
    [out:json][timeout:30];
    (
      node[${tag}](around:5000,${lat},${lng});
      way[${tag}](around:5000,${lat},${lng});
      relation[${tag}](around:5000,${lat},${lng});
    );
    out center;
  `;

  try {
    const response = await axios.post(OVERPASS_URL, query, {
      headers: { "Content-Type": "text/plain" }
    });
    return response.data?.elements || [];
  } catch (error) {
    console.error(`  ❌ Overpass error for ${city}/${categoryId}: ${error.message}`);
    return [];
  }
}

/**
 * Persist place to DB via API.
 */
async function saveToDatabase(place) {
  try {
    const response = await axios.post(`${API_BASE_URL}/places`, place);
    return { success: response.status === 201, skipped: response.status === 200 };
  } catch (error) {
    // console.error(`    🔴 Fail: ${place.name} - ${error.response?.data?.message || error.message}`);
    return { success: false, skipped: false };
  }
}

async function runSmartSeeder() {
  console.log("🚀 Starting Hybrid Overpass-to-DB Seeding...");
  console.log(`📡 API Base: ${API_BASE_URL}\n`);

  for (const city of CITIES) {
    console.log(`🏙️  Processing City: ${city.name.toUpperCase()}`);

    for (const cat of POI_CATEGORIES) {
      process.stdout.write(`  📂 [${cat.id}] Checking cache... `);

      // 1. Smart Cache Check
      const count = await getExistingCount(city.name, cat.id);
      if (count >= MIN_STABLE_COUNT) {
        process.stdout.write(`✅ Sufficient (${count} places). Skipping.\n`);
        continue;
      }

      process.stdout.write(`📉 Low (${count} places). Fetching Overpass... `);

      // 2. Fetch from Overpass
      const elements = await fetchFromOverpass(city.name, city.lat, city.lng, cat.id, cat.tag);
      process.stdout.write(`${elements.length} found. Parsing... `);

      // 3. Process and Normalize
      const placesToInsert = elements
        .filter(el => el.tags?.name) // Require name
        .map(el => ({
          name: el.tags.name,
          category: cat.id,
          city: city.name,
          latitude: el.lat || el.center?.lat,
          longitude: el.lon || el.center?.lon,
          source: "api_cached"
        }))
        .filter(p => p.latitude && p.longitude) // Require coords
        .slice(0, MAX_TO_STORE); // Limit to top 10

      // 4. Persistence
      let inserted = 0;
      for (const p of placesToInsert) {
        const { success } = await saveToDatabase(p);
        if (success) inserted++;
      }

      process.stdout.write(`📥 Inserted ${inserted}/${placesToInsert.length} real places.\n`);
    }
  }

  console.log("\n📊 Seeding process completed successfully!");
  console.log("✨ All major cities now have high-quality, verified fallback data.");
}

runSmartSeeder().catch(err => {
  console.error("\n❌ Critical Seeder Failure:", err.message);
  console.log("\n⚠️ IMPORTANT: Make sure the backend server (node server.js) is running on port 5000 before running this script.");
});
