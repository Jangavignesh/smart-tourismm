// ============================================================
// controllers/meetingPollController.js
// ============================================================

const MeetingPoll = require("../models/MeetingPoll");

// Major Indian cities with coordinates
const INDIAN_CITIES = [
  { city: "Mumbai",      state: "Maharashtra",    lat: 19.0760, lng: 72.8777 },
  { city: "Delhi",       state: "Delhi",           lat: 28.6139, lng: 77.2090 },
  { city: "Bangalore",   state: "Karnataka",       lat: 12.9716, lng: 77.5946 },
  { city: "Chennai",     state: "Tamil Nadu",      lat: 13.0827, lng: 80.2707 },
  { city: "Kolkata",     state: "West Bengal",     lat: 22.5726, lng: 88.3639 },
  { city: "Hyderabad",   state: "Telangana",       lat: 17.3850, lng: 78.4867 },
  { city: "Pune",        state: "Maharashtra",     lat: 18.5204, lng: 73.8567 },
  { city: "Ahmedabad",   state: "Gujarat",         lat: 23.0225, lng: 72.5714 },
  { city: "Jaipur",      state: "Rajasthan",       lat: 26.9124, lng: 75.7873 },
  { city: "Surat",       state: "Gujarat",         lat: 21.1702, lng: 72.8311 },
  { city: "Lucknow",     state: "Uttar Pradesh",   lat: 26.8467, lng: 80.9462 },
  { city: "Nagpur",      state: "Maharashtra",     lat: 21.1458, lng: 79.0882 },
  { city: "Indore",      state: "Madhya Pradesh",  lat: 22.7196, lng: 75.8577 },
  { city: "Bhopal",      state: "Madhya Pradesh",  lat: 23.2599, lng: 77.4126 },
  { city: "Patna",       state: "Bihar",           lat: 25.5941, lng: 85.1376 },
  { city: "Vadodara",    state: "Gujarat",         lat: 22.3072, lng: 73.1812 },
  { city: "Agra",        state: "Uttar Pradesh",   lat: 27.1767, lng: 78.0081 },
  { city: "Varanasi",    state: "Uttar Pradesh",   lat: 25.3176, lng: 82.9739 },
  { city: "Kanpur",      state: "Uttar Pradesh",   lat: 26.4499, lng: 80.3319 },
  { city: "Coimbatore",  state: "Tamil Nadu",      lat: 11.0168, lng: 76.9558 },
  { city: "Kochi",       state: "Kerala",          lat: 9.9312,  lng: 76.2673 },
  { city: "Guwahati",    state: "Assam",           lat: 26.1445, lng: 91.7362 },
  { city: "Bhubaneswar", state: "Odisha",          lat: 20.2961, lng: 85.8245 },
  { city: "Visakhapatnam",state:"Andhra Pradesh",  lat: 17.6868, lng: 83.2185 },
  { city: "Amritsar",    state: "Punjab",          lat: 31.6340, lng: 74.8723 },
  { city: "Chandigarh",  state: "Punjab",          lat: 30.7333, lng: 76.7794 },
  { city: "Raipur",      state: "Chhattisgarh",    lat: 21.2514, lng: 81.6296 },
  { city: "Ranchi",      state: "Jharkhand",       lat: 23.3441, lng: 85.3096 },
  { city: "Nashik",      state: "Maharashtra",     lat: 20.0059, lng: 73.7897 },
  { city: "Aurangabad",  state: "Maharashtra",     lat: 19.8762, lng: 75.3433 },
  { city: "Jodhpur",     state: "Rajasthan",       lat: 26.2389, lng: 73.0243 },
  { city: "Udaipur",     state: "Rajasthan",       lat: 24.5854, lng: 73.7125 },
  { city: "Mysore",      state: "Karnataka",       lat: 12.2958, lng: 76.6394 },
  { city: "Goa",         state: "Goa",             lat: 15.2993, lng: 74.1240 },
  { city: "Shimla",      state: "Himachal Pradesh",lat: 31.1048, lng: 77.1734 },
  { city: "Dehradun",    state: "Uttarakhand",     lat: 30.3165, lng: 78.0322 },
  { city: "Rishikesh",   state: "Uttarakhand",     lat: 30.0869, lng: 78.2676 },
  { city: "Manali",      state: "Himachal Pradesh",lat: 32.2396, lng: 77.1887 },
  { city: "Darjeeling",  state: "West Bengal",     lat: 27.0410, lng: 88.2663 },
  { city: "Madurai",     state: "Tamil Nadu",      lat: 9.9252,  lng: 78.1198 },
];

// Haversine distance formula
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

// Find best meeting city
const findBestMeetingCity = (locations) => {
  if (locations.length === 0) return null;

  // Calculate geographic center
  const centerLat = locations.reduce((s, l) => s + l.lat, 0) / locations.length;
  const centerLng = locations.reduce((s, l) => s + l.lng, 0) / locations.length;

  // Find nearest Indian city to center
  let nearest = null;
  let minDist = Infinity;

  for (const city of INDIAN_CITIES) {
    const dist = getDistance(centerLat, centerLng, city.lat, city.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = city;
    }
  }

  // Calculate avg distance from all members to best city
  const avgDist = nearest
    ? Math.round(locations.reduce((s, l) => s + getDistance(l.lat, l.lng, nearest.lat, nearest.lng), 0) / locations.length)
    : 0;

  return { ...nearest, avgDist };
};

// @route POST /api/meeting-polls
const createPoll = async (req, res) => {
  try {
    const { tripId } = req.body;
    if (!tripId) return res.status(400).json({ success: false, message: "Trip ID required." });

    // Cancel any existing active poll for this trip
    await MeetingPoll.updateMany(
      { tripId, status: "active" },
      { status: "cancelled" }
    );

    const poll = await MeetingPoll.create({
      tripId,
      createdBy: req.user._id,
      createdByName: req.user.name,
      status: "active",
      locations: [],
    });

    res.status(201).json({ success: true, message: "Meeting poll started!", poll });
  } catch (err) {
    console.error("Create poll error:", err.message);
    res.status(500).json({ success: false, message: "Could not create poll." });
  }
};

// @route GET /api/meeting-polls/trip/:tripId
const getPollByTrip = async (req, res) => {
  try {
    const poll = await MeetingPoll.findOne({
      tripId: req.params.tripId,
      status: { $in: ["active", "completed"] }
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, poll });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch poll." });
  }
};

// @route POST /api/meeting-polls/:id/location
const shareLocation = async (req, res) => {
  try {
    const { lat, lng, city } = req.body;
    if (!lat || !lng) return res.status(400).json({ success: false, message: "Location required." });

    const poll = await MeetingPoll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found." });
    if (poll.status !== "active") return res.status(400).json({ success: false, message: "Poll is no longer active." });

    // Update or add location
    const existingIdx = poll.locations.findIndex(l => l.userId === req.user._id.toString());
    if (existingIdx >= 0) {
      poll.locations[existingIdx] = { userId: req.user._id.toString(), userName: req.user.name, lat, lng, city, sharedAt: new Date() };
    } else {
      poll.locations.push({ userId: req.user._id.toString(), userName: req.user.name, lat, lng, city, sharedAt: new Date() });
    }

    await poll.save();

    res.status(200).json({
      success: true,
      message: `✅ ${req.user.name} shared location!`,
      locationsCount: poll.locations.length,
      poll,
    });
  } catch (err) {
    console.error("Share location error:", err.message);
    res.status(500).json({ success: false, message: "Could not share location." });
  }
};

// @route POST /api/meeting-polls/:id/calculate
const calculateMeeting = async (req, res) => {
  try {
    const poll = await MeetingPoll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found." });
    if (poll.locations.length < 1) return res.status(400).json({ success: false, message: "Need at least 1 location to calculate." });

    const best = findBestMeetingCity(poll.locations);
    if (!best) return res.status(400).json({ success: false, message: "Could not find meeting point." });

    poll.result = {
      city: best.city,
      state: best.state,
      lat: best.lat,
      lng: best.lng,
      avgDist: best.avgDist,
    };
    poll.status = "completed";
    await poll.save();

    // Calculate individual distances
    const distances = poll.locations.map(l => ({
      userName: l.userName,
      distance: getDistance(l.lat, l.lng, best.lat, best.lng),
    }));

    res.status(200).json({
      success: true,
      message: `🎯 Best meeting point: ${best.city}, ${best.state}!`,
      result: poll.result,
      distances,
      poll,
    });
  } catch (err) {
    console.error("Calculate error:", err.message);
    res.status(500).json({ success: false, message: "Could not calculate meeting point." });
  }
};

// @route DELETE /api/meeting-polls/:id
const cancelPoll = async (req, res) => {
  try {
    const poll = await MeetingPoll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found." });
    poll.status = "cancelled";
    await poll.save();
    res.status(200).json({ success: true, message: "Poll cancelled." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not cancel poll." });
  }
};

module.exports = { createPoll, getPollByTrip, shareLocation, calculateMeeting, cancelPoll };
