<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Panel data parameters
  let numPlayers = $state(5);
  let numSeasons = $state(4);
  let playerEffect = $state(10);
  let timeEffect = $state(2);

  // Generate panel data
  const panelData = $derived(() => {
    const rng = createRNG(42);
    const data: Array<{ player: number, season: number, pts: number, playerFE: number }> = [];
    
    for (let p = 0; p < numPlayers; p++) {
      const playerFE = normalRandom(rng, 0, playerEffect);
      for (let t = 0; t < numSeasons; t++) {
        const pts = 20 + playerFE + timeEffect * t + normalRandom(rng, 0, 3);
        data.push({ player: p + 1, season: t + 1, pts, playerFE });
      }
    }
    
    return data;
  });

  // Aggregate by player
  const playerAverages = $derived(() => {
    const avgs: number[] = [];
    for (let p = 1; p <= numPlayers; p++) {
      const playerData = panelData().filter(d => d.player === p);
      const avg = playerData.reduce((s, d) => s + d.pts, 0) / playerData.length;
      avgs.push(avg);
    }
    return avgs;
  });

  // Time series by player
  const timeSeriesData = $derived(() => {
    const series: number[][] = [];
    for (let p = 1; p <= numPlayers; p++) {
      const playerData = panelData().filter(d => d.player === p).sort((a, b) => a.season - b.season);
      series.push(playerData.map(d => d.pts));
    }
    return series;
  });

  const seasonLabels = $derived(Array.from({ length: numSeasons }, (_, i) => `Season ${i + 1}`));

  // Model types
  const models = [
    { name: 'Pooled OLS', desc: 'Ignores panel structure', bias: 'Omitted variable bias', use: 'Simple baseline' },
    { name: 'Fixed Effects', desc: 'Controls for time-invariant individual effects', bias: 'Can\'t estimate time-invariant vars', use: 'Most common for causal inference' },
    { name: 'Random Effects', desc: 'Assumes individual effects uncorrelated with X', bias: 'Biased if assumption violated', use: 'More efficient if valid' }
  ];
</script>

<svelte:head>
  <title>Panel Data | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Econometrics</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Panel Data Analysis</h1>
    <p class="section-subtitle max-w-3xl">
      Analyze data with multiple entities observed over time. Control for unobserved
      heterogeneity using fixed and random effects.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 Panel Data Structure</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <p class="text-sm text-obsidian-300 mb-3">
          Panel data = same entities tracked over multiple time periods.
          Combines cross-sectional and time-series dimensions.
        </p>
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h4 class="text-amber-350 font-semibold mb-2">Advantages</h4>
          <ul class="text-xs text-obsidian-400 space-y-1">
            <li>• Control for unobserved individual effects</li>
            <li>• More observations = more power</li>
            <li>• Study dynamics over time</li>
            <li>• Reduce omitted variable bias</li>
          </ul>
        </div>
      </div>
      <div class="overflow-x-auto text-sm">
        <table class="w-full">
          <thead>
            <tr class="border-b border-obsidian-700">
              <th class="p-2 text-left text-obsidian-400">Player</th>
              <th class="p-2 text-center text-obsidian-400">S1</th>
              <th class="p-2 text-center text-obsidian-400">S2</th>
              <th class="p-2 text-center text-obsidian-400">S3</th>
            </tr>
          </thead>
          <tbody>
            {#each playerAverages().slice(0, 3) as avg, i}
              <tr class="border-b border-obsidian-800">
                <td class="p-2 text-amber-350">Player {i + 1}</td>
                {#each timeSeriesData()[i]?.slice(0, 3) || [] as pts}
                  <td class="p-2 text-center font-mono text-obsidian-300">{pts.toFixed(1)}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Panel Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={numPlayers} min={3} max={10} step={1} label="Number of Players" />
          <Slider bind:value={numSeasons} min={2} max={8} step={1} label="Number of Seasons" />
          <Slider bind:value={playerEffect} min={0} max={20} step={1} label="Player Effect (σ)" />
          <Slider bind:value={timeEffect} min={0} max={5} step={0.5} label="Time Trend" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Panel Dimensions</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">N (players)</span>
            <span class="font-mono text-obsidian-200">{numPlayers}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">T (periods)</span>
            <span class="font-mono text-obsidian-200">{numSeasons}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Total Obs (N×T)</span>
            <span class="font-mono text-jade-400">{numPlayers * numSeasons}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Time Series by Player -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Player Trajectories</h3>
        <div class="h-56">
          <LineChart 
            labels={seasonLabels}
            datasets={timeSeriesData().slice(0, 5).map((data, i) => ({
              label: `Player ${i + 1}`,
              data: data,
              borderColor: ['#34d399', '#60a5fa', '#f5c542', '#dc2626', '#a855f7'][i],
              fill: false
            }))}
            xAxisLabel="Season"
            yAxisLabel="Points"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Each line = one player. Parallel upward trend = time effect. Vertical spread = player fixed effects.
        </p>
      </div>

      <!-- Fixed Effects Intuition -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Fixed Effects Intuition</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">Within Variation</h4>
            <p class="text-xs text-obsidian-300">
              Compare each player to their own average. Removes time-invariant differences.
            </p>
            <p class="text-xs text-jade-400 mt-2">
              "How does this player's performance change when X changes?"
            </p>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">Between Variation</h4>
            <p class="text-xs text-obsidian-300">
              Compare averages across players. Confounded by unobserved differences.
            </p>
            <p class="text-xs text-crimson-400 mt-2">
              "High scorers may just be better, not more skilled at X"
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Model Comparison -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📈 Model Comparison</h2>
    <div class="grid md:grid-cols-3 gap-4">
      {#each models as model}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{model.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{model.desc}</p>
          <p class="text-xs text-crimson-400 mb-2">⚠️ {model.bias}</p>
          <p class="text-xs text-jade-400">✓ {model.use}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Panel data analysis with plm
library(plm)

# Convert to panel data frame
pdata &lt;- pdata.frame(df, index = c("player_id", "season"))

# Pooled OLS (ignores panel structure)
pooled &lt;- plm(pts ~ usage + matchup, data = pdata, model = "pooling")

# Fixed Effects (within estimator)
fe_model &lt;- plm(pts ~ usage + matchup, data = pdata, model = "within")

# Random Effects
re_model &lt;- plm(pts ~ usage + matchup, data = pdata, model = "random")

# Hausman test: FE vs RE
phtest(fe_model, re_model)  # p &lt; 0.05 → use FE

# Two-way fixed effects (player + time)
twoway_fe &lt;- plm(pts ~ usage + matchup, data = pdata, 
                 model = "within", effect = "twoways")</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Panel = entities × time periods</li>
        <li>• Fixed effects control for unobserved heterogeneity</li>
        <li>• Uses "within" variation (each entity vs itself)</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Hausman test: FE vs RE</li>
        <li>• Can add time fixed effects too</li>
        <li>• More power than cross-section or time series alone</li>
      </ul>
    </div>
  </div>
</div>

