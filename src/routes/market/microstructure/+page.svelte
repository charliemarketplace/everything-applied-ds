<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Market parameters
  let spreadWidth = $state(3);
  let sharpFlow = $state(30);
  let publicFlow = $state(70);
  let liquidity = $state(50000);

  // Calculate bid-ask
  const fairValue = $state(0);
  const bidLine = $derived(fairValue - spreadWidth / 2);
  const askLine = $derived(fairValue + spreadWidth / 2);

  // Simulate price discovery
  const priceDiscovery = $derived(() => {
    const rng = createRNG(42);
    const steps = 20;
    const prices: number[] = [fairValue];
    const sharpFrac = sharpFlow / 100;
    
    for (let s = 1; s <= steps; s++) {
      const prev = prices[s - 1];
      // Sharp bets move market efficiently toward true value
      const trueValue = 0; // Assume we converge to 0
      const sharpMove = (trueValue - prev) * sharpFrac * 0.3;
      // Public bets add noise
      const publicNoise = normalRandom(rng, 0, (1 - sharpFrac) * 1.5);
      
      prices.push(prev + sharpMove + publicNoise);
    }
    
    return prices;
  });

  const stepLabels = $derived(Array.from({ length: 21 }, (_, i) => String(i)));

  // Market quality metrics
  const effectiveSpread = $derived(spreadWidth * 0.8); // Price improvement
  const priceImpact = $derived((100 / liquidity) * 1000); // Basis points per $1K bet

  // Market structure elements
  const elements = $derived([
    { name: 'Bid-Ask Spread', desc: 'Gap between buy/sell prices', metric: `${spreadWidth} pts` },
    { name: 'Depth', desc: 'Total $ at best prices', metric: `$${(liquidity / 1000).toFixed(0)}K` },
    { name: 'Sharp Flow', desc: '% of volume from informed traders', metric: `${sharpFlow}%` },
    { name: 'Price Impact', desc: 'Move per $ bet', metric: `${priceImpact.toFixed(2)} bp/$K` }
  ]);
</script>

<svelte:head>
  <title>Market Microstructure | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Market Analysis</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Market Microstructure</h1>
    <p class="section-subtitle max-w-3xl">
      Understand how betting markets work at the order level. Spreads, depth,
      price discovery, and the flow of information through prices.
    </p>
  </div>

  <!-- Bid-Ask Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Bid-Ask Spread</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <p class="text-sm text-obsidian-300 mb-3">
          In a two-way market, there's always a gap between buy and sell prices.
          This spread compensates the market maker for risk and inventory.
        </p>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li><span class="text-jade-400">Bid:</span> Price to buy (Back) = Fair - Spread/2</li>
          <li><span class="text-crimson-400">Ask:</span> Price to sell (Lay) = Fair + Spread/2</li>
          <li><span class="text-amber-350">Spread:</span> Market maker's compensation</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h4 class="text-amber-350 font-semibold mb-3">Current Market</h4>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-jade-400">Bid (buy at)</span>
            <span class="font-mono text-2xl text-jade-400">{bidLine.toFixed(1)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-400">Fair Value</span>
            <span class="font-mono text-lg text-obsidian-300">{fairValue.toFixed(1)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-crimson-400">Ask (sell at)</span>
            <span class="font-mono text-2xl text-crimson-400">{askLine.toFixed(1)}</span>
          </div>
          <div class="pt-2 border-t border-obsidian-700 flex justify-between">
            <span class="text-amber-350">Spread</span>
            <span class="font-mono text-amber-350">{spreadWidth} pts</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Market Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={spreadWidth} min={1} max={10} step={0.5} label="Spread Width (pts)" />
          <Slider bind:value={sharpFlow} min={5} max={80} step={5} label="Sharp Flow (%)" />
          <Slider bind:value={liquidity} min={10000} max={200000} step={10000} label="Liquidity ($)" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Market Quality</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Quoted Spread</span>
            <span class="font-mono text-obsidian-200">{spreadWidth} pts</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Effective Spread</span>
            <span class="font-mono text-jade-400">{effectiveSpread.toFixed(1)} pts</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Price Impact</span>
            <span class="font-mono text-amber-350">{priceImpact.toFixed(2)} bp/$K</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Price Discovery -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Price Discovery Over Time</h3>
        <div class="h-48">
          <LineChart 
            labels={stepLabels}
            datasets={[
              {
                label: 'Market Price',
                data: priceDiscovery(),
                borderColor: '#f5c542',
                fill: false
              },
              {
                label: 'Fair Value',
                data: Array(21).fill(0),
                borderColor: '#94a3b8',
                fill: false,
                borderDash: [5, 5]
              }
            ]}
            xAxisLabel="Time Step"
            yAxisLabel="Line"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Higher sharp flow = faster convergence to fair value. Public noise adds volatility.
        </p>
      </div>

      <!-- Market Elements -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Market Structure Elements</h3>
        <div class="grid grid-cols-4 gap-4">
          {#each elements as el}
            <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
              <h4 class="text-amber-350 text-xs font-semibold mb-1">{el.name}</h4>
              <div class="font-mono text-lg text-obsidian-200 mb-1">{el.metric}</div>
              <p class="text-xs text-obsidian-400">{el.desc}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Key Concepts -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📚 Key Concepts</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Informed vs Uninformed Flow</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>Sharp flow:</strong> Moves market toward fair value</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>Public flow:</strong> Adds noise, creates opportunity</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Market makers widen spreads when sharp flow is high</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Price Impact</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Large bets move the market against you</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Split large bets across time/books</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Thin markets = higher impact</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Market microstructure simulation
simulate_price_discovery &lt;- function(n_steps, sharp_frac, fair_value = 0) {'{'} 
  prices &lt;- numeric(n_steps + 1)
  prices[1] &lt;- fair_value + rnorm(1, 0, 2)
  
  for (s in 2:(n_steps + 1)) {'{'} 
    prev &lt;- prices[s - 1]
    # Sharp flow moves toward fair value
    sharp_move &lt;- (fair_value - prev) * sharp_frac * 0.3
    # Public adds noise
    public_noise &lt;- rnorm(1, 0, (1 - sharp_frac) * 1.5)
    prices[s] &lt;- prev + sharp_move + public_noise
  {'}'}
  
  return(prices)
{'}'}

# Calculate effective spread
effective_spread &lt;- function(executions, quotes) {'{'} 
  # 2 * |execution_price - midpoint|
  mean(2 * abs(executions - (quotes$bid + quotes$ask) / 2))
{'}'}

prices &lt;- simulate_price_discovery(20, {sharpFlow / 100})
plot(prices, type = "l", main = "Price Discovery")</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Spread = market maker's compensation</li>
        <li>• Sharp flow drives price discovery</li>
        <li>• Liquidity determines price impact</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Wide spreads when sharps are active</li>
        <li>• Split large bets to reduce impact</li>
        <li>• Markets converge to fair value over time</li>
      </ul>
    </div>
  </div>
</div>

