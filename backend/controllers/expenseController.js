// ============================================================
// controllers/expenseController.js
// ============================================================

const Expense = require("../models/Expense");
const GroupTrip = require("../models/GroupTrip");

// @route POST /api/expenses
const addExpense = async (req, res) => {
  try {
    const { tripId, amount, description, category } = req.body;
    if (!tripId || !amount || !description) {
      return res.status(400).json({ success: false, message: "Trip, amount and description required." });
    }

    // Get trip members to split among
    const trip = await GroupTrip.findById(tripId);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });

    const splitAmong = trip.members.map(m => ({
      userId: m.user?.toString(),
      userName: m.name,
    }));

    const expense = await Expense.create({
      tripId,
      paidBy: req.user._id,
      paidByName: req.user.name,
      amount: parseFloat(amount),
      description,
      category: category || "other",
      splitAmong,
    });

    res.status(201).json({ success: true, message: "Expense added! 💰", expense });
  } catch (err) {
    console.error("Add expense error:", err.message);
    res.status(500).json({ success: false, message: "Could not add expense." });
  }
};

// @route GET /api/expenses/trip/:tripId
const getTripExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not fetch expenses." });
  }
};

// @route DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: "Expense not found." });
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the payer can delete this expense." });
    }
    await expense.deleteOne();
    res.status(200).json({ success: true, message: "Expense deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not delete expense." });
  }
};

// @route GET /api/expenses/trip/:tripId/settlement
const getSettlement = async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId });
    if (expenses.length === 0) {
      return res.status(200).json({ success: true, settlement: [], totalAmount: 0, perPerson: 0 });
    }

    // Get all members
    const trip = await GroupTrip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });

    const members = trip.members.map(m => ({
      userId: m.user?.toString(),
      userName: m.name,
    }));

    const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
    const perPerson = totalAmount / members.length;

    // Calculate how much each person paid
    const paid = {};
    members.forEach(m => { paid[m.userId] = { name: m.userName, amount: 0 }; });

    expenses.forEach(exp => {
      const uid = exp.paidBy.toString();
      if (paid[uid]) paid[uid].amount += exp.amount;
      else paid[uid] = { name: exp.paidByName, amount: exp.amount };
    });

    // Calculate balance (positive = gets money back, negative = owes money)
    const balances = {};
    Object.entries(paid).forEach(([uid, data]) => {
      balances[uid] = { name: data.name, balance: data.amount - perPerson };
    });

    // Settle up — greedy algorithm
    const creditors = Object.entries(balances).filter(([, b]) => b.balance > 0.01).map(([uid, b]) => ({ uid, name: b.name, amount: b.balance }));
    const debtors   = Object.entries(balances).filter(([, b]) => b.balance < -0.01).map(([uid, b]) => ({ uid, name: b.name, amount: -b.balance }));

    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const settlement = [];
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].amount, creditors[j].amount);
      if (pay > 0.01) {
        settlement.push({
          from: debtors[i].name,
          fromId: debtors[i].uid,
          to: creditors[j].name,
          toId: creditors[j].uid,
          amount: Math.round(pay * 100) / 100, // Preserve 2-decimal precision for fairness
        });
      }
      debtors[i].amount -= pay;
      creditors[j].amount -= pay;
      if (debtors[i].amount < 0.01) i++;
      if (creditors[j].amount < 0.01) j++;
    }

    // Per person paid summary
    const paidSummary = Object.entries(paid).map(([uid, data]) => ({
      userId: uid,
      userName: data.name,
      paid: Math.round(data.amount),
      share: Math.round(perPerson),
      balance: Math.round(balances[uid]?.balance || 0),
    }));

    res.status(200).json({
      success: true,
      totalAmount: Math.round(totalAmount),
      perPerson: Math.round(perPerson),
      memberCount: members.length,
      paidSummary,
      settlement,
    });
  } catch (err) {
    console.error("Settlement error:", err.message);
    res.status(500).json({ success: false, message: "Could not calculate settlement." });
  }
};

module.exports = { addExpense, getTripExpenses, deleteExpense, getSettlement };
