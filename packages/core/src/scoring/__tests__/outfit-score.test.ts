import { describe, it, expect } from 'vitest';
import {
  scoreItemForWear,
  calculateFreshnessScore,
  calculateVarietyScore,
  calculateSeasonScore,
  calculateFormalityScore,
  getCurrentSeason,
  type ScoredItem,
  type ItemForScoring,
  type ScoringContext,
} from '../outfit-score';

describe('calculateFreshnessScore', () => {
  it('returns 1.0 for items never worn', () => {
    const score = calculateFreshnessScore(null, '2026-02-27');
    expect(score).toBe(1.0);
  });

  it('returns 1.0 for items worn more than 30 days ago', () => {
    const score = calculateFreshnessScore('2026-01-01', '2026-02-27');
    expect(score).toBe(1.0);
  });

  it('returns lower score for items worn recently', () => {
    const score = calculateFreshnessScore('2026-02-25', '2026-02-27');
    expect(score).toBeLessThan(0.5);
  });

  it('returns 0 for items worn today', () => {
    const score = calculateFreshnessScore('2026-02-27', '2026-02-27');
    expect(score).toBe(0);
  });
});

describe('calculateVarietyScore', () => {
  it('returns 1.0 for items never worn', () => {
    const score = calculateVarietyScore(0);
    expect(score).toBe(1.0);
  });

  it('returns lower score for frequently worn items', () => {
    const score = calculateVarietyScore(10);
    expect(score).toBeLessThan(0.5);
  });

  it('returns higher score for less worn items', () => {
    const lessWornScore = calculateVarietyScore(2);
    const moreWornScore = calculateVarietyScore(10);
    expect(lessWornScore).toBeGreaterThan(moreWornScore);
  });
});

describe('calculateSeasonScore', () => {
  it('returns 1.0 for items matching current season', () => {
    const score = calculateSeasonScore(['winter'], 'winter');
    expect(score).toBe(1.0);
  });

  it('returns 1.0 for all-season items', () => {
    const score = calculateSeasonScore(['spring', 'summer', 'fall', 'winter'], 'winter');
    expect(score).toBe(1.0);
  });

  it('returns 0.3 for items not matching current season', () => {
    const score = calculateSeasonScore(['summer'], 'winter');
    expect(score).toBe(0.3);
  });

  it('returns 0.5 for items with empty season array', () => {
    const score = calculateSeasonScore([], 'winter');
    expect(score).toBe(0.5);
  });
});

describe('calculateFormalityScore', () => {
  it('returns 1.0 for exact formality match', () => {
    const score = calculateFormalityScore(3, 3);
    expect(score).toBe(1.0);
  });

  it('returns lower score for formality mismatch', () => {
    const score = calculateFormalityScore(5, 1);
    expect(score).toBeLessThan(0.5);
  });

  it('returns 0.75 for one level difference', () => {
    const score = calculateFormalityScore(3, 4);
    expect(score).toBe(0.75);
  });

  it('returns 1.0 when no target formality specified', () => {
    const score = calculateFormalityScore(3, undefined);
    expect(score).toBe(1.0);
  });
});

describe('getCurrentSeason', () => {
  it('returns winter for January', () => {
    expect(getCurrentSeason('2026-01-15')).toBe('winter');
  });

  it('returns spring for April', () => {
    expect(getCurrentSeason('2026-04-15')).toBe('spring');
  });

  it('returns summer for July', () => {
    expect(getCurrentSeason('2026-07-15')).toBe('summer');
  });

  it('returns fall for October', () => {
    expect(getCurrentSeason('2026-10-15')).toBe('fall');
  });
});

describe('scoreItemForWear', () => {
  const baseItem: ItemForScoring = {
    id: 'item-1',
    last_worn_at: null,
    times_worn: 0,
    season: ['spring', 'summer', 'fall', 'winter'],
    formality: 3,
  };

  const baseContext: ScoringContext = {
    currentSeason: 'winter',
    today: '2026-02-27',
  };

  it('returns high score for never-worn, all-season items', () => {
    const result = scoreItemForWear(baseItem, baseContext);
    expect(result.score).toBeGreaterThan(0.8);
    expect(result.itemId).toBe('item-1');
  });

  it('includes reasons explaining the score', () => {
    const result = scoreItemForWear(baseItem, baseContext);
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('lowers score for recently worn items', () => {
    const recentlyWorn: ItemForScoring = {
      ...baseItem,
      last_worn_at: '2026-02-26',
      times_worn: 5,
    };
    const result = scoreItemForWear(recentlyWorn, baseContext);
    expect(result.score).toBeLessThan(0.7);
  });

  it('lowers score for season mismatch', () => {
    const summerItem: ItemForScoring = {
      ...baseItem,
      season: ['summer'],
    };
    const allSeasonItem: ItemForScoring = {
      ...baseItem,
      season: ['spring', 'summer', 'fall', 'winter'],
    };
    const summerResult = scoreItemForWear(summerItem, baseContext);
    const allSeasonResult = scoreItemForWear(allSeasonItem, baseContext);
    expect(summerResult.score).toBeLessThan(allSeasonResult.score);
  });

  it('lowers score for formality mismatch when target specified', () => {
    const formalItem: ItemForScoring = {
      ...baseItem,
      formality: 5,
    };
    const casualItem: ItemForScoring = {
      ...baseItem,
      formality: 1,
    };
    const contextWithFormality: ScoringContext = {
      ...baseContext,
      targetFormality: 1,
    };
    const formalResult = scoreItemForWear(formalItem, contextWithFormality);
    const casualResult = scoreItemForWear(casualItem, contextWithFormality);
    expect(formalResult.score).toBeLessThan(casualResult.score);
  });
});
