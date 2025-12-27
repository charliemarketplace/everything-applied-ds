<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Hierarchical model parameters
  let globalMean = $state(22);
  let betweenGroupVar = $state(3);
  let withinGroupVar = $state(2);
  let groupSampleSize = $state(10);

  // Generate hierarchical data
  const groupData = $derived(() => {
    const rng = createRNG(42);
    const teams = ['Lakers', 'Celtics', 'Warriors', 'Heat', 'Bucks'];
    const groups: Array<{ team: string, trueMean: number, observations: number[], estimate: number, shrunk: number }> = [];
    
    for (const team of teams) {
      // Team-specific true mean
      const trueMean = globalMean + normalRandom(rng, 0, betweenGroupVar);
      
      // Generate observations
      const n = groupSampleSize + Math.floor(rng() * 10) - 5;
      const observations: number[] = [];
      for (let i = 0; i < n; i++) {
        observations.push(trueMean + normalRandom(rng, 0, withinGroupVar));
      }
      
      // Raw estimate
      const estimate = observations.reduce((s, o) => s + o, 0) / observations.length;
      
      // Shrinkage toward global mean (simplified)
      const reliability = 1 / (1 + withinGroupVar / (betweenGroupVar * n));
      const shrunk = globalMean + reliability * (estimate - globalMean);
      
      groups.push({ team, trueMean, observations, estimate, shrunk });
    }
    
    return groups;
  });

  // Calculate pooling factor
  const poolingFactor = $derived(() => {
    const totalVar = betweenGroupVar + withinGroupVar / groupSampleSize;
    return withinGroupVar / groupSampleSize / totalVar;
  });

  // Model types
  const modelTypes = [
    { name: 'Complete Pooling', desc: 'Ignore groups, one estimate', pros: 'Low variance', cons: 'High bias' },
    { name: 'No Pooling', desc: 'Separate estimate per group', pros: 'No bias', cons: 'High variance' },
    { name: 'Partial Pooling', desc: 'Shrink toward global mean', pros: 'Balanced', cons: 'Assumes structure' }
  ];
</script>

<svelte:head>
  <title>Hierarchical Models | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Econometrics</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Hierarchical Models</h1>
    <p class="section-subtitle max-w-3xl">
      Model data with natural grouping structure. Borrow strength across groups
      while respecting heterogeneity. Perfect for small-sample sports data.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Small Sample Problem</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
        <h3 class="text-crimson-400 font-semibold mb-2">The Problem</h3>
        <p class="text-sm text-obsidian-300">
          A player has 3 games this season. Sample mean is 28 PPG.
          Do we really believe they're a 28 PPG player?
        </p>
        <p class="text-xs text-obsidian-400 mt-2">
          Small samples have high variance—extreme values likely noise.
        </p>
      </div>
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">The Solution: Shrinkage</h3>
        <p class="text-sm text-obsidian-300">
          "Shrink" the estimate toward a population mean.
          Less shrinkage with more data, more with less.
        </p>
        <p class="text-xs text-obsidian-400 mt-2">
          Hierarchical models do this automatically.
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Model Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={globalMean} min={15} max={30} step={1} label="Global Mean (PPG)" />
          <Slider bind:value={betweenGroupVar} min={1} max={8} step={0.5} label="Between-Group Variance" />
          <Slider bind:value={withinGroupVar} min={1} max={6} step={0.5} label="Within-Group Variance" />
          <Slider bind:value={groupSampleSize} min={3} max={20} step={1} label="~Games per Team" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Pooling Analysis</h3>
        <div class="space-y-4 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Pooling Factor</span>
            <span class="font-mono text-obsidian-200">{(poolingFactor() * 100).toFixed(0)}%</span>
          </div>
          <div class="w-full h-4 bg-obsidian-800 rounded-full overflow-hidden">
            <div class="h-full bg-amber-350" style="width: {poolingFactor() * 100}%"></div>
          </div>
          <p class="text-xs text-obsidian-400">
            {#if poolingFactor() > 0.5}
              High pooling: estimates shrink heavily toward global mean (small samples or low between-group variance)
            {:else}
              Low pooling: estimates stay close to raw averages (large samples or high between-group variance)
            {/if}
          </p>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Team Estimates -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Team Estimates</h3>
        <div class="space-y-4">
          {#each groupData() as group}
            <div class="p-4 bg-obsidian-800/50 rounded-lg">
              <div class="flex justify-between items-center mb-2">
                <span class="text-obsidian-200 font-semibold">{group.team}</span>
                <span class="text-xs text-obsidian-400">n={group.observations.length}</span>
              </div>
              <div class="flex gap-4 items-center">
                <div class="flex-1">
                  <div class="relative h-6 bg-obsidian-700 rounded-full">
                    <!-- Global mean marker -->
                    <div class="absolute w-0.5 h-full bg-obsidian-400" style="left: {((globalMean - 15) / 20) * 100}%"></div>
                    <!-- Raw estimate -->
                    <div 
                      class="absolute w-3 h-3 rounded-full bg-crimson-500 top-1/2 -translate-y-1/2"
                      style="left: calc({((group.estimate - 15) / 20) * 100}% - 6px)"
                      title="Raw: {group.estimate.toFixed(1)}"
                    ></div>
                    <!-- Shrunk estimate -->
                    <div 
                      class="absolute w-3 h-3 rounded-full bg-jade-500 top-1/2 -translate-y-1/2"
                      style="left: calc({((group.shrunk - 15) / 20) * 100}% - 6px)"
                      title="Shrunk: {group.shrunk.toFixed(1)}"
                    ></div>
                  </div>
                </div>
                <div class="text-xs w-24 text-right">
                  <span class="text-crimson-400">{group.estimate.toFixed(1)}</span>
                  <span class="text-obsidian-500">→</span>
                  <span class="text-jade-400">{group.shrunk.toFixed(1)}</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
        <div class="mt-4 flex justify-center gap-6 text-xs">
          <span class="flex items-center gap-1">
            <div class="w-3 h-3 bg-crimson-500 rounded-full"></div>
            Raw estimate
          </span>
          <span class="flex items-center gap-1">
            <div class="w-3 h-3 bg-jade-500 rounded-full"></div>
            Shrunk estimate
          </span>
          <span class="flex items-center gap-1">
            <div class="w-0.5 h-4 bg-obsidian-400"></div>
            Global mean
          </span>
        </div>
      </div>

      <!-- Model Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Pooling Strategies</h3>
        <div class="grid grid-cols-3 gap-4">
          {#each modelTypes as model}
            <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
              <h4 class="text-amber-350 font-semibold mb-2">{model.name}</h4>
              <p class="text-xs text-obsidian-300 mb-2">{model.desc}</p>
              <p class="text-xs text-jade-400">✓ {model.pros}</p>
              <p class="text-xs text-crimson-400">✗ {model.cons}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Use Cases -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏈 Betting Applications</h2>
    <div class="grid md:grid-cols-4 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Player Props</h3>
        <p class="text-xs text-obsidian-400">Shrink early-season stats toward career/positional average</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Team Ratings</h3>
        <p class="text-xs text-obsidian-400">Estimate team strength accounting for roster turnover</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Situational Splits</h3>
        <p class="text-xs text-obsidian-400">Home/away, day/night with limited data</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">New Customers</h3>
        <p class="text-xs text-obsidian-400">Estimate LTV with few transactions</p>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Hierarchical model with lme4
library(lme4)

# Random intercepts model
model &lt;- lmer(points ~ 1 + (1 | team), data = df)

# Extract estimates
fixed &lt;- fixef(model)  # Global mean
random &lt;- ranef(model)$team  # Team deviations
shrunk_estimates &lt;- fixed + random

# Compare to raw means
raw_means &lt;- aggregate(points ~ team, df, mean)

# Shrinkage factor
variance_components &lt;- as.data.frame(VarCorr(model))
between_var &lt;- variance_components$vcov[1]
within_var &lt;- variance_components$vcov[2]
n_per_group &lt;- {groupSampleSize}
pooling &lt;- (within_var / n_per_group) / (between_var + within_var / n_per_group)
cat(sprintf("Pooling factor: %.0f%%\n", pooling * 100))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Hierarchical models handle grouped data</li>
        <li>• Shrinkage reduces noise in small samples</li>
        <li>• More shrinkage with fewer observations</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Partial pooling = best of both worlds</li>
        <li>• Essential for early-season projections</li>
        <li>• Use lme4 (R) or PyMC (Python)</li>
      </ul>
    </div>
  </div>
</div>

