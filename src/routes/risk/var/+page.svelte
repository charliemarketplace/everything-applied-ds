<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import NumberInput from '$lib/components/widgets/NumberInput.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import HistogramChart from '$lib/components/charts/HistogramChart.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom, runMonteCarloSimulation } from '$lib/utils/synthetic-data';

  // VaR Parameters
  let portfolioValue = $state(100000);
  let dailyVolatility = $state(2.5);
  let confidenceLevel = $state(95);
  let timePeriod = $state(1);
  let numSimulations = $state(10000);

  // Calculate VaR using parametric method (normal distribution)
  const zScore = $derived({
    90: 1.28,
    95: 1.645,
    99: 2.33,
    99.5: 2.58
  }[confidenceLevel] || 1.645);

  const parametricVaR = $derived(
    portfolioValue * (dailyVolatility / 100) * zScore * Math.sqrt(timePeriod)
  );

  // Expected Shortfall (CVaR) - average loss beyond VaR
  const expectedShortfall = $derived(
    parametricVaR * (Math.exp(zScore * zScore / 2) / (1 - confidenceLevel / 100)) * 
    (1 / zScore) * (1 / Math.sqrt(2 * Math.PI))
  );

  // Monte Carlo VaR simulation
  const simulation = $derived(() => {
    const simFn = (rng: () => number) => {
      let value = portfolioValue;
      for (let d = 0; d < timePeriod; d++) {
        const dailyReturn = normalRandom(rng, 0, dailyVolatility / 100);
        value *= (1 + dailyReturn);
      }
      return portfolioValue - value; // Return as loss (positive = loss)
    };

    const result = runMonteCarloSimulation(simFn, numSimulations, 42, 40);
    
    // Sort losses to find VaR percentile
    const allLosses: number[] = [];
    const rng = createRNG(42);
    for (let i = 0; i < numSimulations; i++) {
      allLosses.push(simFn(rng));
    }
    allLosses.sort((a, b) => a - b);
    
    const varIndex = Math.floor(numSimulations * (confidenceLevel / 100));
    const historicalVaR = allLosses[varIndex];
    
    // CVaR - average of losses beyond VaR
    const tailLosses = allLosses.slice(varIndex);
    const cvar = tailLosses.reduce((a, b) => a + b, 0) / tailLosses.length;

    return { ...result, historicalVaR, cvar };
  });

  // Confidence level options
  const confidenceLevels = [90, 95, 99, 99.5];

  // VaR over time horizon chart
  const horizonLabels = $derived(
    Array.from({ length: 30 }, (_, i) => String(i + 1))
  );

  const varByHorizon = $derived(
    horizonLabels.map(day => {
      const d = parseInt(day);
      return portfolioValue * (dailyVolatility / 100) * zScore * Math.sqrt(d);
    })
  );
</script>

<svelte:head>
  <title>Value at Risk (VaR) | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Risk Management</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Value at Risk (VaR)</h1>
    <p class="section-subtitle max-w-3xl">
      Quantify maximum expected loss at a given confidence level.
      Critical for setting daily exposure limits and worst-case scenario planning.
    </p>
  </div>

  <!-- Formula Card -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📉 VaR Formula</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Parametric VaR</h3>
        <div class="formula text-lg">
          VaR = P × σ × Z × √t
        </div>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li><span class="text-amber-350">P</span> = Portfolio value</li>
          <li><span class="text-amber-350">σ</span> = Daily volatility</li>
          <li><span class="text-amber-350">Z</span> = Z-score for confidence level</li>
          <li><span class="text-amber-350">t</span> = Time period (days)</li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Interpretation</h3>
        <p class="text-sm text-obsidian-300">
          "At {confidenceLevel}% confidence, we will not lose more than 
          <span class="text-amber-350 font-mono">${parametricVaR.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span> 
          over {timePeriod} day{timePeriod > 1 ? 's' : ''}."
        </p>
        <p class="text-xs text-obsidian-400">
          Or equivalently: There's a {100 - confidenceLevel}% chance we lose <em>more</em> than this.
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Calculator -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Portfolio Settings</h3>
        <div class="space-y-4">
          <NumberInput 
            bind:value={portfolioValue} 
            min={1000} 
            max={10000000} 
            step={10000} 
            label="Portfolio Value ($)" 
          />
          <Slider 
            bind:value={dailyVolatility} 
            min={0.5} 
            max={10} 
            step={0.1} 
            label="Daily Volatility (%)" 
          />
          <Slider 
            bind:value={timePeriod} 
            min={1} 
            max={30} 
            step={1} 
            label="Time Period (Days)" 
          />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Confidence Level</h3>
        <div class="grid grid-cols-4 gap-2">
          {#each confidenceLevels as level}
            <button
              class="px-3 py-2 rounded-lg text-sm font-mono transition-colors
                     {confidenceLevel === level 
                       ? 'bg-amber-350 text-obsidian-900' 
                       : 'bg-obsidian-800 text-obsidian-300 hover:bg-obsidian-700'}"
              onclick={() => confidenceLevel = level}
            >
              {level}%
            </button>
          {/each}
        </div>
        <div class="mt-3 text-xs text-obsidian-400">
          Z-score: <span class="font-mono text-amber-350">{zScore}</span>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- VaR Results -->
      <div class="glass-card p-6 border-crimson-500/30">
        <h3 class="font-display text-lg font-semibold text-crimson-400 mb-4">⚠️ Risk Metrics</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Parametric VaR ({confidenceLevel}%)</div>
            <div class="font-mono text-2xl text-crimson-400">
              ${parametricVaR.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div class="text-xs text-obsidian-400 mt-1">
              {(parametricVaR / portfolioValue * 100).toFixed(2)}% of portfolio
            </div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Monte Carlo VaR</div>
            <div class="font-mono text-2xl text-amber-350">
              ${simulation().historicalVaR.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <div class="text-xs text-obsidian-400 mt-1">
              Based on {numSimulations.toLocaleString()} simulations
            </div>
          </div>
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg text-center col-span-2">
            <div class="text-xs text-obsidian-400 mb-1">Expected Shortfall (CVaR)</div>
            <div class="font-mono text-2xl text-crimson-400">
              ${simulation().cvar.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </div>
            <p class="text-xs text-obsidian-400 mt-1">
              Average loss when VaR is exceeded (tail risk)
            </p>
          </div>
        </div>
      </div>

      <!-- Loss Distribution -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Loss Distribution</h3>
        <div class="h-56">
          <HistogramChart 
            data={simulation().histogram}
            highlightRange={{ min: simulation().historicalVaR, max: simulation().histogram[simulation().histogram.length - 1]?.bin || 0 }}
          />
        </div>
        <div class="mt-4 flex items-center gap-4 text-xs text-obsidian-400">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-amber-350"></div>
            <span>Normal losses</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-crimson-500"></div>
            <span>Tail losses (beyond VaR)</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- VaR Over Time -->
  <div class="glass-card p-6">
    <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">VaR by Time Horizon</h3>
    <p class="text-sm text-obsidian-400 mb-4">
      VaR scales with the square root of time. A 1-day VaR × √10 ≈ 10-day VaR.
    </p>
    <div class="h-56">
      <LineChart 
        labels={horizonLabels}
        datasets={[{
          label: `${confidenceLevel}% VaR`,
          data: varByHorizon,
          borderColor: '#dc2626',
          fill: false
        }]}
        xAxisLabel="Days"
        yAxisLabel="VaR ($)"
      />
    </div>
  </div>

  <!-- Sports Betting Application -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Sports Betting VaR</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Daily Exposure Limits</h3>
        <p class="text-sm text-obsidian-300">
          Set maximum daily liability based on bankroll VaR. If bankroll is $100K 
          and 99% VaR is $10K, limit daily exposure accordingly.
        </p>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Event Concentration</h3>
        <p class="text-sm text-obsidian-300">
          Calculate VaR for single events (Super Bowl, UFC fight). 
          Concentrated bets have higher VaR than diversified exposure.
        </p>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Reserve Requirements</h3>
        <p class="text-sm text-obsidian-300">
          Use VaR to determine cash reserves needed to cover worst-case payouts.
          CVaR gives buffer for extreme scenarios.
        </p>
      </div>
    </div>
  </div>

  <!-- VaR vs CVaR -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 VaR vs Expected Shortfall (CVaR)</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Value at Risk (VaR)</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>• The loss threshold at X% confidence</li>
          <li>• Easy to calculate and communicate</li>
          <li>• Ignores severity of tail losses</li>
          <li>• Not subadditive (diversification can increase VaR)</li>
        </ul>
      </div>
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
        <h3 class="text-crimson-400 font-semibold mb-2">Expected Shortfall (CVaR)</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>• Average loss when VaR is exceeded</li>
          <li>• Captures tail risk severity</li>
          <li>• Coherent risk measure (respects diversification)</li>
          <li>• Required by Basel III for market risk</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Parametric VaR calculation
calculate_var &lt;- function(portfolio_value, daily_vol, confidence, days) {'{'} 
  z_score &lt;- qnorm(confidence)
  var &lt;- portfolio_value * daily_vol * z_score * sqrt(days)
  return(var)
{'}'}

# Monte Carlo VaR
monte_carlo_var &lt;- function(portfolio_value, daily_vol, days, n_sims = 10000, confidence = 0.95) {'{'} 
  simulate_loss &lt;- function() {'{'} 
    returns &lt;- rnorm(days, mean = 0, sd = daily_vol)
    final_value &lt;- portfolio_value * prod(1 + returns)
    return(portfolio_value - final_value)
  {'}'}
  
  losses &lt;- replicate(n_sims, simulate_loss())
  var &lt;- quantile(losses, confidence)
  cvar &lt;- mean(losses[losses &gt; var])
  
  return(list(var = var, cvar = cvar))
{'}'}

# Example
result &lt;- monte_carlo_var({portfolioValue}, {dailyVolatility / 100}, {timePeriod})
cat(sprintf("95%% VaR: $%.0f\n", result$var))
cat(sprintf("CVaR: $%.0f\n", result$cvar))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• VaR answers: "What's my worst X% loss?"</li>
        <li>• VaR scales with √time (not linearly)</li>
        <li>• 99% VaR ≈ 1.4× the 95% VaR</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• CVaR captures tail severity (use for reserves)</li>
        <li>• Monte Carlo handles non-normal distributions</li>
        <li>• Set exposure limits based on VaR, not just $ amount</li>
      </ul>
    </div>
  </div>
</div>

