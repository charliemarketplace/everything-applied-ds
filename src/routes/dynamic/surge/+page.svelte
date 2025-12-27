<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Surge parameters
  let baseDemand = $state(100);
  let currentDemand = $state(180);
  let capacityLimit = $state(120);
  let priceElasticity = $state(-1.5);

  // Calculate surge multiplier
  const demandRatio = $derived(currentDemand / capacityLimit);
  const surgeMultiplier = $derived(() => {
    if (demandRatio <= 1) return 1;
    return 1 + Math.pow(demandRatio - 1, 1.5) * 2;
  });

  // Calculate new demand after surge pricing
  const priceIncrease = $derived((surgeMultiplier() - 1) * 100);
  const demandReduction = $derived(priceIncrease * priceElasticity / 100);
  const effectiveDemand = $derived(currentDemand * (1 + demandReduction));
  const demandServed = $derived(Math.min(effectiveDemand, capacityLimit));

  // Revenue comparison
  const normalRevenue = $derived(baseDemand * 1); // Base price = 1
  const surgeRevenue = $derived(demandServed * surgeMultiplier());

  // Simulate demand over time
  const demandTimeline = $derived(() => {
    const rng = createRNG(42);
    const hours = 24;
    const demand: number[] = [];
    const surges: number[] = [];
    
    for (let h = 0; h < hours; h++) {
      // Simulate demand patterns (peaks at 7-9pm game time)
      let d = baseDemand;
      if (h >= 18 && h <= 21) d *= 1.8 + normalRandom(rng, 0, 0.3);
      else if (h >= 12 && h <= 14) d *= 1.3 + normalRandom(rng, 0, 0.2);
      else d *= 0.7 + normalRandom(rng, 0, 0.2);
      
      demand.push(Math.max(50, d));
      
      // Calculate surge for each hour
      const ratio = d / capacityLimit;
      surges.push(ratio > 1 ? 1 + Math.pow(ratio - 1, 1.5) * 2 : 1);
    }
    
    return { demand, surges };
  });

  const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

  // Surge examples
  const examples = [
    { trigger: 'Big Game', surge: '1.5-2.5x', reason: 'High-demand matchup' },
    { trigger: 'Last Minute', surge: '1.3-1.8x', reason: 'Bets close to kickoff' },
    { trigger: 'Breaking News', surge: '2-4x', reason: 'Injury announcement' },
    { trigger: 'Promo Period', surge: '1.2-1.5x', reason: 'Everyone using same offer' }
  ];
</script>

<svelte:head>
  <title>Surge Pricing | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Dynamic Pricing</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Surge Pricing</h1>
    <p class="section-subtitle max-w-3xl">
      Adjust prices dynamically when demand exceeds capacity. Balance revenue
      optimization with customer experience during peak periods.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">⚡ How Surge Pricing Works</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">📈</div>
        <h3 class="text-obsidian-200 font-semibold mb-2">Demand Spikes</h3>
        <p class="text-xs text-obsidian-400">More users want to bet than system can handle efficiently</p>
      </div>
      <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
        <div class="text-3xl mb-2">💰</div>
        <h3 class="text-amber-350 font-semibold mb-2">Prices Rise</h3>
        <p class="text-xs text-obsidian-400">Higher hold/worse odds during peak demand</p>
      </div>
      <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">⚖️</div>
        <h3 class="text-jade-400 font-semibold mb-2">Balance</h3>
        <p class="text-xs text-obsidian-400">Demand drops to match capacity, revenue maximized</p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Market Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={baseDemand} min={50} max={200} step={10} label="Base Demand" />
          <Slider bind:value={currentDemand} min={50} max={300} step={10} label="Current Demand" />
          <Slider bind:value={capacityLimit} min={80} max={200} step={10} label="Capacity Limit" />
          <Slider bind:value={priceElasticity} min={-3} max={-0.5} step={0.1} label="Price Elasticity" />
        </div>
      </div>

      <div class="glass-card p-6 border-{demandRatio > 1 ? 'amber-350' : 'jade-500'}/30">
        <h3 class="font-display text-lg font-semibold {demandRatio > 1 ? 'text-amber-350' : 'text-jade-400'} mb-4">
          ⚡ Surge Status
        </h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Demand/Capacity</span>
            <span class="font-mono {demandRatio > 1 ? 'text-crimson-400' : 'text-jade-400'}">{(demandRatio * 100).toFixed(0)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Surge Multiplier</span>
            <span class="font-mono text-xl {surgeMultiplier() > 1 ? 'text-amber-350' : 'text-obsidian-200'}">{surgeMultiplier().toFixed(2)}x</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Price Increase</span>
            <span class="font-mono {priceIncrease > 0 ? 'text-crimson-400' : 'text-obsidian-300'}">+{priceIncrease.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Impact -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Surge Impact</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Original Demand</div>
            <div class="font-mono text-2xl text-obsidian-200">{currentDemand}</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">After Surge Pricing</div>
            <div class="font-mono text-2xl text-amber-350">{effectiveDemand.toFixed(0)}</div>
          </div>
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-jade-400 mb-1">Actually Served</div>
            <div class="font-mono text-2xl text-jade-400">{demandServed.toFixed(0)}</div>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Normal Revenue</div>
            <div class="font-mono text-xl text-obsidian-300">${normalRevenue.toFixed(0)}</div>
          </div>
          <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
            <div class="text-xs text-amber-350 mb-1">Surge Revenue</div>
            <div class="font-mono text-xl text-amber-350">${surgeRevenue.toFixed(0)}</div>
            <div class="text-xs text-jade-400">+{((surgeRevenue / normalRevenue - 1) * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      <!-- Daily Pattern -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Daily Demand Pattern</h3>
        <div class="h-48">
          <LineChart 
            labels={hourLabels}
            datasets={[
              {
                label: 'Demand',
                data: demandTimeline().demand,
                borderColor: '#60a5fa',
                fill: false
              },
              {
                label: 'Capacity',
                data: Array(24).fill(capacityLimit),
                borderColor: '#94a3b8',
                fill: false,
                borderDash: [5, 5]
              }
            ]}
            xAxisLabel="Hour"
            yAxisLabel="Demand"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Demand peaks during prime time games (6-9pm). Surge pricing activates when demand exceeds capacity.
        </p>
      </div>
    </div>
  </div>

  <!-- Examples -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Betting Surge Scenarios</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each examples as ex}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{ex.trigger}</h3>
          <div class="font-mono text-lg text-obsidian-200 mb-2">{ex.surge}</div>
          <p class="text-xs text-obsidian-400">{ex.reason}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Surge pricing model
calculate_surge &lt;- function(demand, capacity, power = 1.5) {'{'} 
  ratio &lt;- demand / capacity
  if (ratio &lt;= 1) return(1)
  return(1 + (ratio - 1)^power * 2)
{'}'}

apply_surge &lt;- function(demand, capacity, elasticity = -1.5) {'{'} 
  surge &lt;- calculate_surge(demand, capacity)
  price_increase &lt;- (surge - 1) * 100
  demand_reduction &lt;- price_increase * elasticity / 100
  effective_demand &lt;- demand * (1 + demand_reduction)
  
  list(
    surge = surge,
    effective_demand = effective_demand,
    served = min(effective_demand, capacity),
    revenue = min(effective_demand, capacity) * surge
  )
{'}'}

result &lt;- apply_surge({currentDemand}, {capacityLimit}, {priceElasticity})
cat(sprintf("Surge: %.2fx, Revenue: $%.0f\n", result$surge, result$revenue))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Surge when demand exceeds capacity</li>
        <li>• Higher prices reduce demand to manageable level</li>
        <li>• Maximizes revenue during peak periods</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Balance revenue vs customer experience</li>
        <li>• Communicate surge clearly (transparency)</li>
        <li>• Use elasticity to calibrate multiplier</li>
      </ul>
    </div>
  </div>
</div>

