<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG } from '$lib/utils/synthetic-data';

  // Price elasticity parameters
  let basePrice = $state(1.9); // Multiplier (payout)
  let baseVolume = $state(10000);
  let elasticity = $state(-1.5); // Negative = elastic

  // Calculate demand at different price points
  const demandCurve = $derived(() => {
    const prices = [];
    const volumes = [];
    const revenues = [];
    
    for (let p = 1.5; p <= 2.5; p += 0.1) {
      const priceChange = (p - basePrice) / basePrice;
      const volumeChange = priceChange * elasticity;
      const volume = baseVolume * (1 + volumeChange);
      const hold = (1 - 1/p) * 100; // Hold rate from payout
      const revenue = volume * hold / 100;
      
      prices.push(p.toFixed(1) + 'x');
      volumes.push(volume);
      revenues.push(revenue);
    }
    
    return { prices, volumes, revenues };
  });

  // Current metrics
  const currentHold = $derived((1 - 1/basePrice) * 100);
  const currentRevenue = $derived(baseVolume * currentHold / 100);

  // Optimal price (revenue maximizing)
  const optimalPrice = $derived(() => {
    let maxRev = 0;
    let optPrice = basePrice;
    
    for (let p = 1.5; p <= 2.5; p += 0.05) {
      const priceChange = (p - basePrice) / basePrice;
      const volumeChange = priceChange * elasticity;
      const volume = baseVolume * (1 + volumeChange);
      const hold = (1 - 1/p) * 100;
      const revenue = volume * hold / 100;
      
      if (revenue > maxRev) {
        maxRev = revenue;
        optPrice = p;
      }
    }
    
    return { price: optPrice, revenue: maxRev };
  });

  // Elasticity categories
  const elasticityCategories = [
    { range: 'E < -1', label: 'Elastic', desc: 'Volume very sensitive to price', color: 'text-jade-400' },
    { range: 'E = -1', label: 'Unit Elastic', desc: 'Proportional response', color: 'text-amber-350' },
    { range: '-1 < E < 0', label: 'Inelastic', desc: 'Volume less sensitive', color: 'text-crimson-400' }
  ];

  // Market examples
  const marketExamples = [
    { market: 'NFL Spreads', elasticity: '-0.8', reason: 'Core product, loyal bettors' },
    { market: 'Player Props', elasticity: '-1.5', reason: 'Entertainment, price sensitive' },
    { market: 'Parlays', elasticity: '-2.0', reason: 'Discretionary, jackpot seekers' },
    { market: 'Live Betting', elasticity: '-1.2', reason: 'Impulse, some price sensitivity' }
  ];
</script>

<svelte:head>
  <title>Price Elasticity | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Dynamic Pricing</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Price Elasticity</h1>
    <p class="section-subtitle max-w-3xl">
      Measure how betting volume responds to payout changes. Find the revenue-maximizing
      price point for each market segment.
    </p>
  </div>

  <!-- Formula -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Elasticity Formula</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <div class="formula text-xl mb-4">
          E = (% Δ Volume) / (% Δ Price)
        </div>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li><span class="text-amber-350">E</span> = Price elasticity of demand</li>
          <li><span class="text-jade-400">E &lt; -1</span> = Elastic (volume sensitive)</li>
          <li><span class="text-amber-350">E = -1</span> = Unit elastic</li>
          <li><span class="text-crimson-400">E &gt; -1</span> = Inelastic</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">In Betting Terms</h3>
        <p class="text-sm text-obsidian-300">
          If you increase payout from 1.9x to 2.0x (+5.3%), how much does volume change?
        </p>
        <ul class="text-xs text-obsidian-400 mt-2 space-y-1">
          <li>• Volume +10% → E = -1.9 (elastic)</li>
          <li>• Volume +5% → E = -1.0 (unit)</li>
          <li>• Volume +2% → E = -0.4 (inelastic)</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Market Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={basePrice} min={1.5} max={2.5} step={0.05} label="Base Payout (x)" />
          <Slider bind:value={baseVolume} min={5000} max={50000} step={1000} label="Base Volume ($)" />
          <Slider bind:value={elasticity} min={-3} max={-0.3} step={0.1} label="Elasticity" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Current Metrics</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Hold Rate</span>
            <span class="font-mono text-lg text-obsidian-200">{currentHold.toFixed(1)}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Revenue</span>
            <span class="font-mono text-lg text-obsidian-200">${currentRevenue.toFixed(0)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Elasticity</span>
            <span class="font-mono text-lg {elasticity < -1 ? 'text-jade-400' : 'text-crimson-400'}">{elasticity.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div class="glass-card p-6 border-jade-500/30">
        <h3 class="font-display text-lg font-semibold text-jade-400 mb-4">🎯 Optimal Price</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Optimal Payout</span>
            <span class="font-mono text-lg text-jade-400">{optimalPrice().price.toFixed(2)}x</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Max Revenue</span>
            <span class="font-mono text-lg text-jade-400">${optimalPrice().revenue.toFixed(0)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Revenue Gain</span>
            <span class="font-mono text-lg text-amber-350">
              +{((optimalPrice().revenue / currentRevenue - 1) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Demand Curve -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Volume vs Payout</h3>
        <div class="h-48">
          <LineChart 
            labels={demandCurve().prices}
            datasets={[{
              label: 'Betting Volume',
              data: demandCurve().volumes,
              borderColor: '#34d399',
              fill: false
            }]}
            xAxisLabel="Payout Multiplier"
            yAxisLabel="Volume ($)"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Higher payouts attract more volume, but with diminishing returns.
        </p>
      </div>

      <!-- Revenue Curve -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Revenue vs Payout</h3>
        <div class="h-48">
          <LineChart 
            labels={demandCurve().prices}
            datasets={[{
              label: 'Revenue',
              data: demandCurve().revenues,
              borderColor: '#f5c542',
              fill: true,
              backgroundColor: 'rgba(245, 197, 66, 0.1)'
            }]}
            xAxisLabel="Payout Multiplier"
            yAxisLabel="Revenue ($)"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Revenue peaks at optimal price. Too high = low margin, too low = low volume.
        </p>
      </div>
    </div>
  </div>

  <!-- Elasticity Categories -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📈 Elasticity Interpretation</h2>
    <div class="grid md:grid-cols-3 gap-6">
      {#each elasticityCategories as cat}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <span class="font-mono {cat.color}">{cat.range}</span>
            <span class="text-amber-350 font-semibold">{cat.label}</span>
          </div>
          <p class="text-xs text-obsidian-300">{cat.desc}</p>
          <div class="mt-2 text-xs text-obsidian-400">
            {#if cat.label === 'Elastic'}
              Strategy: Raise prices cautiously, focus on volume
            {:else if cat.label === 'Inelastic'}
              Strategy: Can raise prices, volume won't drop much
            {:else}
              Strategy: At the sweet spot
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Market Examples -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Market Elasticity Examples</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each marketExamples as market}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{market.market}</h3>
          <div class="font-mono text-lg text-obsidian-200 mb-2">{market.elasticity}</div>
          <p class="text-xs text-obsidian-400">{market.reason}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Price elasticity optimization
optimize_price &lt;- function(base_price, base_volume, elasticity) {'{'} 
  prices &lt;- seq(1.5, 2.5, by = 0.05)
  
  results &lt;- sapply(prices, function(p) {'{'} 
    price_change &lt;- (p - base_price) / base_price
    volume_change &lt;- price_change * elasticity
    volume &lt;- base_volume * (1 + volume_change)
    hold &lt;- (1 - 1/p) * 100
    revenue &lt;- volume * hold / 100
    return(revenue)
  {'}'})
  
  optimal_idx &lt;- which.max(results)
  list(
    optimal_price = prices[optimal_idx],
    max_revenue = results[optimal_idx],
    prices = prices,
    revenues = results
  )
{'}'}

# Estimate elasticity from data
estimate_elasticity &lt;- function(price_old, price_new, vol_old, vol_new) {'{'} 
  pct_price &lt;- (price_new - price_old) / price_old
  pct_volume &lt;- (vol_new - vol_old) / vol_old
  elasticity &lt;- pct_volume / pct_price
  return(elasticity)
{'}'}

# Example
result &lt;- optimize_price({basePrice}, {baseVolume}, {elasticity})
cat(sprintf("Optimal: %.2fx, Revenue: $%.0f\n", 
            result$optimal_price, result$max_revenue))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Elasticity measures volume sensitivity to price</li>
        <li>• E &lt; -1: volume very responsive (elastic)</li>
        <li>• E &gt; -1: volume less responsive (inelastic)</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Optimal price maximizes revenue, not hold</li>
        <li>• Different markets have different elasticities</li>
        <li>• A/B test to estimate elasticity empirically</li>
      </ul>
    </div>
  </div>
</div>

