<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Feature selection
  let useRollingAvg = $state(true);
  let useMatchup = $state(true);
  let useHomeAway = $state(true);
  let useRestDays = $state(true);
  let usePace = $state(false);
  let useMinutes = $state(false);

  // Model accuracy with features
  const modelAccuracy = $derived(() => {
    let base = 52; // Baseline
    
    if (useRollingAvg) base += 3;
    if (useMatchup) base += 2.5;
    if (useHomeAway) base += 1.5;
    if (useRestDays) base += 1;
    if (usePace) base += 1.5;
    if (useMinutes) base += 2;
    
    // Diminishing returns
    const features = [useRollingAvg, useMatchup, useHomeAway, useRestDays, usePace, useMinutes].filter(Boolean).length;
    if (features > 4) base -= (features - 4) * 0.3; // Overfitting penalty
    
    return Math.min(72, base);
  });

  // Feature importance scores
  const featureImportance = $derived(() => [
    { name: 'Season Average', score: 35, type: 'Base' },
    { name: 'Rolling Avg (L5)', score: useRollingAvg ? 18 : 0, type: 'Trend' },
    { name: 'Matchup Stats', score: useMatchup ? 15 : 0, type: 'Context' },
    { name: 'Home/Away', score: useHomeAway ? 8 : 0, type: 'Context' },
    { name: 'Rest Days', score: useRestDays ? 6 : 0, type: 'Context' },
    { name: 'Pace Factor', score: usePace ? 10 : 0, type: 'Context' },
    { name: 'Expected Minutes', score: useMinutes ? 12 : 0, type: 'Context' }
  ].filter(f => f.score > 0));

  // Feature types
  const featureCategories = [
    {
      name: 'Base Statistics',
      features: ['Season average', 'Career average', 'Position average'],
      desc: 'Historical performance baselines'
    },
    {
      name: 'Trend Features',
      features: ['Rolling averages (L5, L10)', 'Momentum', 'Hot/cold streak'],
      desc: 'Recent form and direction'
    },
    {
      name: 'Context Features',
      features: ['Home/away', 'Rest days', 'Back-to-back', 'Opponent strength'],
      desc: 'Situational adjustments'
    },
    {
      name: 'Pace/Tempo',
      features: ['Team pace', 'Opponent pace', 'Projected possessions'],
      desc: 'Opportunity-based scaling'
    },
    {
      name: 'Usage Features',
      features: ['Projected minutes', 'Usage rate', 'Lineup impact'],
      desc: 'Role and opportunity'
    },
    {
      name: 'Derived/Interaction',
      features: ['Pace × Minutes', 'Home × Rest', 'Matchup × Usage'],
      desc: 'Combined effects'
    }
  ];
</script>

<svelte:head>
  <title>Feature Engineering | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Machine Learning</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Feature Engineering</h1>
    <p class="section-subtitle max-w-3xl">
      Transform raw data into predictive features. Good features are the 
      difference between a mediocre model and a winning one.
    </p>
  </div>

  <!-- Core Principle -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">💡 The Core Principle</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">📊</div>
        <h3 class="text-obsidian-200 font-semibold mb-2">Raw Data</h3>
        <p class="text-xs text-obsidian-400">Points scored, game logs, box scores</p>
      </div>
      <div class="p-4 bg-amber-350/20 rounded-lg text-center">
        <div class="text-3xl mb-2">🔧</div>
        <h3 class="text-amber-350 font-semibold mb-2">Feature Engineering</h3>
        <p class="text-xs text-obsidian-400">Rolling averages, pace-adjusted, contextual</p>
      </div>
      <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">🎯</div>
        <h3 class="text-jade-400 font-semibold mb-2">Predictive Features</h3>
        <p class="text-xs text-obsidian-400">Signals that improve predictions</p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Feature Selection</h3>
        <div class="space-y-3">
          <Toggle bind:checked={useRollingAvg} label="Rolling Average (L5)" />
          <Toggle bind:checked={useMatchup} label="Matchup Stats" />
          <Toggle bind:checked={useHomeAway} label="Home/Away" />
          <Toggle bind:checked={useRestDays} label="Rest Days" />
          <Toggle bind:checked={usePace} label="Pace Factor" />
          <Toggle bind:checked={useMinutes} label="Expected Minutes" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Model Performance</h3>
        <div class="text-center">
          <div class="font-mono text-5xl {modelAccuracy() > 65 ? 'text-jade-400' : modelAccuracy() > 58 ? 'text-amber-350' : 'text-obsidian-300'}">
            {modelAccuracy().toFixed(1)}%
          </div>
          <div class="text-sm text-obsidian-400 mt-2">Prediction Accuracy</div>
          <div class="mt-4 h-3 bg-obsidian-800 rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-300 {modelAccuracy() > 65 ? 'bg-jade-500' : modelAccuracy() > 58 ? 'bg-amber-350' : 'bg-obsidian-600'}"
              style="width: {(modelAccuracy() - 50) * 4}%"
            ></div>
          </div>
        </div>
        <p class="text-xs text-obsidian-400 mt-4">
          Features: {[useRollingAvg, useMatchup, useHomeAway, useRestDays, usePace, useMinutes].filter(Boolean).length}
          {#if [useRollingAvg, useMatchup, useHomeAway, useRestDays, usePace, useMinutes].filter(Boolean).length > 4}
            <span class="text-crimson-400">(overfitting risk)</span>
          {/if}
        </p>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Feature Importance -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Feature Importance</h3>
        <div class="space-y-3">
          {#each featureImportance() as feature}
            <div class="flex items-center gap-4">
              <div class="w-32 text-sm text-obsidian-300">{feature.name}</div>
              <div class="flex-1 h-6 bg-obsidian-800 rounded-full overflow-hidden">
                <div 
                  class="h-full {feature.type === 'Base' ? 'bg-blue-400' : feature.type === 'Trend' ? 'bg-jade-500' : 'bg-amber-350'}"
                  style="width: {feature.score}%"
                ></div>
              </div>
              <div class="w-12 font-mono text-sm text-right {feature.type === 'Base' ? 'text-blue-400' : feature.type === 'Trend' ? 'text-jade-400' : 'text-amber-350'}">
                {feature.score}%
              </div>
              <div class="w-16 text-xs text-obsidian-400">{feature.type}</div>
            </div>
          {/each}
        </div>
        <div class="mt-4 flex gap-4 text-xs">
          <span class="text-blue-400">● Base</span>
          <span class="text-jade-400">● Trend</span>
          <span class="text-amber-350">● Context</span>
        </div>
      </div>

      <!-- Feature Engineering Tips -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Engineering Best Practices</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
            <h4 class="text-jade-400 font-semibold mb-2">✓ Do</h4>
            <ul class="text-xs text-obsidian-300 space-y-1">
              <li>• Create rolling averages at multiple windows</li>
              <li>• Normalize features to same scale</li>
              <li>• Create interaction terms</li>
              <li>• Handle missing values explicitly</li>
            </ul>
          </div>
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
            <h4 class="text-crimson-400 font-semibold mb-2">✗ Don't</h4>
            <ul class="text-xs text-obsidian-300 space-y-1">
              <li>• Use future information (data leakage)</li>
              <li>• Create too many features (overfit)</li>
              <li>• Ignore correlation between features</li>
              <li>• Use raw counts without normalization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Feature Categories -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📚 Feature Categories</h2>
    <div class="grid md:grid-cols-3 gap-4">
      {#each featureCategories as cat}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{cat.name}</h3>
          <p class="text-xs text-obsidian-400 mb-2">{cat.desc}</p>
          <ul class="text-xs text-obsidian-300 space-y-1">
            {#each cat.features as f}
              <li>• {f}</li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>

  <!-- Player Props Example -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Player Props Feature Set</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-obsidian-700">
            <th class="p-2 text-left text-obsidian-400">Feature</th>
            <th class="p-2 text-left text-obsidian-400">Formula</th>
            <th class="p-2 text-left text-obsidian-400">Why It Matters</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-obsidian-800">
            <td class="p-2 text-amber-350">Pace-Adjusted Avg</td>
            <td class="p-2 text-jade-400 font-mono">season_avg × (matchup_pace / league_pace)</td>
            <td class="p-2 text-obsidian-300">Scales for fast/slow games</td>
          </tr>
          <tr class="border-b border-obsidian-800">
            <td class="p-2 text-amber-350">Minutes-Weighted</td>
            <td class="p-2 text-jade-400 font-mono">per_min_rate × proj_minutes</td>
            <td class="p-2 text-obsidian-300">Accounts for opportunity</td>
          </tr>
          <tr class="border-b border-obsidian-800">
            <td class="p-2 text-amber-350">Matchup Factor</td>
            <td class="p-2 text-jade-400 font-mono">opp_def_rating / league_avg</td>
            <td class="p-2 text-obsidian-300">Defense quality adjustment</td>
          </tr>
          <tr class="border-b border-obsidian-800">
            <td class="p-2 text-amber-350">Rest Impact</td>
            <td class="p-2 text-jade-400 font-mono">1 + 0.02 × (rest_days - 1)</td>
            <td class="p-2 text-obsidian-300">Back-to-back penalty</td>
          </tr>
          <tr>
            <td class="p-2 text-amber-350">Trend Score</td>
            <td class="p-2 text-jade-400 font-mono">(L5_avg - season_avg) / season_std</td>
            <td class="p-2 text-obsidian-300">Hot/cold streak signal</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Feature engineering for player props
library(dplyr)
library(zoo)

create_features &lt;- function(player_games) {'{'} 
  player_games %&gt;%
    arrange(game_date) %&gt;%
    mutate(
      # Rolling averages
      roll_5 = rollmean(pts, k = 5, fill = NA, align = "right"),
      roll_10 = rollmean(pts, k = 10, fill = NA, align = "right"),
      
      # Trend
      trend = (roll_5 - season_avg) / season_std,
      
      # Pace adjustment
      pace_factor = team_pace / league_avg_pace,
      pace_adj_pts = season_avg * pace_factor,
      
      # Minutes projection
      per_min = pts / minutes,
      min_proj_pts = per_min * proj_minutes,
      
      # Matchup adjustment
      matchup_factor = opp_pts_allowed / league_avg,
      
      # Combined projection
      projection = pace_adj_pts * matchup_factor * 
                   (1 + trend * 0.1)
    )
{'}'}

# Feature importance
library(randomForest)
rf_model &lt;- randomForest(pts ~ ., data = features)
importance(rf_model)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Features matter more than model choice</li>
        <li>• Rolling averages capture recent form</li>
        <li>• Pace/tempo adjusts for opportunity</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Watch for data leakage (using future info)</li>
        <li>• More features ≠ better model</li>
        <li>• Domain knowledge guides feature creation</li>
      </ul>
    </div>
  </div>
</div>

