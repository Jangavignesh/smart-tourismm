// ============================================================
// routes/itineraryRoutes.js - Smart Rule-Based Generator
// No API needed - Works 100% free!
// ============================================================

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const axios = require("axios");

const DESTINATION_DATA = {
  "Goa": {
    overview: "Goa is India's beach paradise with stunning coastlines, Portuguese heritage, vibrant nightlife and amazing seafood. Perfect for every type of traveler!",
    bestTime: "November to February",
    places: ["Baga Beach", "Calangute Beach", "Anjuna Beach", "Palolem Beach", "Old Goa", "Panaji", "Fort Aguada", "Dudhsagar Falls"],
    restaurants: ["Fisherman's Wharf", "Thalassa Greek Restaurant", "Martin's Corner", "Culinarium", "Beach shacks at Baga"],
    activities: {
      culture: ["Visit Basilica of Bom Jesus (UNESCO site)", "Explore Se Cathedral and Old Goa churches", "Tour Goa State Museum in Panaji", "Walk through Latin Quarter Fontainhas"],
      food: ["Try fish curry rice at local beach shacks", "Visit Mapusa Friday Market for spices", "Seafood feast at Fisherman's Wharf", "Try local bebinca dessert and feni drink"],
      nature: ["Trek to Dudhsagar Falls (4-tier waterfall)", "Visit Bondla Wildlife Sanctuary", "Explore Mollem National Park", "Birdwatching at Dr. Salim Ali Bird Sanctuary"],
      adventure: ["Water sports at Baga — parasailing, jet ski, banana boat", "Scuba diving at Grande Island", "ATV ride on sand dunes", "Kayaking in backwaters"],
      spiritual: ["Shri Mangueshi Temple (most visited temple)", "Shri Shantadurga Temple in Ponda", "Church of St. Francis of Assisi", "Mahalasa Temple"],
      shopping: ["Anjuna Flea Market every Wednesday", "Mapusa Market on Fridays", "Calangute shops for souvenirs", "Panaji city market for spices"],
    },
    hotels: { budget: "Zostel Goa ₹500-800/night", comfort: "Novotel Goa ₹3,000-5,000/night", luxury: "Taj Exotica Resort ₹15,000+/night", adventure: "Beach camps ₹800-1,500/night", family: "Club Mahindra ₹4,000-7,000/night", romantic: "W Goa ₹12,000+/night" },
    tips: ["Rent a scooter (₹300/day) for easy travel between beaches", "Book beach shack tables early in peak season (Dec-Jan)", "Carry cash — many local vendors don't accept cards", "Avoid Goa in monsoon (June-Sept) — most beaches close"],
    costPerDay: { budget: [800, 1500], comfort: [2000, 4000], luxury: [8000, 15000], adventure: [1500, 3000], family: [3000, 6000], romantic: [3000, 6000] },
  },
  "Jaipur": {
    overview: "The Pink City of Rajasthan dazzles with magnificent forts, royal palaces, vibrant bazaars and rich Rajput heritage. A must-visit for history lovers!",
    bestTime: "October to March",
    places: ["Amber Fort", "City Palace", "Hawa Mahal", "Jantar Mantar", "Nahargarh Fort", "Jal Mahal", "Albert Hall Museum", "Johri Bazaar"],
    restaurants: ["Chokhi Dhani (cultural village)", "1135 AD at Amber Fort", "LMB (Laxmi Misthan Bhandar)", "Spice Court", "Peacock Rooftop Restaurant"],
    activities: {
      culture: ["Amber Fort with light & sound show", "City Palace museum tour", "Jantar Mantar (UNESCO observatory)", "Albert Hall Museum artifacts"],
      food: ["Dal Baati Churma dinner at Chokhi Dhani", "Pyaaz Kachori breakfast at Rawat Misthan", "Ghewar sweet at LMB", "Royal Rajasthani thali at 1135 AD"],
      nature: ["Nahargarh Fort sunset view", "Sisodia Rani Garden & Zoo", "Jal Mahal water palace photo stop", "Kanak Vrindavan garden"],
      adventure: ["Hot air balloon ride at sunrise over Amber Fort", "Elephant safari up to Amber Fort", "Camel ride at Thar desert outskirts", "Zip-lining at Mehrangarh (nearby Jodhpur)"],
      spiritual: ["Govind Dev Ji Temple (very crowded — go early)", "Birla Mandir marble temple", "Galta Ji Monkey Temple", "Moti Dungri Ganesh Temple"],
      shopping: ["Johari Bazaar for gems & jewellery", "Bapu Bazaar for Rajasthani textiles", "Nehru Bazaar for mojari (juttis)", "Tripolia Bazaar for bangles & lac items"],
    },
    hotels: { budget: "Zostel Jaipur ₹400-700/night", comfort: "Sarovar Portico ₹2,500-4,000/night", luxury: "Rambagh Palace ₹25,000+/night", adventure: "Camping near Amber ₹1,000-2,000/night", family: "Trident Hotel ₹4,000-7,000/night", romantic: "Dera Mandawa Haveli ₹5,000-10,000/night" },
    tips: ["Hire a local guide at Amber Fort (₹200-500)", "Visit Hawa Mahal at sunrise for best photos", "Bargain hard at local bazaars — 50% off is normal", "Avoid peak summer (April-June) — extremely hot"],
    costPerDay: { budget: [700, 1500], comfort: [1500, 3500], luxury: [7000, 20000], adventure: [1000, 2500], family: [2500, 5000], romantic: [2500, 5000] },
  },
  "Manali": {
    overview: "Nestled in Himachal Pradesh, Manali is a Himalayan wonderland offering snow-capped peaks, thrilling adventure sports, ancient temples and serene valleys.",
    bestTime: "October to June (avoid July-September monsoons)",
    places: ["Solang Valley", "Rohtang Pass", "Hadimba Devi Temple", "Old Manali", "Vashisht Village", "Beas River", "Kullu Valley", "Naggar Castle"],
    restaurants: ["Johnson's Cafe (best breakfast)", "Drifter's Inn", "La Plage (French food)", "Lazy Dog Lounge", "Cafe 1947", "Chopsticks (Chinese)"],
    activities: {
      culture: ["Hadimba Devi Temple (800-year-old pagoda temple)", "Tibetan Monastery with Buddhist art", "Naggar Castle museum", "Vashisht hot springs village"],
      food: ["Siddu (local bread with ghee) at dhabas", "Fresh trout fish at riverside camps", "Tibetan thukpa and momos", "Try local apple wine and apple jam"],
      nature: ["Solang Valley meadows and views", "Beas River walk in Old Manali", "Rohtang Pass (snow even in summer)", "Kullu Valley apple orchards"],
      adventure: ["Skiing and snowboarding at Solang Valley", "Paragliding at Dobhi meadows", "River rafting on Beas (Grade 3-4)", "ATV and snow scooter rides"],
      spiritual: ["Hadimba Devi Temple prayers", "Manu Temple (oldest in Manali)", "Gayatri Temple hilltop", "Arjun Gufa cave meditation spot"],
      shopping: ["Mall Road for woolens and Kullu shawls", "Tibetan Market for handicrafts", "Local shops for dry fruits and jams", "Himachali cap and handmade jewelry"],
    },
    hotels: { budget: "Zostel Manali ₹500-900/night", comfort: "Span Resort ₹3,000-5,000/night", luxury: "The Himalayan ₹8,000-15,000/night", adventure: "Snow camps ₹800-1,500/night", family: "Club Mahindra Manali ₹5,000-8,000/night", romantic: "Apple Country Resort ₹3,000-6,000/night" },
    tips: ["Carry warm clothes even in summer — nights are cold", "Book Rohtang Pass permit online 2 days before", "Acclimatize for 1 day before any adventure activity", "Download offline maps — connectivity is poor in hills"],
    costPerDay: { budget: [800, 1500], comfort: [2000, 4000], luxury: [6000, 12000], adventure: [1500, 3500], family: [3000, 6000], romantic: [2500, 5000] },
  },
  "Varanasi": {
    overview: "One of the world's oldest living cities, Varanasi is a spiritual epicenter on the banks of the Ganges. Its ghats, temples, and rituals are deeply moving.",
    bestTime: "October to March",
    places: ["Dashashwamedh Ghat", "Manikarnika Ghat", "Kashi Vishwanath Temple", "Sarnath", "Assi Ghat", "Tulsi Manas Temple", "Banaras Hindu University"],
    restaurants: ["Kashi Chat Bhandar", "Blue Lassi Shop", "Bread of Life Bakery", "Pizzeria Vatika", "Keshari Restaurant"],
    activities: {
      culture: ["Morning Ganga Aarti at Dashashwamedh Ghat", "Boat ride on the Ganges at sunrise", "Visit Sarnath (where Buddha gave first sermon)", "Banaras Hindu University campus tour"],
      food: ["Kachori sabzi breakfast at Kashi Chat Bhandar", "Famous Blue Lassi on the ghats", "Banarasi paan after meals", "Malaiyo dessert in winter mornings"],
      nature: ["Sunrise boat ride on Ganges", "Walk along all 84 ghats", "Evening sunset view from Assi Ghat"],
      adventure: ["Cycle rickshaw through narrow lanes (gallis)", "Night boat ride during Ganga Aarti", "Photography walk in old city"],
      spiritual: ["Ganga Aarti ceremony at Dashashwamedh (evening)", "Kashi Vishwanath Temple darshan", "Sankat Mochan Hanuman Temple", "Morning rituals at Manikarnika Ghat"],
      shopping: ["Banarasi silk sarees at Vishwanath Gali", "Rudraksha and wooden toys at ghats", "Musical instruments on Vishwanath Lane"],
    },
    hotels: { budget: "Stops Hostel ₹400-700/night", comfort: "Hotel Surya ₹2,000-3,500/night", luxury: "Taj Nadesar Palace ₹15,000+/night", adventure: "Ghat-side guesthouses ₹600-1,200/night", family: "BrijRama Palace ₹8,000-12,000/night", romantic: "Radisson Varanasi ₹4,000-7,000/night" },
    tips: ["Attend Ganga Aarti every evening — arrive 30 min early for good spot", "Hire a local boat for sunrise (₹200-500)", "Respect religious sentiments — dress modestly", "Avoid Manikarnika Ghat photography — it's a cremation site"],
    costPerDay: { budget: [600, 1200], comfort: [1500, 3000], luxury: [6000, 15000], adventure: [800, 1800], family: [2000, 4000], romantic: [2000, 4500] },
  },
  "Udaipur": {
    overview: "The City of Lakes, Udaipur is Rajasthan's most romantic destination with shimmering lakes, majestic palaces, and a fairy-tale atmosphere.",
    bestTime: "September to March",
    places: ["City Palace", "Lake Pichola", "Jag Mandir", "Sajjangarh (Monsoon Palace)", "Fateh Sagar Lake", "Jagdish Temple", "Vintage Car Museum"],
    restaurants: ["Ambrai Restaurant (lake view)", "Upre by 1559 AD", "Jaiwana Haveli rooftop", "Natraj Dining Hall", "Millets of Mewar"],
    activities: {
      culture: ["City Palace museum (largest in Rajasthan)", "Boat ride on Lake Pichola to Jag Mandir", "Bagore Ki Haveli evening cultural show", "Vintage Car Museum (royal collection)"],
      food: ["Dal Baati Churma at Natraj Dining Hall", "Romantic dinner at Ambrai with lake view", "Rajasthani thali at Millets of Mewar", "Mawa Kachori at local sweet shops"],
      nature: ["Sajjangarh Monsoon Palace sunset trek", "Fateh Sagar Lake boat ride", "Shilpgram rural arts village", "Aravalli hills nature walk"],
      adventure: ["Horse safari in Aravalli hills", "Zip-lining at Flying Fox Udaipur", "Kayaking on Fateh Sagar Lake", "Cycling tour of old city"],
      spiritual: ["Jagdish Temple (17th century Vishnu temple)", "Eklingji Temple (32 shrines complex)", "Neemach Mata Temple hilltop", "Ambika Mata Temple"],
      shopping: ["Hathi Pol Bazaar for handicrafts", "Bada Bazaar for silver jewelry", "Shilpgram for folk art", "Chetak Circle for miniature paintings"],
    },
    hotels: { budget: "Zostel Udaipur ₹500-800/night", comfort: "Raas Devigarh ₹5,000-8,000/night", luxury: "Taj Lake Palace ₹30,000+/night", adventure: "Camping near Sajjangarh ₹1,000-2,000/night", family: "Trident Udaipur ₹5,000-8,000/night", romantic: "The Leela Palace ₹20,000+/night" },
    tips: ["Book boat rides in advance for Jag Mandir", "Sajjangarh has best sunset views — go 1 hour before sunset", "Explore old city on foot — many hidden havelis", "Avoid peak winter weekends — very crowded"],
    costPerDay: { budget: [800, 1500], comfort: [2500, 5000], luxury: [10000, 30000], adventure: [1200, 2500], family: [3000, 6000], romantic: [3500, 7000] },
  },
};

const MORNING_INTROS = ["Start your day early with", "Kick off the morning with", "Begin Day {n} with", "Your morning starts at"];
const AFTERNOON_INTROS = ["After a delicious lunch, head to", "Spend the afternoon exploring", "Post-lunch, make your way to", "The afternoon is perfect for"];
const EVENING_INTROS = ["As the sun sets, enjoy", "Wind down your evening with", "End the day beautifully at", "Your evening is reserved for"];

const generateDay = (dayNum, dest, destination, interests, style, days) => {
  const actPool = [];
  interests.forEach(int => {
    const acts = dest.activities[int] || [];
    acts.forEach(a => actPool.push({ interest: int, activity: a }));
  });

  const usedActs = actPool.slice((dayNum - 1) * 3, (dayNum - 1) * 3 + 9);
  const place1 = dest.places[((dayNum - 1) * 2) % dest.places.length];
  const place2 = dest.places[((dayNum - 1) * 2 + 1) % dest.places.length];
  const restaurant = dest.restaurants[(dayNum - 1) % dest.restaurants.length];
  const tip = dest.tips[(dayNum - 1) % dest.tips.length];

  const themes = [
    "Arrival & First Impressions", "Deep Exploration & Culture",
    "Hidden Gems & Local Life", "Adventure & Thrills",
    "Food & Market Trail", "Nature & Serenity",
    "Spiritual & Heritage", "Shopping & Leisure",
    "Day Trip & Excursion", "Farewell & Fond Memories",
  ];

  const isFirst = dayNum === 1;
  const isLast = dayNum === days;

  const hotel = dest.hotels[style] || dest.hotels.comfort;

  const morning = isFirst
    ? `Arrive in ${destination} and check into ${hotel}. Freshen up and head to ${place1} to get your first feel of the city. Have a hearty local breakfast nearby before starting your explorations.`
    : `${MORNING_INTROS[(dayNum - 1) % 4].replace("{n}", dayNum)} ${usedActs[0]?.activity || `visiting ${place1}`}. Have a local breakfast and set out early to avoid the crowds.`;

  const afternoon = isLast
    ? `Visit ${usedActs[1]?.activity || place2} for some last-minute memories. Enjoy a final lunch at ${restaurant}. Head back to pack your bags and check out of the hotel.`
    : `${AFTERNOON_INTROS[(dayNum - 1) % 4]} ${usedActs[1]?.activity || `${place2}`}. Have lunch at ${restaurant} and take a short rest before the evening activities.`;

  const evening = isLast
    ? `Make your way to the airport/railway station. Carry some local souvenirs for your loved ones. ${destination} bids you a warm farewell — come back soon!`
    : `${EVENING_INTROS[(dayNum - 1) % 4]} ${usedActs[2]?.activity || `${dest.places[dayNum % dest.places.length]}`}. Enjoy a delicious dinner and stroll around before calling it a night.`;

  const costs = dest.costPerDay[style] || dest.costPerDay.comfort;

  return {
    title: `Day ${dayNum} — ${themes[(dayNum - 1) % themes.length]}`,
    theme: isFirst ? "Arrival & Settling In" : isLast ? "Farewell Day" : themes[(dayNum) % themes.length],
    morning,
    afternoon,
    evening,
    tips: tip,
    estimatedCost: `₹${costs[0].toLocaleString("en-IN")} - ₹${costs[1].toLocaleString("en-IN")} per person`,
  };
};

router.post("/generate", protect, async (req, res) => {
  try {
    const { destination, days, travelStyle, interests, budget, month } = req.body;

    if (!destination || !days || !interests?.length) {
      return res.status(400).json({ success: false, message: "Destination, days and interests required." });
    }

    console.log(`🗺️ Generating ${days}-day ${travelStyle} itinerary for ${destination}...`);

    const dest = DESTINATION_DATA[destination] || {
      overview: `${destination} is a stunning destination in India with rich culture, amazing food, and unforgettable experiences waiting to be explored!`,
      bestTime: "October to March",
      places: ["City Center", "Old Town", "Local Market", "Heritage Site", "Nature Park", "Scenic Viewpoint", "Religious Site", "Art Gallery"],
      restaurants: ["Local Dhaba", "Restaurant Row", "Street Food Corner", "Rooftop Cafe", "Heritage Restaurant"],
      activities: {
        culture: [`Explore ${destination}'s heritage monuments`, `Visit local museums and art galleries`, `Attend a cultural performance`, `Tour historical sites`],
        food: [`Try authentic local street food`, `Visit the famous local market`, `Take a food walk tour`, `Dine at a heritage restaurant`],
        nature: [`Visit local parks and gardens`, `Nature walk in scenic areas`, `Explore nearby hills or water bodies`, `Sunrise/sunset viewpoints`],
        adventure: [`Try local adventure activities`, `Cycling tour of the city`, `Trekking nearby trails`, `River or lake activities`],
        spiritual: [`Visit main temples and shrines`, `Attend morning prayers or aarti`, `Explore religious heritage sites`, `Meditation or yoga session`],
        shopping: [`Local handicraft bazaars`, `Famous shopping streets`, `Artisan workshops`, `Souvenir and spice markets`],
      },
      hotels: { budget: `Budget guesthouses ₹500-800/night`, comfort: `Mid-range hotels ₹2,000-4,000/night`, luxury: `Luxury resorts ₹8,000+/night`, adventure: `Camps ₹800-1,500/night`, family: `Family resorts ₹3,000-6,000/night`, romantic: `Boutique hotels ₹3,000-7,000/night` },
      tips: ["Hire a local guide for the best experience", "Try local transport for an authentic feel", "Carry cash for local markets", "Respect local customs and dress modestly"],
      costPerDay: { budget: [700, 1400], comfort: [1800, 3500], luxury: [6000, 12000], adventure: [1200, 2800], family: [2500, 5000], romantic: [2500, 5000] },
    };

    const style = travelStyle || "comfort";
    const numDays = Math.min(parseInt(days), 10);

    const dayPlans = [];
    for (let i = 1; i <= numDays; i++) {
      dayPlans.push(generateDay(i, dest, destination, interests, style, numDays));
    }

    const STYLE_LABELS = {
      budget: "Budget Travel", comfort: "Comfort Travel", luxury: "Luxury Travel",
      adventure: "Adventure Travel", family: "Family Trip", romantic: "Romantic Getaway",
    };

    const costs = dest.costPerDay[style] || dest.costPerDay.comfort;
    const totalMin = costs[0] * numDays;
    const totalMax = costs[1] * numDays;

    const itinerary = {
      destination,
      duration: `${numDays} Day${numDays > 1 ? "s" : ""}`,
      style: STYLE_LABELS[style] || style,
      overview: dest.overview,
      bestTime: month ? `You're visiting in ${month}. Best time is ${dest.bestTime}.` : dest.bestTime,
      totalEstimatedCost: budget || `₹${totalMin.toLocaleString("en-IN")} - ₹${totalMax.toLocaleString("en-IN")} total`,
      accommodation: dest.hotels[style] || dest.hotels.comfort,
      days: dayPlans,
    };

    console.log(`✅ Itinerary ready for ${destination}!`);
    res.status(200).json({ success: true, text: JSON.stringify(itinerary) });

  } catch (err) {
    console.error("❌ Itinerary error:", err.message);
    res.status(500).json({ success: false, message: "Could not generate itinerary." });
  }
});

// ============================================================
// LLM Itinerary Generator (Gemini) — optional
// POST /api/itinerary/generate-llm
// Requires GEMINI_API_KEY in backend env
// ============================================================
router.post("/generate-llm", protect, async (req, res) => {
  try {
    const { destination, days, travelStyle, interests, budget, month } = req.body || {};

    if (!destination || !days || !Array.isArray(interests) || interests.length === 0) {
      return res.status(400).json({ success: false, message: "Destination, days and interests required." });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(501).json({ success: false, message: "LLM itinerary is not configured (missing GEMINI_API_KEY)." });
    }

    const model = process.env.GEMINI_MODEL || "gemini-flash-latest";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const numDays = Math.max(1, Math.min(parseInt(days, 10) || 3, 10));
    const style = (travelStyle || "comfort").toString();
    const interestsText = interests.join(", ");
    const budgetText = budget ? `Budget: ${budget}` : "Budget: not specified";
    const monthText = month ? `Travel month: ${month}` : "Travel month: not specified";

    const prompt = [
      "You are a travel planner for India.",
      "Generate a detailed, practical, day-by-day itinerary in STRICT JSON ONLY (no markdown, no backticks).",
      "",
      "Requirements:",
      "- Output must be valid JSON (parseable).",
      "- Do not include any extra keys outside this schema.",
      "- Keep each text field concise (1-2 sentences) to fit within token limits.",
      "",
      "Schema:",
      "{",
      '  \"destination\": string,',
      '  \"duration\": string,',
      '  \"style\": string,',
      '  \"bestTime\": string,',
      '  \"overview\": string,',
      '  \"totalEstimatedCost\": string,',
      '  \"days\": [',
      "    {",
      '      \"title\": string,',
      '      \"theme\": string,',
      '      \"morning\": string,',
      '      \"afternoon\": string,',
      '      \"evening\": string,',
      '      \"tips\": string,',
      '      \"estimatedCost\": string',
      "    }",
      "  ]",
      "}",
      "",
      `Destination: ${destination}`,
      `Days: ${numDays}`,
      `Travel style: ${style}`,
      `Interests: ${interestsText}`,
      budgetText,
      monthText,
      "",
      "Make it realistic: include local transport suggestions, food ideas, and time-friendly sequencing.",
    ].join("\n");

    const tryParseJson = (text) => {
      if (!text || typeof text !== "string") return null;
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    };

    const cleanToJsonObjectText = (raw) => {
      if (!raw) return "";
      let t = String(raw).trim();

      // Remove code fences if present.
      t = t.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();

      // Extract first {...} block if model added extra text.
      const firstBrace = t.indexOf("{");
      const lastBrace = t.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        t = t.slice(firstBrace, lastBrace + 1);
      }

      // Remove trailing commas (common model mistake).
      t = t.replace(/,\s*([}\]])/g, "$1");

      // Replace smart quotes with normal quotes.
      t = t
        .replace(/[\u201C\u201D]/g, "\"")
        .replace(/[\u2018\u2019]/g, "'");

      return t.trim();
    };

    // 10-day itineraries can exceed 1800 tokens and get truncated -> invalid JSON.
    // Allocate more output tokens for larger itineraries.
    const outputTokens = numDays >= 8 ? 4096 : 3072;

    const callGemini = async (promptText, temperature) => {
      return axios.post(
        url,
        {
          contents: [{ role: "user", parts: [{ text: promptText }] }],
          generationConfig: {
            // JSON mode drastically reduces invalid JSON responses.
            responseMimeType: "application/json",
            temperature,
            maxOutputTokens: outputTokens,
          },
        },
        // Keep this slightly lower than the frontend timeout so the server can respond cleanly.
        { timeout: 150000 }
      );
    };

    const geminiRes = await callGemini(prompt, 0.3);

    const rawText =
      geminiRes.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("") ||
      "";

    // Cleanup + validate so the frontend doesn't crash on JSON.parse.
    let jsonText = cleanToJsonObjectText(rawText);
    let parsed = tryParseJson(jsonText);

    // One retry with stricter instruction if JSON is still invalid.
    if (!parsed || typeof parsed !== "object") {
      const retryPrompt = [
        prompt,
        "",
        "IMPORTANT:",
        "- Return ONLY valid JSON.",
        "- Do NOT include trailing commas.",
        "- Do NOT include comments.",
        "- Do NOT include any text before or after the JSON.",
      ].join("\n");

      const retryRes = await callGemini(retryPrompt, 0.0);
      const retryRawText =
        retryRes.data?.candidates?.[0]?.content?.parts?.map((p) => p.text).filter(Boolean).join("") ||
        "";

      jsonText = cleanToJsonObjectText(retryRawText);
      parsed = tryParseJson(jsonText);

      if (!parsed || typeof parsed !== "object") {
        console.error("LLM itinerary returned invalid JSON text (after retry):", jsonText.slice(0, 800));
        return res.status(422).json({
          success: false,
          message: "Gemini returned invalid JSON. Please try again.",
          provider: "gemini",
          // Help debug locally without checking server logs.
          debug: process.env.NODE_ENV === "development"
            ? { sample: jsonText.slice(0, 2000) }
            : undefined,
        });
      }
    }

    return res.status(200).json({
      success: true,
      text: JSON.stringify(parsed),
      model,
    });
  } catch (err) {
    // Axios timeout -> 504 so the frontend can show a clear retry message.
    if (err.code === "ECONNABORTED") {
      console.error("LLM itinerary timeout:", err.message);
      return res.status(504).json({
        success: false,
        message: "LLM itinerary request timed out. Please try again or use the standard generator.",
      });
    }

    // If Gemini API returned a non-2xx response, pass through a helpful status/message.
    if (err.response) {
      const status = err.response.status || 500;
      const data = err.response.data;
      const providerMessage =
        data?.error?.message ||
        data?.message ||
        (typeof data === "string" ? data : null) ||
        "Gemini API request failed.";

      console.error("LLM itinerary upstream error:", { status, data });
      return res.status(status).json({
        success: false,
        message: providerMessage,
        provider: "gemini",
      });
    }

    console.error("LLM itinerary error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Could not generate LLM itinerary.",
      provider: "gemini",
    });
  }
});

module.exports = router;

