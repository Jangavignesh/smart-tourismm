// ============================================================
// data/seedPlaces.js - Seed Predefined Fallback Places
// Run: node data/seedPlaces.js   (from backend/ directory)
// Populates the `places` collection with 4-5 real places per
// category for each seeded city.
// ============================================================

const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });
const Place = require("../models/Place");

// ── Fallback Place Data ─────────────────────────────────────
// Each city contains 4-5 real, well-known places per category
// with accurate coordinates verified against Google Maps.
// ─────────────────────────────────────────────────────────────

const placesData = [
  // ═══════════════════════════════════════════════════════════
  //  MYSORE (Mysuru), Karnataka
  // ═══════════════════════════════════════════════════════════

  // Cafes
  { name: "The Old House Café", category: "cafe", city: "Mysore", latitude: 12.3051, longitude: 76.6551 },
  { name: "Depth N Green Café", category: "cafe", city: "Mysore", latitude: 12.3105, longitude: 76.6523 },
  { name: "Pelican Pub & Café", category: "cafe", city: "Mysore", latitude: 12.3142, longitude: 76.6610 },
  { name: "Café Aramane", category: "cafe", city: "Mysore", latitude: 12.3065, longitude: 76.6545 },
  { name: "Spring Café", category: "cafe", city: "Mysore", latitude: 12.3020, longitude: 76.6440 },

  // Restaurants
  { name: "RRR Restaurant", category: "restaurant", city: "Mysore", latitude: 12.3145, longitude: 76.6574 },
  { name: "Hotel Mylari", category: "restaurant", city: "Mysore", latitude: 12.3077, longitude: 76.6526 },
  { name: "Vinayaka Mylari", category: "restaurant", city: "Mysore", latitude: 12.3100, longitude: 76.6530 },
  { name: "Oyster Bay", category: "restaurant", city: "Mysore", latitude: 12.3152, longitude: 76.6662 },
  { name: "Hotel Hanumanthu", category: "restaurant", city: "Mysore", latitude: 12.3070, longitude: 76.6570 },

  // Fast Food
  { name: "McDonald's Mysore", category: "fast_food", city: "Mysore", latitude: 12.2993, longitude: 76.6404 },
  { name: "Domino's Pizza Saraswathipuram", category: "fast_food", city: "Mysore", latitude: 12.3120, longitude: 76.6440 },
  { name: "KFC Mysore", category: "fast_food", city: "Mysore", latitude: 12.3030, longitude: 76.6370 },
  { name: "Subway Mysore", category: "fast_food", city: "Mysore", latitude: 12.3100, longitude: 76.6530 },
  { name: "Pizza Hut Mysore", category: "fast_food", city: "Mysore", latitude: 12.2960, longitude: 76.6395 },

  // Hotels
  { name: "Radisson Blu Plaza Hotel Mysore", category: "hotel", city: "Mysore", latitude: 12.2953, longitude: 76.6130 },
  { name: "Royal Orchid Metropole", category: "hotel", city: "Mysore", latitude: 12.3098, longitude: 76.6554 },
  { name: "Windflower Spa & Resort", category: "hotel", city: "Mysore", latitude: 12.2850, longitude: 76.5980 },
  { name: "Hotel Dasaprakash", category: "hotel", city: "Mysore", latitude: 12.3082, longitude: 76.6540 },
  { name: "Lalitha Mahal Palace Hotel", category: "hotel", city: "Mysore", latitude: 12.2862, longitude: 76.6684 },

  // Parks
  { name: "Brindavan Gardens", category: "park", city: "Mysore", latitude: 12.4214, longitude: 76.5729 },
  { name: "Karanji Lake Nature Park", category: "park", city: "Mysore", latitude: 12.2910, longitude: 76.6590 },
  { name: "Chamundi Hill Park", category: "park", city: "Mysore", latitude: 12.2724, longitude: 76.6706 },
  { name: "Kukkarahalli Lake Park", category: "park", city: "Mysore", latitude: 12.3072, longitude: 76.6380 },
  { name: "GRS Fantasy Park", category: "park", city: "Mysore", latitude: 12.3200, longitude: 76.6150 },

  // Bus Stations
  { name: "Mysore KSRTC Bus Stand", category: "bus_station", city: "Mysore", latitude: 12.2976, longitude: 76.6382 },
  { name: "Mysore Sub Urban Bus Stand", category: "bus_station", city: "Mysore", latitude: 12.3060, longitude: 76.6540 },
  { name: "KSRTC Satellite Bus Station Mysore", category: "bus_station", city: "Mysore", latitude: 12.3240, longitude: 76.6280 },
  { name: "Mysore City Bus Stand", category: "bus_station", city: "Mysore", latitude: 12.3090, longitude: 76.6520 },

  // Railway Stations
  { name: "Mysore Junction Railway Station", category: "railway_station", city: "Mysore", latitude: 12.2981, longitude: 76.6383 },
  { name: "Ashokapuram Railway Station", category: "railway_station", city: "Mysore", latitude: 12.3080, longitude: 76.6260 },
  { name: "Chamarajapuram Railway Station", category: "railway_station", city: "Mysore", latitude: 12.3005, longitude: 76.6460 },
  { name: "Mysore New Goods Terminal", category: "railway_station", city: "Mysore", latitude: 12.2900, longitude: 76.6120 },

  // ═══════════════════════════════════════════════════════════
  //  CHENNAI, Tamil Nadu
  // ═══════════════════════════════════════════════════════════

  // Cafes
  { name: "Amethyst Café", category: "cafe", city: "Chennai", latitude: 13.0569, longitude: 80.2612 },
  { name: "Writer's Café", category: "cafe", city: "Chennai", latitude: 13.0490, longitude: 80.2490 },
  { name: "Chamiers Café", category: "cafe", city: "Chennai", latitude: 13.0290, longitude: 80.2510 },
  { name: "Sandy's Chocolate Laboratory", category: "cafe", city: "Chennai", latitude: 13.0410, longitude: 80.2670 },
  { name: "Ciclo Café", category: "cafe", city: "Chennai", latitude: 13.0060, longitude: 80.2570 },

  // Restaurants
  { name: "Dakshin - ITC Grand Chola", category: "restaurant", city: "Chennai", latitude: 13.0130, longitude: 80.2210 },
  { name: "Murugan Idli Shop", category: "restaurant", city: "Chennai", latitude: 13.0560, longitude: 80.2580 },
  { name: "Saravana Bhavan", category: "restaurant", city: "Chennai", latitude: 13.0670, longitude: 80.2570 },
  { name: "Peshawri - ITC Grand Chola", category: "restaurant", city: "Chennai", latitude: 13.0130, longitude: 80.2215 },
  { name: "Anjappar Chettinad Restaurant", category: "restaurant", city: "Chennai", latitude: 13.0610, longitude: 80.2410 },

  // Fast Food
  { name: "McDonald's T. Nagar", category: "fast_food", city: "Chennai", latitude: 13.0391, longitude: 80.2345 },
  { name: "KFC Anna Nagar", category: "fast_food", city: "Chennai", latitude: 13.0860, longitude: 80.2100 },
  { name: "Domino's Pizza Adyar", category: "fast_food", city: "Chennai", latitude: 13.0063, longitude: 80.2550 },
  { name: "Burger King Express Avenue", category: "fast_food", city: "Chennai", latitude: 13.0594, longitude: 80.2641 },
  { name: "Subway Nungambakkam", category: "fast_food", city: "Chennai", latitude: 13.0650, longitude: 80.2440 },

  // Hotels
  { name: "ITC Grand Chola", category: "hotel", city: "Chennai", latitude: 13.0130, longitude: 80.2210 },
  { name: "Taj Connemara", category: "hotel", city: "Chennai", latitude: 13.0600, longitude: 80.2570 },
  { name: "The Leela Palace Chennai", category: "hotel", city: "Chennai", latitude: 13.0150, longitude: 80.2290 },
  { name: "Taj Fisherman's Cove", category: "hotel", city: "Chennai", latitude: 12.6200, longitude: 80.1900 },
  { name: "Hyatt Regency Chennai", category: "hotel", city: "Chennai", latitude: 13.0195, longitude: 80.2210 },

  // Parks
  { name: "Guindy National Park", category: "park", city: "Chennai", latitude: 13.0055, longitude: 80.2240 },
  { name: "Semmozhi Poonga", category: "park", city: "Chennai", latitude: 13.0510, longitude: 80.2680 },
  { name: "Tholkappia Poonga", category: "park", city: "Chennai", latitude: 13.0285, longitude: 80.2700 },
  { name: "Anna Nagar Tower Park", category: "park", city: "Chennai", latitude: 13.0875, longitude: 80.2085 },
  { name: "Natesan Park", category: "park", city: "Chennai", latitude: 13.0340, longitude: 80.2490 },

  // Bus Stations
  { name: "Chennai Mofussil Bus Terminus (CMBT)", category: "bus_station", city: "Chennai", latitude: 13.0693, longitude: 80.2000 },
  { name: "Broadway Bus Terminus", category: "bus_station", city: "Chennai", latitude: 13.0900, longitude: 80.2800 },
  { name: "T. Nagar Bus Terminus", category: "bus_station", city: "Chennai", latitude: 13.0400, longitude: 80.2350 },
  { name: "Tambaram Bus Stand", category: "bus_station", city: "Chennai", latitude: 12.9250, longitude: 80.1270 },

  // Railway Stations
  { name: "Chennai Central Railway Station", category: "railway_station", city: "Chennai", latitude: 13.0827, longitude: 80.2757 },
  { name: "Chennai Egmore Railway Station", category: "railway_station", city: "Chennai", latitude: 13.0736, longitude: 80.2629 },
  { name: "Tambaram Railway Station", category: "railway_station", city: "Chennai", latitude: 12.9249, longitude: 80.1278 },
  { name: "Guindy Railway Station", category: "railway_station", city: "Chennai", latitude: 13.0096, longitude: 80.2112 },

  // ═══════════════════════════════════════════════════════════
  //  HYDERABAD, Telangana
  // ═══════════════════════════════════════════════════════════

  // Cafes
  { name: "Roastery Coffee House", category: "cafe", city: "Hyderabad", latitude: 17.4260, longitude: 78.4490 },
  { name: "Autumn Leaf Café", category: "cafe", city: "Hyderabad", latitude: 17.4375, longitude: 78.4480 },
  { name: "Conçu Banjara Hills", category: "cafe", city: "Hyderabad", latitude: 17.4160, longitude: 78.4410 },
  { name: "The Hole in the Wall Café", category: "cafe", city: "Hyderabad", latitude: 17.4120, longitude: 78.4400 },
  { name: "Kaficko", category: "cafe", city: "Hyderabad", latitude: 17.4350, longitude: 78.4530 },

  // Restaurants
  { name: "Paradise Biryani", category: "restaurant", city: "Hyderabad", latitude: 17.4459, longitude: 78.4736 },
  { name: "Bawarchi Restaurant", category: "restaurant", city: "Hyderabad", latitude: 17.3890, longitude: 78.4680 },
  { name: "Shah Ghouse", category: "restaurant", city: "Hyderabad", latitude: 17.3380, longitude: 78.4080 },
  { name: "Falaknuma Hotel Dining", category: "restaurant", city: "Hyderabad", latitude: 17.3316, longitude: 78.4681 },
  { name: "Chutneys", category: "restaurant", city: "Hyderabad", latitude: 17.4310, longitude: 78.4490 },

  // Fast Food
  { name: "McDonald's Ameerpet", category: "fast_food", city: "Hyderabad", latitude: 17.4370, longitude: 78.4480 },
  { name: "KFC Abids", category: "fast_food", city: "Hyderabad", latitude: 17.3900, longitude: 78.4732 },
  { name: "Domino's Kukatpally", category: "fast_food", city: "Hyderabad", latitude: 17.4947, longitude: 78.3996 },
  { name: "Burger King GVK One", category: "fast_food", city: "Hyderabad", latitude: 17.4250, longitude: 78.4480 },
  { name: "Subway Banjara Hills", category: "fast_food", city: "Hyderabad", latitude: 17.4175, longitude: 78.4390 },

  // Hotels
  { name: "Taj Falaknuma Palace", category: "hotel", city: "Hyderabad", latitude: 17.3316, longitude: 78.4681 },
  { name: "ITC Kohenur", category: "hotel", city: "Hyderabad", latitude: 17.4260, longitude: 78.3430 },
  { name: "Novotel Hyderabad Convention Centre", category: "hotel", city: "Hyderabad", latitude: 17.4260, longitude: 78.3450 },
  { name: "Park Hyatt Hyderabad", category: "hotel", city: "Hyderabad", latitude: 17.4265, longitude: 78.4470 },
  { name: "Trident Hyderabad", category: "hotel", city: "Hyderabad", latitude: 17.4290, longitude: 78.3480 },

  // Parks
  { name: "KBR National Park", category: "park", city: "Hyderabad", latitude: 17.4121, longitude: 78.4510 },
  { name: "Lumbini Park", category: "park", city: "Hyderabad", latitude: 17.4060, longitude: 78.4730 },
  { name: "Nehru Zoological Park", category: "park", city: "Hyderabad", latitude: 17.3505, longitude: 78.4519 },
  { name: "Botanical Garden Kondapur", category: "park", city: "Hyderabad", latitude: 17.4540, longitude: 78.3650 },
  { name: "NTR Gardens", category: "park", city: "Hyderabad", latitude: 17.4050, longitude: 78.4700 },

  // Bus Stations
  { name: "Mahatma Gandhi Bus Station (MGBS)", category: "bus_station", city: "Hyderabad", latitude: 17.3780, longitude: 78.4830 },
  { name: "JBS Jubilee Bus Station", category: "bus_station", city: "Hyderabad", latitude: 17.4530, longitude: 78.4980 },
  { name: "Miyapur Bus Depot", category: "bus_station", city: "Hyderabad", latitude: 17.4970, longitude: 78.3540 },
  { name: "Secunderabad Bus Station", category: "bus_station", city: "Hyderabad", latitude: 17.4340, longitude: 78.5010 },

  // Railway Stations
  { name: "Secunderabad Junction", category: "railway_station", city: "Hyderabad", latitude: 17.4340, longitude: 78.5010 },
  { name: "Hyderabad Deccan (Nampally)", category: "railway_station", city: "Hyderabad", latitude: 17.3928, longitude: 78.4694 },
  { name: "Kacheguda Railway Station", category: "railway_station", city: "Hyderabad", latitude: 17.3800, longitude: 78.4850 },
  { name: "Lingampally Railway Station", category: "railway_station", city: "Hyderabad", latitude: 17.4900, longitude: 78.3170 },

  // ═══════════════════════════════════════════════════════════
  //  BANGALORE (Bengaluru), Karnataka
  // ═══════════════════════════════════════════════════════════

  // Cafes
  { name: "Third Wave Coffee Indiranagar", category: "cafe", city: "Bangalore", latitude: 12.9783, longitude: 77.6408 },
  { name: "Blue Tokai Coffee Koramangala", category: "cafe", city: "Bangalore", latitude: 12.9352, longitude: 77.6245 },
  { name: "Matteo Coffea", category: "cafe", city: "Bangalore", latitude: 12.9780, longitude: 77.6410 },
  { name: "Dyu Art Café", category: "cafe", city: "Bangalore", latitude: 12.9360, longitude: 77.6249 },
  { name: "Hatti Kaapi", category: "cafe", city: "Bangalore", latitude: 12.9700, longitude: 77.6000 },

  // Restaurants
  { name: "MTR (Mavalli Tiffin Rooms)", category: "restaurant", city: "Bangalore", latitude: 12.9550, longitude: 77.5830 },
  { name: "Vidyarthi Bhavan", category: "restaurant", city: "Bangalore", latitude: 12.9518, longitude: 77.5723 },
  { name: "Toit Brewpub", category: "restaurant", city: "Bangalore", latitude: 12.9784, longitude: 77.6405 },
  { name: "Karavalli - Taj Gateway", category: "restaurant", city: "Bangalore", latitude: 12.9748, longitude: 77.5963 },
  { name: "Nagarjuna Restaurant", category: "restaurant", city: "Bangalore", latitude: 12.9720, longitude: 77.6050 },

  // Fast Food
  { name: "McDonald's Brigade Road", category: "fast_food", city: "Bangalore", latitude: 12.9730, longitude: 77.6060 },
  { name: "KFC MG Road", category: "fast_food", city: "Bangalore", latitude: 12.9758, longitude: 77.6070 },
  { name: "Domino's HSR Layout", category: "fast_food", city: "Bangalore", latitude: 12.9116, longitude: 77.6412 },
  { name: "Burger King Whitefield", category: "fast_food", city: "Bangalore", latitude: 12.9698, longitude: 77.7500 },
  { name: "Subway Jayanagar", category: "fast_food", city: "Bangalore", latitude: 12.9308, longitude: 77.5838 },

  // Hotels
  { name: "The Leela Palace Bangalore", category: "hotel", city: "Bangalore", latitude: 12.9610, longitude: 77.6449 },
  { name: "ITC Gardenia", category: "hotel", city: "Bangalore", latitude: 12.9660, longitude: 77.5890 },
  { name: "Taj West End", category: "hotel", city: "Bangalore", latitude: 12.9710, longitude: 77.5910 },
  { name: "JW Marriott Hotel Bangalore", category: "hotel", city: "Bangalore", latitude: 12.9600, longitude: 77.6480 },
  { name: "Sheraton Grand Bangalore", category: "hotel", city: "Bangalore", latitude: 12.9730, longitude: 77.6160 },

  // Parks
  { name: "Cubbon Park", category: "park", city: "Bangalore", latitude: 12.9767, longitude: 77.5929 },
  { name: "Lalbagh Botanical Garden", category: "park", city: "Bangalore", latitude: 12.9507, longitude: 77.5848 },
  { name: "Bannerghatta National Park", category: "park", city: "Bangalore", latitude: 12.8007, longitude: 77.5806 },
  { name: "JP Park (Jayanagar)", category: "park", city: "Bangalore", latitude: 12.9286, longitude: 77.5819 },
  { name: "Freedom Park", category: "park", city: "Bangalore", latitude: 12.9770, longitude: 77.5850 },

  // Bus Stations
  { name: "Kempegowda Bus Station (Majestic)", category: "bus_station", city: "Bangalore", latitude: 12.9770, longitude: 77.5722 },
  { name: "Shanthinagar BMTC Bus Station", category: "bus_station", city: "Bangalore", latitude: 12.9558, longitude: 77.5969 },
  { name: "Satellite Bus Station Mysore Road", category: "bus_station", city: "Bangalore", latitude: 12.9550, longitude: 77.5400 },
  { name: "KSRTC Bus Station Peenya", category: "bus_station", city: "Bangalore", latitude: 13.0310, longitude: 77.5190 },

  // Railway Stations
  { name: "Bangalore City Railway Station (SBC)", category: "railway_station", city: "Bangalore", latitude: 12.9783, longitude: 77.5710 },
  { name: "Yeshwantpur Junction", category: "railway_station", city: "Bangalore", latitude: 13.0286, longitude: 77.5513 },
  { name: "KSR Bengaluru (Cantonment)", category: "railway_station", city: "Bangalore", latitude: 12.9997, longitude: 77.5943 },
  { name: "Whitefield Railway Station", category: "railway_station", city: "Bangalore", latitude: 12.9770, longitude: 77.7460 },

  // ═══════════════════════════════════════════════════════════
  //  MUMBAI, Maharashtra
  // ═══════════════════════════════════════════════════════════

  // Cafes
  { name: "Birdsong Café", category: "cafe", city: "Mumbai", latitude: 19.0449, longitude: 72.8205 },
  { name: "Leaping Windows Café", category: "cafe", city: "Mumbai", latitude: 19.0510, longitude: 72.8360 },
  { name: "Kala Ghoda Café", category: "cafe", city: "Mumbai", latitude: 18.9310, longitude: 72.8310 },
  { name: "Filter Coffee", category: "cafe", city: "Mumbai", latitude: 19.1050, longitude: 72.8340 },
  { name: "Prithvi Café", category: "cafe", city: "Mumbai", latitude: 19.1405, longitude: 72.8365 },

  // Restaurants
  { name: "Leopold Café", category: "restaurant", city: "Mumbai", latitude: 18.9220, longitude: 72.8322 },
  { name: "Trishna Seafood", category: "restaurant", city: "Mumbai", latitude: 18.9290, longitude: 72.8320 },
  { name: "Britannia & Co.", category: "restaurant", city: "Mumbai", latitude: 18.9324, longitude: 72.8361 },
  { name: "Bastian", category: "restaurant", city: "Mumbai", latitude: 19.0150, longitude: 72.8160 },
  { name: "Punjab Grill BKC", category: "restaurant", city: "Mumbai", latitude: 19.0650, longitude: 72.8690 },

  // Fast Food
  { name: "McDonald's CST", category: "fast_food", city: "Mumbai", latitude: 18.9403, longitude: 72.8354 },
  { name: "KFC Andheri", category: "fast_food", city: "Mumbai", latitude: 19.1197, longitude: 72.8464 },
  { name: "Domino's Bandra", category: "fast_food", city: "Mumbai", latitude: 19.0553, longitude: 72.8404 },
  { name: "Burger King Lower Parel", category: "fast_food", city: "Mumbai", latitude: 18.9970, longitude: 72.8297 },
  { name: "Subway Dadar", category: "fast_food", city: "Mumbai", latitude: 19.0190, longitude: 72.8430 },

  // Hotels
  { name: "Taj Mahal Palace", category: "hotel", city: "Mumbai", latitude: 18.9217, longitude: 72.8332 },
  { name: "The Oberoi Mumbai", category: "hotel", city: "Mumbai", latitude: 18.9283, longitude: 72.8201 },
  { name: "Trident Nariman Point", category: "hotel", city: "Mumbai", latitude: 18.9268, longitude: 72.8183 },
  { name: "JW Marriott Mumbai Juhu", category: "hotel", city: "Mumbai", latitude: 19.1030, longitude: 72.8270 },
  { name: "The St. Regis Mumbai", category: "hotel", city: "Mumbai", latitude: 18.9940, longitude: 72.8260 },

  // Parks
  { name: "Shivaji Park", category: "park", city: "Mumbai", latitude: 19.0285, longitude: 72.8389 },
  { name: "Sanjay Gandhi National Park", category: "park", city: "Mumbai", latitude: 19.2147, longitude: 72.9110 },
  { name: "Joggers Park Bandra", category: "park", city: "Mumbai", latitude: 19.0510, longitude: 72.8200 },
  { name: "Oval Maidan", category: "park", city: "Mumbai", latitude: 18.9290, longitude: 72.8270 },
  { name: "Five Gardens Matunga", category: "park", city: "Mumbai", latitude: 19.0220, longitude: 72.8530 },

  // Bus Stations
  { name: "Mumbai Central Bus Depot", category: "bus_station", city: "Mumbai", latitude: 18.9712, longitude: 72.8191 },
  { name: "Borivali Bus Depot", category: "bus_station", city: "Mumbai", latitude: 19.2307, longitude: 72.8567 },
  { name: "Dadar Bus Terminal", category: "bus_station", city: "Mumbai", latitude: 19.0176, longitude: 72.8436 },
  { name: "Kurla Bus Depot", category: "bus_station", city: "Mumbai", latitude: 19.0726, longitude: 72.8793 },

  // Railway Stations
  { name: "Chhatrapati Shivaji Maharaj Terminus (CST)", category: "railway_station", city: "Mumbai", latitude: 18.9402, longitude: 72.8356 },
  { name: "Mumbai Central Railway Station", category: "railway_station", city: "Mumbai", latitude: 18.9710, longitude: 72.8190 },
  { name: "Dadar Railway Station", category: "railway_station", city: "Mumbai", latitude: 19.0190, longitude: 72.8430 },
  { name: "Bandra Terminus", category: "railway_station", city: "Mumbai", latitude: 19.0544, longitude: 72.8408 },

  // ═══════════════════════════════════════════════════════════
  //  DELHI (New Delhi), Delhi
  // ═══════════════════════════════════════════════════════════

  // Cafes
  { name: "Indian Coffee House", category: "cafe", city: "Delhi", latitude: 28.6358, longitude: 77.2245 },
  { name: "Triveni Terrace Café", category: "cafe", city: "Delhi", latitude: 28.6290, longitude: 77.2210 },
  { name: "Blue Tokai Champa Gali", category: "cafe", city: "Delhi", latitude: 28.5386, longitude: 77.2163 },
  { name: "Diggin Café", category: "cafe", city: "Delhi", latitude: 28.5603, longitude: 77.2106 },
  { name: "Rose Café", category: "cafe", city: "Delhi", latitude: 28.5390, longitude: 77.2130 },

  // Restaurants
  { name: "Karim's Jama Masjid", category: "restaurant", city: "Delhi", latitude: 28.6501, longitude: 77.2333 },
  { name: "Bukhara - ITC Maurya", category: "restaurant", city: "Delhi", latitude: 28.5975, longitude: 77.1730 },
  { name: "Dum Pukht - ITC Maurya", category: "restaurant", city: "Delhi", latitude: 28.5975, longitude: 77.1735 },
  { name: "Indian Accent", category: "restaurant", city: "Delhi", latitude: 28.5876, longitude: 77.1847 },
  { name: "Paranthe Wali Gali", category: "restaurant", city: "Delhi", latitude: 28.6560, longitude: 77.2297 },

  // Fast Food
  { name: "McDonald's Connaught Place", category: "fast_food", city: "Delhi", latitude: 28.6315, longitude: 77.2195 },
  { name: "KFC Rajouri Garden", category: "fast_food", city: "Delhi", latitude: 28.6449, longitude: 77.1225 },
  { name: "Domino's Lajpat Nagar", category: "fast_food", city: "Delhi", latitude: 28.5681, longitude: 77.2427 },
  { name: "Burger King Select Citywalk", category: "fast_food", city: "Delhi", latitude: 28.5286, longitude: 77.2189 },
  { name: "Subway Hauz Khas", category: "fast_food", city: "Delhi", latitude: 28.5494, longitude: 77.2001 },

  // Hotels
  { name: "The Imperial", category: "hotel", city: "Delhi", latitude: 28.6282, longitude: 77.2190 },
  { name: "ITC Maurya", category: "hotel", city: "Delhi", latitude: 28.5975, longitude: 77.1730 },
  { name: "Taj Palace New Delhi", category: "hotel", city: "Delhi", latitude: 28.5955, longitude: 77.1700 },
  { name: "The Leela Palace New Delhi", category: "hotel", city: "Delhi", latitude: 28.5577, longitude: 77.1925 },
  { name: "The Oberoi New Delhi", category: "hotel", city: "Delhi", latitude: 28.5905, longitude: 77.2280 },

  // Parks
  { name: "Lodhi Garden", category: "park", city: "Delhi", latitude: 28.5931, longitude: 77.2197 },
  { name: "India Gate Lawns", category: "park", city: "Delhi", latitude: 28.6129, longitude: 77.2295 },
  { name: "Nehru Park", category: "park", city: "Delhi", latitude: 28.5870, longitude: 77.1910 },
  { name: "Deer Park Hauz Khas", category: "park", city: "Delhi", latitude: 28.5489, longitude: 77.2019 },
  { name: "Garden of Five Senses", category: "park", city: "Delhi", latitude: 28.5129, longitude: 77.2032 },

  // Bus Stations
  { name: "ISBT Kashmere Gate", category: "bus_station", city: "Delhi", latitude: 28.6670, longitude: 77.2281 },
  { name: "ISBT Anand Vihar", category: "bus_station", city: "Delhi", latitude: 28.6469, longitude: 77.3152 },
  { name: "Sarai Kale Khan ISBT", category: "bus_station", city: "Delhi", latitude: 28.5889, longitude: 77.2550 },
  { name: "Dhaula Kuan Bus Terminal", category: "bus_station", city: "Delhi", latitude: 28.5908, longitude: 77.1650 },

  // Railway Stations
  { name: "New Delhi Railway Station (NDLS)", category: "railway_station", city: "Delhi", latitude: 28.6431, longitude: 77.2197 },
  { name: "Old Delhi Railway Station", category: "railway_station", city: "Delhi", latitude: 28.6579, longitude: 77.2251 },
  { name: "Hazrat Nizamuddin Railway Station", category: "railway_station", city: "Delhi", latitude: 28.5882, longitude: 77.2521 },
  { name: "Anand Vihar Terminal", category: "railway_station", city: "Delhi", latitude: 28.6469, longitude: 77.3152 },

  // ═══════════════════════════════════════════════════════════
  //  JAIPUR, Rajasthan
  // ═══════════════════════════════════════════════════════════

  // Cafes
  { name: "Tapri Central", category: "cafe", city: "Jaipur", latitude: 26.9100, longitude: 75.7835 },
  { name: "Curious Life Coffee Roasters", category: "cafe", city: "Jaipur", latitude: 26.9040, longitude: 75.8060 },
  { name: "Anokhi Café", category: "cafe", city: "Jaipur", latitude: 26.9210, longitude: 75.8010 },
  { name: "Palladio Café", category: "cafe", city: "Jaipur", latitude: 26.8710, longitude: 75.7600 },
  { name: "Bar Palladio", category: "cafe", city: "Jaipur", latitude: 26.8720, longitude: 75.7610 },

  // Restaurants
  { name: "LMB (Laxmi Mishthan Bhandar)", category: "restaurant", city: "Jaipur", latitude: 26.9220, longitude: 75.8235 },
  { name: "Chokhi Dhani", category: "restaurant", city: "Jaipur", latitude: 26.8100, longitude: 75.8320 },
  { name: "Suvarna Mahal - Rambagh Palace", category: "restaurant", city: "Jaipur", latitude: 26.8990, longitude: 75.7880 },
  { name: "Handi Restaurant", category: "restaurant", city: "Jaipur", latitude: 26.9185, longitude: 75.8060 },
  { name: "Peacock Rooftop Restaurant", category: "restaurant", city: "Jaipur", latitude: 26.9170, longitude: 75.8230 },

  // Fast Food
  { name: "McDonald's GT Central", category: "fast_food", city: "Jaipur", latitude: 26.9180, longitude: 75.7880 },
  { name: "KFC Vaishali Nagar", category: "fast_food", city: "Jaipur", latitude: 26.9120, longitude: 75.7420 },
  { name: "Domino's MI Road", category: "fast_food", city: "Jaipur", latitude: 26.9165, longitude: 75.8000 },
  { name: "Burger King WTP", category: "fast_food", city: "Jaipur", latitude: 26.9050, longitude: 75.7470 },
  { name: "Subway Malviya Nagar", category: "fast_food", city: "Jaipur", latitude: 26.8530, longitude: 75.8160 },

  // Hotels
  { name: "Rambagh Palace", category: "hotel", city: "Jaipur", latitude: 26.8990, longitude: 75.7880 },
  { name: "ITC Rajputana", category: "hotel", city: "Jaipur", latitude: 26.9170, longitude: 75.8020 },
  { name: "Jai Mahal Palace", category: "hotel", city: "Jaipur", latitude: 26.9200, longitude: 75.7940 },
  { name: "The Oberoi Rajvilas", category: "hotel", city: "Jaipur", latitude: 26.8520, longitude: 75.8500 },
  { name: "Narain Niwas Palace", category: "hotel", city: "Jaipur", latitude: 26.9000, longitude: 75.7960 },

  // Parks
  { name: "Central Park Jaipur", category: "park", city: "Jaipur", latitude: 26.9060, longitude: 75.7920 },
  { name: "Ram Niwas Bagh", category: "park", city: "Jaipur", latitude: 26.9115, longitude: 75.8110 },
  { name: "Jawahar Circle Garden", category: "park", city: "Jaipur", latitude: 26.8460, longitude: 75.8140 },
  { name: "Sisodia Rani Ka Bagh", category: "park", city: "Jaipur", latitude: 26.8570, longitude: 75.8470 },

  // Bus Stations
  { name: "Sindhi Camp Bus Stand (RSRTC)", category: "bus_station", city: "Jaipur", latitude: 26.9210, longitude: 75.7870 },
  { name: "Narayan Singh Circle Bus Stand", category: "bus_station", city: "Jaipur", latitude: 26.9100, longitude: 75.8035 },
  { name: "Durgapura Bus Depot", category: "bus_station", city: "Jaipur", latitude: 26.8580, longitude: 75.8180 },
  { name: "Vidyadhar Nagar Bus Stand", category: "bus_station", city: "Jaipur", latitude: 26.9520, longitude: 75.8510 },

  // Railway Stations
  { name: "Jaipur Junction Railway Station", category: "railway_station", city: "Jaipur", latitude: 26.9194, longitude: 75.7878 },
  { name: "Durgapura Railway Station", category: "railway_station", city: "Jaipur", latitude: 26.8610, longitude: 75.8175 },
  { name: "Gandhinagar Jaipur Railway Station", category: "railway_station", city: "Jaipur", latitude: 26.9260, longitude: 75.7980 },
  { name: "Jagatpura Railway Halt", category: "railway_station", city: "Jaipur", latitude: 26.8350, longitude: 75.8390 },

  // ═══════════════════════════════════════════════════════════
  //  KOLKATA, West Bengal
  // ═══════════════════════════════════════════════════════════

  // Cafes
  { name: "Flurys", category: "cafe", city: "Kolkata", latitude: 22.5510, longitude: 88.3507 },
  { name: "Indian Coffee House College Street", category: "cafe", city: "Kolkata", latitude: 22.5750, longitude: 88.3630 },
  { name: "Mrs. Magpie", category: "cafe", city: "Kolkata", latitude: 22.5260, longitude: 88.3580 },
  { name: "Artsy Café", category: "cafe", city: "Kolkata", latitude: 22.5170, longitude: 88.3630 },
  { name: "Café Coffee Day Park Street", category: "cafe", city: "Kolkata", latitude: 22.5510, longitude: 88.3510 },

  // Restaurants
  { name: "Peter Cat", category: "restaurant", city: "Kolkata", latitude: 22.5510, longitude: 88.3510 },
  { name: "6 Ballygunge Place", category: "restaurant", city: "Kolkata", latitude: 22.5290, longitude: 88.3640 },
  { name: "Oh! Calcutta", category: "restaurant", city: "Kolkata", latitude: 22.5370, longitude: 88.3590 },
  { name: "Arsalan Biryani", category: "restaurant", city: "Kolkata", latitude: 22.5510, longitude: 88.3590 },
  { name: "Kewpie's Kitchen", category: "restaurant", city: "Kolkata", latitude: 22.5320, longitude: 88.3470 },

  // Fast Food
  { name: "McDonald's Park Street", category: "fast_food", city: "Kolkata", latitude: 22.5520, longitude: 88.3510 },
  { name: "KFC Forum Mall Elgin Road", category: "fast_food", city: "Kolkata", latitude: 22.5419, longitude: 88.3530 },
  { name: "Domino's Salt Lake", category: "fast_food", city: "Kolkata", latitude: 22.5880, longitude: 88.4050 },
  { name: "Burger King South City Mall", category: "fast_food", city: "Kolkata", latitude: 22.5010, longitude: 88.3640 },
  { name: "Subway Camac Street", category: "fast_food", city: "Kolkata", latitude: 22.5460, longitude: 88.3530 },

  // Hotels
  { name: "The Oberoi Grand", category: "hotel", city: "Kolkata", latitude: 22.5600, longitude: 88.3508 },
  { name: "ITC Royal Bengal", category: "hotel", city: "Kolkata", latitude: 22.5720, longitude: 88.4390 },
  { name: "Taj Bengal", category: "hotel", city: "Kolkata", latitude: 22.5260, longitude: 88.3530 },
  { name: "JW Marriott Kolkata", category: "hotel", city: "Kolkata", latitude: 22.5720, longitude: 88.4400 },
  { name: "The Lalit Great Eastern", category: "hotel", city: "Kolkata", latitude: 22.5680, longitude: 88.3510 },

  // Parks
  { name: "Victoria Memorial Garden", category: "park", city: "Kolkata", latitude: 22.5448, longitude: 88.3426 },
  { name: "Maidan (Kolkata)", category: "park", city: "Kolkata", latitude: 22.5533, longitude: 88.3410 },
  { name: "Eco Park New Town", category: "park", city: "Kolkata", latitude: 22.6018, longitude: 88.4636 },
  { name: "Rabindra Sarobar", category: "park", city: "Kolkata", latitude: 22.5060, longitude: 88.3580 },
  { name: "Botanical Garden Howrah", category: "park", city: "Kolkata", latitude: 22.5488, longitude: 88.3062 },

  // Bus Stations
  { name: "Esplanade Bus Terminus", category: "bus_station", city: "Kolkata", latitude: 22.5632, longitude: 88.3529 },
  { name: "Babughat Bus Stand", category: "bus_station", city: "Kolkata", latitude: 22.5610, longitude: 88.3380 },
  { name: "Dharmatala Bus Stop", category: "bus_station", city: "Kolkata", latitude: 22.5620, longitude: 88.3530 },
  { name: "Karunamoyee Bus Stand", category: "bus_station", city: "Kolkata", latitude: 22.5874, longitude: 88.4124 },

  // Railway Stations
  { name: "Howrah Junction", category: "railway_station", city: "Kolkata", latitude: 22.5835, longitude: 88.3424 },
  { name: "Sealdah Railway Station", category: "railway_station", city: "Kolkata", latitude: 22.5688, longitude: 88.3730 },
  { name: "Kolkata Railway Station (Chitpur)", category: "railway_station", city: "Kolkata", latitude: 22.5952, longitude: 88.3700 },
  { name: "Santragachi Junction", category: "railway_station", city: "Kolkata", latitude: 22.5739, longitude: 88.2789 },

  // ═══════════════════════════════════════════════════════════
  //  GOA (Panaji)
  // ═══════════════════════════════════════════════════════════

  // Cafes
  { name: "Artjuna Garden Café", category: "cafe", city: "Goa", latitude: 15.5013, longitude: 73.7678 },
  { name: "Bean Me Up Café", category: "cafe", city: "Goa", latitude: 15.5050, longitude: 73.7700 },
  { name: "Café Bodega", category: "cafe", city: "Goa", latitude: 15.4909, longitude: 73.8280 },
  { name: "Eva Café", category: "cafe", city: "Goa", latitude: 15.6145, longitude: 73.7360 },
  { name: "Sakana Café", category: "cafe", city: "Goa", latitude: 15.2740, longitude: 73.9690 },

  // Restaurants
  { name: "Gunpowder", category: "restaurant", city: "Goa", latitude: 15.4950, longitude: 73.8130 },
  { name: "Vinayak Family Restaurant", category: "restaurant", city: "Goa", latitude: 15.2830, longitude: 74.0080 },
  { name: "Martin's Corner", category: "restaurant", city: "Goa", latitude: 15.3300, longitude: 73.9520 },
  { name: "Mum's Kitchen", category: "restaurant", city: "Goa", latitude: 15.4940, longitude: 73.8270 },
  { name: "Fisherman's Wharf", category: "restaurant", city: "Goa", latitude: 15.4510, longitude: 73.8620 },

  // Fast Food
  { name: "McDonald's Panjim", category: "fast_food", city: "Goa", latitude: 15.4960, longitude: 73.8250 },
  { name: "KFC Mapusa", category: "fast_food", city: "Goa", latitude: 15.5920, longitude: 73.8120 },
  { name: "Domino's Margao", category: "fast_food", city: "Goa", latitude: 15.2830, longitude: 74.0130 },
  { name: "Burger King Candolim", category: "fast_food", city: "Goa", latitude: 15.5190, longitude: 73.7620 },
  { name: "Subway Calangute", category: "fast_food", city: "Goa", latitude: 15.5440, longitude: 73.7620 },

  // Hotels
  { name: "Taj Exotica Resort & Spa", category: "hotel", city: "Goa", latitude: 15.3250, longitude: 73.9140 },
  { name: "The Leela Goa", category: "hotel", city: "Goa", latitude: 15.1780, longitude: 73.9490 },
  { name: "W Goa", category: "hotel", city: "Goa", latitude: 15.5530, longitude: 73.7390 },
  { name: "Alila Diwa Goa", category: "hotel", city: "Goa", latitude: 15.3620, longitude: 73.9200 },
  { name: "Taj Fort Aguada Resort", category: "hotel", city: "Goa", latitude: 15.4920, longitude: 73.7730 },

  // Parks
  { name: "Salim Ali Bird Sanctuary", category: "park", city: "Goa", latitude: 15.5000, longitude: 73.8610 },
  { name: "Bondla Wildlife Sanctuary", category: "park", city: "Goa", latitude: 15.4350, longitude: 74.0310 },
  { name: "Garcia de Orta Garden", category: "park", city: "Goa", latitude: 15.4950, longitude: 73.8330 },
  { name: "Caculo Mall Park Area", category: "park", city: "Goa", latitude: 15.4710, longitude: 73.8880 },

  // Bus Stations
  { name: "Kadamba Bus Stand Panaji", category: "bus_station", city: "Goa", latitude: 15.4898, longitude: 73.8283 },
  { name: "Mapusa Bus Stand", category: "bus_station", city: "Goa", latitude: 15.5930, longitude: 73.8060 },
  { name: "Margao Bus Stand", category: "bus_station", city: "Goa", latitude: 15.2810, longitude: 74.0050 },
  { name: "Vasco Bus Stand", category: "bus_station", city: "Goa", latitude: 15.3988, longitude: 73.8110 },

  // Railway Stations
  { name: "Madgaon Junction (Margao)", category: "railway_station", city: "Goa", latitude: 15.2867, longitude: 74.0014 },
  { name: "Thivim Railway Station", category: "railway_station", city: "Goa", latitude: 15.6022, longitude: 73.8467 },
  { name: "Vasco Da Gama Railway Station", category: "railway_station", city: "Goa", latitude: 15.3959, longitude: 73.8140 },
  { name: "Karmali Railway Station", category: "railway_station", city: "Goa", latitude: 15.4600, longitude: 73.8968 },

  // ═══════════════════════════════════════════════════════════
  //  PUNE, Maharashtra
  // ═══════════════════════════════════════════════════════════

  // Cafes
  { name: "Vohuman Café", category: "cafe", city: "Pune", latitude: 18.5185, longitude: 73.8747 },
  { name: "Pagdandi Books Chai Café", category: "cafe", city: "Pune", latitude: 18.5349, longitude: 73.8940 },
  { name: "Café Durga", category: "cafe", city: "Pune", latitude: 18.5167, longitude: 73.8447 },
  { name: "The French Window Patisserie", category: "cafe", city: "Pune", latitude: 18.5363, longitude: 73.8967 },
  { name: "Café Peter Doughnuts", category: "cafe", city: "Pune", latitude: 18.5327, longitude: 73.8740 },

  // Restaurants
  { name: "Shreyas Restaurant", category: "restaurant", city: "Pune", latitude: 18.5090, longitude: 73.8510 },
  { name: "Kayani Bakery", category: "restaurant", city: "Pune", latitude: 18.5230, longitude: 73.8750 },
  { name: "Vaishali Restaurant", category: "restaurant", city: "Pune", latitude: 18.5204, longitude: 73.8410 },
  { name: "Malaka Spice Koregaon Park", category: "restaurant", city: "Pune", latitude: 18.5374, longitude: 73.8990 },
  { name: "Savya Rasa", category: "restaurant", city: "Pune", latitude: 18.5370, longitude: 73.8950 },

  // Fast Food
  { name: "McDonald's FC Road", category: "fast_food", city: "Pune", latitude: 18.5207, longitude: 73.8420 },
  { name: "KFC Phoenix Marketcity", category: "fast_food", city: "Pune", latitude: 18.5610, longitude: 73.9160 },
  { name: "Domino's Kothrud", category: "fast_food", city: "Pune", latitude: 18.5070, longitude: 73.8130 },
  { name: "Burger King Hinjewadi", category: "fast_food", city: "Pune", latitude: 18.5913, longitude: 73.7389 },
  { name: "Subway Camp", category: "fast_food", city: "Pune", latitude: 18.5140, longitude: 73.8770 },

  // Hotels
  { name: "JW Marriott Pune", category: "hotel", city: "Pune", latitude: 18.5398, longitude: 73.9027 },
  { name: "Conrad Pune", category: "hotel", city: "Pune", latitude: 18.5363, longitude: 73.8921 },
  { name: "The Ritz-Carlton Pune", category: "hotel", city: "Pune", latitude: 18.5553, longitude: 73.8958 },
  { name: "Hyatt Pune", category: "hotel", city: "Pune", latitude: 18.5530, longitude: 73.9050 },
  { name: "Taj Blue Diamond", category: "hotel", city: "Pune", latitude: 18.5353, longitude: 73.8933 },

  // Parks
  { name: "Empress Botanical Garden", category: "park", city: "Pune", latitude: 18.5080, longitude: 73.8810 },
  { name: "Saras Baug", category: "park", city: "Pune", latitude: 18.4970, longitude: 73.8530 },
  { name: "Osho Teerth Park", category: "park", city: "Pune", latitude: 18.5340, longitude: 73.9010 },
  { name: "Pu La Deshpande Garden", category: "park", city: "Pune", latitude: 18.4960, longitude: 73.8530 },
  { name: "Okayama Friendship Garden", category: "park", city: "Pune", latitude: 18.4960, longitude: 73.8535 },

  // Bus Stations
  { name: "Pune Station Bus Stand (PMT)", category: "bus_station", city: "Pune", latitude: 18.5286, longitude: 73.8740 },
  { name: "Shivajinagar Bus Stand", category: "bus_station", city: "Pune", latitude: 18.5310, longitude: 73.8460 },
  { name: "Swargate Bus Station", category: "bus_station", city: "Pune", latitude: 18.5010, longitude: 73.8670 },
  { name: "Wakad Bus Depot", category: "bus_station", city: "Pune", latitude: 18.5990, longitude: 73.7600 },

  // Railway Stations
  { name: "Pune Junction Railway Station", category: "railway_station", city: "Pune", latitude: 18.5286, longitude: 73.8740 },
  { name: "Shivajinagar Railway Station", category: "railway_station", city: "Pune", latitude: 18.5331, longitude: 73.8452 },
  { name: "Khadki Railway Station", category: "railway_station", city: "Pune", latitude: 18.5629, longitude: 73.8493 },
  { name: "Hadapsar Railway Station", category: "railway_station", city: "Pune", latitude: 18.5050, longitude: 73.9320 },
];

// ── Seed Runner ─────────────────────────────────────────────
const seedPlaces = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error("❌ MONGO_URI not found in .env");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("✅ MongoDB connected for seeding places");

    // Clear existing places
    await Place.deleteMany({});
    console.log("🗑️  Cleared existing places collection");

    // Insert all places
    const result = await Place.insertMany(placesData);
    console.log(`✅ Successfully seeded ${result.length} places!`);

    // Print summary
    const cities = [...new Set(placesData.map((p) => p.city))];
    const categories = [...new Set(placesData.map((p) => p.category))];
    console.log("\n📊 Seed Summary:");
    console.log(`   Cities: ${cities.join(", ")}`);
    console.log(`   Categories: ${categories.join(", ")}`);
    console.log(`   Total records: ${result.length}`);
    console.log("");

    for (const city of cities) {
      const count = placesData.filter((p) => p.city === city).length;
      console.log(`   🏙️  ${city}: ${count} places`);
    }

    await mongoose.disconnect();
    console.log("\n✅ Seeding complete! MongoDB disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err.message);
    process.exit(1);
  }
};

seedPlaces();
