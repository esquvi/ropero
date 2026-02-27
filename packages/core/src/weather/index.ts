export interface WeatherDay {
  date: string;
  tempMin: number;
  tempMax: number;
  precipitation: number;
  weatherCode: number;
  description: string;
}

export interface WeatherForecast {
  daily: WeatherDay[];
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

// WMO Weather interpretation codes
// https://open-meteo.com/en/docs
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

export function getWeatherDescription(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] || 'Unknown';
}

export interface OpenMeteoForecastResponse {
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

export interface OpenMeteoGeocodingResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  }>;
}

export function parseOpenMeteoResponse(
  data: OpenMeteoForecastResponse,
  locationName: string
): WeatherForecast {
  const { daily, latitude, longitude } = data;

  const days: WeatherDay[] = daily.time.map((date, i) => ({
    date,
    tempMin: daily.temperature_2m_min[i],
    tempMax: daily.temperature_2m_max[i],
    precipitation: daily.precipitation_sum[i],
    weatherCode: daily.weather_code[i],
    description: getWeatherDescription(daily.weather_code[i]),
  }));

  return {
    daily: days,
    location: {
      name: locationName,
      latitude,
      longitude,
    },
  };
}

export function parseGeocodingResponse(data: OpenMeteoGeocodingResponse): {
  name: string;
  latitude: number;
  longitude: number;
} | null {
  if (!data.results || data.results.length === 0) {
    return null;
  }

  const result = data.results[0];
  const name = result.admin1
    ? `${result.name}, ${result.admin1}, ${result.country}`
    : `${result.name}, ${result.country}`;

  return {
    name,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}
