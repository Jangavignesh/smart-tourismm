// ============================================================
// src/components/common/WeatherWidget.js
// Shows current weather + 5-day forecast for destination
// Uses OpenWeatherMap FREE API
// ============================================================

import React, { useState, useEffect } from "react";

// City coordinates for weather API
const CITY_COORDS = {
  "Agra":       { lat: 27.1767, lon: 78.0081 },
  "Jaipur":     { lat: 26.9124, lon: 75.7873 },
  "Goa":        { lat: 15.2993, lon: 74.1240 },
  "Delhi":      { lat: 28.6139, lon: 77.2090 },
  "Varanasi":   { lat: 25.3176, lon: 82.9739 },
  "Udaipur":    { lat: 24.5854, lon: 73.7125 },
  "Mumbai":     { lat: 19.0760, lon: 72.8777 },
  "Mysore":     { lat: 12.2958, lon: 76.6394 },
  "Amritsar":   { lat: 31.6340, lon: 74.8723 },
  "Rishikesh":  { lat: 30.0869, lon: 78.2676 },
  "Manali":     { lat: 32.2396, lon: 77.1887 },
  "Ooty":       { lat: 11.4064, lon: 76.6932 },
  "Darjeeling": { lat: 27.0410, lon: 88.2663 },
  "Kolkata":    { lat: 22.5726, lon: 88.3639 },
  "Chennai":    { lat: 13.0827, lon: 80.2707 },
  "Hampi":      { lat: 15.3350, lon: 76.4600 },
  "Jodhpur":    { lat: 26.2389, lon: 73.0243 },
  "Munnar":     { lat: 10.0889, lon: 77.0595 },
  "Kochi":      { lat: 9.9312,  lon: 76.2673 },
  "Pushkar":    { lat: 26.4897, lon: 74.5511 },
  "Shimla":     { lat: 31.1048, lon: 77.1734 },
  "Hyderabad":  { lat: 17.3850, lon: 78.4867 },
  "Bangalore":  { lat: 12.9716, lon: 77.5946 },
};

// Weather condition icons mapping
const getWeatherEmoji = (condition) => {
  const c = condition?.toLowerCase() || "";
  if (c.includes("clear")) return "☀️";
  if (c.includes("cloud")) return "⛅";
  if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
  if (c.includes("thunder") || c.includes("storm")) return "⛈️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "🌫️";
  if (c.includes("wind")) return "💨";
  return "🌤️";
};

// Travel advice based on weather
const getTravelAdvice = (temp, condition) => {
  const c = condition?.toLowerCase() || "";
  if (c.includes("thunder") || c.includes("storm")) return { text: "Not ideal for travel", color: "text-red-500", icon: "⚠️" };
  if (c.includes("rain")) return { text: "Carry an umbrella", color: "text-blue-500", icon: "☂️" };
  if (temp > 38) return { text: "Very hot — stay hydrated", color: "text-orange-500", icon: "🥵" };
  if (temp > 30) return { text: "Warm — light clothes recommended", color: "text-yellow-500", icon: "👕" };
  if (temp < 10) return { text: "Cold — carry warm clothes", color: "text-blue-500", icon: "🧥" };
  return { text: "Great weather for travel!", color: "text-green-500", icon: "✅" };
};

const WeatherWidget = ({ destination }) => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

  // Get city coordinates
  const cityName = destination?.citySource || destination?.location?.city || "Delhi";
  const coords = CITY_COORDS[cityName] || CITY_COORDS["Delhi"];

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      // Current weather
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
      );
      if (!currentRes.ok) throw new Error("Weather data unavailable");
      const currentData = await currentRes.json();

      // 5-day forecast
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&cnt=5`
      );
      const forecastData = await forecastRes.json();

      setWeather(currentData);

      // Get one forecast per day
      const dailyForecasts = forecastData.list
        ?.filter((_, i) => i % 1 === 0)
        .slice(0, 5)
        .map(item => ({
          date: new Date(item.dt * 1000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" }),
          temp: Math.round(item.main.temp),
          condition: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
        })) || [];

      setForecast(dailyForecasts);
    } catch (err) {
      setError("Could not fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!API_KEY) {
      setError("Weather API key not configured.");
      setLoading(false);
      return;
    }
    fetchWeather(); // eslint-disable-line react-hooks/exhaustive-deps
  }, [cityName]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🌤️</div>
        <div>
          <h3 className="font-bold text-slate-800">Current Weather</h3>
          <p className="text-xs text-slate-400">Loading weather data...</p>
        </div>
      </div>
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-8 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    </div>
  );

  if (error || !weather) return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🌤️</div>
        <h3 className="font-bold text-slate-800">Weather</h3>
      </div>
      <div className="bg-blue-50 rounded-xl p-4 text-center">
        <p className="text-sm text-blue-600 mb-2">🔑 Add weather API key to see live weather</p>
        <p className="text-xs text-slate-400">Add REACT_APP_WEATHER_API_KEY to frontend/.env</p>
        <a href="https://openweathermap.org/api" target="_blank" rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline mt-1 block">
          Get FREE key at openweathermap.org →
        </a>
      </div>
    </div>
  );

  const temp = Math.round(weather.main.temp);
  const feelsLike = Math.round(weather.main.feels_like);
  const condition = weather.weather[0].description;
  const humidity = weather.main.humidity;
  const windSpeed = Math.round(weather.wind.speed * 3.6); // m/s to km/h
  const advice = getTravelAdvice(temp, condition);
  const emoji = getWeatherEmoji(condition);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">🌤️ Weather in {cityName}</h3>
            <p className="text-blue-100 text-xs mt-0.5">
              {destination?.name} • Live data
            </p>
          </div>
          <div className="text-right">
            <p className="text-5xl font-bold">{temp}°</p>
            <p className="text-blue-100 text-xs">Feels like {feelsLike}°C</p>
          </div>
        </div>

        {/* Condition */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-2xl">{emoji}</span>
          <span className="text-sm font-medium capitalize">{condition}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Travel advice */}
        <div className={`flex items-center gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100`}>
          <span className="text-lg">{advice.icon}</span>
          <p className={`text-sm font-semibold ${advice.color}`}>{advice.text}</p>
        </div>

        {/* Weather stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "💧", label: "Humidity", value: `${humidity}%` },
            { icon: "💨", label: "Wind", value: `${windSpeed} km/h` },
            { icon: "🌡️", label: "Feels like", value: `${feelsLike}°C` },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-xl mb-1">{stat.icon}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="text-sm font-bold text-slate-700">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 5-day forecast */}
        {forecast.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              5-Day Forecast
            </p>
            <div className="space-y-2">
              {forecast.map((day, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-600 w-20">{day.date}</span>
                  <span className="text-lg">{getWeatherEmoji(day.condition)}</span>
                  <span className="text-xs text-slate-400 flex-1 mx-3 capitalize">{day.condition}</span>
                  <span className="text-sm font-bold text-slate-700">{day.temp}°C</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best time to visit */}
        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
          <p className="text-xs font-semibold text-green-700 mb-1">📅 Best time to visit</p>
          <p className="text-sm text-green-800 font-medium">
            {destination?.bestTimeToVisit || "October to March"}
          </p>
        </div>

        <button onClick={fetchWeather}
          className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">
          🔄 Refresh weather
        </button>
      </div>
    </div>
  );
};

export default WeatherWidget;
