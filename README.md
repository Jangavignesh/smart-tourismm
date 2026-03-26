# 🌍 Smart Tourism & Group Trip Planning System

> A full-stack AI-powered tourism recommendation platform built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).

---

## 📸 Features Overview

| Feature | Status |
|---|---|
| User Registration & Login (JWT) | ✅ Done |
| Password Hashing (bcrypt) | ✅ Done |
| Protected Routes | ✅ Done |
| Travel Preferences Selection | ✅ Done |
| AI Recommendation Engine | ✅ Done |
| 25 Pre-seeded Destinations | ✅ Done |
| Destination Cards UI | ✅ Done |
| Explore / Search Destinations | ✅ Done |
| Responsive Tailwind CSS UI | ✅ Done |
| Group Trip Planning (Chat, Location, Median Point) | 🔜 Stage 2 |

---

## 🏗️ Project Structure

```
smart-tourism/
├── backend/
│   ├── controllers/
│   │   ├── authController.js          # Register & Login logic
│   │   ├── userController.js          # Profile & Preferences
│   │   ├── destinationController.js   # Destination CRUD
│   │   └── recommendationController.js # AI Recommendation Engine
│   ├── middleware/
│   │   └── authMiddleware.js          # JWT verification
│   ├── models/
│   │   ├── User.js                    # User schema (bcrypt hashing)
│   │   └── Destination.js             # Destination schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── destinationRoutes.js
│   │   └── recommendationRoutes.js
│   ├── data/
│   │   └── seed.js                    # Seeds 25 destinations to MongoDB
│   ├── .env.example
│   ├── package.json
│   └── server.js                      # Express entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── DestinationCard.js  # Reusable destination card
    │   │   │   └── ProtectedRoute.js   # Auth guard wrapper
    │   │   └── layout/
    │   │       └── Navbar.js           # Sticky responsive navbar
    │   ├── context/
    │   │   └── AuthContext.js          # Global auth state (React Context)
    │   ├── pages/
    │   │   ├── HomePage.js             # Landing page
    │   │   ├── LoginPage.js            # Login form
    │   │   ├── RegisterPage.js         # Register form with password strength
    │   │   ├── DashboardPage.js        # User dashboard
    │   │   ├── PreferencesPage.js      # Interest selection
    │   │   ├── RecommendationsPage.js  # AI recommendations display
    │   │   └── ExplorePage.js          # Browse all destinations
    │   ├── utils/
    │   │   └── api.js                  # Axios instance + interceptors
    │   ├── App.js                      # Routes definition
    │   ├── index.js                    # React entry
    │   └── index.css                   # Tailwind + global styles
    ├── .env
    ├── package.json
    └── tailwind.config.js
```

---

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v18+ → [Download](https://nodejs.org)
- **MongoDB** (local) → [Download](https://www.mongodb.com/try/download/community) OR use [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud)
- **npm** v8+ (comes with Node.js)

---

### Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd smart-tourism
```

---

### Step 2 — Backend Setup

```bash
# Go to backend folder
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env
```

**Edit `backend/.env`:**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/smart_tourism
JWT_SECRET=your_super_secret_key_at_least_32_chars_long
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

> 💡 **For MongoDB Atlas (cloud):** Replace `MONGO_URI` with your Atlas connection string.
> Example: `MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/smart_tourism`

---

### Step 3 — Seed the Database

```bash
# Still inside /backend
node data/seed.js
```

Expected output:
```
✅ Connected to MongoDB for seeding...
🗑️  Cleared existing destinations
🌍 Successfully seeded 25 destinations!
✅ Database seeding complete. Connection closed.
```

---

### Step 4 — Start the Backend Server

```bash
# Development (auto-restart with nodemon)
npm run dev

# OR Production
npm start
```

Server starts at: `http://localhost:5000`

Test it: Open `http://localhost:5000` in your browser — you should see:
```json
{ "message": "🌍 Smart Tourism API is running!" }
```

---

### Step 5 — Frontend Setup

```bash
# Open a NEW terminal tab
cd ../frontend

# Install dependencies
npm install
```

> ⚠️ **Note:** If `npm install` is slow, it's installing React, TailwindCSS, and dependencies (~200MB). Be patient!

---

### Step 6 — Start the Frontend

```bash
npm start
```

React app starts at: `http://localhost:3000`

> The `"proxy": "http://localhost:5000"` in `frontend/package.json` automatically forwards API calls to the backend.

---

### Step 7 — Install Tailwind CSS (if not auto-configured)

```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

The `tailwind.config.js` is already included in the project.

---

## 🌐 API Reference

### Auth Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create new account | ❌ |
| POST | `/api/auth/login` | Login & get token | ❌ |

**Register Body:**
```json
{ "name": "John Doe", "email": "john@email.com", "password": "secret123" }
```

**Login Body:**
```json
{ "email": "john@email.com", "password": "secret123" }
```

**Response (both):**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": { "_id": "...", "name": "John Doe", "email": "...", "preferences": [] }
}
```

---

### User Endpoints (🔒 Protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/profile` | Get current user profile |
| PUT | `/api/users/profile` | Update user name |
| GET | `/api/users/preferences` | Get user preferences |
| POST | `/api/users/preferences` | Save preferences |

**Headers required:**
```
Authorization: Bearer <your_jwt_token>
```

**Save Preferences Body:**
```json
{
  "preferences": ["nature", "adventure", "hill_stations"]
}
```

Valid preference values: `nature`, `adventure`, `food`, `historical`, `hill_stations`, `beach`, `culture`, `wildlife`

---

### Recommendation Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/recommendations` | Get personalized AI recommendations | 🔒 |
| GET | `/api/recommendations/explore` | Browse all destinations | ❌ |

**Explore Query Params:**
```
GET /api/recommendations/explore?category=nature&limit=10&sort=rating
```

**Recommendation Response:**
```json
{
  "success": true,
  "message": "Found 8 destinations matching your interests!",
  "recommendations": [...],
  "userPreferences": ["nature", "adventure"],
  "hasPreferences": true
}
```

---

### Destination Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/destinations` | All destinations (with filters) |
| GET | `/api/destinations/:id` | Single destination |

---

## 🤖 AI Recommendation Algorithm

The recommendation engine uses a **weighted scoring system**:

```
Score = (matchCount × 10) + (rating × 2) + min(reviewCount / 100, 5)
```

**How it works:**
1. Fetch user's saved preferences (e.g., `["nature", "hill_stations"]`)
2. For each destination, count how many of its categories match the user's preferences
3. Add bonus points for higher rating and more reviews (popularity)
4. Sort all destinations by score (descending)
5. Return top 12 matches
6. If no matches → fall back to top-rated destinations

**Example:**
- User preferences: `["nature", "adventure"]`
- Coorg categories: `["nature", "adventure", "hill_stations"]`
- Match count = 2 → Score = (2×10) + (4.6×2) + 5 = **34.2** → High rank!

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (unique, required),
  password: String (hashed with bcrypt, select: false),
  preferences: [String] (enum: 8 categories),
  tripsCount: Number (default: 0),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Destinations Collection
```javascript
{
  _id: ObjectId,
  name: String,
  location: { city, state, country },
  description: String,
  shortDescription: String,
  categories: [String] (indexed for fast queries),
  image: String (URL),
  rating: Number (1-5),
  reviewCount: Number,
  bestTimeToVisit: String,
  entryFee: String,
  popularActivities: [String],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt with 12 salt rounds |
| Authentication | JWT (JSON Web Tokens) |
| Token storage | localStorage (client-side) |
| Protected routes | Frontend + Backend middleware |
| Token expiry | 7 days (configurable) |
| Input validation | Controller-level validation |
| Error handling | Global error middleware |

---

## 🎨 Pages Overview

| Page | Route | Access |
|---|---|---|
| Home / Landing | `/` | Public |
| Explore Destinations | `/explore` | Public |
| Login | `/login` | Public |
| Register | `/register` | Public |
| Dashboard | `/dashboard` | 🔒 Protected |
| Set Preferences | `/preferences` | 🔒 Protected |
| My Recommendations | `/recommendations` | 🔒 Protected |

---

## 🔜 Stage 2 — Group Trip Planning (Roadmap)

```
Feature                 Tech Stack
────────────────────────────────────────
Group Rooms             MongoDB (Group model)
Real-time Chat          Socket.IO
Live Location Sharing   Geolocation API + Socket.IO
Median Meeting Point    Haversine formula / Google Maps API
Trip Invitations        Email (Nodemailer)
Shared Itinerary        Collaborative CRUD
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, React Router v6 |
| Styling | Tailwind CSS |
| HTTP Client | Axios with interceptors |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT + bcryptjs |
| Notifications | react-hot-toast |
| Dev Tool | nodemon |

---

## 📝 Common Issues & Fixes

**MongoDB connection failed:**
```bash
# Make sure MongoDB service is running
sudo systemctl start mongod    # Linux
brew services start mongodb-community  # Mac
```

**Port already in use:**
```bash
# Kill process on port 5000
npx kill-port 5000
# Kill process on port 3000
npx kill-port 3000
```

**Tailwind styles not applying:**
```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
```

**CORS error in browser:**
- Make sure backend is running on port 5000
- Check `proxy` field in `frontend/package.json` is `"http://localhost:5000"`

---

## 👨‍💻 Author

Built as part of Smart Tourism & AI Recommendation System project.
MERN Stack · Stage 1 Complete · Stage 2 in Progress

---

*Made with ❤️ and ☕ for travellers across India*
