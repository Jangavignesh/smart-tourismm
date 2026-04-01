# 🔍 Smart Tourism — Pre-Deployment Bug Report

> **Tester:** Antigravity QA Agent | **Date:** 2026-03-31 | **Scope:** Full static code analysis of both backend and frontend before live deployment.

---

## 🔴 CRITICAL Bugs (Fix Before Deploy)

---

### BUG-001 · Expense Settlement Crashes When Trip Is Deleted Mid-Flight

**File:** [`expenseController.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/backend/controllers/expenseController.js#L76-L83)  
**Severity:** 🔴 Critical — Server 500 error / data loss

**Description:**  
In `getSettlement()`, the code calls `GroupTrip.findById()` on line 76 but **never checks if `trip` is null**. If the trip is deleted while expenses still exist, calling `.members` on `null` causes an unhandled `TypeError: Cannot read properties of null`, crashing the server response.

```js
// ❌ BUG — trip could be null
const trip = await GroupTrip.findById(req.params.tripId);
const members = trip.members.map(...); // 💥 Crash if trip deleted
```

**Fix:**
```js
const trip = await GroupTrip.findById(req.params.tripId);
if (!trip) return res.status(404).json({ success: false, message: "Trip not found." });
```

---

### BUG-002 · Socket Connection Created Twice Per Page Load (Memory/Connection Leak)

**File:** [`GroupTripDetailPage.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/frontend/src/pages/GroupTripDetailPage.js#L48-L108)  
**Severity:** 🔴 Critical — Memory leak + duplicate real-time events

**Description:**  
Two separate `useEffect` hooks both establish socket connections to the server for the same trip:
- Lines 48-86: Loads a raw `window.io` socket for badge tracking.
- Lines 94-108: Calls `initSocket()` for a shared socket.

This creates **two concurrent socket connections per user per trip**, causing duplicate `new_message` events, wasted server resources, and potential data inconsistency (message received twice).

**Fix:** Consolidate both into the shared `socketService` (`initSocket/getSocket`) and use `getSocket()` to attach badge listeners. Remove the manual `window.io` socket entirely.

---

### BUG-003 · Trip Code Collision — No Retry on Duplicate

**File:** [`GroupTrip.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/backend/models/GroupTrip.js#L41-L46)  
**Severity:** 🔴 Critical — Silent save failure for users

**Description:**  
The `pre("save")` hook generates a trip code using `Math.random().toString(36).substring(2,8).toUpperCase()`. Since `tripCode` has a `unique` index, if a collision occurs, MongoDB throws a `E11000 duplicate key error` which propagates as an unhandled 500 error in `createGroupTrip`. Users see "Could not create trip" with no explanation.

**Fix:** Add a retry loop or use a more collision-resistant generator (e.g., combine timestamp + random suffix):
```js
groupTripSchema.pre("save", async function(next) {
  if (!this.tripCode) {
    let code, exists = true;
    while (exists) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      exists = await this.constructor.findOne({ tripCode: code });
    }
    this.tripCode = code;
  }
  next();
});
```

---

## 🟠 HIGH Severity Bugs

---

### BUG-004 · Review Route Ordering Conflict — `/my` Route Shadowed

**File:** [`reviewRoutes.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/backend/routes/reviewRoutes.js)  
**Severity:** 🟠 High — GET `/api/reviews/user/my` returns 500

**Description:**  
Express route for `GET /api/reviews/:destinationId` will match **before** the `GET /api/reviews/user/my` route if defined in that order. The string `"user"` is matched as `:destinationId`, causing Mongoose to try `Review.find({ destination: "user" })` which returns empty (or could throw a CastError if using ObjectId). The user's review history page would break silently.

**Fix:** Ensure the specific `/user/my` route is registered **before** the parameterized `/:destinationId` route.

---

### BUG-005 · Hardcoded `localhost:5000` CORS & Socket URL — Production Failure

**Files:**  
- [`server.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/backend/server.js#L20-L27) — CORS origin hardcoded  
- [`GroupTripDetailPage.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/frontend/src/pages/GroupTripDetailPage.js#L59) — Socket URL hardcoded  

**Description:**  
`http://localhost:3000` is hardcoded in CORS config and `http://localhost:5000` is hardcoded in the badge socket listener. Once deployed to a real server, all WebSocket connections and CORS preflight requests will fail with origin errors.

**Fix:**
```js
// server.js
origin: process.env.CORS_ORIGIN || "http://localhost:3000"

// GroupTripDetailPage.js
const socket = window.io?.(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", ...)
```

---

### BUG-006 · Creator Check Uses `localStorage` Bypass (Stale Data Risk)

**File:** [`GroupTripPage.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/frontend/src/pages/GroupTripPage.js#L412-L415)  
**Severity:** 🟠 High — Security bypass / wrong UI shown

**Description:**  
The trip card's delete/leave button logic directly reads from `localStorage.getItem("user")` instead of using `useAuth()`, which is the authoritative user state in context:

```js
const stored = JSON.parse(localStorage.getItem("user") || "{}");
const myId = stored._id || stored.id || "";
```

If the stored user object has `id` but the trip stores `_id`, or localStorage is stale after a session refresh, the creator check fails and the wrong buttons (Delete vs Leave) are shown. A non-creator could see a Delete button (which fails when clicked, but is a bad UX + potential confusion).

**Fix:** Use `const { user } = useAuth()` consistently, as already done in `GroupTripDetailPage.js`.

---

### BUG-007 · Itinerary Route Does Not Support More Than 5 Destinations (Day 1 Repeat)

**File:** [`itineraryRoutes.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/backend/routes/itineraryRoutes.js#L109)  
**Severity:** 🟠 High — Incorrect itinerary content for 4+ day trips

**Description:**  
The activity pool slicing on line 109:
```js
const usedActs = actPool.slice((dayNum - 1) * 3, (dayNum - 1) * 3 + 9);
```
For day 4 and beyond, if `actPool` has fewer items than `(dayNum-1)*3`, `usedActs` will be an empty array and all morning/afternoon/evening activities will fall back to `place1`, `place2`, etc., causing every day to look nearly identical. For a 7-day Goa trip with only `culture` interest, the pool has 4 items; days 2+ repeat content.

**Fix:** Use modular slicing:
```js
const idx = (dayNum - 1) * 3;
const usedActs = [
  actPool[idx % actPool.length],
  actPool[(idx + 1) % actPool.length],
  actPool[(idx + 2) % actPool.length],
];
```

---

## 🟡 MEDIUM Severity Issues

---

### BUG-008 · App Loader Blocks Full UI for 2 Seconds on Every Page Load

**File:** [`App.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/frontend/src/App.js#L56-L58)  

**Description:**  
A fixed 2-second `setTimeout` drives the splash loader regardless of whether the app is actually ready. On fast connections this is pure dead time and harms user experience (especially on revisits where everything is cached).

**Fix:** Remove the fake timer and tie loading state to `AuthContext.loading` instead:
```js
// In App.js
const { loading } = useAuth(); // show loader only while auth is restoring
```

---

### BUG-009 · Expense Settlement Uses `Math.round()` — Precision Loss Causes Unbounded Rounding Errors

**File:** [`expenseController.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/backend/controllers/expenseController.js#L118-L133)  

**Description:**  
The greedy settlement algorithm rounds amounts with `Math.round(pay)`, which can accumulate errors across many expense entries. With amounts like ₹333.33 per person, rounding at each step means the final settlement total may be ₹1-2 off, and the paid summary may not balance to zero. Over large groups/budgets this causes trust issues.

**Fix:** Use `Math.round(pay * 100) / 100` to preserve 2 decimal places throughout, and only round on final display output.

---

### BUG-010 · Group Edit Modal — `invitedEmails` Keeps Growing Duplicates

**File:** [`GroupTripDetailPage.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/frontend/src/pages/GroupTripDetailPage.js#L183-L186)  

**Description:**  
When editing a trip, new emails are appended to the existing `invitedEmails` array without deduplication:
```js
invitedEmails: [
  ...(trip.invitedEmails || []),
  ...newEmails, // ← same email can be added multiple times
],
```
If a user edits the trip twice and types the same email, it will appear twice in invited list. The display even shows "Already invited" emails, so users know they're there but the system doesn't prevent re-adds.

**Fix:**
```js
invitedEmails: [...new Set([...(trip.invitedEmails || []), ...newEmails])],
```

---

### BUG-011 · `MeetingPollController.shareLocation` Accepts `lat=0, lng=0` as Valid

**File:** [`meetingPollController.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/backend/controllers/meetingPollController.js#L134)  

**Description:**  
The guard `if (!lat || !lng)` uses falsy check. A coordinate of `0` (valid for equator/prime meridian) would be rejected. More importantly, `lat=0, lng=0` (null island) is not a real Indian city location but would pass a truthy check if a client intentionally sends zeros. The meeting point result would be corrupted.

**Fix:**
```js
if (lat === undefined || lat === null || lng === undefined || lng === null) ...
// Also validate range:
if (lat < 6 || lat > 38 || lng < 68 || lng > 98) {
  return res.status(400).json({ success: false, message: "Location must be within India." });
}
```

---

## 🟢 LOW Priority / Code Quality

---

### BUG-012 · `AuthContext` Calls `logout()` Before It's Defined (Temporal Dead Zone Risk)

**File:** [`AuthContext.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/frontend/src/context/AuthContext.js#L29)  
Line 29 calls `logout()` inside `restoreSession()` which is called from `useEffect`. `logout` is defined with `const` at line 59. While hoisting rules mean this works (the function executes after all declarations), it's an ordering risk during refactoring. Move `logout` above `restoreSession`.

---

### BUG-013 · No Rate Limiting on Auth Routes

**File:** [`authRoutes.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/backend/routes/authRoutes.js)  
Login and register endpoints have no rate limiting. A brute-force attack can make unlimited login attempts. Before deployment, add `express-rate-limit`:
```js
const rateLimit = require("express-rate-limit");
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
router.post("/login", authLimiter, login);
```

---

### BUG-014 · `updateReview` Allows Clearing Fields by Passing Empty String

**File:** [`reviewController.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/backend/controllers/reviewController.js#L106-L110)  
```js
review.title   = title   || review.title;   // ❌ empty string = falsy, keeps old
review.comment = comment || review.comment; // ❌ user can't intentionally set short comment
```
While currently not a security issue, if `rating: 0` is passed, `0 || review.rating` keeps the old rating. A user updating their 1-star to 5-star would be blocked if the `||` short-circuits.

**Fix:**
```js
if (rating !== undefined) review.rating = rating;
if (title  !== undefined) review.title  = title;
if (comment !== undefined) review.comment = comment;
```

---

### BUG-015 · No `404` Page — All Unknown Routes Silently Redirect to Home

**File:** [`App.js`](file:///c:/Users/shrey/Downloads/smart-tourismm-main/smart-tourismm/frontend/src/App.js#L47)  
```jsx
<Route path="*" element={<Navigate to="/" replace />} />
```
Broken links, typos in URLs, and deleted group trip URLs all silently bounce to the home page with no feedback. This confuses users and hides errors.

**Fix:** Create a simple `NotFoundPage` component and render it for the catch-all route.

---

## 📊 Summary

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 3 | Must fix before deploy |
| 🟠 High | 4 | Fix this sprint |
| 🟡 Medium | 4 | Fix in next sprint |
| 🟢 Low | 4 | Backlog |
| **Total** | **15** | |
