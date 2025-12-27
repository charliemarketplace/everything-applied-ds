/**
 * Synthetic Data Generation Utilities
 * Seeded random number generation for reproducible results
 */

// Simple seeded random number generator (mulberry32)
export function createRNG(seed: number) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Standard normal random variable (Box-Muller transform)
export function normalRandom(rng: () => number, mean = 0, std = 1): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return z * std + mean;
}

// Generate array of normal random values
export function generateNormalSamples(n: number, mean = 0, std = 1, seed = 42): number[] {
  const rng = createRNG(seed);
  return Array.from({ length: n }, () => normalRandom(rng, mean, std));
}

// Generate player stats
export interface PlayerStats {
  name: string;
  position: string;
  avgPoints: number;
  stdDev: number;
  games: number[];
  projectedLine: number;
}

export function generatePlayerStats(seed = 42): PlayerStats[] {
  const rng = createRNG(seed);
  
  const players = [
    { name: 'Jayson Tatum', position: 'SF', avgPoints: 26.5, stdDev: 6.2 },
    { name: 'Luka Doncic', position: 'PG', avgPoints: 28.3, stdDev: 7.1 },
    { name: 'Nikola Jokic', position: 'C', avgPoints: 24.8, stdDev: 5.4 },
    { name: 'Joel Embiid', position: 'C', avgPoints: 27.1, stdDev: 6.8 },
    { name: 'Giannis Antetokounmpo', position: 'PF', avgPoints: 29.2, stdDev: 5.9 },
    { name: 'Anthony Edwards', position: 'SG', avgPoints: 25.4, stdDev: 6.5 },
    { name: 'Shai Gilgeous-Alexander', position: 'PG', avgPoints: 26.9, stdDev: 5.7 },
    { name: 'Donovan Mitchell', position: 'SG', avgPoints: 24.2, stdDev: 6.3 }
  ];

  return players.map(p => ({
    ...p,
    games: Array.from({ length: 20 }, () => 
      Math.max(0, normalRandom(rng, p.avgPoints, p.stdDev))
    ),
    projectedLine: p.avgPoints + (rng() - 0.5) * 2
  }));
}

// Generate time series data
export interface TimeSeriesPoint {
  date: Date;
  value: number;
  trend: number;
}

export function generateTimeSeries(
  n: number, 
  trend = 0.1, 
  volatility = 1, 
  seed = 42
): TimeSeriesPoint[] {
  const rng = createRNG(seed);
  const data: TimeSeriesPoint[] = [];
  let value = 100;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - n);

  for (let i = 0; i < n; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    value += trend + normalRandom(rng, 0, volatility);
    data.push({
      date,
      value: Math.max(0, value),
      trend: 100 + trend * i
    });
  }

  return data;
}

// Generate betting data
export interface BetData {
  id: string;
  player: string;
  stat: string;
  line: number;
  overProb: number;
  underProb: number;
  payout: number;
  ev: number;
  isSharp: boolean;
}

export function generateBettingData(n = 20, seed = 42): BetData[] {
  const rng = createRNG(seed);
  const players = ['LeBron James', 'Stephen Curry', 'Kevin Durant', 'Giannis A.', 'Joel Embiid'];
  const stats = ['Points', 'Rebounds', 'Assists', '3PM', 'Steals'];

  return Array.from({ length: n }, (_, i) => {
    const trueProb = 0.3 + rng() * 0.4; // 30-70% true probability
    const houseEdge = 0.04 + rng() * 0.06; // 4-10% house edge
    const impliedProb = trueProb + houseEdge / 2;
    const payout = 1 / impliedProb;
    const ev = trueProb * payout - 1;

    return {
      id: `bet-${i}`,
      player: players[Math.floor(rng() * players.length)],
      stat: stats[Math.floor(rng() * stats.length)],
      line: Math.round((15 + rng() * 20) * 2) / 2,
      overProb: trueProb,
      underProb: 1 - trueProb,
      payout: Math.round(payout * 100) / 100,
      ev: Math.round(ev * 1000) / 1000,
      isSharp: rng() > 0.85
    };
  });
}

// Monte Carlo simulation
export interface SimulationResult {
  mean: number;
  median: number;
  std: number;
  percentile5: number;
  percentile95: number;
  histogram: { bin: number; count: number }[];
}

export function runMonteCarloSimulation(
  simulationFn: (rng: () => number) => number,
  iterations = 10000,
  seed = 42,
  numBins = 50
): SimulationResult {
  const rng = createRNG(seed);
  const results: number[] = [];

  for (let i = 0; i < iterations; i++) {
    results.push(simulationFn(rng));
  }

  results.sort((a, b) => a - b);

  const mean = results.reduce((a, b) => a + b, 0) / results.length;
  const median = results[Math.floor(results.length / 2)];
  const variance = results.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / results.length;
  const std = Math.sqrt(variance);

  const percentile5 = results[Math.floor(results.length * 0.05)];
  const percentile95 = results[Math.floor(results.length * 0.95)];

  // Create histogram
  const min = results[0];
  const max = results[results.length - 1];
  const binWidth = (max - min) / numBins;
  const histogram: { bin: number; count: number }[] = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = binStart + binWidth;
    const count = results.filter(x => x >= binStart && x < binEnd).length;
    histogram.push({ bin: binStart + binWidth / 2, count });
  }

  return { mean, median, std, percentile5, percentile95, histogram };
}

// Bayesian updating
export interface BayesianState {
  prior: { mean: number; std: number };
  posterior: { mean: number; std: number };
  observations: number[];
  likelihood: { mean: number; std: number };
}

export function bayesianUpdate(
  priorMean: number,
  priorStd: number,
  observationMean: number,
  observationStd: number,
  nObs: number
): { posteriorMean: number; posteriorStd: number } {
  // Conjugate normal-normal update
  const priorPrecision = 1 / (priorStd * priorStd);
  const likePrecision = nObs / (observationStd * observationStd);
  
  const posteriorPrecision = priorPrecision + likePrecision;
  const posteriorMean = (priorMean * priorPrecision + observationMean * likePrecision) / posteriorPrecision;
  const posteriorStd = Math.sqrt(1 / posteriorPrecision);

  return { posteriorMean, posteriorStd };
}

// Kelly Criterion calculation
export function kellyFraction(probability: number, odds: number): number {
  // f = (bp - q) / b where b = odds - 1
  const b = odds - 1;
  const q = 1 - probability;
  const f = (b * probability - q) / b;
  return Math.max(0, f);
}

// Expected Value calculation
export function expectedValue(probability: number, payout: number, stake = 1): number {
  return probability * payout - (1 - probability) * stake;
}

// Generate correlation matrix
export function generateCorrelationMatrix(n: number, seed = 42): number[][] {
  const rng = createRNG(seed);
  const matrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else if (j < i) {
        matrix[i][j] = matrix[j][i];
      } else {
        matrix[i][j] = (rng() - 0.5) * 1.6; // -0.8 to 0.8
      }
    }
  }

  return matrix;
}

// Elo rating calculation
export function calculateEloChange(
  ratingA: number,
  ratingB: number,
  scoreA: number,
  k = 32
): number {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  return k * (scoreA - expectedA);
}

export function generateEloHistory(teams: string[], games = 50, seed = 42): Map<string, number[]> {
  const rng = createRNG(seed);
  const ratings = new Map<string, number[]>();
  const currentRatings = new Map<string, number>();

  teams.forEach(team => {
    ratings.set(team, [1500]);
    currentRatings.set(team, 1500);
  });

  for (let g = 0; g < games; g++) {
    // Random matchup
    const shuffled = [...teams].sort(() => rng() - 0.5);
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const teamA = shuffled[i];
      const teamB = shuffled[i + 1];
      const ratingA = currentRatings.get(teamA)!;
      const ratingB = currentRatings.get(teamB)!;

      // Determine winner based on ratings + randomness
      const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
      const scoreA = rng() < expectedA ? 1 : 0;

      const change = calculateEloChange(ratingA, ratingB, scoreA);
      currentRatings.set(teamA, ratingA + change);
      currentRatings.set(teamB, ratingB - change);
    }

    teams.forEach(team => {
      ratings.get(team)!.push(currentRatings.get(team)!);
    });
  }

  return ratings;
}

