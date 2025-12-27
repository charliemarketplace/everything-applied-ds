<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Portfolio/strategy parameters
  let expectedReturn = $state(8);
  let volatility = $state(15);
  let riskFreeRate = $state(4);

  // Calculate Sharpe Ratio
  const sharpeRatio = $derived((expectedReturn - riskFreeRate) / volatility);

  // Simulate returns over time
  const simulateReturns = $derived(() => {
    const rng = createRNG(42);
    const months = 36;
    const monthlyReturn = expectedReturn / 12;
    const monthlyVol = volatility / Math.sqrt(12);
    
    const returns: number[] = [];
    const cumulative: number[] = [100];
    
    for (let m = 0; m < months; m++) {
      const ret = normalRandom(rng, monthlyReturn, monthlyVol);
      returns.push(ret);
      cumulative.push(cumulative[m] * (1 + ret / 100));
    }
    
    return { returns, cumulative };
  });

  const monthLabels = $derived(
    Array.from({ length: 37 }, (_, i) => i === 0 ? 'Start' : `M${i}`)
  );

  // Risk-adjusted comparison
  const strategies = $derived(() => [
    { name: 'Conservative', return: 6, vol: 8, rf: riskFreeRate },
    { name: 'Balanced', return: 10, vol: 15, rf: riskFreeRate },
    { name: 'Aggressive', return: 15, vol: 25, rf: riskFreeRate },
    { name: 'Your Strategy', return: expectedReturn, vol: volatility, rf: riskFreeRate }
  ].map(s => ({
    ...s,
    sharpe: (s.return - s.rf) / s.vol
  })));

  // Sharpe interpretation
  function interpretSharpe(sharpe: number): { label: string, color: string } {
    if (sharpe >= 1) return { label: 'Excellent', color: 'text-jade-400' };
    if (sharpe >= 0.5) return { label: 'Good', color: 'text-jade-400/70' };
    if (sharpe >= 0) return { label: 'Acceptable', color: 'text-amber-350' };
    return { label: 'Poor', color: 'text-crimson-400' };
  }

  const interpretation = $derived(interpretSharpe(sharpeRatio));
</script>

<svelte:head>
  <title>Sharpe Ratio | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Metrics & Evaluation</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Sharpe Ratio</h1>
    <p class="section-subtitle max-w-3xl">
      Measure risk-adjusted returns. Compare strategies by how much return 
      you get per unit of risk taken.
    </p>
  </div>

  <!-- Formula -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Sharpe Ratio Formula</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <div class="formula text-2xl mb-4">
          Sharpe = (R_p - R_f) / σ_p
        </div>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li><span class="text-amber-350">R_p</span> = Portfolio/strategy return</li>
          <li><span class="text-amber-350">R_f</span> = Risk-free rate</li>
          <li><span class="text-amber-350">σ_p</span> = Portfolio volatility (std dev)</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Interpretation</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• <span class="text-jade-400">&gt; 1.0</span> = Excellent (hedge fund territory)</li>
          <li>• <span class="text-jade-400">0.5 - 1.0</span> = Good</li>
          <li>• <span class="text-amber-350">0 - 0.5</span> = Acceptable</li>
          <li>• <span class="text-crimson-400">&lt; 0</span> = Underperforming risk-free</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Calculator -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Strategy Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={expectedReturn} min={-5} max={30} step={0.5} label="Expected Return (%/yr)" />
          <Slider bind:value={volatility} min={5} max={40} step={1} label="Volatility (%/yr)" />
          <Slider bind:value={riskFreeRate} min={0} max={10} step={0.5} label="Risk-Free Rate (%/yr)" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Result</h3>
        <div class="text-center">
          <div class="font-mono text-5xl {interpretation.color}">
            {sharpeRatio.toFixed(2)}
          </div>
          <div class="text-sm text-obsidian-400 mt-2">Sharpe Ratio</div>
          <div class="mt-4 px-4 py-2 rounded-full inline-block {sharpeRatio >= 0.5 ? 'bg-jade-500/20 text-jade-400' : sharpeRatio >= 0 ? 'bg-amber-350/20 text-amber-350' : 'bg-crimson-500/20 text-crimson-400'}">
            {interpretation.label}
          </div>
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-xs text-obsidian-400">
          Excess return: {(expectedReturn - riskFreeRate).toFixed(1)}% ÷ Volatility: {volatility}%
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Cumulative Returns -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Simulated Cumulative Returns (36 months)</h3>
        <div class="h-48">
          <LineChart 
            labels={monthLabels}
            datasets={[
              {
                label: 'Strategy',
                data: simulateReturns().cumulative,
                borderColor: '#f5c542',
                fill: false
              },
              {
                label: 'Risk-Free',
                data: monthLabels.map((_, i) => 100 * Math.pow(1 + riskFreeRate / 100 / 12, i)),
                borderColor: '#94a3b8',
                fill: false,
                borderDash: [5, 5]
              }
            ]}
            xAxisLabel="Month"
            yAxisLabel="Portfolio Value"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Higher Sharpe = smoother path to the same return. Volatility creates bumpy ride.
        </p>
      </div>

      <!-- Strategy Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Strategy Comparison</h3>
        <div class="grid grid-cols-4 gap-4">
          {#each strategies() as strat}
            {@const isYours = strat.name === 'Your Strategy'}
            <div class="p-4 rounded-lg {isYours ? 'bg-amber-350/20 border border-amber-350/30' : 'bg-obsidian-800/50'}">
              <h4 class="font-semibold {isYours ? 'text-amber-350' : 'text-obsidian-200'} mb-3">{strat.name}</h4>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between">
                  <span class="text-obsidian-400">Return</span>
                  <span class="font-mono text-obsidian-200">{strat.return}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-obsidian-400">Volatility</span>
                  <span class="font-mono text-obsidian-200">{strat.vol}%</span>
                </div>
                <div class="flex justify-between pt-2 border-t border-obsidian-700">
                  <span class="text-obsidian-400">Sharpe</span>
                  <span class="font-mono {interpretSharpe(strat.sharpe).color}">{strat.sharpe.toFixed(2)}</span>
                </div>
              </div>
            </div>
          {/each}
        </div>
        <p class="mt-4 text-sm text-obsidian-400">
          <strong class="text-amber-350">Note:</strong> Aggressive strategy has highest return but worst Sharpe. 
          Risk-adjusted, Conservative may be better!
        </p>
      </div>
    </div>
  </div>

  <!-- Betting Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Sports Betting Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Evaluating Betting Strategies</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Compare ROI vs variance across strategies</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>High-volume low-edge vs low-volume high-edge</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Parlay strategies have high vol, often low Sharpe</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">House Perspective</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Evaluate pricing strategy risk-adjusted performance</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Higher Sharpe = more consistent profits</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Guide reserve requirements based on volatility</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Information Ratio -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📈 Related Metrics</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Sharpe Ratio</h3>
        <div class="formula text-sm mb-2">(R - Rf) / σ</div>
        <p class="text-xs text-obsidian-400">Return over risk-free, per unit total risk</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Information Ratio</h3>
        <div class="formula text-sm mb-2">(R - Rb) / TE</div>
        <p class="text-xs text-obsidian-400">Return over benchmark, per unit tracking error</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Sortino Ratio</h3>
        <div class="formula text-sm mb-2">(R - Rf) / σ_down</div>
        <p class="text-xs text-obsidian-400">Only penalizes downside volatility</p>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calculate Sharpe Ratio
sharpe_ratio &lt;- function(returns, rf_rate = 0.04) {'{'} 
  excess_return &lt;- mean(returns) - rf_rate / 12  # Monthly
  vol &lt;- sd(returns)
  
  # Annualize
  sharpe &lt;- (excess_return * 12) / (vol * sqrt(12))
  return(sharpe)
{'}'}

# Compare strategies
compare_strategies &lt;- function(returns_list, names, rf = 0.04) {'{'} 
  results &lt;- data.frame(
    strategy = names,
    return = sapply(returns_list, function(r) mean(r) * 12 * 100),
    vol = sapply(returns_list, function(r) sd(r) * sqrt(12) * 100),
    sharpe = sapply(returns_list, sharpe_ratio, rf_rate = rf)
  )
  return(results[order(-results$sharpe), ])
{'}'}

# Example
returns &lt;- rnorm(36, mean = {expectedReturn / 12 / 100}, sd = {volatility / Math.sqrt(12) / 100})
cat(sprintf("Sharpe: %.2f\n", sharpe_ratio(returns, {riskFreeRate / 100})))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Sharpe = excess return per unit of risk</li>
        <li>• &gt; 1.0 is excellent, &gt; 0.5 is good</li>
        <li>• Compare strategies fairly across risk levels</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• High return with high vol may have low Sharpe</li>
        <li>• Useful for betting strategy evaluation</li>
        <li>• Annualize using √time for volatility</li>
      </ul>
    </div>
  </div>
</div>

