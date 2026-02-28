import type { Season } from '../types';
import type { WeatherForecast } from '../weather';
import {
  calculateFreshnessScore,
  calculateSeasonScore,
  calculateFormalityScore,
} from '../scoring/outfit-score';

export interface PackableItem {
  id: string;
  name: string;
  category: string;
  season: string[];
  formality: number;
  times_worn: number;
  last_worn_at: string | null;
  color_primary: string;
}

export interface TripContext {
  duration: number;
  tripType: string;
  formality: number;
  weather: WeatherForecast | null;
}

export interface ScoredPackingItem {
  itemId: string;
  name: string;
  category: string;
  score: number;
  reasons: string[];
}

export interface PackingSuggestion {
  items: ScoredPackingItem[];
  categoryBreakdown: Record<string, { needed: number; suggested: number }>;
}

// How many items per category based on trip duration
const CATEGORY_RATIOS: Record<string, (days: number) => number> = {
  tops: (d) => Math.ceil(d * 0.8),
  bottoms: (d) => Math.ceil(d * 0.5),
  outerwear: (d) => Math.min(Math.ceil(d * 0.15), 2),
  shoes: (d) => Math.min(Math.ceil(d * 0.2), 3),
  accessories: (d) => Math.min(Math.ceil(d * 0.3), 5),
  dresses: (d) => Math.ceil(d * 0.3),
  activewear: (d) => Math.min(Math.ceil(d * 0.2), 3),
  swimwear: (d) => Math.min(Math.ceil(d * 0.15), 2),
  sleepwear: (d) => Math.min(Math.ceil(d * 0.3), 3),
  underwear: (d) => d,
};

// Trip type -> formality level mapping (1=very casual, 5=very formal)
const TRIP_TYPE_FORMALITY: Record<string, number> = {
  business: 4,
  conference: 4,
  wedding: 5,
  city: 3,
  leisure: 2,
  beach: 1,
  adventure: 1,
  other: 3,
};

// Trip type adjustments to category quantities
const TRIP_TYPE_CATEGORY_MULTIPLIERS: Record<string, Record<string, number>> = {
  beach: { swimwear: 2, activewear: 1.5, outerwear: 0.5 },
  adventure: { activewear: 2, outerwear: 1.5, dresses: 0.2 },
  business: { outerwear: 1.5, activewear: 0.5, swimwear: 0.2 },
  wedding: { dresses: 1.5, accessories: 1.5, activewear: 0.3 },
};

/**
 * Determine the dominant season from weather forecast data.
 */
export function getSeasonFromWeather(weather: WeatherForecast): Season {
  if (weather.daily.length === 0) return 'spring';

  const avgTemp =
    weather.daily.reduce((sum, d) => sum + (d.tempMin + d.tempMax) / 2, 0) /
    weather.daily.length;

  if (avgTemp >= 25) return 'summer';
  if (avgTemp >= 15) return 'spring';
  if (avgTemp >= 5) return 'fall';
  return 'winter';
}

/**
 * Check if weather indicates rain.
 */
export function weatherIndicatesRain(weather: WeatherForecast): boolean {
  const rainyDays = weather.daily.filter((d) => d.precipitation > 2).length;
  return rainyDays / weather.daily.length > 0.3;
}

/**
 * Calculate how many items are needed per category for a trip.
 */
export function calculateCategoryNeeds(
  duration: number,
  tripType: string
): Record<string, number> {
  const needs: Record<string, number> = {};
  const multipliers = TRIP_TYPE_CATEGORY_MULTIPLIERS[tripType] ?? {};

  for (const [category, ratioFn] of Object.entries(CATEGORY_RATIOS)) {
    const base = ratioFn(duration);
    const multiplier = multipliers[category] ?? 1;
    needs[category] = Math.max(1, Math.round(base * multiplier));
  }

  return needs;
}

/**
 * Score a single item for packing relevance.
 */
function scoreItemForPacking(
  item: PackableItem,
  context: TripContext,
  season: Season,
  today: string
): ScoredPackingItem {
  const reasons: string[] = [];

  // Season match (0-1)
  const seasonScore = calculateSeasonScore(item.season, season);
  if (seasonScore === 1.0) reasons.push(`Good for ${season}`);
  if (seasonScore < 0.5) reasons.push('Off-season');

  // Formality match (0-1)
  const targetFormality = context.formality || TRIP_TYPE_FORMALITY[context.tripType] || 3;
  const formalityScore = calculateFormalityScore(item.formality, targetFormality);
  if (formalityScore === 1.0) reasons.push('Formality matches trip');
  if (formalityScore < 0.5) reasons.push('Formality mismatch');

  // Freshness — prefer items not worn recently (0-1)
  const freshnessScore = calculateFreshnessScore(item.last_worn_at, today);
  if (freshnessScore >= 0.9) reasons.push('Fresh — not worn recently');

  // Versatility bonus — items worn frequently are proven versatile
  const versatilityScore = Math.min(item.times_worn / 20, 1.0);
  if (versatilityScore > 0.5) reasons.push('Versatile wardrobe staple');

  // Weighted combination
  const score =
    seasonScore * 0.3 +
    formalityScore * 0.3 +
    freshnessScore * 0.25 +
    versatilityScore * 0.15;

  return {
    itemId: item.id,
    name: item.name,
    category: item.category,
    score,
    reasons,
  };
}

/**
 * Generate packing suggestions for a trip.
 *
 * Scores all active items, groups by category, and picks the top N
 * per category based on trip duration and type.
 */
export function suggestPackingItems(
  items: PackableItem[],
  trip: TripContext
): PackingSuggestion {
  const today = new Date().toISOString().split('T')[0];
  const season: Season = trip.weather
    ? getSeasonFromWeather(trip.weather)
    : 'spring';

  // Score all items
  const scored = items.map((item) =>
    scoreItemForPacking(item, trip, season, today)
  );

  // Group by category
  const byCategory: Record<string, ScoredPackingItem[]> = {};
  for (const item of scored) {
    if (!byCategory[item.category]) {
      byCategory[item.category] = [];
    }
    byCategory[item.category].push(item);
  }

  // Sort each category by score
  for (const category of Object.keys(byCategory)) {
    byCategory[category].sort((a, b) => b.score - a.score);
  }

  // Calculate needs per category
  const needs = calculateCategoryNeeds(trip.duration, trip.tripType);

  // Pick top items per category
  const suggested: ScoredPackingItem[] = [];
  const categoryBreakdown: Record<string, { needed: number; suggested: number }> = {};

  for (const [category, needed] of Object.entries(needs)) {
    const available = byCategory[category] ?? [];
    const picked = available.slice(0, needed);
    suggested.push(...picked);
    categoryBreakdown[category] = {
      needed,
      suggested: picked.length,
    };
  }

  // Sort final list by score descending
  suggested.sort((a, b) => b.score - a.score);

  return { items: suggested, categoryBreakdown };
}
