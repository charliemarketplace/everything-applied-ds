<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Player scenario
  let seasonAverage = $state(22);
  let last5Average = $state(30);
  let last1Game = $state(42);
  let sampleSize = $state(50);

  // Public perception vs true expectation
  const publicWeight = $derived({
    season: 0.2,
    last5: 0.4,
    last1: 0.4
  });

  const optimalWeight = $derived({
    season: 0.6,
    last5: 0.3,
    last1: 0.1
  });

  // Calculate projections
  const publicProjection = $derived(
    seasonAverage * publicWeight.season +
    last5Average * publicWeight.last5 +
    last1Game * publicWeight.last1
  );

  const optimalProjection = $derived(
    seasonAverage * optimalWeight.season +
    last5Average * optimalWeight.last5 +
    last1Game * optimalWeight.last1
  );

  const mispricing = $derived(publicProjection - optimalProjection);

  // Simulate hot streak regression
  const simulateRegression = $derived(() => {
    const rng = createRNG(42);
    const games = 20;
    const results: number[] = [];
    
    // Start with hot streak baseline
    let momentum = (last5Average - seasonAverage) / seasonAverage;
    
    for (let g = 0; g < games; g++) {
      // Gradually regress to mean
      momentum *= 0.85; // 15% regression per game
      const expected = seasonAverage * (1 + momentum);
      const actual = Math.max(0, normalRandom(rng, expected, 5));
      results.push(actual);
    }
    
    return results;
  });

  const gameLabels = $derived(
    Array.from({ length: 20 }, (_, i) => `G${i + 1}`)
  );

  // Examples of recency bias
  const examples = [
    { 
      scenario: 'Hot Streak', 
      recent: '+35% vs avg',
      public: 'Will keep it up!',
      reality: 'Likely regression',
      edge: 'Fade the over'
    },
    { 
      scenario: 'Cold Streak', 
      recent: '-25% vs avg',
      public: 'Lost it, done',
      reality: 'Likely bounce back',
      edge: 'Take the over'
    },
    { 
      scenario: 'Blowup Game', 
      recent: '50 pts (2x avg)',
      public: 'New level!',
      reality: 'Outlier, regress',
      edge: 'Strong fade'
    },
    { 
      scenario: 'Injury Return', 
      recent: '15 pts (low)',
      public: 'Not same player',
      reality: 'Ramping up',
      edge: 'Buy the over'
    }
  ];
</script>

<svelte:head>
  <title>Recency Bias | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Behavioral Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Recency Bias</h1>
    <p class="section-subtitle max-w-3xl">
      Users overweight recent performance when predicting future outcomes.
      Exploit this by identifying regression to the mean opportunities.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🧠 The Cognitive Bias</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
        <h3 class="text-crimson-400 font-semibold mb-2">What People Do</h3>
        <p class="text-sm text-obsidian-300 mb-3">
          Overweight the most recent data points. A player's last game feels more predictive than it actually is.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• "He just dropped 40, he's on fire!"</li>
          <li>• "He's cold, only 12 pts last game"</li>
          <li>• "This team can't lose, 5 game win streak"</li>
        </ul>
      </div>
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">What Actually Happens</h3>
        <p class="text-sm text-obsidian-300 mb-3">
          Performance regresses to the mean. Hot and cold streaks are mostly random variation.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Variance in small samples is high</li>
          <li>• True ability changes slowly</li>
          <li>• Outliers are... outliers</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Player Stats</h3>
        <div class="space-y-4">
          <Slider bind:value={seasonAverage} min={10} max={35} step={0.5} label="Season Average" />
          <Slider bind:value={last5Average} min={10} max={45} step={0.5} label="Last 5 Games Avg" />
          <Slider bind:value={last1Game} min={5} max={60} step={1} label="Last Game" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Projection Comparison</h3>
        <div class="space-y-4">
          <div class="p-3 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
            <div class="text-xs text-obsidian-400 mb-1">Public Projection</div>
            <div class="font-mono text-2xl text-crimson-400">{publicProjection.toFixed(1)}</div>
            <div class="text-xs text-obsidian-400">Heavy recency weighting</div>
          </div>
          <div class="p-3 bg-jade-500/10 border border-jade-500/30 rounded-lg">
            <div class="text-xs text-obsidian-400 mb-1">Optimal Projection</div>
            <div class="font-mono text-2xl text-jade-400">{optimalProjection.toFixed(1)}</div>
            <div class="text-xs text-obsidian-400">Regression-adjusted</div>
          </div>
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <div class="text-xs text-obsidian-400 mb-1">Mispricing</div>
            <div class="font-mono text-xl {mispricing > 0 ? 'text-crimson-400' : 'text-jade-400'}">
              {mispricing > 0 ? '+' : ''}{mispricing.toFixed(1)} pts
            </div>
            <div class="text-xs text-obsidian-400">
              {mispricing > 2 ? 'Fade OVER' : mispricing < -2 ? 'Take OVER' : 'Neutral'}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Weighting Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Weighting Schemes</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
            <h4 class="text-crimson-400 font-semibold mb-3">Public (Recency Biased)</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-obsidian-300">Season Avg</span>
                <span class="font-mono text-obsidian-400">{(publicWeight.season * 100)}%</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-obsidian-300">Last 5 Games</span>
                <span class="font-mono text-crimson-400">{(publicWeight.last5 * 100)}%</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-obsidian-300">Last Game</span>
                <span class="font-mono text-crimson-400">{(publicWeight.last1 * 100)}%</span>
              </div>
            </div>
          </div>
          <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
            <h4 class="text-jade-400 font-semibold mb-3">Optimal (Regression-Adjusted)</h4>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-obsidian-300">Season Avg</span>
                <span class="font-mono text-jade-400">{(optimalWeight.season * 100)}%</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-obsidian-300">Last 5 Games</span>
                <span class="font-mono text-obsidian-400">{(optimalWeight.last5 * 100)}%</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-obsidian-300">Last Game</span>
                <span class="font-mono text-obsidian-400">{(optimalWeight.last1 * 100)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Regression Simulation -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Simulated Regression to Mean</h3>
        <div class="h-48">
          <LineChart 
            labels={gameLabels}
            datasets={[
              {
                label: 'Simulated Points',
                data: simulateRegression(),
                borderColor: '#60a5fa',
                fill: false
              },
              {
                label: 'Season Average',
                data: Array(20).fill(seasonAverage),
                borderColor: '#f5c542',
                fill: false,
                borderDash: [5, 5]
              },
              {
                label: 'Recent Average',
                data: Array(20).fill(last5Average),
                borderColor: '#dc2626',
                fill: false,
                borderDash: [2, 2]
              }
            ]}
            xAxisLabel="Game"
            yAxisLabel="Points"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Hot streaks regress toward season average, not stay at elevated levels.
        </p>
      </div>
    </div>
  </div>

  <!-- Scenario Examples -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📋 Common Scenarios</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each examples as ex}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{ex.scenario}</h3>
          <div class="text-xs space-y-2">
            <div>
              <span class="text-obsidian-400">Recent:</span>
              <span class="text-obsidian-200 ml-1">{ex.recent}</span>
            </div>
            <div>
              <span class="text-crimson-400">Public thinks:</span>
              <span class="text-obsidian-300 ml-1">{ex.public}</span>
            </div>
            <div>
              <span class="text-jade-400">Reality:</span>
              <span class="text-obsidian-300 ml-1">{ex.reality}</span>
            </div>
            <div class="pt-2 border-t border-obsidian-700">
              <span class="text-amber-350">Edge:</span>
              <span class="text-obsidian-200 ml-1">{ex.edge}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Pricing Implications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💰 Pricing Implications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Exploit Recency Bias</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Shade lines toward public perception (let them bet wrong side)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Boost props for players on cold streaks (public under-bets)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Reduce props for hot players (public over-bets)</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">For Your Models</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Use Bayesian shrinkage to weight season over recent</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Calibrate optimal recency weights empirically</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Identify situations where recent IS more predictive (injuries, role changes)</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Regression-adjusted projection
project_with_regression &lt;- function(season_avg, last5_avg, last1, 
                                     weights = c(0.6, 0.3, 0.1)) {'{'} 
  projection &lt;- season_avg * weights[1] + 
                last5_avg * weights[2] + 
                last1 * weights[3]
  return(projection)
{'}'}

# Compare public vs optimal
public_proj &lt;- project_with_regression({seasonAverage}, {last5Average}, {last1Game},
                                        weights = c(0.2, 0.4, 0.4))
optimal_proj &lt;- project_with_regression({seasonAverage}, {last5Average}, {last1Game},
                                          weights = c(0.6, 0.3, 0.1))

mispricing &lt;- public_proj - optimal_proj
cat(sprintf("Public: %.1f, Optimal: %.1f, Edge: %.1f pts\n", 
            public_proj, optimal_proj, mispricing))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Humans overweight recent performance</li>
        <li>• Hot streaks regress, cold streaks bounce back</li>
        <li>• Season average is more predictive than last game</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Fade extreme recent performance</li>
        <li>• Use Bayesian shrinkage for optimal weighting</li>
        <li>• Exception: genuine role/situation changes</li>
      </ul>
    </div>
  </div>
</div>

