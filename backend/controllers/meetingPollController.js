// ============================================================
// controllers/meetingPollController.js
// ============================================================

const MeetingPoll = require("../models/MeetingPoll");

// Major Indian cities with coordinates
const INDIAN_CITIES = [
  { city: "Mumbai",      state: "Maharashtra",    latitude: 19.0760, longitude: 72.8777 },
  { city: "Delhi",       state: "Delhi",           latitude: 28.6139, longitude: 77.2090 },
  { city: "Bangalore",   state: "Karnataka",       latitude: 12.9716, longitude: 77.5946 },
  { city: "Chennai",     state: "Tamil Nadu",      latitude: 13.0827, longitude: 80.2707 },
  { city: "Kolkata",     state: "West Bengal",     latitude: 22.5726, longitude: 88.3639 },
  { city: "Hyderabad",   state: "Telangana",       latitude: 17.3850, longitude: 78.4867 },
  { city: "Pune",        state: "Maharashtra",     latitude: 18.5204, longitude: 73.8567 },
  { city: "Ahmedabad",   state: "Gujarat",         latitude: 23.0225, longitude: 72.5714 },
  { city: "Jaipur",      state: "Rajasthan",       latitude: 26.9124, longitude: 75.7873 },
  { city: "Surat",       state: "Gujarat",         latitude: 21.1702, longitude: 72.8311 },
  { city: "Lucknow",     state: "Uttar Pradesh",   latitude: 26.8467, longitude: 80.9462 },
  { city: "Nagpur",      state: "Maharashtra",     latitude: 21.1458, longitude: 79.0882 },
  { city: "Indore",      state: "Madhya Pradesh",  latitude: 22.7196, longitude: 75.8577 },
  { city: "Bhopal",      state: "Madhya Pradesh",  latitude: 23.2599, longitude: 77.4126 },
  { city: "Patna",       state: "Bihar",           latitude: 25.5941, longitude: 85.1376 },
  { city: "Vadodara",    state: "Gujarat",         latitude: 22.3072, longitude: 73.1812 },
  { city: "Agra",        state: "Uttar Pradesh",   latitude: 27.1767, longitude: 78.0081 },
  { city: "Varanasi",    state: "Uttar Pradesh",   latitude: 25.3176, longitude: 82.9739 },
  { city: "Kanpur",      state: "Uttar Pradesh",   latitude: 26.4499, longitude: 80.3319 },
  { city: "Coimbatore",  state: "Tamil Nadu",      latitude: 11.0168, longitude: 76.9558 },
  { city: "Kochi",       state: "Kerala",          latitude: 9.9312,  longitude: 76.2673 },
  { city: "Guwahati",    state: "Assam",           latitude: 26.1445, longitude: 91.7362 },
  { city: "Bhubaneswar", state: "Odisha",          latitude: 20.2961, longitude: 85.8245 },
  { city: "Visakhapatnam",state:"Andhra Pradesh",  latitude: 17.6868, longitude: 83.2185 },
  { city: "Amritsar",    state: "Punjab",          latitude: 31.6340, longitude: 74.8723 },
  { city: "Chandigarh",  state: "Punjab",          latitude: 30.7333, longitude: 76.7794 },
  { city: "Raipur",      state: "Chhattisgarh",    latitude: 21.2514, longitude: 81.6296 },
  { city: "Ranchi",      state: "Jharkhand",       latitude: 23.3441, longitude: 85.3096 },
  { city: "Nashik",      state: "Maharashtra",     latitude: 20.0059, longitude: 73.7897 },
  { city: "Aurangabad",  state: "Maharashtra",     latitude: 19.8762, longitude: 75.3433 },
  { city: "Jodhpur",     state: "Rajasthan",       latitude: 26.2389, longitude: 73.0243 },
  { city: "Udaipur",     state: "Rajasthan",       latitude: 24.5854, longitude: 73.7125 },
  { city: "Mysore",      state: "Karnataka",       latitude: 12.2958, longitude: 76.6394 },
  { city: "Goa",         state: "Goa",             latitude: 15.2993, longitude: 74.1240 },
  { city: "Shimla",      state: "Himachal Pradesh",latitude: 31.1048, longitude: 77.1734 },
  { city: "Dehradun",    state: "Uttarakhand",     latitude: 30.3165, longitude: 78.0322 },
  { city: "Rishikesh",   state: "Uttarakhand",     latitude: 30.0869, longitude: 78.2676 },
  { city: "Manali",      state: "Himachal Pradesh",latitude: 32.2396, longitude: 77.1887 },
  { city: "Darjeeling",  state: "West Bengal",     latitude: 27.0410, longitude: 88.2663 },
  { city: "Madurai",     state: "Tamil Nadu",      latitude: 9.9252,  longitude: 78.1198 },
  { city: "Vijayawada",  state: "Andhra Pradesh",  latitude: 16.5062, longitude: 80.6480 },
  { city: "Tirupati",    state: "Andhra Pradesh",  latitude: 13.6288, longitude: 79.4192 },
  { city: "Kurnool",     state: "Andhra Pradesh",  latitude: 15.8281, longitude: 78.0373 }
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

  let bestCity = null;
  let minMaxDist = Infinity;
  let bestAvg = 0;

  console.log(`[MeetingPoint] Scoring ${INDIAN_CITIES.length} candidate cities...`);

  for (const city of INDIAN_CITIES) {
    const distances = locations.map(l => getDistance(l.latitude, l.longitude, city.latitude, city.longitude));
    const maxDist = Math.max(...distances);
    const totalDist = distances.reduce((sum, d) => sum + d, 0);
    const avgDist = totalDist / locations.length;
    
    console.log(`[MeetingPoint] Candidate: ${city.city}, MaxDist: ${maxDist}km`);

    // Fairness-based score: strictly minimize the max distance across all users
    if (maxDist < minMaxDist) {
      minMaxDist = maxDist;
      bestCity = city;
      bestAvg = Math.round(avgDist);
    }
  }

  console.log(`[MeetingPoint] FINAL BMP SELECTED: ${bestCity.city} (Min MaxDist: ${minMaxDist}km)`);
  return { ...bestCity, avgDist: bestAvg };
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
    const { latitude, longitude, city } = req.body;
    if (latitude === undefined || latitude === null || longitude === undefined || longitude === null) {
      return res.status(400).json({ success: false, message: "Location required." });
    }

    const poll = await MeetingPoll.findById(req.params.id);
    if (!poll) return res.status(404).json({ success: false, message: "Poll not found." });
    if (poll.status !== "active") return res.status(400).json({ success: false, message: "Poll is no longer active." });

    // Update or add location
    const existingIdx = poll.locations.findIndex(l => l.userId === req.user._id.toString());
    if (existingIdx >= 0) {
      poll.locations[existingIdx] = { userId: req.user._id.toString(), userName: req.user.name, latitude, longitude, city, sharedAt: new Date() };
    } else {
      poll.locations.push({ userId: req.user._id.toString(), userName: req.user.name, latitude, longitude, city, sharedAt: new Date() });
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
      latitude: best.latitude,
      longitude: best.longitude,
      avgDist: best.avgDist,
    };
    poll.status = "completed";
    await poll.save();

    // Calculate individual distances
    const distances = poll.locations.map(l => ({
      userName: l.userName,
      distance: getDistance(l.latitude, l.longitude, best.latitude, best.longitude),
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
