const express = require('express');
const router = express.Router();
const axios = require('axios');

/**
 * Get current weather for a city
 * GET /api/weather/:city
 */
router.get('/:city', async (req, res) => {
  try {
    const { city } = req.params;
    const cache = req.app.locals.cache;
    const cacheKey = `weather_${city}`;
    
    // Check cache
    const cachedData = cache.get(cacheKey);
    if (cachedData && process.env.ENABLE_CACHE === 'true') {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    // Call OpenWeather API
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather`,
      {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric'
        }
      }
    );

    const weatherData = transformWeatherData(response.data);
    
    // Cache for 5 minutes
    cache.set(cacheKey, weatherData, 300);

    res.json({
      success: true,
      data: weatherData,
      source: 'openweather',
      cached: false
    });

  } catch (error) {
    console.error('Weather API error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching weather data',
      error: error.message
    });
  }
});

/**
 * Get 5-day forecast
 * GET /api/weather/:city/forecast
 */
router.get('/:city/forecast', async (req, res) => {
  try {
    const { city } = req.params;
    const cache = req.app.locals.cache;
    const cacheKey = `forecast_${city}`;
    
    const cachedData = cache.get(cacheKey);
    if (cachedData && process.env.ENABLE_CACHE === 'true') {
      return res.json({
        success: true,
        data: cachedData,
        cached: true
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          q: city,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric'
        }
      }
    );

    cache.set(cacheKey, response.data, 300);

    res.json({
      success: true,
      data: response.data,
      source: 'openweather',
      cached: false
    });

  } catch (error) {
    console.error('Forecast API error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching forecast data',
      error: error.message
    });
  }
});

/**
 * Transform weather data to frontend format
 */
function transformWeatherData(data) {
  return {
    temperature: Math.round(data.main.temp),
    condition: data.weather[0].main,
    description: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: Math.round(data.wind.speed * 3.6),
    icon: data.weather[0].icon,
    city: data.name,
    country: data.sys.country,
    feelsLike: Math.round(data.main.feels_like),
    pressure: data.main.pressure,
    visibility: data.visibility,
    windDirection: data.wind.deg,
    timezone: data.timezone,
    tempMin: Math.round(data.main.temp_min),
    tempMax: Math.round(data.main.temp_max),
    weatherIcon: data.weather[0].icon
  };
}

module.exports = router;

