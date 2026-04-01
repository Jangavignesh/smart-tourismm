const axios = require('axios');

async function testOverpass() {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="cafe"](around:2000,12.2958,76.6394);
      way["amenity"="cafe"](around:2000,12.2958,76.6394);
      relation["amenity"="cafe"](around:2000,12.2958,76.6394);
    );
    out center 10;
  `;

  try {
    const response = await axios.post("https://overpass-api.de/api/interpreter", query, { timeout: 10000 });
    const elements = response.data.elements || [];
    console.log(`✅ Received ${elements.length} elements from Overpass.`);
    
    if (elements.length > 0) {
      const el = elements[0];
      const pLat = el.lat || el.center?.lat;
      const pLon = el.lon || el.center?.lon;
      const name = el.tags?.name || "Unnamed Place";
      console.log(`📌 First result: "${name}" at ${pLat}, ${pLon}`);
    }
  } catch (err) {
    console.error(`❌ Overpass API failed: ${err.message}`);
  }
}

testOverpass();
