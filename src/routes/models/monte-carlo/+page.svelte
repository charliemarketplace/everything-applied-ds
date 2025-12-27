<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Monte Carlo parameters
  let numSimulations = $state(1000);
  let winProbability = $state(55);
  let betSize = $state(100);
  let numBets = $state(50);

  // Run Monte Carlo simulation
  const simResults = $derived(() => {
    const rng = createRNG(42);
    const outcomes: number[] = [];
    const paths: number[][] = [];
    const winProb = winProbability / 100;
    
    for (let s = 0; s < numSimulations; s++) {
      let bankroll = 1000;
      const path = [bankroll];
      
      for (let b = 0; b < numBets; b++) {
        const win = rng() < winProb;
        bankroll += win ? betSize : -betSize;
        path.push(bankroll);
      }
      
      outcomes.push(bankroll);
      if (paths.length < 20) paths.push(path); // Sample paths
    }
    
    return { outcomes, paths };
  });

  // Statistics
  const stats = $derived(() => {
    const outcomes = simResults().outcomes;
    outcomes.sort((a, b) => a - b);
    
    const mean = outcomes.reduce((s, o) => s + o, 0) / outcomes.length;
    const std = Math.sqrt(outcomes.reduce((s, o) => s + Math.pow(o - mean, 2), 0) / outcomes.length);
    const min = outcomes[0];
    const max = outcomes[outcomes.length - 1];
    const median = outcomes[Math.floor(outcomes.length / 2)];
    const p5 = outcomes[Math.floor(outcomes.length * 0.05)];
    const p95 = outcomes[Math.floor(outcomes.length * 0.95)];
    const bustRate = outcomes.filter(o => o <= 0).length / outcomes.length * 100;
    const profitRate = outcomes.filter(o => o > 1000).length / outcomes.length * 100;
    
    return { mean, std, min, max, median, p5, p95, bustRate, profitRate };
  });

  // Outcome distribution
  const distribution = $derived(() => {
    const outcomes = simResults().outcomes;
    const binWidth = 200;
    const minVal = Math.min(...outcomes);
    const maxVal = Math.max(...outcomes);
    const bins: { label: string, count: number }[] = [];
    
    for (let v = Math.floor(minVal / binWidth) * binWidth; v <= maxVal; v += binWidth) {
      const count = outcomes.filter(o => o >= v && o < v + binWidth).length;
      bins.push({ label: `$${v}`, count });
    }
    
    return bins;
  });

  const betLabels = $derived(Array.from({ length: numBets + 1 }, (_, i) => i.toString()));
</script>

<svelte:head>
  <title>Monte Carlo Simulation | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Statistical Models</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Monte Carlo Simulation</h1>
    <p class="section-subtitle max-w-3xl">
      Use random sampling to understand complex systems. Simulate thousands of
      scenarios to estimate probabilities, risks, and expected outcomes.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 Why Monte Carlo?</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">🎲</div>
        <h3 class="text-amber-350 font-semibold mb-2">Random Sampling</h3>
        <p class="text-xs text-obsidian-400">Generate many random scenarios</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">📈</div>
        <h3 class="text-amber-350 font-semibold mb-2">Distribution</h3>
        <p class="text-xs text-obsidian-400">See full range of possible outcomes</p>
      </div>
      <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">📊</div>
        <h3 class="text-jade-400 font-semibold mb-2">Risk Metrics</h3>
        <p class="text-xs text-obsidian-400">Calculate VaR, bust rate, percentiles</p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Simulation Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={numSimulations} min={100} max={5000} step={100} label="# Simulations" />
          <Slider bind:value={winProbability} min={40} max={60} step={1} label="Win Probability (%)" />
          <Slider bind:value={betSize} min={50} max={200} step={10} label="Bet Size ($)" />
          <Slider bind:value={numBets} min={20} max={100} step={10} label="# Bets per Season" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Simulation Results</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Mean Outcome</span>
            <span class="font-mono {stats().mean > 1000 ? 'text-jade-400' : 'text-crimson-400'}">${stats().mean.toFixed(0)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Std Dev</span>
            <span class="font-mono text-obsidian-200">${stats().std.toFixed(0)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">5th / 95th %ile</span>
            <span class="font-mono text-obsidian-200">${stats().p5} / ${stats().p95}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-obsidian-700">
            <span class="text-obsidian-300">Bust Rate</span>
            <span class="font-mono text-crimson-400">{stats().bustRate.toFixed(1)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Profit Rate</span>
            <span class="font-mono text-jade-400">{stats().profitRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Sample Paths -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Sample Bankroll Paths</h3>
        <div class="h-48">
          <LineChart 
            labels={betLabels}
            datasets={simResults().paths.slice(0, 10).map((path, i) => ({
              label: `Path ${i + 1}`,
              data: path,
              borderColor: i === 0 ? '#34d399' : `hsl(${i * 36}, 70%, 60%)`,
              fill: false,
              borderWidth: 1
            }))}
            xAxisLabel="Bet #"
            yAxisLabel="Bankroll ($)"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Each line is one possible future. Wide spread = high variance.
        </p>
      </div>

      <!-- Distribution -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Final Outcome Distribution</h3>
        <div class="h-48">
          <BarChart 
            labels={distribution().map(b => b.label)}
            data={distribution().map(b => b.count)}
            color="#f5c542"
          />
        </div>
        <div class="mt-4 grid grid-cols-3 gap-4 text-xs text-center">
          <div class="p-2 bg-crimson-500/20 rounded-lg">
            <span class="text-crimson-400">Min: ${stats().min}</span>
          </div>
          <div class="p-2 bg-obsidian-800/50 rounded-lg">
            <span class="text-obsidian-300">Median: ${stats().median}</span>
          </div>
          <div class="p-2 bg-jade-500/20 rounded-lg">
            <span class="text-jade-400">Max: ${stats().max}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Use Cases -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎰 Monte Carlo in Betting</h2>
    <div class="grid md:grid-cols-4 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Bankroll Risk</h3>
        <p class="text-xs text-obsidian-400">Simulate ruin probability under different bet sizing</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Parlay Pricing</h3>
        <p class="text-xs text-obsidian-400">Simulate correlated outcomes to price multi-leg bets</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Season Sims</h3>
        <p class="text-xs text-obsidian-400">Project win totals and playoff odds</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Player Props</h3>
        <p class="text-xs text-obsidian-400">Simulate game flow to project stats</p>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Monte Carlo betting simulation
monte_carlo_betting &lt;- function(n_sims, win_prob, bet_size, n_bets, bankroll = 1000) {'{'} 
  outcomes &lt;- replicate(n_sims, {'{'} 
    wins &lt;- rbinom(n_bets, 1, win_prob)
    profit &lt;- sum(ifelse(wins == 1, bet_size, -bet_size))
    bankroll + profit
  {'}'})
  
  list(
    mean = mean(outcomes),
    sd = sd(outcomes),
    median = median(outcomes),
    p5 = quantile(outcomes, 0.05),
    p95 = quantile(outcomes, 0.95),
    bust_rate = mean(outcomes &lt;= 0),
    profit_rate = mean(outcomes &gt; bankroll)
  )
{'}'}

result &lt;- monte_carlo_betting({numSimulations}, {winProbability / 100}, {betSize}, {numBets})
cat(sprintf("Mean: $%.0f, Bust: %.1f%%, Profit: %.1f%%\n", 
    result$mean, result$bust_rate * 100, result$profit_rate * 100))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Monte Carlo: simulate many random scenarios</li>
        <li>• Get full distribution, not just expected value</li>
        <li>• Essential for risk metrics (VaR, bust rate)</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• More simulations = more accurate estimates</li>
        <li>• Can model correlations and path dependence</li>
        <li>• Variance matters as much as mean</li>
      </ul>
    </div>
  </div>
</div>
