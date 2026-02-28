import { describe, it, expect } from 'vitest';
import {
  suggestPackingItems,
  calculateCategoryNeeds,
  getSeasonFromWeather,
  weatherIndicatesRain,
} from '../suggest';
import type { PackableItem, TripContext } from '../suggest';
import type { WeatherForecast } from '../../weather';

function makeItem(overrides: Partial<PackableItem> & { id: string; category: string }): PackableItem {
  return {
    name: `Item ${overrides.id}`,
    season: [],
    formality: 3,
    times_worn: 0,
    last_worn_at: null,
    color_primary: 'black',
    ...overrides,
  };
}

function makeWeather(avgTemp: number, precipitation = 0): WeatherForecast {
  return {
    daily: [
      {
        date: '2026-07-01',
        tempMin: avgTemp - 5,
        tempMax: avgTemp + 5,
        precipitation,
        weatherCode: precipitation > 2 ? 61 : 0,
        description: precipitation > 2 ? 'Slight rain' : 'Clear sky',
      },
    ],
    location: { name: 'Test City', latitude: 0, longitude: 0 },
  };
}

describe('getSeasonFromWeather', () => {
  it('returns summer for hot weather', () => {
    expect(getSeasonFromWeather(makeWeather(30))).toBe('summer');
  });

  it('returns spring for mild weather', () => {
    expect(getSeasonFromWeather(makeWeather(18))).toBe('spring');
  });

  it('returns fall for cool weather', () => {
    expect(getSeasonFromWeather(makeWeather(10))).toBe('fall');
  });

  it('returns winter for cold weather', () => {
    expect(getSeasonFromWeather(makeWeather(0))).toBe('winter');
  });

  it('returns spring for empty forecast', () => {
    const weather: WeatherForecast = {
      daily: [],
      location: { name: 'Empty', latitude: 0, longitude: 0 },
    };
    expect(getSeasonFromWeather(weather)).toBe('spring');
  });
});

describe('weatherIndicatesRain', () => {
  it('returns true when most days have significant precipitation', () => {
    const weather: WeatherForecast = {
      daily: [
        { date: '2026-07-01', tempMin: 15, tempMax: 20, precipitation: 5, weatherCode: 63, description: 'Rain' },
        { date: '2026-07-02', tempMin: 15, tempMax: 20, precipitation: 8, weatherCode: 65, description: 'Rain' },
        { date: '2026-07-03', tempMin: 15, tempMax: 20, precipitation: 0, weatherCode: 0, description: 'Clear' },
      ],
      location: { name: 'Rainy City', latitude: 0, longitude: 0 },
    };
    expect(weatherIndicatesRain(weather)).toBe(true);
  });

  it('returns false when few days have rain', () => {
    const weather: WeatherForecast = {
      daily: [
        { date: '2026-07-01', tempMin: 15, tempMax: 20, precipitation: 0, weatherCode: 0, description: 'Clear' },
        { date: '2026-07-02', tempMin: 15, tempMax: 20, precipitation: 0, weatherCode: 0, description: 'Clear' },
        { date: '2026-07-03', tempMin: 15, tempMax: 20, precipitation: 1, weatherCode: 51, description: 'Drizzle' },
      ],
      location: { name: 'Dry City', latitude: 0, longitude: 0 },
    };
    expect(weatherIndicatesRain(weather)).toBe(false);
  });
});

describe('calculateCategoryNeeds', () => {
  it('scales with trip duration', () => {
    const short = calculateCategoryNeeds(3, 'leisure');
    const long = calculateCategoryNeeds(10, 'leisure');
    expect(long.tops).toBeGreaterThan(short.tops);
    expect(long.underwear).toBeGreaterThan(short.underwear);
  });

  it('gives 1 underwear per day', () => {
    expect(calculateCategoryNeeds(5, 'leisure').underwear).toBe(5);
  });

  it('adjusts for trip type — beach gets more swimwear', () => {
    const beach = calculateCategoryNeeds(5, 'beach');
    const business = calculateCategoryNeeds(5, 'business');
    expect(beach.swimwear).toBeGreaterThan(business.swimwear);
  });

  it('caps outerwear regardless of duration', () => {
    const needs = calculateCategoryNeeds(30, 'leisure');
    expect(needs.outerwear).toBeLessThanOrEqual(3);
  });

  it('always needs at least 1 per category', () => {
    const needs = calculateCategoryNeeds(1, 'leisure');
    for (const count of Object.values(needs)) {
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('suggestPackingItems', () => {
  const items: PackableItem[] = [
    makeItem({ id: '1', category: 'tops', name: 'T-Shirt', season: ['summer'], formality: 1, times_worn: 10 }),
    makeItem({ id: '2', category: 'tops', name: 'Dress Shirt', season: ['spring', 'fall'], formality: 4 }),
    makeItem({ id: '3', category: 'tops', name: 'Polo', season: ['summer', 'spring'], formality: 2, times_worn: 5 }),
    makeItem({ id: '4', category: 'bottoms', name: 'Jeans', season: ['fall', 'winter'], formality: 2, times_worn: 15 }),
    makeItem({ id: '5', category: 'bottoms', name: 'Chinos', season: ['spring', 'summer'], formality: 3 }),
    makeItem({ id: '6', category: 'shoes', name: 'Sneakers', season: ['spring', 'summer'], formality: 1, times_worn: 20 }),
    makeItem({ id: '7', category: 'shoes', name: 'Dress Shoes', season: [], formality: 5 }),
    makeItem({ id: '8', category: 'underwear', name: 'Boxers', times_worn: 30 }),
  ];

  it('returns suggestions grouped by category with scores', () => {
    const trip: TripContext = {
      duration: 3,
      tripType: 'leisure',
      formality: 2,
      weather: makeWeather(28), // summer
    };

    const result = suggestPackingItems(items, trip);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.categoryBreakdown).toBeDefined();

    // All suggested items should have scores between 0 and 1
    for (const item of result.items) {
      expect(item.score).toBeGreaterThanOrEqual(0);
      expect(item.score).toBeLessThanOrEqual(1);
      expect(item.reasons.length).toBeGreaterThan(0);
    }
  });

  it('prefers season-appropriate items', () => {
    const trip: TripContext = {
      duration: 3,
      tripType: 'leisure',
      formality: 2,
      weather: makeWeather(28), // summer
    };

    const result = suggestPackingItems(items, trip);
    const topItems = result.items.filter((i) => i.category === 'tops');

    // Summer items should score higher
    const tShirt = topItems.find((i) => i.name === 'T-Shirt');
    const dressShirt = topItems.find((i) => i.name === 'Dress Shirt');
    if (tShirt && dressShirt) {
      expect(tShirt.score).toBeGreaterThan(dressShirt.score);
    }
  });

  it('prefers formality-matching items for business trips', () => {
    const trip: TripContext = {
      duration: 3,
      tripType: 'business',
      formality: 4,
      weather: makeWeather(18), // spring
    };

    const result = suggestPackingItems(items, trip);
    const topItems = result.items.filter((i) => i.category === 'tops');

    const dressShirt = topItems.find((i) => i.name === 'Dress Shirt');
    const tShirt = topItems.find((i) => i.name === 'T-Shirt');
    if (dressShirt && tShirt) {
      expect(dressShirt.score).toBeGreaterThan(tShirt.score);
    }
  });

  it('provides category breakdown with needed vs suggested counts', () => {
    const trip: TripContext = {
      duration: 5,
      tripType: 'leisure',
      formality: 2,
      weather: null,
    };

    const result = suggestPackingItems(items, trip);
    expect(result.categoryBreakdown.tops).toBeDefined();
    expect(result.categoryBreakdown.tops.needed).toBeGreaterThan(0);
    expect(result.categoryBreakdown.tops.suggested).toBeLessThanOrEqual(
      result.categoryBreakdown.tops.needed
    );
  });

  it('handles empty item list', () => {
    const trip: TripContext = {
      duration: 5,
      tripType: 'leisure',
      formality: 2,
      weather: null,
    };

    const result = suggestPackingItems([], trip);
    expect(result.items).toEqual([]);
  });
});
