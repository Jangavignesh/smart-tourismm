// ============================================================
// controllers/favoritesController.js - FIXED v2
// Looks in BOTH Destination and DestinationCache collections
// ============================================================

const User = require("../models/User");
const Destination = require("../models/Destination");
const DestinationCache = require("../models/DestinationCache");

const addFavorite = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const user = await User.findById(req.user._id);

    if (user.favorites.map(f => f.toString()).includes(destinationId)) {
      return res.status(400).json({ success: false, message: "Already in your wishlist!" });
    }

    user.favorites.push(destinationId);
    await user.save();

    // Try to get destination name from either collection
    let destName = "Destination";
    try {
      const dest = await Destination.findById(destinationId) ||
                   await DestinationCache.findById(destinationId);
      if (dest) destName = dest.name;
    } catch {}

    res.status(200).json({
      success: true,
      message: `${destName} added to your wishlist! ❤️`,
      favorites: user.favorites,
    });
  } catch (err) {
    console.error("Add Favorite Error:", err);
    res.status(500).json({ success: false, message: "Could not add to favorites." });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const user = await User.findById(req.user._id);
    user.favorites = user.favorites.filter(id => id.toString() !== destinationId);
    await user.save();
    res.status(200).json({ success: true, message: "Removed from wishlist.", favorites: user.favorites });
  } catch (err) {
    console.error("Remove Favorite Error:", err);
    res.status(500).json({ success: false, message: "Could not remove from favorites." });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.favorites || user.favorites.length === 0) {
      return res.status(200).json({ success: true, favorites: [] });
    }

    const ids = user.favorites.map(id => id.toString());

    // Search in BOTH collections simultaneously
    const [fromDestination, fromCache] = await Promise.all([
      Destination.find({ _id: { $in: ids } }).lean(),
      DestinationCache.find({ _id: { $in: ids } }).lean(),
    ]);

    // Merge results — avoid duplicates
    const seen = new Set();
    const allFavorites = [];

    [...fromDestination, ...fromCache].forEach(dest => {
      const id = dest._id.toString();
      if (!seen.has(id)) {
        seen.add(id);
        allFavorites.push(dest);
      }
    });

    // Sort in same order as user.favorites
    allFavorites.sort((a, b) => {
      return ids.indexOf(a._id.toString()) - ids.indexOf(b._id.toString());
    });

    console.log(`✅ Favorites: ${allFavorites.length} found (${fromDestination.length} from Destination, ${fromCache.length} from Cache)`);

    res.status(200).json({ success: true, favorites: allFavorites });
  } catch (err) {
    console.error("Get Favorites Error:", err);
    res.status(500).json({ success: false, message: "Could not fetch favorites." });
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites };
