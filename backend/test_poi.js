// ============================================================
// backend/test_poi.js - Final validation script
// ============================================================
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Target the controller
const poiController = require('./controllers/poiController');

dotenv.config();

async function validatePOI() {
  console.log("🔍 Starting validation of POI system...");

  const cities = [
    { name: "Mysore",  lat: 12.2958, lng: 76.6394, category: "cafe" },
    { name: "Chennai", lat: 13.0827, lng: 80.2707, category: "restaurant" }
  ];

  for (const city of cities) {
    console.log(`\n🌆 Testing City: ${city.name} (${city.lat}, ${city.lng})`);
    
    // Mock res object
    const res = {
      status: function(code) { this.statusCode = code; return this; },
      json: function(data) { this.data = data; return this; }
    };

    const req = {
      body: { 
        lat: city.lat, 
        lng: city.lng, 
        category: city.category,
        city: city.name 
      }
    };

    try {
      await poiController.getNearbyPlaces(req, res);
      
      const { places, source, fallback } = res.data;
      console.log(`✅ Result Count: ${places?.length || 0} | Source: ${source} | Fallback: ${fallback}`);

      if (places && places.length > 0) {
        const p = places[0];
        console.log(`📌 Sample: "${p.name}" | Type: ${p.type} | Coords: ${p.latitude}, ${p.longitude}`);
        
        // Check NEW-004
        if (p.latitude === undefined || p.longitude === undefined) {
          console.error("❌ ERR: Missing latitude/longitude keys!");
        } else {
          console.log("✅ Key Consistency: latitude/longitude verified.");
        }
      } else {
        console.warn("⚠️  Empty results found.");
      }
    } catch (err) {
      console.error(`❌ Controller failed for ${city.name}:`, err.message);
    }
  }

  process.exit();
}

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/smart_tourism")
  .then(validatePOI)
  .catch(err => {
    console.error("❌ DB Connection failed. Validation incomplete.", err.message);
    process.exit(1);
  });
