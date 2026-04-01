// ============================================================
// routes/expenseRoutes.js
// ============================================================

const express = require("express");
const router = express.Router();
const { addExpense, getTripExpenses, deleteExpense, getSettlement } = require("../controllers/expenseController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/",                          addExpense);
router.get("/trip/:tripId",              getTripExpenses);
router.get("/trip/:tripId/settlement",   getSettlement);
router.delete("/:id",                    deleteExpense);

module.exports = router;
