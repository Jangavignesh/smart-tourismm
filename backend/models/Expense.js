// ============================================================
// models/Expense.js
// ============================================================

const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  tripId:      { type: mongoose.Schema.Types.ObjectId, ref: "GroupTrip", required: true },
  paidBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  paidByName:  { type: String, required: true },
  amount:      { type: Number, required: true, min: 0 },
  description: { type: String, required: true, trim: true },
  category:    { type: String, enum: ["food", "transport", "hotel", "activities", "shopping", "other"], default: "other" },
  splitAmong:  [{ userId: String, userName: String }],
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);
