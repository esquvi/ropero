import { describe, it, expect } from 'vitest';
import {
  parseOpenMeteoResponse,
  parseGeocodingResponse,
  getWeatherDescription,
  type OpenMeteoForecastResponse,
  type OpenMeteoGeocodingResponse,
} from '../index';

describe('getWeatherDescription', () => {
  it('returns correct description for clear sky', () => {
    expect(getWeatherDescription(0)).toBe('Clear sky');
  });

  it('returns correct description for rain', () => {
    expect(getWeatherDescription(63)).toBe('Moderate rain');
  });

  it('returns correct description for thunderstorm', () => {
    expect(getWeatherDescription(95)).toBe('Thunderstorm');
  });

  it('returns Unknown for invalid code', () => {
    expect(getWeatherDescription(999)).toBe('Unknown');
  });
});

describe('parseGeocodingResponse', () => {
  it('parses valid geocoding response', () => {
    const response: OpenMeteoGeocodingResponse = {
      results: [
        {
          name: 'Paris',
          latitude: 48.8566,
          longitude: 2.3522,
          country: 'France',
          admin1: 'Île-de-France',
        },
      ],
    };

    const result = parseGeocodingResponse(response);
    expect(result).toEqual({
      name: 'Paris, Île-de-France, France',
      latitude: 48.8566,
      longitude: 2.3522,
    });
  });

  it('handles response without admin1', () => {
    const response: OpenMeteoGeocodingResponse = {
      results: [
        {
          name: 'Tokyo',
          latitude: 35.6762,
          longitude: 139.6503,
          country: 'Japan',
        },
      ],
    };

    const result = parseGeocodingResponse(response);
    expect(result).toEqual({
      name: 'Tokyo, Japan',
      latitude: 35.6762,
      longitude: 139.6503,
    });
  });

  it('returns null for empty results', () => {
    const response: OpenMeteoGeocodingResponse = {
      results: [],
    };

    const result = parseGeocodingResponse(response);
    expect(result).toBeNull();
  });

  it('returns null for missing results', () => {
    const response: OpenMeteoGeocodingResponse = {};

    const result = parseGeocodingResponse(response);
    expect(result).toBeNull();
  });
});

describe('parseOpenMeteoResponse', () => {
  it('parses forecast data correctly', () => {
    const response: OpenMeteoForecastResponse = {
      latitude: 48.8566,
      longitude: 2.3522,
      daily: {
        time: ['2026-03-01', '2026-03-02', '2026-03-03'],
        temperature_2m_min: [5, 7, 6],
        temperature_2m_max: [12, 15, 14],
        precipitation_sum: [0, 2.5, 0.5],
        weather_code: [0, 63, 2],
      },
    };

    const result = parseOpenMeteoResponse(response, 'Paris, France');

    expect(result.location).toEqual({
      name: 'Paris, France',
      latitude: 48.8566,
      longitude: 2.3522,
    });

    expect(result.daily).toHaveLength(3);

    expect(result.daily[0]).toEqual({
      date: '2026-03-01',
      tempMin: 5,
      tempMax: 12,
      precipitation: 0,
      weatherCode: 0,
      description: 'Clear sky',
    });

    expect(result.daily[1]).toEqual({
      date: '2026-03-02',
      tempMin: 7,
      tempMax: 15,
      precipitation: 2.5,
      weatherCode: 63,
      description: 'Moderate rain',
    });

    expect(result.daily[2]).toEqual({
      date: '2026-03-03',
      tempMin: 6,
      tempMax: 14,
      precipitation: 0.5,
      weatherCode: 2,
      description: 'Partly cloudy',
    });
  });

  it('handles empty daily arrays', () => {
    const response: OpenMeteoForecastResponse = {
      latitude: 0,
      longitude: 0,
      daily: {
        time: [],
        temperature_2m_min: [],
        temperature_2m_max: [],
        precipitation_sum: [],
        weather_code: [],
      },
    };

    const result = parseOpenMeteoResponse(response, 'Unknown');
    expect(result.daily).toHaveLength(0);
  });
});
