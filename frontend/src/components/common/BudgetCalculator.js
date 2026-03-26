// ============================================================
// src/components/common/BudgetCalculator.js
// Budget Estimation Component
// ============================================================

import React, { useState } from "react";

const CITY_BUDGETS = {
  "Agra":       { hotel: { budget: 800,  mid: 2500,  luxury: 12000 }, food: { budget: 300, mid: 800,  luxury: 2000 }, flight: 3500,  activities: { budget: 200, mid: 600,  luxury: 2000 }, transport: { budget: 150, mid: 400,  luxury: 1200 } },
  "Jaipur":     { hotel: { budget: 700,  mid: 2000,  luxury: 10000 }, food: { budget: 300, mid: 700,  luxury: 1800 }, flight: 3000,  activities: { budget: 200, mid: 500,  luxury: 1800 }, transport: { budget: 150, mid: 400,  luxury: 1000 } },
  "Goa":        { hotel: { budget: 1000, mid: 3000,  luxury: 15000 }, food: { budget: 400, mid: 1000, luxury: 3000 }, flight: 4500,  activities: { budget: 300, mid: 800,  luxury: 2500 }, transport: { budget: 200, mid: 500,  luxury: 1500 } },
  "Delhi":      { hotel: { budget: 800,  mid: 2500,  luxury: 12000 }, food: { budget: 300, mid: 800,  luxury: 2000 }, flight: 2500,  activities: { budget: 200, mid: 600,  luxury: 2000 }, transport: { budget: 150, mid: 400,  luxury: 1200 } },
  "Varanasi":   { hotel: { budget: 600,  mid: 1800,  luxury: 8000  }, food: { budget: 250, mid: 600,  luxury: 1500 }, flight: 3500,  activities: { budget: 150, mid: 400,  luxury: 1500 }, transport: { budget: 100, mid: 300,  luxury: 800  } },
  "Udaipur":    { hotel: { budget: 800,  mid: 2500,  luxury: 12000 }, food: { budget: 300, mid: 800,  luxury: 2000 }, flight: 4000,  activities: { budget: 200, mid: 500,  luxury: 1800 }, transport: { budget: 150, mid: 400,  luxury: 1000 } },
  "Mumbai":     { hotel: { budget: 1200, mid: 4000,  luxury: 20000 }, food: { budget: 400, mid: 1200, luxury: 3000 }, flight: 3000,  activities: { budget: 300, mid: 800,  luxury: 2500 }, transport: { budget: 200, mid: 600,  luxury: 1500 } },
  "Mysore":     { hotel: { budget: 600,  mid: 1800,  luxury: 8000  }, food: { budget: 250, mid: 600,  luxury: 1500 }, flight: 4000,  activities: { budget: 150, mid: 400,  luxury: 1500 }, transport: { budget: 100, mid: 300,  luxury: 800  } },
  "Amritsar":   { hotel: { budget: 500,  mid: 1500,  luxury: 7000  }, food: { budget: 200, mid: 500,  luxury: 1200 }, flight: 3500,  activities: { budget: 150, mid: 400,  luxury: 1200 }, transport: { budget: 100, mid: 300,  luxury: 700  } },
  "Rishikesh":  { hotel: { budget: 500,  mid: 1500,  luxury: 7000  }, food: { budget: 200, mid: 500,  luxury: 1200 }, flight: 3500,  activities: { budget: 300, mid: 800,  luxury: 2000 }, transport: { budget: 100, mid: 300,  luxury: 700  } },
  "Manali":     { hotel: { budget: 700,  mid: 2000,  luxury: 10000 }, food: { budget: 300, mid: 700,  luxury: 1800 }, flight: 5000,  activities: { budget: 300, mid: 800,  luxury: 2500 }, transport: { budget: 200, mid: 500,  luxury: 1200 } },
  "Ooty":       { hotel: { budget: 600,  mid: 1800,  luxury: 8000  }, food: { budget: 250, mid: 600,  luxury: 1500 }, flight: 4500,  activities: { budget: 150, mid: 400,  luxury: 1500 }, transport: { budget: 100, mid: 300,  luxury: 800  } },
  "Darjeeling": { hotel: { budget: 700,  mid: 2000,  luxury: 10000 }, food: { budget: 300, mid: 700,  luxury: 1800 }, flight: 5000,  activities: { budget: 200, mid: 500,  luxury: 1800 }, transport: { budget: 150, mid: 400,  luxury: 1000 } },
  "Kolkata":    { hotel: { budget: 600,  mid: 1800,  luxury: 8000  }, food: { budget: 250, mid: 600,  luxury: 1500 }, flight: 3000,  activities: { budget: 150, mid: 400,  luxury: 1500 }, transport: { budget: 100, mid: 300,  luxury: 800  } },
  "Chennai":    { hotel: { budget: 700,  mid: 2000,  luxury: 9000  }, food: { budget: 300, mid: 700,  luxury: 1800 }, flight: 3500,  activities: { budget: 200, mid: 500,  luxury: 1800 }, transport: { budget: 150, mid: 400,  luxury: 1000 } },
  "Hampi":      { hotel: { budget: 500,  mid: 1500,  luxury: 6000  }, food: { budget: 200, mid: 500,  luxury: 1200 }, flight: 5000,  activities: { budget: 150, mid: 400,  luxury: 1200 }, transport: { budget: 100, mid: 300,  luxury: 700  } },
  "Jodhpur":    { hotel: { budget: 700,  mid: 2000,  luxury: 10000 }, food: { budget: 300, mid: 700,  luxury: 1800 }, flight: 4000,  activities: { budget: 200, mid: 500,  luxury: 1800 }, transport: { budget: 150, mid: 400,  luxury: 1000 } },
  "Munnar":     { hotel: { budget: 700,  mid: 2500,  luxury: 10000 }, food: { budget: 300, mid: 700,  luxury: 1800 }, flight: 4500,  activities: { budget: 200, mid: 500,  luxury: 1800 }, transport: { budget: 150, mid: 400,  luxury: 1000 } },
  "Kochi":      { hotel: { budget: 700,  mid: 2500,  luxury: 10000 }, food: { budget: 300, mid: 700,  luxury: 1800 }, flight: 4000,  activities: { budget: 200, mid: 500,  luxury: 1800 }, transport: { budget: 150, mid: 400,  luxury: 1000 } },
  "default":    { hotel: { budget: 700,  mid: 2000,  luxury: 10000 }, food: { budget: 300, mid: 700,  luxury: 1800 }, flight: 4000,  activities: { budget: 200, mid: 500,  luxury: 1800 }, transport: { budget: 150, mid: 400,  luxury: 1000 } },
};

const BUDGET_TYPES = [
  { id: "budget",  label: "Budget",    emoji: "💚", activeClass: "bg-green-500 text-white border-green-500",   inactiveClass: "bg-green-50 border-green-200 text-green-700" },
  { id: "mid",     label: "Mid-range", emoji: "💛", activeClass: "bg-yellow-500 text-white border-yellow-500", inactiveClass: "bg-yellow-50 border-yellow-200 text-yellow-700" },
  { id: "luxury",  label: "Luxury",    emoji: "💜", activeClass: "bg-purple-500 text-white border-purple-500", inactiveClass: "bg-purple-50 border-purple-200 text-purple-700" },
];

const fmt = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;

const BudgetCalculator = ({ destination, travelInfo, onBudgetChange }) => {
  const [days, setDays] = useState(3);
  const [people, setPeople] = useState(2);
  const [budgetType, setBudgetType] = useState("mid");
  const [showBreakdown, setShowBreakdown] = useState(false);

  const cityName = destination?.location?.city || "default";
  const data = CITY_BUDGETS[cityName] || CITY_BUDGETS["default"];

  const hotelCost      = data.hotel[budgetType] * days * people;
  const travelCost     = travelInfo ? travelInfo.travelCost * 2 * people : data.flight * people * 2;
  const foodCost       = data.food[budgetType] * days * people;
  const activitiesCost = data.activities[budgetType] * days * people;
  const transportCost  = data.transport[budgetType] * days * people;
  const totalCost      = hotelCost + foodCost + travelCost + activitiesCost + transportCost;
  const perPerson      = Math.round(totalCost / people);

  const breakdown = [
    { label: travelInfo ? `${travelInfo.emoji} Travel (${travelInfo.mode} - return)` : "✈️ Flights (return)", value: travelCost, note: travelInfo ? `${travelInfo.distance} km × ₹${travelInfo.costPerKm}/km × ${people} person${people > 1 ? "s" : ""} × 2` : `${people} person${people > 1 ? "s" : ""}` },
    { label: "🏨 Hotel",            value: hotelCost,      note: `${days} nights × ${people} person${people > 1 ? "s" : ""}` },
    { label: "🍽️ Food",             value: foodCost,       note: `${days} days × ${people} person${people > 1 ? "s" : ""}` },
    { label: "🎯 Activities",       value: activitiesCost, note: `Sightseeing & entry fees` },
    { label: "🚗 Local transport",  value: transportCost,  note: `Autos, cabs, local travel` },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-4 text-white">
        <h3 className="font-bold text-base">💰 Trip Budget Estimator</h3>
        <p className="text-green-100 text-xs mt-0.5">
          Estimate your trip cost to {destination?.name || "this destination"}
        </p>
        {travelInfo && (
          <div className="mt-2 bg-white/20 rounded-lg px-3 py-1.5 text-xs text-white inline-block">
            {travelInfo.emoji} {travelInfo.mode} travel included: {travelInfo.distance} km from your location
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Budget type */}
        <div className="grid grid-cols-3 gap-2">
          {BUDGET_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setBudgetType(t.id)}
              className={`py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                budgetType === t.id ? t.activeClass : t.inactiveClass
              }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Days slider */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-600">📅 Number of days</label>
            <span className="text-sm font-bold text-blue-600">{days} {days === 1 ? "day" : "days"}</span>
          </div>
          <input
            type="range" min="1" max="14" step="1"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1 day</span><span>7 days</span><span>14 days</span>
          </div>
        </div>

        {/* People slider */}
        <div>
          <div className="flex justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-600">👥 Number of people</label>
            <span className="text-sm font-bold text-blue-600">{people} {people === 1 ? "person" : "people"}</span>
          </div>
          <input
            type="range" min="1" max="10" step="1"
            value={people}
            onChange={(e) => setPeople(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>1</span><span>5</span><span>10</span>
          </div>
        </div>

        {/* Total cost display */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-slate-500 mb-1">Estimated total cost</p>
          <p className="text-3xl font-bold text-blue-700">{fmt(totalCost)}</p>
          <p className="text-xs text-slate-400 mt-1">
            {fmt(perPerson)} per person · {days} days · {people} {people === 1 ? "person" : "people"}
          </p>
        </div>

        {/* Quick summary cards */}
        <div className="grid grid-cols-2 gap-2">
          {breakdown.slice(0, 4).map((item) => (
            <div key={item.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="text-sm font-bold text-slate-700 mt-0.5">{fmt(item.value)}</p>
            </div>
          ))}
        </div>

        {/* Detailed breakdown toggle */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
        >
          {showBreakdown ? "▲ Hide breakdown" : "▼ Show full breakdown"}
        </button>

        {showBreakdown && (
          <div className="space-y-2 animate-fade-in">
            {breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.note}</p>
                </div>
                <span className="text-sm font-bold text-slate-800">{fmt(item.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between py-2 bg-blue-50 rounded-xl px-3 mt-2">
              <span className="text-sm font-bold text-blue-700">Total</span>
              <span className="text-base font-bold text-blue-700">{fmt(totalCost)}</span>
            </div>
            <p className="text-xs text-slate-400 text-center pt-1">
              * Estimates based on average prices. Actual costs may vary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetCalculator;
