// ============================================================
// controllers/groupTripController.js - FIXED
// Field names match GroupTrip model exactly
// ============================================================

const GroupTrip = require("../models/GroupTrip");

// @route POST /api/group-trips
const createGroupTrip = async (req, res) => {
  try {
    const { name, description, startDate, endDate, totalBudget, invitedEmails } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "Trip name is required." });

    const trip = await GroupTrip.create({
      name,
      description: description || "",
      creator: req.user._id,
      creatorName: req.user.name,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      totalBudget: totalBudget || 0,
      invitedEmails: invitedEmails || [],
      members: [{
        user: req.user._id,
        name: req.user.name,
        email: req.user.email,
        status: "accepted",
        joinedAt: new Date(),
      }],
    });

    res.status(201).json({ success: true, message: "Group trip created! 🎉", trip });
  } catch (err) {
    console.error("Create trip error:", err.message);
    res.status(500).json({ success: false, message: err.message || "Could not create trip." });
  }
};

// @route GET /api/group-trips
const getMyTrips = async (req, res) => {
  try {
    const trips = await GroupTrip.find({
      $or: [
        { creator: req.user._id },
        { "members.user": req.user._id },
      ]
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: trips.length, trips });
  } catch (err) {
    console.error("Get trips error:", err.message);
    res.status(500).json({ success: false, message: "Could not fetch trips." });
  }
};

// @route GET /api/group-trips/:id
const getTripById = async (req, res) => {
  try {
    const trip = await GroupTrip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });
    res.status(200).json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch trip." });
  }
};

// @route POST /api/group-trips/join
const joinTrip = async (req, res) => {
  try {
    const { tripCode } = req.body;
    if (!tripCode) return res.status(400).json({ success: false, message: "Trip code required." });

    const trip = await GroupTrip.findOne({ tripCode: tripCode.toUpperCase() });
    if (!trip) return res.status(404).json({ success: false, message: "Invalid trip code." });

    const isMember = trip.members.some(m => m.user?.toString() === req.user._id.toString());
    if (isMember) return res.status(400).json({ success: false, message: "You are already in this trip!" });

    trip.members.push({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      status: "accepted",
      joinedAt: new Date(),
    });

    await trip.save();
    res.status(200).json({ success: true, message: `Joined "${trip.name}" successfully! 🎉`, trip });
  } catch (err) {
    console.error("Join trip error:", err.message);
    res.status(500).json({ success: false, message: "Could not join trip." });
  }
};

// @route POST /api/group-trips/:id/destinations
const addDestination = async (req, res) => {
  try {
    const { destinationId, destinationName, image, city } = req.body;
    if (!destinationName) return res.status(400).json({ success: false, message: "Destination name required." });

    const trip = await GroupTrip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });

    const exists = trip.destinations.some(d => d.destinationId === destinationId);
    if (exists) return res.status(400).json({ success: false, message: "Destination already added!" });

    trip.destinations.push({
      destinationId: destinationId || `dest_${Date.now()}`,
      destinationName,
      image: image || "",
      city: city || "",
      addedBy: req.user.name,
      votes: [],
    });

    await trip.save();
    res.status(200).json({ success: true, message: `${destinationName} added! 📍`, trip });
  } catch (err) {
    console.error("Add destination error:", err.message);
    res.status(500).json({ success: false, message: "Could not add destination." });
  }
};

// @route POST /api/group-trips/:id/destinations/:destId/vote
const voteDestination = async (req, res) => {
  try {
    const trip = await GroupTrip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });

    const dest = trip.destinations.find(d => d.destinationId === req.params.destId);
    if (!dest) return res.status(404).json({ success: false, message: "Destination not found." });

    const hasVoted = dest.votes.some(v => v.toString() === req.user._id.toString());
    if (hasVoted) {
      dest.votes = dest.votes.filter(v => v.toString() !== req.user._id.toString());
    } else {
      dest.votes.push(req.user._id);
    }

    await trip.save();
    res.status(200).json({
      success: true,
      votes: dest.votes.length,
      hasVoted: !hasVoted,
      message: hasVoted ? "Vote removed" : "Voted! 👍",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not vote." });
  }
};

// @route PUT /api/group-trips/:id
const updateTrip = async (req, res) => {
  try {
    const trip = await GroupTrip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });
    if (trip.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only creator can update." });
    }

    const { name, description, startDate, endDate, totalBudget, status } = req.body;
    if (name) trip.name = name;
    if (description !== undefined) trip.description = description;
    if (startDate) trip.startDate = startDate;
    if (endDate) trip.endDate = endDate;
    if (totalBudget !== undefined) trip.totalBudget = totalBudget;
    if (status) trip.status = status;

    await trip.save();
    res.status(200).json({ success: true, message: "Trip updated!", trip });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not update trip." });
  }
};

// @route DELETE /api/group-trips/:id
const deleteTrip = async (req, res) => {
  try {
    const trip = await GroupTrip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });
    if (trip.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only creator can delete." });
    }
    await trip.deleteOne();
    res.status(200).json({ success: true, message: "Trip deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not delete trip." });
  }
};

// @route DELETE /api/group-trips/:id/destinations/:destId
const removeDestination = async (req, res) => {
  try {
    const trip = await GroupTrip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });
    trip.destinations = trip.destinations.filter(d => d.destinationId !== req.params.destId);
    await trip.save();
    res.status(200).json({ success: true, message: "Destination removed.", trip });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not remove destination." });
  }
};


// @route POST /api/group-trips/:id/invite-by-email
// @desc  Validate email exists in DB and add as member
const inviteByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    const User = require("../models/User");

    // Check if email is registered on SmartTrip
    const invitedUser = await User.findOne({
      email: email.toLowerCase().trim()
    }).select("_id name email");

    if (!invitedUser) {
      return res.status(404).json({
        success: false,
        message: `❌ "${email}" is not registered on SmartTrip. Ask them to sign up first!`,
        notRegistered: true,
      });
    }

    const trip = await GroupTrip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });

    // Already a member?
    const alreadyMember = trip.members.some(
      m => m.user?.toString() === invitedUser._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: `${invitedUser.name} is already in this trip!`,
      });
    }

    // Can't invite yourself
    if (invitedUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot invite yourself!" });
    }

    // Add as member directly
    trip.members.push({
      user: invitedUser._id,
      name: invitedUser.name,
      email: invitedUser.email,
      status: "accepted",
      joinedAt: new Date(),
    });

    await trip.save();

    res.status(200).json({
      success: true,
      message: `✅ ${invitedUser.name} added to the trip!`,
      member: { name: invitedUser.name, email: invitedUser.email },
      trip,
    });
  } catch (err) {
    console.error("Invite error:", err.message);
    res.status(500).json({ success: false, message: "Could not invite member." });
  }
};


// @route DELETE /api/group-trips/:id/leave
// @desc  Leave a group trip (for non-creators)
const leaveTrip = async (req, res) => {
  try {
    const trip = await GroupTrip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });

    // Creator cannot leave — they must delete instead
    if (trip.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You are the creator! Delete the trip instead of leaving.",
      });
    }

    // Check if user is a member
    const isMember = trip.members.some(m => m.user?.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(400).json({ success: false, message: "You are not a member of this trip." });
    }

    // Remove from members
    trip.members = trip.members.filter(m => m.user?.toString() !== req.user._id.toString());
    await trip.save();

    res.status(200).json({ success: true, message: `You have left "${trip.name}". See you next time! 👋` });
  } catch (err) {
    console.error("Leave trip error:", err.message);
    res.status(500).json({ success: false, message: "Could not leave trip." });
  }
};

module.exports = {
  createGroupTrip, getMyTrips, getTripById, joinTrip,
  addDestination, voteDestination, updateTrip,
  deleteTrip, removeDestination, inviteByEmail, leaveTrip,
};
