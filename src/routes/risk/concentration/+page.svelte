<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Portfolio exposures
  let nflExposure = $state(35);
  let nbaExposure = $state(25);
  let mlbExposure = $state(15);
  let nhlExposure = $state(10);
  let soccerExposure = $state(10);
  let otherExposure = $state(5);

  // Total should be 100
  const totalExposure = $derived(nflExposure + nbaExposure + mlbExposure + nhlExposure + soccerExposure + otherExposure);

  // Calculate Herfindahl-Hirschman Index (HHI)
  const hhi = $derived(() => {
    const shares = [nflExposure, nbaExposure, mlbExposure, nhlExposure, soccerExposure, otherExposure];
    return shares.reduce((sum, s) => sum + Math.pow(s, 2), 0);
  });

  // Concentration interpretation
  const concentrationLevel = $derived(() => {
    const h = hhi();
    if (h >= 2500) return { label: 'High Concentration', color: 'text-crimson-400', risk: 'High' };
    if (h >= 1500) return { label: 'Moderate Concentration', color: 'text-amber-350', risk: 'Medium' };
    return { label: 'Low Concentration', color: 'text-jade-400', risk: 'Low' };
  });

  // Effective number of markets
  const effectiveN = $derived(10000 / hhi());

  // Single event risk
  let largestSingleBet = $state(5);
  let totalLiability = $state(100);
  
  const singleEventRisk = $derived(largestSingleBet / totalLiability * 100);

  // Concentration examples
  const examples = [
    { sport: 'NFL', risk: 'High correlation on Sundays, 1PM slate exposure' },
    { sport: 'NBA', risk: 'Back-to-back games, load management uncertainty' },
    { sport: 'Parlay', risk: 'Correlated legs (same game, same team)' },
    { sport: 'Player', risk: 'Injury exposure, single star dependence' }
  ];
</script>

<svelte:head>
  <title>Concentration Risk | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Risk Management</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Concentration Risk</h1>
    <p class="section-subtitle max-w-3xl">
      Measure and manage exposure to single events, sports, or correlated outcomes.
      Diversification reduces variance without sacrificing expected return.
    </p>
  </div>

  <!-- HHI Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 Herfindahl-Hirschman Index (HHI)</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <div class="formula text-xl mb-4">
          HHI = Σ (share_i)²
        </div>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li><span class="text-amber-350">share_i</span> = Percentage exposure to segment i</li>
          <li><span class="text-jade-400">&lt; 1500</span> = Low concentration</li>
          <li><span class="text-amber-350">1500-2500</span> = Moderate</li>
          <li><span class="text-crimson-400">&gt; 2500</span> = High concentration</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Interpretation</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• <strong>10000:</strong> All exposure in one segment</li>
          <li>• <strong>2000:</strong> 5 equal segments</li>
          <li>• <strong>1000:</strong> 10 equal segments</li>
          <li>• Lower HHI = better diversification</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Exposure by Sport</h3>
        <div class="space-y-4">
          <Slider bind:value={nflExposure} min={0} max={60} step={5} label="NFL (%)" />
          <Slider bind:value={nbaExposure} min={0} max={60} step={5} label="NBA (%)" />
          <Slider bind:value={mlbExposure} min={0} max={60} step={5} label="MLB (%)" />
          <Slider bind:value={nhlExposure} min={0} max={60} step={5} label="NHL (%)" />
          <Slider bind:value={soccerExposure} min={0} max={60} step={5} label="Soccer (%)" />
          <Slider bind:value={otherExposure} min={0} max={60} step={5} label="Other (%)" />
        </div>
        <div class="mt-3 p-3 bg-obsidian-800/50 rounded-lg">
          <div class="flex justify-between text-sm">
            <span class="text-obsidian-300">Total</span>
            <span class="font-mono {totalExposure === 100 ? 'text-jade-400' : 'text-crimson-400'}">{totalExposure}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- HHI Result -->
      <div class="glass-card p-6 border {concentrationLevel().color.replace('text-', 'border-')}/30">
        <h3 class="font-display text-lg font-semibold {concentrationLevel().color} mb-4">📊 Concentration Analysis</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="text-center">
            <div class="font-mono text-4xl {concentrationLevel().color}">{hhi().toFixed(0)}</div>
            <div class="text-sm text-obsidian-400">HHI Score</div>
          </div>
          <div class="text-center">
            <div class="font-mono text-3xl text-obsidian-200">{effectiveN.toFixed(1)}</div>
            <div class="text-sm text-obsidian-400">Effective # Segments</div>
          </div>
          <div class="text-center">
            <div class="font-mono text-2xl {concentrationLevel().color}">{concentrationLevel().label}</div>
            <div class="text-sm text-obsidian-400">Risk Level: {concentrationLevel().risk}</div>
          </div>
        </div>
        <div class="mt-6 h-4 bg-obsidian-800 rounded-full overflow-hidden">
          <div 
            class="h-full transition-all duration-300 {hhi() >= 2500 ? 'bg-crimson-500' : hhi() >= 1500 ? 'bg-amber-350' : 'bg-jade-500'}"
            style="width: {Math.min(100, hhi() / 100)}%"
          ></div>
        </div>
        <div class="mt-2 flex justify-between text-xs text-obsidian-400">
          <span>0 (Diversified)</span>
          <span>10000 (All in one)</span>
        </div>
      </div>

      <!-- Exposure Chart -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Exposure Distribution</h3>
        <div class="h-48">
          <BarChart 
            labels={['NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Other']}
            data={[nflExposure, nbaExposure, mlbExposure, nhlExposure, soccerExposure, otherExposure]}
            color="#f5c542"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Single Event Risk -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">⚠️ Single Event Risk</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <Slider bind:value={largestSingleBet} min={1} max={20} step={1} label="Largest Single Event ($K)" />
        <Slider bind:value={totalLiability} min={50} max={500} step={25} label="Total Book Liability ($K)" />
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-3">Single Event Concentration</h3>
        <div class="text-center">
          <div class="font-mono text-4xl {singleEventRisk > 10 ? 'text-crimson-400' : singleEventRisk > 5 ? 'text-amber-350' : 'text-jade-400'}">
            {singleEventRisk.toFixed(1)}%
          </div>
          <div class="text-sm text-obsidian-400 mt-2">of total liability</div>
        </div>
        <p class="text-xs text-obsidian-400 mt-4">
          {#if singleEventRisk > 10}
            <span class="text-crimson-400">⚠️ High risk!</span> Single event could swing results significantly.
          {:else if singleEventRisk > 5}
            <span class="text-amber-350">⚠️ Elevated</span> Consider hedging large exposures.
          {:else}
            <span class="text-jade-400">✓ Acceptable</span> Well-diversified event exposure.
          {/if}
        </p>
      </div>
    </div>
  </div>

  <!-- Risk Types -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎯 Types of Concentration Risk</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each examples as ex}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{ex.sport}</h3>
          <p class="text-xs text-obsidian-300">{ex.risk}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Mitigation Strategies -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🛡️ Mitigation Strategies</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Limits & Controls</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Max % of book on single event</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Max exposure per sport/league</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Parlay leg correlation caps</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Time-based concentration limits (Sunday slate)</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Active Management</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Move lines to balance exposure</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Hedge at other books</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Reduce limits on concentrated outcomes</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Real-time exposure monitoring</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calculate Herfindahl-Hirschman Index
calculate_hhi &lt;- function(exposures) {'{'} 
  shares &lt;- exposures / sum(exposures) * 100
  hhi &lt;- sum(shares^2)
  return(hhi)
{'}'}

# Effective number of segments
effective_n &lt;- function(hhi) {'{'} 
  10000 / hhi
{'}'}

# Classify concentration
classify_concentration &lt;- function(hhi) {'{'} 
  if (hhi &gt;= 2500) return("High")
  if (hhi &gt;= 1500) return("Moderate")
  return("Low")
{'}'}

# Example
exposures &lt;- c({nflExposure}, {nbaExposure}, {mlbExposure}, {nhlExposure}, {soccerExposure}, {otherExposure})
hhi &lt;- calculate_hhi(exposures)
cat(sprintf("HHI: %.0f - %s concentration\n", hhi, classify_concentration(hhi)))
cat(sprintf("Effective # segments: %.1f\n", effective_n(hhi)))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• HHI measures portfolio concentration (lower = better)</li>
        <li>• &lt;1500 = diverse, &gt;2500 = concentrated</li>
        <li>• Single event risk should be capped</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Diversification reduces variance, not EV</li>
        <li>• Watch for hidden correlations (same game parlays)</li>
        <li>• Active management: move lines, hedge, limit</li>
      </ul>
    </div>
  </div>
</div>

