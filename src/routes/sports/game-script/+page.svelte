<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Game script parameters
  let vegasSpread = $state(-7);
  let vegasTotal = $state(224);
  let currentQuarter = $state(1);
  let scoreDiff = $state(0);
  let minutesRemaining = $state(48);

  // Calculate implied game script
  const favoritePoints = $derived((vegasTotal - vegasSpread) / 2);
  const underdogPoints = $derived((vegasTotal + vegasSpread) / 2);
  
  // Blowout probability (simplified model)
  const blowoutProb = $derived(Math.min(0.9, Math.max(0.1, 0.3 + Math.abs(vegasSpread) * 0.03)));
  const closeGameProb = $derived(1 - blowoutProb);

  // Player usage adjustments based on game script
  const starUsageBlowout = $derived(0.75); // Stars rest in blowouts
  const starUsageClose = $derived(1.1); // Stars play more in close games
  const benchUsageBlowout = $derived(1.4); // Bench gets more run
  const benchUsageClose = $derived(0.8);

  // Real-time adjustment based on current score
  const liveGameScript = $derived(() => {
    const expectedDiff = (vegasSpread * (48 - minutesRemaining) / 48);
    const actualVsExpected = scoreDiff - expectedDiff;
    
    let script = 'neutral';
    if (actualVsExpected > 10) script = 'blowout_favorite';
    else if (actualVsExpected > 5) script = 'favorite_ahead';
    else if (actualVsExpected < -10) script = 'blowout_underdog';
    else if (actualVsExpected < -5) script = 'underdog_ahead';
    
    return {
      script,
      expectedDiff,
      variance: actualVsExpected,
      paceAdjust: script.includes('blowout') ? 0.85 : 1.0,
      starMinutes: script.includes('blowout') ? 28 : 36
    };
  });

  // Simulate game score trajectory
  const simulateGame = $derived(() => {
    const rng = createRNG(42);
    const periods = 48; // Minutes
    const scores: { favorite: number[], underdog: number[] } = { favorite: [], underdog: [] };
    let favScore = 0;
    let undScore = 0;
    
    const favPPM = favoritePoints / 48;
    const undPPM = underdogPoints / 48;
    
    for (let m = 0; m < periods; m++) {
      favScore += Math.max(0, normalRandom(rng, favPPM, 0.8));
      undScore += Math.max(0, normalRandom(rng, undPPM, 0.8));
      scores.favorite.push(Math.round(favScore));
      scores.underdog.push(Math.round(undScore));
    }
    
    return scores;
  });

  const gameLabels = $derived(
    Array.from({ length: 48 }, (_, i) => i % 12 === 0 ? `Q${Math.floor(i/12) + 1}` : '')
  );

  // Player adjustments table
  const playerTypes = [
    { type: 'Star Starter', baseMin: 36, closeAdj: 1.1, blowoutAdj: 0.75 },
    { type: 'Role Player', baseMin: 28, closeAdj: 1.0, blowoutAdj: 0.9 },
    { type: 'Bench Player', baseMin: 12, closeAdj: 0.8, blowoutAdj: 1.4 },
    { type: 'Garbage Time Only', baseMin: 5, closeAdj: 0.3, blowoutAdj: 2.0 }
  ];

  function getScriptColor(script: string): string {
    if (script === 'blowout_favorite') return 'text-jade-400';
    if (script === 'favorite_ahead') return 'text-jade-400/70';
    if (script === 'blowout_underdog') return 'text-crimson-400';
    if (script === 'underdog_ahead') return 'text-crimson-400/70';
    return 'text-amber-350';
  }

  function getScriptLabel(script: string): string {
    const labels: Record<string, string> = {
      'blowout_favorite': 'Blowout (Fav)',
      'favorite_ahead': 'Favorite Leading',
      'neutral': 'Close Game',
      'underdog_ahead': 'Underdog Leading',
      'blowout_underdog': 'Blowout (Dog)'
    };
    return labels[script] || script;
  }
</script>

<svelte:head>
  <title>Game Script Modeling | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Sports Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Game Script Modeling</h1>
    <p class="section-subtitle max-w-3xl">
      Predict how game flow affects player usage and stats. Blowouts reduce star minutes,
      close games increase late-game usage.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📜 What is Game Script?</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">Close Game</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Stars play heavy minutes, bench limited. High-leverage situations.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Star minutes: 36-40</li>
          <li>• Usage rate: High</li>
          <li>• Pace: Normal/Higher</li>
        </ul>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Moderate Lead</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Normal rotation, slight reduction in star usage late if comfortable.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Star minutes: 32-36</li>
          <li>• Usage rate: Normal</li>
          <li>• Pace: Normal</li>
        </ul>
      </div>
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
        <h3 class="text-crimson-400 font-semibold mb-2">Blowout</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Stars pulled early, bench gets garbage time. Lower pace.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Star minutes: 24-30</li>
          <li>• Usage rate: Low</li>
          <li>• Pace: Lower</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Vegas Lines</h3>
        <div class="space-y-4">
          <Slider bind:value={vegasSpread} min={-15} max={15} step={0.5} label="Spread (- = favorite)" />
          <Slider bind:value={vegasTotal} min={200} max={250} step={0.5} label="Total O/U" />
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-obsidian-300">Favorite Implied</span>
            <span class="font-mono text-jade-400">{favoritePoints.toFixed(1)} pts</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-obsidian-300">Underdog Implied</span>
            <span class="font-mono text-crimson-400">{underdogPoints.toFixed(1)} pts</span>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Live Game State</h3>
        <div class="space-y-4">
          <Slider bind:value={minutesRemaining} min={0} max={48} step={1} label="Minutes Remaining" />
          <Slider bind:value={scoreDiff} min={-30} max={30} step={1} label="Score Diff (+ = fav leads)" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Current Script</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Game Script</span>
            <span class="font-mono {getScriptColor(liveGameScript().script)}">
              {getScriptLabel(liveGameScript().script)}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Expected Diff</span>
            <span class="font-mono text-obsidian-200">{liveGameScript().expectedDiff.toFixed(1)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Actual vs Expected</span>
            <span class="font-mono {liveGameScript().variance > 0 ? 'text-jade-400' : 'text-crimson-400'}">
              {liveGameScript().variance > 0 ? '+' : ''}{liveGameScript().variance.toFixed(1)}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Star Proj Minutes</span>
            <span class="font-mono text-amber-350">{liveGameScript().starMinutes}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Blowout Probability -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Game Script Probabilities</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Close Game Prob</div>
            <div class="font-mono text-2xl text-jade-400">{(closeGameProb * 100).toFixed(0)}%</div>
          </div>
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Blowout Prob</div>
            <div class="font-mono text-2xl text-crimson-400">{(blowoutProb * 100).toFixed(0)}%</div>
          </div>
        </div>
        <p class="text-xs text-obsidian-400">
          Based on spread of {vegasSpread}. Larger spreads = higher blowout probability.
        </p>
      </div>

      <!-- Player Minutes Adjustment -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Player Minutes by Script</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-obsidian-700">
                <th class="text-left py-2 text-obsidian-400">Player Type</th>
                <th class="text-center py-2 text-obsidian-400">Base Min</th>
                <th class="text-center py-2 text-jade-400">Close Game</th>
                <th class="text-center py-2 text-crimson-400">Blowout</th>
                <th class="text-center py-2 text-amber-350">Expected</th>
              </tr>
            </thead>
            <tbody>
              {#each playerTypes as player}
                {@const expected = player.baseMin * (closeGameProb * player.closeAdj + blowoutProb * player.blowoutAdj)}
                <tr class="border-b border-obsidian-800">
                  <td class="py-2 text-obsidian-200">{player.type}</td>
                  <td class="py-2 text-center font-mono text-obsidian-300">{player.baseMin}</td>
                  <td class="py-2 text-center font-mono text-jade-400">
                    {(player.baseMin * player.closeAdj).toFixed(0)}
                  </td>
                  <td class="py-2 text-center font-mono text-crimson-400">
                    {(player.baseMin * player.blowoutAdj).toFixed(0)}
                  </td>
                  <td class="py-2 text-center font-mono text-amber-350">
                    {expected.toFixed(1)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Score Simulation -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Simulated Game Trajectory</h3>
        <div class="h-48">
          <LineChart 
            labels={gameLabels}
            datasets={[
              {
                label: 'Favorite',
                data: simulateGame().favorite,
                borderColor: '#34d399',
                fill: false
              },
              {
                label: 'Underdog',
                data: simulateGame().underdog,
                borderColor: '#dc2626',
                fill: false
              }
            ]}
            xAxisLabel="Game Time"
            yAxisLabel="Score"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Pricing Implications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💰 Pricing Implications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Adjust Player Projections</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Reduce star projections in predicted blowouts</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Boost bench players when spread is large</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Factor pace adjustments into totals</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Use expected minutes, not season average</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Live Betting Adjustments</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Real-time script detection from live scores</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Adjust remaining projections as game unfolds</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Close player props when script shifts dramatically</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Price garbage time stat padding</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Game script adjustments
calculate_game_script_adjustment &lt;- function(spread, total) {'{'} 
  # Estimate blowout probability
  blowout_prob &lt;- pmin(0.9, pmax(0.1, 0.3 + abs(spread) * 0.03))
  close_prob &lt;- 1 - blowout_prob
  
  # Star player minutes adjustment
  star_minutes &lt;- 36 * (close_prob * 1.1 + blowout_prob * 0.75)
  bench_minutes &lt;- 12 * (close_prob * 0.8 + blowout_prob * 1.4)
  
  return(list(
    blowout_prob = blowout_prob,
    star_minutes = star_minutes,
    bench_minutes = bench_minutes
  ))
{'}'}

# Apply to player projection
adjust_projection &lt;- function(base_proj, minutes_played, base_minutes, script_adj) {'{'} 
  minutes_ratio &lt;- script_adj$star_minutes / base_minutes
  adjusted &lt;- base_proj * minutes_ratio
  return(adjusted)
{'}'}

# Example
script &lt;- calculate_game_script_adjustment({vegasSpread}, {vegasTotal})
cat(sprintf("Blowout prob: %.0f%%\n", script$blowout_prob * 100))
cat(sprintf("Expected star minutes: %.1f\n", script$star_minutes))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Spread size predicts blowout probability</li>
        <li>• Stars play ~20% fewer minutes in blowouts</li>
        <li>• Bench gets 40%+ more run in garbage time</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Weight projections by game script probability</li>
        <li>• Live update projections as game unfolds</li>
        <li>• Vegas lines encode valuable script information</li>
      </ul>
    </div>
  </div>
</div>

