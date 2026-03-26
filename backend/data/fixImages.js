// ============================================================
// backend/data/fixImages.js
// Run: node data/fixImages.js
// Fixes all destination images in MongoDB cache
// ============================================================

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const DestinationCache = require("../models/DestinationCache");

// Correct images per destination name
const CORRECT_IMAGES = {
  "Taj Mahal":              "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
  "Agra Fort":              "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
  "Hawa Mahal":             "https://images.unsplash.com/photo-1477587458883-47145ed31fd8?w=800&q=80",
  "Amber Fort":             "https://images.unsplash.com/photo-1477587458883-47145ed31fd8?w=800&q=80",
  "Baga Beach":             "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
  "Calangute Beach":        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
  "Anjuna Beach":           "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
  "Palolem Beach":          "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
  "Old Goa Churches":       "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
  "Qutub Minar":            "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
  "India Gate":             "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
  "Red Fort":               "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
  "Humayun Tomb":           "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
  "Ganga Aarti":            "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80",
  "Kashi Vishwanath Temple":"https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80",
  "City Palace Udaipur":    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Lake Pichola":           "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
  "Gateway of India":       "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
  "Marine Drive":           "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
  "Elephanta Caves":        "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80",
  "Mysore Palace":          "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  "Golden Temple":          "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80",
  "Laxman Jhula":           "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=800&q=80",
  "Rishikesh River Rafting":"https://images.unsplash.com/photo-1609920658906-8223bd289001?w=800&q=80",
  "Rohtang Pass":           "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80",
  "Ooty Lake":              "https://images.unsplash.com/photo-1600298882525-7d17e8ca9f24?w=800&q=80",
  "Tiger Hill Darjeeling":  "https://images.unsplash.com/photo-1544644181-1484b3fdfc32?w=800&q=80",
  "Darjeeling Toy Train":   "https://images.unsplash.com/photo-1544644181-1484b3fdfc32?w=800&q=80",
  "Victoria Memorial":      "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&q=80",
  "Marina Beach":           "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  "Virupaksha Temple":      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80",
  "Mehrangarh Fort":        "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80",
  "Munnar Tea Gardens":     "https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?w=800&q=80",
  "Kerala Backwaters":      "https://images.unsplash.com/photo-1593106410288-caf65eca7c9d?w=800&q=80",
  "Fort Kochi":             "https://images.unsplash.com/photo-1593106410288-caf65eca7c9d?w=800&q=80",
  "Brahma Temple Pushkar":  "https://images.unsplash.com/photo-1477587458883-47145ed31fd8?w=800&q=80",
  "Ranthambore Tiger Reserve":"https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80",
  "Jim Corbett National Park":"https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80",
  "Coorg Coffee Estates":   "https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?w=800&q=80",
  "Spiti Valley":           "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
};

// Category fallback images
const CATEGORY_FALLBACKS = {
  beach:         "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  historical:    "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80",
  nature:        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
  adventure:     "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=800&q=80",
  hill_stations: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80",
  wildlife:      "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80",
  pilgrimage:    "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80",
  culture:       "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
  food:          "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80",
  offbeat:       "https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?w=800&q=80",
  default:       "https://images.unsplash.com/photo-1477587458883-47145ed31fd8?w=800&q=80",
};

const fixImages = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/smart_tourism";
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const destinations = await DestinationCache.find({});
    console.log(`📦 Found ${destinations.length} destinations to fix`);

    let fixed = 0;
    for (const dest of destinations) {
      // Get correct image
      let correctImage =
        CORRECT_IMAGES[dest.name] ||
        CATEGORY_FALLBACKS[dest.categories?.[0]] ||
        CATEGORY_FALLBACKS.default;

      // Only update if image is wrong (picsum or missing)
      const needsFix = !dest.image ||
        dest.image.includes("picsum") ||
        !dest.image.startsWith("http");

      if (needsFix || CORRECT_IMAGES[dest.name]) {
        await DestinationCache.findByIdAndUpdate(dest._id, { image: correctImage });
        fixed++;
        console.log(`✅ Fixed: ${dest.name}`);
      }
    }

    console.log(`\n🎉 Fixed ${fixed} destination images!`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

fixImages();
