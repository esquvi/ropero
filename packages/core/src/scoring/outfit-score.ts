import type { Season } from '../types';

export interface ItemForScoring {
  id: string;
  last_worn_at: string | null;
  times_worn: number;
  season: string[];
  formality: number;
}

export interface ScoringContext {
  currentSeason: Season;
  targetFormality?: number;
  today: string;
}

export interface ScoredItem {
  itemId: string;
  score: number;
  reasons: string[];
}

// Weights for combining scores
const WEIGHTS = {
  freshness: 0.35,
  variety: 0.25,
  season: 0.25,
  formality: 0.15,
} as const;

/**
 * Calculate freshness score based on days since last worn.
 * Items not worn recently get higher scores.
 */
export function calculateFreshnessScore(
  lastWornAt: string | null,
  today: string
): number {
  if (!lastWornAt) {
    return 1.0; // Never worn = maximum freshness
  }

  const lastWorn = new Date(lastWornAt);
  const todayDate = new Date(today);
  const daysSinceWorn = Math.floor(
    (todayDate.getTime() - lastWorn.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceWorn <= 0) {
    return 0; // Worn today
  }

  if (daysSinceWorn >= 30) {
    return 1.0; // More than 30 days = fully fresh
  }

  // Linear scale from 0 to 1 over 30 days
  return daysSinceWorn / 30;
}

/**
 * Calculate variety score based on total wear count.
 * Less frequently worn items get higher scores to encourage variety.
 */
export function calculateVarietyScore(timesWorn: number): number {
  if (timesWorn === 0) {
    return 1.0; // Never worn = try it!
  }

  // Exponential decay: score decreases as times_worn increases
  // e^(-0.1 * timesWorn) gives a nice curve
  return Math.exp(-0.1 * timesWorn);
}

/**
 * Calculate season match score.
 * Items appropriate for current season get higher scores.
 */
export function calculateSeasonScore(
  itemSeasons: string[],
  currentSeason: Season
): number {
  if (itemSeasons.length === 0) {
    return 0.5; // No season specified = neutral
  }

  if (itemSeasons.includes(currentSeason)) {
    return 1.0; // Season match
  }

  return 0.3; // Season mismatch - still wearable but not ideal
}

/**
 * Calculate formality match score.
 * Items matching target formality get higher scores.
 */
export function calculateFormalityScore(
  itemFormality: number,
  targetFormality: number | undefined
): number {
  if (targetFormality === undefined) {
    return 1.0; // No target = all formalities equal
  }

  const difference = Math.abs(itemFormality - targetFormality);

  // Each level of difference reduces score by 0.25
  return Math.max(0, 1 - difference * 0.25);
}

/**
 * Get the current season based on a date string.
 */
export function getCurrentSeason(dateString: string): Season {
  const date = new Date(dateString);
  const month = date.getMonth(); // 0-11

  if (month >= 2 && month <= 4) {
    return 'spring'; // March, April, May
  }
  if (month >= 5 && month <= 7) {
    return 'summer'; // June, July, August
  }
  if (month >= 8 && month <= 10) {
    return 'fall'; // September, October, November
  }
  return 'winter'; // December, January, February
}

/**
 * Score an item for wear recommendation.
 * Combines multiple factors to produce a final score and explanatory reasons.
 */
export function scoreItemForWear(
  item: ItemForScoring,
  context: ScoringContext
): ScoredItem {
  const reasons: string[] = [];

  // Calculate individual scores
  const freshnessScore = calculateFreshnessScore(item.last_worn_at, context.today);
  const varietyScore = calculateVarietyScore(item.times_worn);
  const seasonScore = calculateSeasonScore(item.season, context.currentSeason);
  const formalityScore = calculateFormalityScore(
    item.formality,
    context.targetFormality
  );

  // Add reasons based on scores
  if (freshnessScore >= 0.9) {
    if (!item.last_worn_at) {
      reasons.push('Never worn before');
    } else {
      reasons.push('Not worn recently');
    }
  } else if (freshnessScore < 0.3) {
    reasons.push('Worn recently');
  }

  if (varietyScore >= 0.8) {
    reasons.push('Rarely worn - try something different');
  }

  if (seasonScore === 1.0) {
    reasons.push(`Perfect for ${context.currentSeason}`);
  } else if (seasonScore < 0.5) {
    reasons.push('Not ideal for current season');
  }

  if (context.targetFormality !== undefined) {
    if (formalityScore === 1.0) {
      reasons.push('Formality matches occasion');
    } else if (formalityScore < 0.5) {
      reasons.push('Formality mismatch for occasion');
    }
  }

  // Calculate weighted final score
  const score =
    freshnessScore * WEIGHTS.freshness +
    varietyScore * WEIGHTS.variety +
    seasonScore * WEIGHTS.season +
    formalityScore * WEIGHTS.formality;

  return {
    itemId: item.id,
    score,
    reasons,
  };
}

/**
 * Score multiple items and sort by score descending.
 */
export function scoreAndRankItems(
  items: ItemForScoring[],
  context: ScoringContext
): ScoredItem[] {
  return items
    .map((item) => scoreItemForWear(item, context))
    .sort((a, b) => b.score - a.score);
}
