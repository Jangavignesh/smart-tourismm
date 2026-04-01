# SmartTourismM

SmartTourismM is an intelligent, agent-powered robust travel recommendation and itinerary generation platform. It handles everything from finding optimal meeting points for geographically scattered groups to generating AI-powered daily itineraries.

## Key Features
- **Intelligent Group Meeting Point:** Calculates the most geographically fair meeting point (city and exact coordinates) for up to N users via a weighted Haversine distance algorithm. Features the ability to optionally shift the center towards a preferred destination.
- **Dynamic POI Fetching:** Uses the OpenStreetMap (Overpass) API to dynamically discover real-world nearby cafes, restaurants, parks, and more, directly adjacent to the group’s meeting coordinate. Fails over between 3 independent API mirrors for robust handling of 504 and 429 rate limits.
- **Smart Data Caching:** Every dynamically surfaced location is instantly cached in the persistent MongoDB database. The system preferentially reads from the cached database to save API payload times on repeat geographically proximate searches, ensuring blazingly fast lookups.
- **AI Itinerary Generator:** Leverages Google's Gemini Flash Large Language Model to rapidly author rich, contextually aware day-by-day vacation itineraries inside the app, customized by destination, duration, month, interests, and budget constraints.
- **Trip Dashboard:** Users can create group trips, cast votes, message securely, and plan travel seamlessly in one hub.

## Tech Stack
**Frontend:**
- React (Custom Hooks, Context APIs)
- TailwindCSS (Styling & Responsive Layout)
- Leaflet (Interactive mapping integration)
- Axios, React-Router-DOM

**Backend:**
- Node.js & Express.js (REST API layer)
- MongoDB / Mongoose (Data persistence & geospatial storage caching)
- Axios (Third-party API integration)
- JSON Web Tokens (User Auth & secure route protection)

## Workflow & Data Flow
1. **User Connection:** The frontend authenticates securely via JWT and establishes WebSocket (if applicable) connections.
2. **Meeting Calculation:** Users share their coordinates. The `poiController` runs a distance matrix minimizing the farthest distances to assign a localized center coordinate in the nearest seeded city.
3. **Data Hydration:** If the requested geographical zone hasn't been cached, `placeService` calls the multi-node `fetchFromOverpass` mechanism to retrieve 10km radius Points of Interest securely. Found entities strictly require a mapped name tag.
4. **Presentation:** The map intelligently centers on the calculated destination along with its localized POIs. Members can tap a single location to select the group's meetup destination.

## Setup Instructions
1. Navigate to `backend/` and run `npm install`.
2. Configure your `.env` in the backend root with your local `MONGO_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
3. Start the backend with `npm run dev` (`nodemon`).
4. In a separate terminal, navigate to `frontend/` and run `npm install`.
5. Start the React server via `npm start`.

*Built for exploration, speed, and fairness.*
