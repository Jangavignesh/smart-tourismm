// ============================================================
// Run this file to test TripAdvisor API
// Command: node testAPI.js
// ============================================================

const axios = require("axios");

const RAPIDAPI_KEY = "3e43f259fdmsh9efb3c09b97c007p19d5c4jsn4a6e1edabae7";

const test = async () => {
  try {
    console.log("Testing TripAdvisor API...");

    const response = await axios.get(
      "https://travel-advisor.p.rapidapi.com/locations/search",
      {
        params: {
          query: "tourist attractions India",
          limit: "5",
          offset: "0",
          units: "km",
          currency: "INR",
          sort: "relevance",
          lang: "en_US",
        },
        headers: {
          "X-RapidAPI-Key": RAPIDAPI_KEY,
          "X-RapidAPI-Host": "travel-advisor.p.rapidapi.com",
        },
      }
    );

    console.log("✅ API Working!");
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.log("❌ API Error!");
    console.log("Status:", err.response?.status);
    console.log("Message:", err.response?.data || err.message);
  }
};

test();
