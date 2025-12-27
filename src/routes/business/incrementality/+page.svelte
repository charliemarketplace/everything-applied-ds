<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Incrementality parameters
  let treatmentConversion = $state(12);
  let controlConversion = $state(8);
  let treatmentSize = $state(5000);
  let controlSize = $state(5000);
  let promoCost = $state(10);

  // Calculate metrics
  const incrementalLift = $derived(treatmentConversion - controlConversion);
  const relativeLift = $derived((treatmentConversion / controlConversion - 1) * 100);
  const incrementalCustomers = $derived(treatmentSize * incrementalLift / 100);
  const totalPromoCost = $derived(treatmentSize * promoCost);
  const costPerIncremental = $derived(incrementalCustomers > 0 ? totalPromoCost / incrementalCustomers : Infinity);

  // Cannibalization
  const orgConversions = $derived(controlConversion * treatmentSize / 100);
  const totalConversions = $derived(treatmentConversion * treatmentSize / 100);
  const cannibalizedPct = $derived(orgConversions / totalConversions * 100);

  // Statistical significance (simplified z-test)
  const pValue = $derived(() => {
    const p1 = treatmentConversion / 100;
    const p2 = controlConversion / 100;
    const pooledP = (p1 * treatmentSize + p2 * controlSize) / (treatmentSize + controlSize);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/treatmentSize + 1/controlSize));
    const z = (p1 - p2) / se;
    
    // Approximate p-value from z-score
    const pVal = 2 * (1 - normalCDF(Math.abs(z)));
    return pVal;
  });

  function normalCDF(x: number): number {
    return (1 + Math.erf(x / Math.sqrt(2))) / 2;
  }

  Math.erf = function(x: number) {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    const t = 1.0/(1.0 + p*x);
    const y = 1.0 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
    return sign * y;
  };

  // Test types
  const testTypes = [
    { name: 'Holdout', desc: 'Random control group receives no promo', pros: 'Clean causality' },
    { name: 'Geo Test', desc: 'Different regions get different treatments', pros: 'Real-world conditions' },
    { name: 'Ghost Bids', desc: 'Track "would have converted" in control', pros: 'No lost revenue' },
    { name: 'Pre/Post', desc: 'Compare before vs after treatment', pros: 'Simple setup' }
  ];
</script>

<svelte:head>
  <title>Incrementality | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Business Frameworks</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Incrementality Testing</h1>
    <p class="section-subtitle max-w-3xl">
      Measure true causal impact of marketing. How many conversions happened
      BECAUSE of the promo vs would have happened anyway?
    </p>
  </div>

  <!-- Core Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Attribution Problem</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
        <h3 class="text-crimson-400 font-semibold mb-2">❌ Last-Touch Attribution</h3>
        <p class="text-sm text-obsidian-300">
          "User saw ad, then converted. Ad gets credit."
        </p>
        <p class="text-xs text-obsidian-400 mt-2">
          Problem: They might have converted anyway!
        </p>
      </div>
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">✓ Incrementality</h3>
        <p class="text-sm text-obsidian-300">
          "How many MORE conversions vs no ad?"
        </p>
        <p class="text-xs text-obsidian-400 mt-2">
          Solution: Randomized control group
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Experiment Setup</h3>
        <div class="space-y-4">
          <Slider bind:value={treatmentConversion} min={5} max={25} step={1} label="Treatment Conversion (%)" />
          <Slider bind:value={controlConversion} min={2} max={20} step={1} label="Control Conversion (%)" />
          <Slider bind:value={treatmentSize} min={1000} max={10000} step={500} label="Treatment Size" />
          <Slider bind:value={promoCost} min={5} max={50} step={5} label="Promo Cost ($/user)" />
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Results -->
      <div class="glass-card p-6 border-{incrementalLift > 0 ? 'jade-500' : 'crimson-500'}/30">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">📊 Incrementality Results</h3>
        <div class="grid grid-cols-4 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Incremental Lift</div>
            <div class="font-mono text-2xl {incrementalLift > 0 ? 'text-jade-400' : 'text-crimson-400'}">
              +{incrementalLift.toFixed(1)}pp
            </div>
            <div class="text-xs text-obsidian-400 mt-1">{relativeLift.toFixed(0)}% relative</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Incremental Customers</div>
            <div class="font-mono text-2xl text-amber-350">{incrementalCustomers.toFixed(0)}</div>
            <div class="text-xs text-obsidian-400 mt-1">new from promo</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Cost per Incremental</div>
            <div class="font-mono text-2xl text-obsidian-200">${costPerIncremental.toFixed(0)}</div>
            <div class="text-xs text-obsidian-400 mt-1">iCAC</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">p-value</div>
            <div class="font-mono text-2xl {pValue() < 0.05 ? 'text-jade-400' : 'text-crimson-400'}">
              {pValue().toFixed(3)}
            </div>
            <div class="text-xs {pValue() < 0.05 ? 'text-jade-400' : 'text-crimson-400'} mt-1">
              {pValue() < 0.05 ? '✓ Significant' : '✗ Not sig'}
            </div>
          </div>
        </div>
      </div>

      <!-- Visualization -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Conversion Breakdown</h3>
        <div class="grid grid-cols-2 gap-6">
          <div>
            <h4 class="text-sm text-obsidian-300 mb-2 text-center">Treatment Group</h4>
            <div class="h-48 flex items-end justify-center gap-4">
              <div class="flex flex-col items-center">
                <div class="w-16 bg-obsidian-600 rounded-t" style="height: {orgConversions / 6}px"></div>
                <div class="w-16 bg-jade-500 rounded-t" style="height: {incrementalCustomers / 6}px"></div>
                <div class="text-xs text-obsidian-400 mt-2">Conversions</div>
              </div>
            </div>
            <div class="flex justify-center gap-4 mt-2 text-xs">
              <span class="flex items-center gap-1">
                <div class="w-3 h-3 bg-obsidian-600 rounded"></div>
                Organic ({orgConversions.toFixed(0)})
              </span>
              <span class="flex items-center gap-1">
                <div class="w-3 h-3 bg-jade-500 rounded"></div>
                Incremental ({incrementalCustomers.toFixed(0)})
              </span>
            </div>
          </div>
          <div>
            <h4 class="text-sm text-obsidian-300 mb-2 text-center">Control Group</h4>
            <div class="h-48 flex items-end justify-center gap-4">
              <div class="flex flex-col items-center">
                <div class="w-16 bg-obsidian-600 rounded-t" style="height: {controlConversion * controlSize / 100 / 6}px"></div>
                <div class="text-xs text-obsidian-400 mt-2">Conversions</div>
              </div>
            </div>
            <div class="flex justify-center gap-4 mt-2 text-xs">
              <span class="flex items-center gap-1">
                <div class="w-3 h-3 bg-obsidian-600 rounded"></div>
                Organic only ({(controlConversion * controlSize / 100).toFixed(0)})
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Warning -->
      <div class="glass-card p-6 bg-amber-350/5 border border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-2">⚠️ Cannibalization Warning</h3>
        <p class="text-sm text-obsidian-300">
          Of your {totalConversions.toFixed(0)} treatment conversions, only 
          <span class="text-jade-400 font-semibold">{incrementalCustomers.toFixed(0)} ({(100 - cannibalizedPct).toFixed(0)}%)</span> 
          are truly incremental. The rest would have converted anyway!
        </p>
      </div>
    </div>
  </div>

  <!-- Test Types -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🧪 Incrementality Test Types</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each testTypes as test}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{test.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{test.desc}</p>
          <p class="text-xs text-jade-400">✓ {test.pros}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Incrementality analysis
calculate_incrementality &lt;- function(treat_conv, control_conv, 
                                      treat_n, control_n, promo_cost) {'{'} 
  # Lift
  lift_pp &lt;- treat_conv - control_conv
  lift_rel &lt;- (treat_conv / control_conv - 1)
  
  # Incremental conversions
  incremental &lt;- treat_n * lift_pp / 100
  
  # Cost per incremental
  total_cost &lt;- treat_n * promo_cost
  icac &lt;- total_cost / incremental
  
  # Significance test
  test &lt;- prop.test(
    x = c(treat_conv * treat_n / 100, control_conv * control_n / 100),
    n = c(treat_n, control_n)
  )
  
  list(
    lift_pp = lift_pp,
    lift_rel = lift_rel,
    incremental = incremental,
    icac = icac,
    p_value = test$p.value,
    significant = test$p.value &lt; 0.05
  )
{'}'}

result &lt;- calculate_incrementality({treatmentConversion}, {controlConversion}, 
                                   {treatmentSize}, {controlSize}, {promoCost})
cat(sprintf("Incremental: %.0f, iCAC: $%.0f, p=%.3f\n",
    result$incremental, result$icac, result$p_value))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Incrementality = causal impact of marketing</li>
        <li>• Most "attributed" conversions are cannibalized</li>
        <li>• Need randomized holdout for true measurement</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• iCAC often 3-10x higher than standard CAC</li>
        <li>• Statistical significance required</li>
        <li>• Geo tests for expensive campaigns</li>
      </ul>
    </div>
  </div>
</div>

