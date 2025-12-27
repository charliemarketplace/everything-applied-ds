<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG } from '$lib/utils/synthetic-data';

  // Competitor prices
  let yourHold = $state(5);
  let competitor1Hold = $state(4.5);
  let competitor2Hold = $state(5.2);
  let competitor3Hold = $state(4.8);

  // Market position
  const avgCompetitorHold = $derived((competitor1Hold + competitor2Hold + competitor3Hold) / 3);
  const yourPosition = $derived(yourHold - avgCompetitorHold);

  // Simulate market share
  const marketShares = $derived(() => {
    const holds = [yourHold, competitor1Hold, competitor2Hold, competitor3Hold];
    const inversed = holds.map(h => 1 / h);
    const total = inversed.reduce((s, v) => s + v, 0);
    return inversed.map(v => v / total * 100);
  });

  // Revenue comparison
  const revenues = $derived(() => {
    const shares = marketShares();
    const totalMarket = 1000000; // $1M market
    return [
      shares[0] / 100 * totalMarket * yourHold / 100,
      shares[1] / 100 * totalMarket * competitor1Hold / 100,
      shares[2] / 100 * totalMarket * competitor2Hold / 100,
      shares[3] / 100 * totalMarket * competitor3Hold / 100
    ];
  });

  // Competitive strategies
  const strategies = [
    { name: 'Price Leader', desc: 'Lowest hold, highest volume', risk: 'Margin pressure', when: 'Scale advantage' },
    { name: 'Premium', desc: 'Higher hold, better product', risk: 'Volume loss', when: 'Strong brand' },
    { name: 'Match', desc: 'Stay at market average', risk: 'No differentiation', when: 'Status quo' },
    { name: 'Segment', desc: 'Different prices for segments', risk: 'Complexity', when: 'Diverse users' }
  ];
</script>

<svelte:head>
  <title>Competitive Pricing | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Market Analysis</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Competitive Pricing</h1>
    <p class="section-subtitle max-w-3xl">
      Position your pricing relative to competitors. Find the sweet spot between
      volume (lower hold) and margin (higher hold).
    </p>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Hold Rates (%)</h3>
        <div class="space-y-4">
          <Slider bind:value={yourHold} min={2} max={8} step={0.1} label="Your Hold" />
          <Slider bind:value={competitor1Hold} min={2} max={8} step={0.1} label="Competitor A" />
          <Slider bind:value={competitor2Hold} min={2} max={8} step={0.1} label="Competitor B" />
          <Slider bind:value={competitor3Hold} min={2} max={8} step={0.1} label="Competitor C" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Your Position</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Your Hold</span>
            <span class="font-mono text-obsidian-200">{yourHold.toFixed(1)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Market Avg</span>
            <span class="font-mono text-obsidian-200">{avgCompetitorHold.toFixed(1)}%</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-obsidian-700">
            <span class="text-obsidian-300">vs Market</span>
            <span class="font-mono {yourPosition < 0 ? 'text-jade-400' : yourPosition > 0 ? 'text-crimson-400' : 'text-amber-350'}">
              {yourPosition > 0 ? '+' : ''}{yourPosition.toFixed(2)}%
            </span>
          </div>
        </div>
        <p class="text-xs text-obsidian-400 mt-4">
          {#if yourPosition < -0.3}
            🏆 Price leader: Better odds attract volume
          {:else if yourPosition > 0.3}
            💎 Premium: Higher margin, need differentiation
          {:else}
            ⚖️ Market parity: Competing on other factors
          {/if}
        </p>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Market Share -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Estimated Market Share</h3>
        <div class="h-48">
          <BarChart 
            labels={['You', 'Competitor A', 'Competitor B', 'Competitor C']}
            data={marketShares()}
            color="#f5c542"
          />
        </div>
        <p class="text-xs text-obsidian-400 mt-3">
          Lower hold → higher market share (inverse relationship)
        </p>
      </div>

      <!-- Revenue -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Estimated Revenue ($1M Market)</h3>
        <div class="grid grid-cols-4 gap-4">
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-jade-400 mb-1">You</div>
            <div class="font-mono text-xl text-jade-400">${(revenues()[0] / 1000).toFixed(1)}K</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Comp A</div>
            <div class="font-mono text-lg text-obsidian-300">${(revenues()[1] / 1000).toFixed(1)}K</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Comp B</div>
            <div class="font-mono text-lg text-obsidian-300">${(revenues()[2] / 1000).toFixed(1)}K</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Comp C</div>
            <div class="font-mono text-lg text-obsidian-300">${(revenues()[3] / 1000).toFixed(1)}K</div>
          </div>
        </div>
        <p class="text-xs text-obsidian-400 mt-3">
          Revenue = Share × Market × Hold. Optimal hold maximizes revenue, not share.
        </p>
      </div>
    </div>
  </div>

  <!-- Strategies -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎯 Competitive Strategies</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each strategies as strategy}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{strategy.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{strategy.desc}</p>
          <p class="text-xs text-crimson-400 mb-1">⚠️ {strategy.risk}</p>
          <p class="text-xs text-jade-400">✓ {strategy.when}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Competitive pricing analysis
estimate_share &lt;- function(holds) {'{'} 
  # Lower hold = higher share (inverse)
  inverse &lt;- 1 / holds
  inverse / sum(inverse) * 100
{'}'}

optimize_hold &lt;- function(competitor_holds, market_size = 1000000) {'{'} 
  test_holds &lt;- seq(2, 8, by = 0.1)
  results &lt;- sapply(test_holds, function(my_hold) {'{'} 
    all_holds &lt;- c(my_hold, competitor_holds)
    shares &lt;- estimate_share(all_holds)
    my_revenue &lt;- shares[1] / 100 * market_size * my_hold / 100
    return(my_revenue)
  {'}'})
  
  optimal_idx &lt;- which.max(results)
  list(optimal_hold = test_holds[optimal_idx], max_revenue = results[optimal_idx])
{'}'}

# Example
comp_holds &lt;- c({competitor1Hold}, {competitor2Hold}, {competitor3Hold})
result &lt;- optimize_hold(comp_holds)
cat(sprintf("Optimal: %.1f%%, Revenue: $%.0f\n", result$optimal_hold, result$max_revenue))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Lower hold → higher share, lower margin</li>
        <li>• Optimal hold maximizes revenue, not share</li>
        <li>• Monitor competitor pricing regularly</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Price leadership requires scale</li>
        <li>• Premium requires differentiation</li>
        <li>• Segment pricing for different user types</li>
      </ul>
    </div>
  </div>
</div>

