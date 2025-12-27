<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import Select from '$lib/components/widgets/Select.svelte';
  import HistogramChart from '$lib/components/charts/HistogramChart.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom, runMonteCarloSimulation, generatePlayerStats } from '$lib/utils/synthetic-data';

  // Player selection
  const players = generatePlayerStats(42);
  let selectedPlayerIdx = $state(0);
  const selectedPlayer = $derived(players[selectedPlayerIdx]);

  // Projection adjustments
  let minutesAdjustment = $state(0);
  let matchupAdjustment = $state(0);
  let paceAdjustment = $state(0);
  let restDaysBonus = $state(0);
  let vegasTotal = $state(225);

  // Weights for projection components
  let seasonWeight = $state(0.4);
  let recentWeight = $state(0.4);
  let matchupWeight = $state(0.2);

  // Calculate base projection
  const baseProjection = $derived(selectedPlayer.avgPoints);

  // Recent form (last 5 games)
  const recentForm = $derived(() => {
    const last5 = selectedPlayer.games.slice(-5);
    return last5.reduce((a, b) => a + b, 0) / last5.length;
  });

  // Calculate weighted projection
  const adjustedProjection = $derived(() => {
    // Base components
    const seasonComponent = baseProjection * seasonWeight;
    const recentComponent = recentForm() * recentWeight;
    const matchupComponent = (baseProjection + matchupAdjustment) * matchupWeight;
    
    // Weighted base
    let proj = seasonComponent + recentComponent + matchupComponent;
    
    // Apply adjustments
    proj += minutesAdjustment * 0.8; // ~0.8 pts per minute
    proj += paceAdjustment * 0.5;
    proj += restDaysBonus;
    
    // Vegas total adjustment
    const vegasDeviation = (vegasTotal - 220) / 20; // Deviation from average
    proj += vegasDeviation * 1.5;
    
    return Math.max(0, proj);
  });

  // Run simulation for projection distribution
  const simulation = $derived(() => {
    const simFn = (rng: () => number) => {
      const variance = selectedPlayer.stdDev;
      return Math.max(0, normalRandom(rng, adjustedProjection(), variance));
    };
    return runMonteCarloSimulation(simFn, 10000, 42, 40);
  });

  // Calculate over/under probabilities
  const lineValue = $derived(selectedPlayer.projectedLine);
  const overProb = $derived(() => {
    // Count simulations over the line
    const rng = createRNG(42);
    let overCount = 0;
    for (let i = 0; i < 10000; i++) {
      const simValue = Math.max(0, normalRandom(rng, adjustedProjection(), selectedPlayer.stdDev));
      if (simValue > lineValue) overCount++;
    }
    return overCount / 10000;
  });

  // Performance vs line chart data
  const gameLabels = $derived(selectedPlayer.games.map((_, i) => `G${i + 1}`));

  // Player comparison data
  const playerCompare = $derived(
    players.map(p => ({
      name: p.name.split(' ')[1], // Last name only
      avg: p.avgPoints,
      std: p.stdDev
    }))
  );
</script>

<svelte:head>
  <title>Player Projections | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Sports Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Player Projections</h1>
    <p class="section-subtitle max-w-3xl">
      Build player stat projections using usage, matchup, and context features.
      The foundation for pricing player props and DFS projections.
    </p>
  </div>

  <!-- Player Selection -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🏀 Select Player</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each players as player, i}
        <button
          class="p-4 rounded-lg text-left transition-all
                 {selectedPlayerIdx === i 
                   ? 'bg-amber-350/20 border-2 border-amber-350' 
                   : 'bg-obsidian-800/50 border border-obsidian-700 hover:border-obsidian-500'}"
          onclick={() => selectedPlayerIdx = i}
        >
          <div class="font-semibold text-obsidian-100">{player.name}</div>
          <div class="text-xs text-obsidian-400">{player.position}</div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="font-mono text-lg text-amber-350">{player.avgPoints.toFixed(1)}</span>
            <span class="text-xs text-obsidian-400">PPG</span>
          </div>
        </button>
      {/each}
    </div>
  </div>

  <!-- Interactive Projection Builder -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <!-- Weighting -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Projection Weights</h3>
        <div class="space-y-4">
          <Slider bind:value={seasonWeight} min={0} max={0.8} step={0.1} label="Season Average" />
          <Slider bind:value={recentWeight} min={0} max={0.8} step={0.1} label="Recent Form (Last 5)" />
          <Slider bind:value={matchupWeight} min={0} max={0.5} step={0.1} label="Matchup Factor" />
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg">
          <div class="text-xs text-obsidian-400 mb-1">Total Weight</div>
          <div class="font-mono text-lg {Math.abs(seasonWeight + recentWeight + matchupWeight - 1) < 0.01 ? 'text-jade-400' : 'text-crimson-400'}">
            {((seasonWeight + recentWeight + matchupWeight) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <!-- Adjustments -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Contextual Adjustments</h3>
        <div class="space-y-4">
          <Slider bind:value={minutesAdjustment} min={-5} max={5} step={1} label="Minutes Adjustment" unit=" min" />
          <Slider bind:value={matchupAdjustment} min={-5} max={5} step={0.5} label="Matchup Quality" />
          <Slider bind:value={paceAdjustment} min={-5} max={5} step={0.5} label="Pace Factor" />
          <Slider bind:value={restDaysBonus} min={-2} max={3} step={0.5} label="Rest Days Bonus" />
          <Slider bind:value={vegasTotal} min={200} max={250} step={1} label="Vegas Total" />
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Projection Result -->
      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Projection for {selectedPlayer.name}</h3>
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Season Avg</div>
            <div class="font-mono text-xl text-obsidian-200">{baseProjection.toFixed(1)}</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Recent Form</div>
            <div class="font-mono text-xl text-obsidian-200">{recentForm().toFixed(1)}</div>
          </div>
          <div class="p-4 bg-amber-350/20 border border-amber-350/50 rounded-lg text-center">
            <div class="text-xs text-amber-350 mb-1">Adjusted Projection</div>
            <div class="font-mono text-2xl text-amber-350">{adjustedProjection().toFixed(1)}</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">
              Line: {lineValue.toFixed(1)} | OVER Prob
            </div>
            <div class="font-mono text-2xl text-jade-400">{(overProb() * 100).toFixed(1)}%</div>
          </div>
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">
              Line: {lineValue.toFixed(1)} | UNDER Prob
            </div>
            <div class="font-mono text-2xl text-crimson-400">{((1 - overProb()) * 100).toFixed(1)}%</div>
          </div>
        </div>
      </div>

      <!-- Projection Distribution -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Projection Distribution</h3>
        <div class="h-48">
          <HistogramChart 
            data={simulation().histogram}
            highlightRange={{ min: lineValue, max: 100 }}
          />
        </div>
        <div class="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div class="text-obsidian-400">5th Percentile</div>
            <div class="font-mono text-obsidian-200">{simulation().percentile5.toFixed(1)}</div>
          </div>
          <div>
            <div class="text-obsidian-400">Median</div>
            <div class="font-mono text-amber-350">{simulation().median.toFixed(1)}</div>
          </div>
          <div>
            <div class="text-obsidian-400">95th Percentile</div>
            <div class="font-mono text-obsidian-200">{simulation().percentile95.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <!-- Game Log -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Recent Game Log</h3>
        <div class="h-48">
          <LineChart 
            labels={gameLabels}
            datasets={[
              {
                label: 'Points',
                data: selectedPlayer.games,
                borderColor: '#60a5fa',
                fill: false
              },
              {
                label: 'Season Avg',
                data: Array(selectedPlayer.games.length).fill(baseProjection),
                borderColor: '#f5c542',
                fill: false,
                borderDash: [5, 5]
              },
              {
                label: 'Line',
                data: Array(selectedPlayer.games.length).fill(lineValue),
                borderColor: '#dc2626',
                fill: false,
                borderDash: [2, 2]
              }
            ]}
            xAxisLabel="Game"
            yAxisLabel="Points"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Feature Categories -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔧 Projection Feature Categories</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Usage Features</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• Minutes per game</li>
          <li>• Usage rate</li>
          <li>• Field goal attempts</li>
          <li>• Touches per game</li>
          <li>• Shot distribution (paint/mid/3pt)</li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Matchup Features</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• Opponent defensive rating</li>
          <li>• Position-specific defense rank</li>
          <li>• Opponent pace</li>
          <li>• Recent opponent performance vs position</li>
          <li>• Key defender assignments</li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Context Features</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• Vegas total / spread (implied game script)</li>
          <li>• Home / away</li>
          <li>• Rest days</li>
          <li>• Back-to-back indicator</li>
          <li>• Teammate injuries</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Weighting Strategies -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">⚖️ Weighting Strategies</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">Recency Weighting</h3>
        <p class="text-sm text-obsidian-300 mb-3">
          Recent games often more predictive. Common approaches:
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• <span class="text-amber-350">Linear decay:</span> Weight = (N - game_age) / N</li>
          <li>• <span class="text-amber-350">Exponential:</span> Weight = λ^game_age</li>
          <li>• <span class="text-amber-350">Rolling window:</span> Last 10-20 games only</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">Regression to Mean</h3>
        <p class="text-sm text-obsidian-300 mb-3">
          Extreme recent performance tends to regress. Apply shrinkage:
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• <span class="text-amber-350">Bayesian:</span> Prior = season avg, update with recent</li>
          <li>• <span class="text-amber-350">James-Stein:</span> Shrink toward group mean</li>
          <li>• <span class="text-amber-350">Empirical:</span> Calibrate on historical variance</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Player projection model
library(dplyr)

# Feature engineering
player_features &lt;- player_games %&gt;%
  group_by(player_id) %&gt;%
  mutate(
    # Rolling averages
    season_avg = mean(points),
    last5_avg = zoo::rollmean(points, k = 5, fill = NA, align = "right"),
    
    # Recency weighting (exponential)
    recency_weight = 0.9 ^ row_number(),
    weighted_avg = sum(points * recency_weight) / sum(recency_weight)
  ) %&gt;%
  ungroup()

# Build projection
build_projection &lt;- function(player, game_context) {'{'} 
  proj &lt;- {seasonWeight} * player$season_avg +
          {recentWeight} * player$last5_avg +
          {matchupWeight} * (player$season_avg + game_context$matchup_adj)
  
  # Apply adjustments
  proj &lt;- proj + game_context$minutes_adj * 0.8
  proj &lt;- proj + (game_context$vegas_total - 220) / 20 * 1.5
  
  return(proj)
{'}'}

# Simulate distribution
simulate_player &lt;- function(projection, std_dev, n = 10000) {'{'} 
  sims &lt;- rnorm(n, mean = projection, sd = std_dev)
  over_prob &lt;- mean(sims &gt; player$line)
  return(list(projection = projection, over_prob = over_prob, sims = sims))
{'}'}</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Blend season average with recent form</li>
        <li>• Usage features are most predictive (minutes!)</li>
        <li>• Vegas totals encode valuable information</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Apply regression to mean for hot/cold streaks</li>
        <li>• Simulate distribution, not just point estimate</li>
        <li>• Calibrate weights on out-of-sample data</li>
      </ul>
    </div>
  </div>
</div>

