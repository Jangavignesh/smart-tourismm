// ============================================================
// models/User.js - User Schema & Model
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries by default
    },
    preferences: {
      // Array of interest categories selected by the user
      type: [String],
      enum: ["nature", "adventure", "food", "historical", "hill_stations", "beach", "culture", "wildlife"],
      default: [],
    },
    avatar: {
      type: String,
      default: "", // URL to profile picture (future feature)
    },
    favorites: {
      // Array of destination IDs saved by the user
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Destination" }],
      default: [],
    },
    tripsCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// ── Pre-save Hook: Hash password before saving ──────────────
userSchema.pre("save", async function (next) {
  // Only hash if password field was modified
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12); // 12 rounds = good security/performance balance
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ── Instance Method: Compare passwords ─────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: Return safe user object (no password) ──
userSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    preferences: this.preferences,
    favorites: this.favorites,
    tripsCount: this.tripsCount,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model("User", userSchema);
module.exports = User;
