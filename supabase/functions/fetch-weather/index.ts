// Supabase Edge Function for fetching weather data from Open-Meteo API
// Deploy with: supabase functions deploy fetch-weather

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface GeocodingResult {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  }>;
}

interface ForecastResponse {
  latitude: number;
  longitude: number;
  daily: {
    time: string[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    precipitation_sum: number[];
    weather_code: number[];
  };
}

interface WeatherDay {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitation: number;
  weatherCode: number;
  description: string;
}

interface WeatherForecast {
  daily: WeatherDay[];
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

function getWeatherDescription(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] || 'Unknown';
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { tripId, destination, startDate, endDate } = await req.json();

    if (!destination || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: destination, startDate, endDate' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Geocode the destination
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`;
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData: GeocodingResult = await geocodeRes.json();

    if (!geocodeData.results || geocodeData.results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Could not find location' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const location = geocodeData.results[0];
    const locationName = location.admin1
      ? `${location.name}, ${location.admin1}, ${location.country}`
      : `${location.name}, ${location.country}`;

    // Step 2: Fetch weather forecast
    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weather_code&start_date=${startDate}&end_date=${endDate}&timezone=auto`;
    const forecastRes = await fetch(forecastUrl);
    const forecastData: ForecastResponse = await forecastRes.json();

    // Step 3: Parse the response
    const forecast: WeatherForecast = {
      daily: forecastData.daily.time.map((date, i) => ({
        date,
        tempMin: forecastData.daily.temperature_2m_min[i],
        tempMax: forecastData.daily.temperature_2m_max[i],
        precipitation: forecastData.daily.precipitation_sum[i],
        weatherCode: forecastData.daily.weather_code[i],
        description: getWeatherDescription(forecastData.daily.weather_code[i]),
      })),
      location: {
        name: locationName,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    };

    // Step 4: Cache the result in the database if tripId is provided
    if (tripId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase
        .from('trips')
        .update({ weather_forecast: forecast })
        .eq('id', tripId);
    }

    return new Response(
      JSON.stringify(forecast),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching weather:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch weather data' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});
