// ============================================================
// controllers/destinationController.js - SMART VERSION
// Uses MongoDB cache + Local fallback data
// No infinite loops, handles API rate limits gracefully
// ============================================================

const axios = require("axios");
const DestinationCache = require("../models/DestinationCache");

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const headers = {
  "X-RapidAPI-Key": RAPIDAPI_KEY,
  "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
};

// Track if refresh is already running
let isRefreshing = false;

const INDIAN_CITIES = [
  { name: "Agra",       id: "297683", state: "Uttar Pradesh" },
  { name: "Jaipur",     id: "304554", state: "Rajasthan" },
  { name: "Goa",        id: "297604", state: "Goa" },
  { name: "Delhi",      id: "304551", state: "Delhi" },
  { name: "Varanasi",   id: "297670", state: "Uttar Pradesh" },
  { name: "Udaipur",    id: "303963", state: "Rajasthan" },
  { name: "Mumbai",     id: "304574", state: "Maharashtra" },
  { name: "Mysore",     id: "297580", state: "Karnataka" },
  { name: "Amritsar",   id: "298564", state: "Punjab" },
  { name: "Rishikesh",  id: "1374645", state: "Uttarakhand" },
  { name: "Manali",     id: "1539327", state: "Himachal Pradesh" },
  { name: "Ooty",       id: "297587", state: "Tamil Nadu" },
  { name: "Darjeeling", id: "297579", state: "West Bengal" },
  { name: "Kolkata",    id: "293978", state: "West Bengal" },
  { name: "Chennai",    id: "297668", state: "Tamil Nadu" },
  { name: "Hampi",      id: "479688", state: "Karnataka" },
  { name: "Jodhpur",    id: "303960", state: "Rajasthan" },
  { name: "Munnar",     id: "297577", state: "Kerala" },
  { name: "Kochi",      id: "297575", state: "Kerala" },
  { name: "Pushkar",    id: "304022", state: "Rajasthan" },
];

// ── Local fallback data (always works, no API needed) ────────
const LOCAL_DESTINATIONS = [
  { tripadvisorId: "local_1",  name: "Taj Mahal",           citySource: "Agra",       location: { city: "Agra", state: "Uttar Pradesh", country: "India" },        categories: ["historical"],              rating: 4.9, reviewCount: 95000, image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", description: "The Taj Mahal is an ivory-white marble mausoleum, one of the Seven Wonders of the World.", shortDescription: "Iconic white marble wonder — symbol of eternal love.", bestTimeToVisit: "October to March", entryFee: "₹50 (Indian)", phone: "+91 562 222 6431", address: "Dharmapuri, Agra", tripAdvisorUrl: "", rankingString: "#1 in Agra", popularActivities: ["Sunrise visit", "Agra Fort", "Fatehpur Sikri"] },
  { tripadvisorId: "local_2",  name: "Agra Fort",            citySource: "Agra",       location: { city: "Agra", state: "Uttar Pradesh", country: "India" },        categories: ["historical"],              rating: 4.5, reviewCount: 12000, image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", description: "Agra Fort is a UNESCO World Heritage Site and was the main residence of Mughal emperors.", shortDescription: "Magnificent Mughal red sandstone fort.", bestTimeToVisit: "October to March", entryFee: "₹40 (Indian)", phone: "", address: "Agra Fort, Agra", tripAdvisorUrl: "", rankingString: "#2 in Agra", popularActivities: ["Fort exploration", "Diwan-i-Khas", "Sound & Light show"] },
  { tripadvisorId: "local_3",  name: "Hawa Mahal",           citySource: "Jaipur",     location: { city: "Jaipur", state: "Rajasthan", country: "India" },           categories: ["historical", "culture"],  rating: 4.6, reviewCount: 25000, image: "https://images.unsplash.com/photo-1477587458883-47145ed31fd8?w=800&q=80", description: "The Palace of Winds is an iconic five-story palace with 953 small windows.", shortDescription: "The Pink City's iconic palace of winds.", bestTimeToVisit: "October to March", entryFee: "₹50 (Indian)", phone: "", address: "Hawa Mahal Rd, Jaipur", tripAdvisorUrl: "", rankingString: "#1 in Jaipur", popularActivities: ["Photography", "Amer Fort", "City Palace"] },
  { tripadvisorId: "local_4",  name: "Amber Fort",           citySource: "Jaipur",     location: { city: "Jaipur", state: "Rajasthan", country: "India" },           categories: ["historical"],              rating: 4.7, reviewCount: 32000, image: "https://images.unsplash.com/photo-1477587458883-47145ed31fd8?w=800&q=80", description: "Amber Fort is a majestic hilltop fortress combining Rajput and Mughal architecture.", shortDescription: "Majestic hilltop Rajput-Mughal fortress.", bestTimeToVisit: "October to March", entryFee: "₹100 (Indian)", phone: "", address: "Devisinghpura, Amer, Jaipur", tripAdvisorUrl: "", rankingString: "#2 in Jaipur", popularActivities: ["Elephant ride", "Light show", "Sheesh Mahal"] },
  { tripadvisorId: "local_5",  name: "Baga Beach",           citySource: "Goa",        location: { city: "Goa", state: "Goa", country: "India" },                    categories: ["beach"],                   rating: 4.3, reviewCount: 18000, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80", description: "Baga Beach is one of the most popular beaches in Goa, known for water sports and nightlife.", shortDescription: "Popular Goa beach with water sports and nightlife.", bestTimeToVisit: "November to February", entryFee: "Free", phone: "", address: "Baga, Goa", tripAdvisorUrl: "", rankingString: "#1 Beach in Goa", popularActivities: ["Water sports", "Beach shacks", "Nightlife"] },
  { tripadvisorId: "local_6",  name: "Calangute Beach",      citySource: "Goa",        location: { city: "Goa", state: "Goa", country: "India" },                    categories: ["beach"],                   rating: 4.2, reviewCount: 22000, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80", description: "Calangute is the largest beach in North Goa and one of the busiest tourist spots.", shortDescription: "The Queen of Beaches in North Goa.", bestTimeToVisit: "November to February", entryFee: "Free", phone: "", address: "Calangute, North Goa", tripAdvisorUrl: "", rankingString: "#2 Beach in Goa", popularActivities: ["Swimming", "Shopping", "Watersports"] },
  { tripadvisorId: "local_7",  name: "Anjuna Beach",         citySource: "Goa",        location: { city: "Goa", state: "Goa", country: "India" },                    categories: ["beach"],                   rating: 4.4, reviewCount: 15000, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80", description: "Anjuna Beach is famous for its scenic beauty, flea market, and trance music culture.", shortDescription: "Famous for flea market and trance music culture.", bestTimeToVisit: "November to February", entryFee: "Free", phone: "", address: "Anjuna, North Goa", tripAdvisorUrl: "", rankingString: "#3 in Goa", popularActivities: ["Flea market", "Cliff views", "Yoga"] },
  { tripadvisorId: "local_8",  name: "Palolem Beach",        citySource: "Goa",        location: { city: "Goa", state: "Goa", country: "India" },                    categories: ["beach"],                   rating: 4.5, reviewCount: 12000, image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80", description: "Palolem is a crescent-shaped beach in South Goa, known for its calm waters.", shortDescription: "Crescent-shaped paradise beach in South Goa.", bestTimeToVisit: "November to February", entryFee: "Free", phone: "", address: "Palolem, South Goa", tripAdvisorUrl: "", rankingString: "#1 in South Goa", popularActivities: ["Kayaking", "Dolphin watching", "Silent noise parties"] },
  { tripadvisorId: "local_9",  name: "Old Goa Churches",     citySource: "Goa",        location: { city: "Goa", state: "Goa", country: "India" },                    categories: ["historical", "pilgrimage"],rating: 4.5, reviewCount: 8000,  image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80", description: "Old Goa has a collection of UNESCO-listed churches including Basilica of Bom Jesus.", shortDescription: "UNESCO-listed Portuguese colonial churches.", bestTimeToVisit: "November to March", entryFee: "Free", phone: "", address: "Old Goa, North Goa", tripAdvisorUrl: "", rankingString: "UNESCO Heritage", popularActivities: ["Church visits", "Museum", "Photography"] },
  { tripadvisorId: "local_10", name: "Qutub Minar",          citySource: "Delhi",      location: { city: "New Delhi", state: "Delhi", country: "India" },            categories: ["historical"],              rating: 4.5, reviewCount: 42000, image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", description: "Qutub Minar is a UNESCO World Heritage Site and the tallest minaret in India.", shortDescription: "UNESCO listed — tallest minaret in India.", bestTimeToVisit: "October to March", entryFee: "₹40 (Indian)", phone: "", address: "Seth Sarai, New Delhi", tripAdvisorUrl: "", rankingString: "#1 in Delhi", popularActivities: ["Exploration", "Photography", "Museum"] },
  { tripadvisorId: "local_11", name: "India Gate",           citySource: "Delhi",      location: { city: "New Delhi", state: "Delhi", country: "India" },            categories: ["historical", "culture"],  rating: 4.5, reviewCount: 55000, image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", description: "India Gate is a war memorial dedicated to soldiers who died in World War I.", shortDescription: "Iconic war memorial and national monument.", bestTimeToVisit: "October to March", entryFee: "Free", phone: "", address: "Rajpath, New Delhi", tripAdvisorUrl: "", rankingString: "#2 in Delhi", popularActivities: ["Evening visit", "Picnic", "Photography"] },
  { tripadvisorId: "local_12", name: "Red Fort",             citySource: "Delhi",      location: { city: "New Delhi", state: "Delhi", country: "India" },            categories: ["historical"],              rating: 4.3, reviewCount: 38000, image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", description: "Red Fort is a UNESCO World Heritage Site and served as the main residence of Mughal emperors.", shortDescription: "Mughal Emperor's Red Sandstone UNESCO fortress.", bestTimeToVisit: "October to March", entryFee: "₹35 (Indian)", phone: "", address: "Netaji Subhash Marg, New Delhi", tripAdvisorUrl: "", rankingString: "#3 in Delhi", popularActivities: ["Sound & Light show", "Museum", "Exploration"] },
  { tripadvisorId: "local_13", name: "Humayun Tomb",         citySource: "Delhi",      location: { city: "New Delhi", state: "Delhi", country: "India" },            categories: ["historical"],              rating: 4.5, reviewCount: 22000, image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80", description: "Humayun's Tomb is a UNESCO listed masterpiece, predecessor to the Taj Mahal.", shortDescription: "Mughal garden tomb — precursor to Taj Mahal.", bestTimeToVisit: "October to March", entryFee: "₹40 (Indian)", phone: "", address: "Mathura Road, New Delhi", tripAdvisorUrl: "", rankingString: "#4 in Delhi", popularActivities: ["Architecture tour", "Garden walk", "Photography"] },
  { tripadvisorId: "local_14", name: "Ganga Aarti",          citySource: "Varanasi",   location: { city: "Varanasi", state: "Uttar Pradesh", country: "India" },     categories: ["pilgrimage", "culture"],  rating: 4.8, reviewCount: 28000, image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80", description: "The evening Ganga Aarti at Dashashwamedh Ghat is a mesmerizing spiritual ritual.", shortDescription: "Mesmerizing evening fire ritual on the Ganges.", bestTimeToVisit: "October to March", entryFee: "Free", phone: "", address: "Dashashwamedh Ghat, Varanasi", tripAdvisorUrl: "", rankingString: "#1 in Varanasi", popularActivities: ["Boat ride", "Aarti ceremony", "Temple visit"] },
  { tripadvisorId: "local_15", name: "Kashi Vishwanath Temple", citySource: "Varanasi", location: { city: "Varanasi", state: "Uttar Pradesh", country: "India" },    categories: ["pilgrimage"],              rating: 4.7, reviewCount: 35000, image: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=800&q=80", description: "One of the most sacred Hindu temples dedicated to Lord Shiva.", shortDescription: "Most sacred Shiva temple in Hinduism.", bestTimeToVisit: "October to March", entryFee: "Free", phone: "", address: "Lahori Tola, Varanasi", tripAdvisorUrl: "", rankingString: "#2 in Varanasi", popularActivities: ["Darshan", "Ghats walk", "Spiritual tour"] },
  { tripadvisorId: "local_16", name: "City Palace Udaipur",  citySource: "Udaipur",    location: { city: "Udaipur", state: "Rajasthan", country: "India" },          categories: ["historical", "culture"],  rating: 4.7, reviewCount: 18000, image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80", description: "City Palace is a massive palace complex overlooking Lake Pichola.", shortDescription: "Magnificent palace complex on Lake Pichola.", bestTimeToVisit: "September to March", entryFee: "₹30 (Indian)", phone: "", address: "City Palace Rd, Udaipur", tripAdvisorUrl: "", rankingString: "#1 in Udaipur", popularActivities: ["Palace tour", "Lake view", "Museum"] },
  { tripadvisorId: "local_17", name: "Lake Pichola",         citySource: "Udaipur",    location: { city: "Udaipur", state: "Rajasthan", country: "India" },          categories: ["nature"],                  rating: 4.6, reviewCount: 22000, image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80", description: "Lake Pichola is an artificial fresh water lake with two islands — Jag Niwas and Jag Mandir.", shortDescription: "Romantic artificial lake with island palaces.", bestTimeToVisit: "September to March", entryFee: "Free", phone: "", address: "Udaipur", tripAdvisorUrl: "", rankingString: "#2 in Udaipur", popularActivities: ["Boat ride", "Sunset view", "Photography"] },
  { tripadvisorId: "local_18", name: "Gateway of India",     citySource: "Mumbai",     location: { city: "Mumbai", state: "Maharashtra", country: "India" },        categories: ["historical"],              rating: 4.4, reviewCount: 45000, image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80", description: "The Gateway of India is an arch monument built in 1924 on the waterfront of Mumbai.", shortDescription: "Iconic arch monument on Mumbai waterfront.", bestTimeToVisit: "November to February", entryFee: "Free", phone: "", address: "Apollo Bandar, Mumbai", tripAdvisorUrl: "", rankingString: "#1 in Mumbai", popularActivities: ["Boat rides", "Photography", "Elephanta Caves trip"] },
  { tripadvisorId: "local_19", name: "Marine Drive",         citySource: "Mumbai",     location: { city: "Mumbai", state: "Maharashtra", country: "India" },        categories: ["beach", "nature"],         rating: 4.5, reviewCount: 38000, image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80", description: "Marine Drive is a 3.6 km long boulevard along the coast of Mumbai.", shortDescription: "Queen's Necklace — Mumbai's iconic seafront boulevard.", bestTimeToVisit: "November to February", entryFee: "Free", phone: "", address: "Marine Drive, Mumbai", tripAdvisorUrl: "", rankingString: "#2 in Mumbai", popularActivities: ["Evening walk", "Sunset watching", "Photography"] },
  { tripadvisorId: "local_20", name: "Elephanta Caves",      citySource: "Mumbai",     location: { city: "Mumbai", state: "Maharashtra", country: "India" },        categories: ["historical", "culture"],  rating: 4.2, reviewCount: 15000, image: "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&q=80", description: "Elephanta Caves are a UNESCO World Heritage Site with ancient rock-cut cave temples.", shortDescription: "UNESCO rock-cut cave temples on island near Mumbai.", bestTimeToVisit: "November to February", entryFee: "₹40 (Indian)", phone: "", address: "Elephanta Island, Mumbai", tripAdvisorUrl: "", rankingString: "#3 in Mumbai", popularActivities: ["Cave exploration", "Ferry ride", "Photography"] },
  { tripadvisorId: "local_21", name: "Mysore Palace",        citySource: "Mysore",     location: { city: "Mysore", state: "Karnataka", country: "India" },          categories: ["historical", "culture"],  rating: 4.7, reviewCount: 32000, image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80", description: "Mysore Palace is one of the most magnificent royal palaces in India.", shortDescription: "Magnificent royal palace — must visit in Karnataka.", bestTimeToVisit: "October to February", entryFee: "₹70 (Indian)", phone: "", address: "Sayyaji Rao Rd, Mysore", tripAdvisorUrl: "", rankingString: "#1 in Mysore", popularActivities: ["Palace tour", "Light show", "Shopping"] },
  { tripadvisorId: "local_22", name: "Golden Temple",        citySource: "Amritsar",   location: { city: "Amritsar", state: "Punjab", country: "India" },           categories: ["pilgrimage", "historical"],rating: 4.9, reviewCount: 65000, image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?w=800&q=80", description: "The Harmandir Sahib (Golden Temple) is the holiest shrine of Sikhism.", shortDescription: "Holiest Sikh shrine — golden temple of eternal peace.", bestTimeToVisit: "November to March", entryFee: "Free", phone: "", address: "Golden Temple Rd, Amritsar", tripAdvisorUrl: "", rankingString: "#1 in Amritsar", popularActivities: ["Langar", "Darshan", "Wagah Border"] },
  { tripadvisorId: "local_23", name: "Laxman Jhula",         citySource: "Rishikesh",  location: { city: "Rishikesh", state: "Uttarakhand", country: "India" },     categories: ["adventure", "pilgrimage"],rating: 4.5, reviewCount: 22000, image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=800&q=80", description: "Laxman Jhula is an iconic iron suspension bridge over the Ganges River.", shortDescription: "Iconic suspension bridge over the holy Ganges.", bestTimeToVisit: "February to November", entryFee: "Free", phone: "", address: "Laxman Jhula, Rishikesh", tripAdvisorUrl: "", rankingString: "#1 in Rishikesh", popularActivities: ["River rafting", "Yoga", "Bungee jumping"] },
  { tripadvisorId: "local_24", name: "Rohtang Pass",         citySource: "Manali",     location: { city: "Manali", state: "Himachal Pradesh", country: "India" },   categories: ["adventure", "hill_stations"], rating: 4.6, reviewCount: 18000, image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80", description: "Rohtang Pass is a high mountain pass at 3,978m connecting Kullu Valley to Lahaul.", shortDescription: "High altitude mountain pass with snow views.", bestTimeToVisit: "May to November", entryFee: "₹550 (permit)", phone: "", address: "Rohtang, Manali", tripAdvisorUrl: "", rankingString: "#1 in Manali", popularActivities: ["Snow activities", "Trekking", "Photography"] },
  { tripadvisorId: "local_25", name: "Ooty Lake",            citySource: "Ooty",       location: { city: "Ooty", state: "Tamil Nadu", country: "India" },           categories: ["nature", "hill_stations"], rating: 4.3, reviewCount: 15000, image: "https://images.unsplash.com/photo-1600298882525-7d17e8ca9f24?w=800&q=80", description: "Ooty Lake is a picturesque artificial lake in the Nilgiri Hills.", shortDescription: "Picturesque artificial lake in Nilgiri Hills.", bestTimeToVisit: "April to June", entryFee: "Free", phone: "", address: "Ooty Lake Road, Ooty", tripAdvisorUrl: "", rankingString: "#1 in Ooty", popularActivities: ["Boating", "Toy Train", "Botanical Garden"] },
  { tripadvisorId: "local_26", name: "Tiger Hill Darjeeling", citySource: "Darjeeling", location: { city: "Darjeeling", state: "West Bengal", country: "India" },   categories: ["nature", "hill_stations"], rating: 4.6, reviewCount: 12000, image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc32?w=800&q=80", description: "Tiger Hill offers the most spectacular sunrise view of Mount Kanchenjunga.", shortDescription: "Best sunrise view of Mount Kanchenjunga.", bestTimeToVisit: "March to May", entryFee: "Free", phone: "", address: "Tiger Hill, Darjeeling", tripAdvisorUrl: "", rankingString: "#1 in Darjeeling", popularActivities: ["Sunrise view", "Toy Train", "Tea gardens"] },
  { tripadvisorId: "local_27", name: "Victoria Memorial",    citySource: "Kolkata",    location: { city: "Kolkata", state: "West Bengal", country: "India" },       categories: ["historical", "culture"],  rating: 4.6, reviewCount: 28000, image: "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&q=80", description: "Victoria Memorial is a magnificent white marble building dedicated to Queen Victoria.", shortDescription: "Grand white marble memorial — jewel of Kolkata.", bestTimeToVisit: "October to March", entryFee: "₹30 (Indian)", phone: "", address: "Victoria Memorial Hall, Kolkata", tripAdvisorUrl: "", rankingString: "#1 in Kolkata", popularActivities: ["Museum", "Garden walk", "Light show"] },
  { tripadvisorId: "local_28", name: "Marina Beach",         citySource: "Chennai",    location: { city: "Chennai", state: "Tamil Nadu", country: "India" },        categories: ["beach"],                   rating: 4.3, reviewCount: 32000, image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", description: "Marina Beach is one of the longest urban beaches in the world at 13km.", shortDescription: "World's second longest urban beach.", bestTimeToVisit: "November to February", entryFee: "Free", phone: "", address: "Marina Beach, Chennai", tripAdvisorUrl: "", rankingString: "#1 in Chennai", popularActivities: ["Morning walk", "Seafood", "Sunset"] },
  { tripadvisorId: "local_29", name: "Virupaksha Temple",    citySource: "Hampi",      location: { city: "Hampi", state: "Karnataka", country: "India" },           categories: ["historical", "pilgrimage"],rating: 4.7, reviewCount: 15000, image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80", description: "Virupaksha Temple is one of the oldest and most sacred temples in Hampi.", shortDescription: "Ancient sacred temple in UNESCO Hampi ruins.", bestTimeToVisit: "October to February", entryFee: "Free", phone: "", address: "Hampi Bazaar, Hampi", tripAdvisorUrl: "", rankingString: "#1 in Hampi", popularActivities: ["Temple visit", "Coracle ride", "Sunset view"] },
  { tripadvisorId: "local_30", name: "Mehrangarh Fort",      citySource: "Jodhpur",    location: { city: "Jodhpur", state: "Rajasthan", country: "India" },         categories: ["historical"],              rating: 4.7, reviewCount: 28000, image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80", description: "Mehrangarh Fort is one of the largest forts in India, overlooking the Blue City.", shortDescription: "Massive fort overlooking the Blue City of Jodhpur.", bestTimeToVisit: "October to March", entryFee: "₹100 (Indian)", phone: "", address: "Fort Rd, Jodhpur", tripAdvisorUrl: "", rankingString: "#1 in Jodhpur", popularActivities: ["Fort tour", "Zip-lining", "Museum"] },
  { tripadvisorId: "local_31", name: "Munnar Tea Gardens",   citySource: "Munnar",     location: { city: "Munnar", state: "Kerala", country: "India" },             categories: ["nature", "hill_stations"], rating: 4.7, reviewCount: 22000, image: "https://images.unsplash.com/photo-1570458436416-b8fcccfe883f?w=800&q=80", description: "Munnar is home to vast tea plantations in the Western Ghats at 1600m altitude.", shortDescription: "Endless tea plantations in Western Ghats.", bestTimeToVisit: "September to March", entryFee: "Free", phone: "", address: "Munnar, Kerala", tripAdvisorUrl: "", rankingString: "#1 in Munnar", popularActivities: ["Tea plantation tour", "Trekking", "Wildlife"] },
  { tripadvisorId: "local_32", name: "Kerala Backwaters",    citySource: "Kochi",      location: { city: "Alleppey", state: "Kerala", country: "India" },           categories: ["nature", "culture"],       rating: 4.8, reviewCount: 35000, image: "https://images.unsplash.com/photo-1593106410288-caf65eca7c9d?w=800&q=80", description: "Kerala's backwaters offer a unique houseboat experience through tranquil waterways.", shortDescription: "Houseboat cruises through Kerala's tranquil backwaters.", bestTimeToVisit: "September to March", entryFee: "Houseboat fees apply", phone: "", address: "Alleppey, Kerala", tripAdvisorUrl: "", rankingString: "#1 in Kerala", popularActivities: ["Houseboat cruise", "Village tours", "Canoe rides"] },
  { tripadvisorId: "local_33", name: "Brahma Temple Pushkar", citySource: "Pushkar",   location: { city: "Pushkar", state: "Rajasthan", country: "India" },         categories: ["pilgrimage"],              rating: 4.6, reviewCount: 12000, image: "https://images.unsplash.com/photo-1477587458883-47145ed31fd8?w=800&q=80", description: "The Brahma Temple in Pushkar is one of the very few temples dedicated to Lord Brahma.", shortDescription: "One of India's rarest temples dedicated to Lord Brahma.", bestTimeToVisit: "October to March", entryFee: "Free", phone: "", address: "Pushkar, Rajasthan", tripAdvisorUrl: "", rankingString: "#1 in Pushkar", popularActivities: ["Temple visit", "Camel fair", "Pushkar Lake"] },
  { tripadvisorId: "local_34", name: "Ranthambore Tiger Reserve", citySource: "Jaipur", location: { city: "Sawai Madhopur", state: "Rajasthan", country: "India" }, categories: ["wildlife", "adventure"],   rating: 4.8, reviewCount: 18000, image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80", description: "Ranthambore is one of the best places in India to spot Royal Bengal Tigers.", shortDescription: "Best tiger spotting destination in India.", bestTimeToVisit: "October to June", entryFee: "₹200 (Indian)", phone: "", address: "Ranthambore, Rajasthan", tripAdvisorUrl: "", rankingString: "Top Wildlife in India", popularActivities: ["Tiger safari", "Bird watching", "Fort visit"] },
  { tripadvisorId: "local_35", name: "Jim Corbett National Park", citySource: "Delhi", location: { city: "Ramnagar", state: "Uttarakhand", country: "India" },     categories: ["wildlife", "nature"],      rating: 4.7, reviewCount: 22000, image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80", description: "India's oldest national park is famous for its Bengal tiger population.", shortDescription: "India's oldest and most famous tiger reserve.", bestTimeToVisit: "November to June", entryFee: "₹150 (Indian)", phone: "", address: "Ramnagar, Uttarakhand", tripAdvisorUrl: "", rankingString: "Top Wildlife Park", popularActivities: ["Jeep safari", "Elephant safari", "Bird watching"] },
  { tripadvisorId: "local_36", name: "Coorg Coffee Estates",  citySource: "Mysore",    location: { city: "Coorg", state: "Karnataka", country: "India" },          categories: ["nature", "hill_stations", "food"], rating: 4.6, reviewCount: 15000, image: "https://images.unsplash.com/photo-1598977123118-4e30ba3c4f5b?w=800&q=80", description: "Coorg is known as the Scotland of India with vast coffee and tea estates.", shortDescription: "Scotland of India — coffee estates and waterfalls.", bestTimeToVisit: "October to March", entryFee: "Free", phone: "", address: "Coorg, Karnataka", tripAdvisorUrl: "", rankingString: "Top Hill Station Karnataka", popularActivities: ["Coffee tour", "Trekking", "River rafting"] },
  { tripadvisorId: "local_37", name: "Spiti Valley",          citySource: "Manali",    location: { city: "Kaza", state: "Himachal Pradesh", country: "India" },    categories: ["adventure", "hill_stations", "culture"], rating: 4.9, reviewCount: 8000, image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80", description: "Spiti Valley is a cold desert mountain valley in the trans-Himalayan region.", shortDescription: "Remote cold desert with ancient monasteries.", bestTimeToVisit: "June to October", entryFee: "Free", phone: "", address: "Kaza, Spiti Valley", tripAdvisorUrl: "", rankingString: "Top Offbeat Destination", popularActivities: ["Bike trip", "Monastery visits", "Stargazing"] },
  { tripadvisorId: "local_38", name: "Rishikesh River Rafting", citySource: "Rishikesh", location: { city: "Rishikesh", state: "Uttarakhand", country: "India" }, categories: ["adventure"],               rating: 4.7, reviewCount: 28000, image: "https://images.unsplash.com/photo-1609920658906-8223bd289001?w=800&q=80", description: "Rishikesh offers world-class white water rafting on the Ganges River.", shortDescription: "World-class white water rafting on the Ganges.", bestTimeToVisit: "February to November", entryFee: "₹600-1500", phone: "", address: "Rishikesh, Uttarakhand", tripAdvisorUrl: "", rankingString: "#1 Adventure Activity", popularActivities: ["Grade 3-4 rapids", "Camping", "Bungee jumping"] },
  { tripadvisorId: "local_39", name: "Darjeeling Toy Train",  citySource: "Darjeeling", location: { city: "Darjeeling", state: "West Bengal", country: "India" },  categories: ["hill_stations", "culture"],rating: 4.7, reviewCount: 18000, image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc32?w=800&q=80", description: "The Darjeeling Himalayan Railway is a UNESCO World Heritage site narrow gauge railway.", shortDescription: "UNESCO listed toy train through Himalayan tea gardens.", bestTimeToVisit: "March to May", entryFee: "₹30 (Indian)", phone: "", address: "Darjeeling Station", tripAdvisorUrl: "", rankingString: "UNESCO Heritage Railway", popularActivities: ["Joyride", "Tea garden views", "Photography"] },
  { tripadvisorId: "local_40", name: "Fort Kochi",            citySource: "Kochi",      location: { city: "Kochi", state: "Kerala", country: "India" },             categories: ["historical", "culture"],  rating: 4.5, reviewCount: 22000, image: "https://images.unsplash.com/photo-1593106410288-caf65eca7c9d?w=800&q=80", description: "Fort Kochi is a historic neighbourhood with Chinese fishing nets, colonial buildings and art galleries.", shortDescription: "Historic colonial neighbourhood with Chinese fishing nets.", bestTimeToVisit: "October to March", entryFee: "Free", phone: "", address: "Fort Kochi, Kerala", tripAdvisorUrl: "", rankingString: "#1 in Kochi", popularActivities: ["Chinese fishing nets", "Art walks", "Kathakali show"] },
].map(d => ({ ...d, source: "Local", fetchedAt: new Date() }));

// ── Seed local data to MongoDB ───────────────────────────────
const seedLocalData = async () => {
  const count = await DestinationCache.countDocuments();
  if (count > 0) return; // Already has data

  console.log("🌱 Seeding local destination data...");
  for (const dest of LOCAL_DESTINATIONS) {
    await DestinationCache.findOneAndUpdate(
      { tripadvisorId: dest.tripadvisorId },
      dest,
      { upsert: true, new: true }
    );
  }
  console.log(`✅ Seeded ${LOCAL_DESTINATIONS.length} local destinations!`);
};

// ── Fetch from TripAdvisor API ───────────────────────────────
const detectCategories = (place) => {
  const t = `${(place.name || "").toLowerCase()} ${(place.description || "").toLowerCase()} ${Array.isArray(place.subcategory) ? place.subcategory.map(s => s.key || "").join(",") : ""}`;
  const cats = [];
  if (t.match(/fort|palace|mahal|tomb|monument|ancient|mughal|medieval|heritage/)) cats.push("historical");
  if (t.match(/\bpark\b|garden|lake|river|waterfall|forest|valley|nature/)) cats.push("nature");
  if (t.match(/\bbeach\b|coast|shore|bay|island|marine/)) cats.push("beach");
  if (t.match(/trek|adventure|rafting|bungee|paragliding|climbing|camping/)) cats.push("adventure");
  if (t.match(/wildlife|zoo|safari|tiger|elephant|sanctuary/)) cats.push("wildlife");
  if (t.match(/\btemple\b|mosque|church|shrine|holy|sacred|pilgrimage|ghat|aarti/)) cats.push("pilgrimage");
  if (t.match(/hill station|mountain|peak|himalaya|snow/)) cats.push("hill_stations");
  if (t.match(/food|restaurant|cuisine|street food|market|bazaar/)) cats.push("food");
  if (t.match(/museum|art|cultural|theatre|dance|craft/)) cats.push("culture");
  return cats.length > 0 ? [...new Set(cats)] : ["culture"];
};

const isRealPlace = (item) => {
  if (!item.location_id || item.location_id === "0" || !item.name || !item.photo) return false;
  const name = item.name.toLowerCase();
  return !["tour ", "tours", "shuttle", "taxi", "transfer", "day trip", "booking", "ticket", "package", "cab ", "casino"].some(w => name.includes(w));
};

const fetchFromAPI = async () => {
  if (isRefreshing) return;
  isRefreshing = true;
  console.log("🔄 Fetching fresh data from TripAdvisor API...");
  let totalFetched = 0;

  for (const city of INDIAN_CITIES) {
    try {
      const [p1, p2] = await Promise.all([
        axios.get("https://travel-advisor.p.rapidapi.com/attractions/list", {
          params: { location_id: city.id, currency: "INR", lang: "en_US", limit: "30", offset: "0", sort: "ranking" },
          headers, timeout: 10000,
        }).then(r => r.data?.data || []).catch(() => []),
        axios.get("https://travel-advisor.p.rapidapi.com/attractions/list", {
          params: { location_id: city.id, currency: "INR", lang: "en_US", limit: "30", offset: "30", sort: "ranking" },
          headers, timeout: 10000,
        }).then(r => r.data?.data || []).catch(() => []),
      ]);

      const places = [...p1, ...p2].filter(isRealPlace);
      let saved = 0;

      for (const place of places) {
        const locationStr = place.location_string || "";
        const STATES = ["india","goa","rajasthan","maharashtra","karnataka","kerala","tamil","pradesh","west bengal","delhi","punjab","uttarakhand","himachal"];
        if (locationStr && !STATES.some(s => locationStr.toLowerCase().includes(s))) continue;

        const parts = locationStr.split(",").map(p => p.trim());
        const img = place.photo?.images?.large?.url || place.photo?.images?.medium?.url || `https://picsum.photos/seed/${encodeURIComponent(place.name)}/800/600`;

        await DestinationCache.findOneAndUpdate(
          { tripadvisorId: place.location_id },
          {
            tripadvisorId: place.location_id,
            name: place.name,
            citySource: city.name,
            location: { city: parts[0] || city.name, state: parts[1] || city.state, country: "India" },
            description: place.description || `${place.name} is a top attraction in ${city.name}.`,
            shortDescription: (place.description || `Top attraction in ${city.name}`).substring(0, 150),
            categories: detectCategories(place),
            image: img,
            rating: parseFloat(place.rating) || 4.0,
            reviewCount: parseInt(place.num_reviews) || 0,
            bestTimeToVisit: "October to March",
            entryFee: place.admission || "Check locally",
            popularActivities: Array.isArray(place.subcategory) ? place.subcategory.map(s => s.localized_name).filter(Boolean) : [],
            tripAdvisorUrl: place.web_url || "",
            rankingString: place.ranking_string || "",
            phone: place.phone || "",
            address: [place.address_obj?.street1, place.address_obj?.city].filter(Boolean).join(", ") || locationStr,
            source: "TripAdvisor",
            fetchedAt: new Date(),
          },
          { upsert: true }
        ).catch(() => {});
        saved++;
        totalFetched++;
      }
      console.log(`✅ ${city.name}: ${saved} destinations cached`);
    } catch (err) {
      console.error(`❌ ${city.name} failed:`, err.message);
    }
  }

  console.log(`✅ API fetch complete! Total: ${totalFetched} new destinations`);
  isRefreshing = false;
};

// ── Initialize: seed local data + try API ───────────────────
const initializeCache = async () => {
  await seedLocalData();
  // Try API refresh in background (won't block startup)
  setTimeout(() => fetchFromAPI(), 5000);
};

// Call on module load
initializeCache();

// ── API ROUTES ───────────────────────────────────────────────

const getAllDestinations = async (req, res) => {
  try {
    const { category, search, city, limit = 500 } = req.query;
    let query = {};

    if (city && city !== "All Cities") query.citySource = { $regex: city, $options: "i" };
    if (category && category !== "all") query.categories = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
        { citySource: { $regex: search, $options: "i" } },
      ];
    }

    const destinations = await DestinationCache.find(query).sort({ rating: -1 }).limit(parseInt(limit)).lean();
    const formatted = destinations.map(d => ({ _id: d.tripadvisorId, ...d }));

    // Stats
    const allDocs = await DestinationCache.find(city && city !== "All Cities" ? { citySource: { $regex: city, $options: "i" } } : {}).select("categories citySource").lean();
    const stats = {};
    allDocs.forEach(d => d.categories?.forEach(c => { stats[c] = (stats[c] || 0) + 1; }));

    const cityStats = {};
    const allCities = await DestinationCache.find().select("citySource").lean();
    allCities.forEach(d => { if (d.citySource) cityStats[d.citySource] = (cityStats[d.citySource] || 0) + 1; });

    res.status(200).json({
      success: true,
      count: formatted.length,
      totalInDB: await DestinationCache.countDocuments(),
      categoryStats: stats,
      cityStats,
      fromCache: true,
      destinations: formatted,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch destinations." });
  }
};

const getPopularDestinations = async (req, res) => {
  try {
    const { city = "Agra", limit = 30 } = req.query;
    const destinations = await DestinationCache.find({ citySource: { $regex: city, $options: "i" } }).sort({ rating: -1 }).limit(parseInt(limit)).lean();
    res.status(200).json({ success: true, count: destinations.length, city, destinations: destinations.map(d => ({ _id: d.tripadvisorId, ...d })) });
  } catch { res.status(500).json({ success: false, message: "Could not fetch." }); }
};

const getByCategory = async (req, res) => {
  try {
    const { category, limit = 30 } = req.query;
    if (!category) return res.status(400).json({ success: false, message: "Category required" });
    const destinations = await DestinationCache.find({ categories: category }).sort({ rating: -1 }).limit(parseInt(limit)).lean();
    res.status(200).json({ success: true, category, count: destinations.length, destinations: destinations.map(d => ({ _id: d.tripadvisorId, ...d })) });
  } catch { res.status(500).json({ success: false, message: "Could not fetch." }); }
};

const searchDestinations = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: "Query required" });
    const destinations = await DestinationCache.find({
      $or: [{ name: { $regex: q, $options: "i" } }, { "location.city": { $regex: q, $options: "i" } }, { citySource: { $regex: q, $options: "i" } }]
    }).sort({ rating: -1 }).limit(parseInt(limit)).lean();
    res.status(200).json({ success: true, count: destinations.length, destinations: destinations.map(d => ({ _id: d.tripadvisorId, ...d })) });
  } catch { res.status(500).json({ success: false, message: "Search failed." }); }
};

const getDestinationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Search by tripadvisorId
    let cached = await DestinationCache.findOne({ tripadvisorId: id }).lean();

    // Try by MongoDB _id
    if (!cached) {
      try { cached = await DestinationCache.findById(id).lean(); } catch {}
    }

    // Try by name
    if (!cached) {
      const decodedName = decodeURIComponent(id);
      cached = await DestinationCache.findOne({ name: { $regex: decodedName, $options: "i" } }).lean();
    }

    if (cached) {
      return res.status(200).json({
        success: true,
        destination: { _id: cached.tripadvisorId || cached._id.toString(), ...cached }
      });
    }

    return res.status(404).json({ success: false, message: "Destination not found." });
  } catch (err) {
    console.error("getDestinationById error:", err.message);
    res.status(500).json({ success: false, message: "Could not fetch destination." });
  }
};

const refreshCache = async (req, res) => {
  res.status(200).json({ success: true, message: "Cache refresh started!" });
  if (!isRefreshing) fetchFromAPI();
};

module.exports = { getAllDestinations, getDestinationById, searchDestinations, getPopularDestinations, getByCategory, refreshCache };
