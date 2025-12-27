<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import NumberInput from '$lib/components/widgets/NumberInput.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { expectedValue, createRNG } from '$lib/utils/synthetic-data';

  // Basic EV parameters
  let winProbability = $state(0.52);
  let payout = $state(1.9);
  let stake = $state(100);

  // Derived calculations
  const ev = $derived(expectedValue(winProbability, payout, stake));
  const impliedProb = $derived(1 / payout);
  const edge = $derived(winProbability - impliedProb);
  const houseEdge = $derived(impliedProb - (1 - winProbability));
  const roi = $derived((ev / stake) * 100);

  // Boolean flags for template (avoid > in class directives)
  const isPositiveEV = $derived(ev > 0);
  const isPositiveROI = $derived(roi > 0);
  const isPositiveEdge = $derived(edge > 0);

  // Multi-outcome EV
  let outcomes = $state([
    { prob: 0.6, payout: 0.9, label: 'Under' },
    { prob: 0.4, payout: 1.8, label: 'Over' }
  ]);

  const multiEV = $derived(
    outcomes.reduce((sum, o) => sum + o.prob * o.payout, 0) - 1
  );

  // Long-run simulation
  const numBets = 1000;
  
  const simulateLongRun = $derived(() => {
    const rng = createRNG(42);
    let cumulative = 0;
    const history: number[] = [0];
    
    for (let i = 0; i < numBets; i++) {
      if (rng() < winProbability) {
        cumulative += stake * (payout - 1);
      } else {
        cumulative -= stake;
      }
      history.push(cumulative);
    }
    return history;
  });

  const expectedLine = $derived(
    Array.from({ length: numBets + 1 }, (_, i) => ev * i)
  );

  const simulationLabels = $derived(
    Array.from({ length: numBets + 1 }, (_, i) => i % 100 === 0 ? String(i) : '')
  );

  // EV sensitivity analysis
  const probRange = $derived(
    Array.from({ length: 21 }, (_, i) => 0.4 + i * 0.01)
  );

  const evByProb = $derived(
    probRange.map(p => expectedValue(p, payout, stake))
  );
</script>

<svelte:head>
  <title>Expected Value | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Pricing Framework</span>
      <span class="badge-jade">Fundamental</span>
    </div>
    <h1 class="section-title">Expected Value (EV)</h1>
    <p class="section-subtitle max-w-3xl">
      The foundation of all betting pricing. EV tells you the average profit or loss per bet
      over the long run. Users should have negative EV; the house should have positive EV.
    </p>
  </div>

  <!-- Formula -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">💰 The EV Formula</h2>
    <div class="flex flex-col md:flex-row items-center gap-8">
      <div class="space-y-2">
        <div class="formula text-xl md:text-2xl">
          EV = P(win) × Payout − P(loss) × Stake
        </div>
        <p class="text-center text-obsidian-400 text-sm">
          Or equivalently: <span class="formula text-sm">EV = P(win) × Payout − 1</span> (unit stake)
        </p>
      </div>
      <div class="flex-1 p-4 bg-obsidian-800/50 rounded-lg">
        <p class="text-sm text-obsidian-300">
          <strong class="text-amber-350">Interpretation:</strong> If EV is positive, you profit on average. 
          If negative, the house profits. The magnitude tells you how much per dollar wagered.
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Calculator -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Bet Parameters</h3>
        <div class="space-y-4">
          <Slider 
            bind:value={winProbability} 
            min={0.3} max={0.7} step={0.01} 
            label="True Win Probability" 
          />
          <Slider 
            bind:value={payout} 
            min={1.1} max={3.0} step={0.05} 
            label="Payout Multiple" 
            unit="x" 
          />
          <NumberInput 
            bind:value={stake} 
            min={1} max={10000} step={10} 
            label="Stake Amount" 
            unit="$" 
          />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 EV Analysis</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Expected Value</span>
            <span class="font-mono text-2xl" class:text-jade-400={isPositiveEV} class:text-crimson-400={!isPositiveEV}>
              ${ev.toFixed(2)}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">ROI per Bet</span>
            <span class="font-mono text-lg" class:text-jade-400={isPositiveROI} class:text-crimson-400={!isPositiveROI}>
              {roi.toFixed(2)}%
            </span>
          </div>
          <hr class="border-obsidian-700">
          <div class="flex justify-between items-center text-sm">
            <span class="text-obsidian-400">Implied Probability</span>
            <span class="font-mono text-obsidian-200">{(impliedProb * 100).toFixed(1)}%</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-obsidian-400">Your Edge</span>
            <span class="font-mono" class:text-jade-400={isPositiveEdge} class:text-crimson-400={!isPositiveEdge}>
              {(edge * 100).toFixed(1)}%
            </span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-obsidian-400">House Edge</span>
            <span class="font-mono text-crimson-400">{(houseEdge * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <!-- Interpretation -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-3">🎯 What This Means</h3>
        <p class="text-sm text-obsidian-300">
          {#if ev > 0}
            <span class="text-jade-400 font-semibold">+EV Bet!</span> 
            Over many bets at these odds, you'd expect to profit 
            <span class="text-amber-350">${Math.abs(ev).toFixed(2)}</span> per ${stake} wagered.
          {:else}
            <span class="text-crimson-400 font-semibold">-EV Bet.</span> 
            The house profits <span class="text-amber-350">${Math.abs(ev).toFixed(2)}</span> per ${stake} you wager.
            This is how sportsbooks make money.
          {/if}
        </p>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">
          Long-Run Profit/Loss ({numBets} bets)
        </h3>
        <div class="h-64">
          <LineChart 
            labels={simulationLabels}
            datasets={[
              { label: 'Actual Results', data: simulateLongRun(), borderColor: '#60a5fa', fill: false },
              { label: 'Expected (EV Line)', data: expectedLine, borderColor: '#f5c542', fill: false, tension: 0 }
            ]}
            xAxisLabel="Bet Number"
            yAxisLabel="Cumulative P/L ($)"
          />
        </div>
        <p class="mt-4 text-sm text-obsidian-400">
          Blue shows actual random results; gold shows expected value line. 
          Over time, results converge to the EV line.
        </p>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">
          EV Sensitivity to Win Probability
        </h3>
        <div class="h-48">
          <LineChart 
            labels={probRange.map(p => (p * 100).toFixed(0) + '%')}
            datasets={[{
              label: 'EV at different win probabilities',
              data: evByProb,
              borderColor: '#f5c542',
              fill: true
            }]}
            xAxisLabel="True Win Probability"
            yAxisLabel="EV ($)"
          />
        </div>
        <p class="mt-4 text-sm text-obsidian-400">
          At current payout of {payout}x, you break even at 
          <span class="text-amber-350 font-mono">{(impliedProb * 100).toFixed(1)}%</span> win probability.
        </p>
      </div>
    </div>
  </div>

  <!-- Payout/Probability Table -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📋 Common Payout Structures</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-obsidian-700">
            <th class="text-left py-3 px-4 text-obsidian-400 font-medium">Bet Type</th>
            <th class="text-center py-3 px-4 text-obsidian-400 font-medium">Payout</th>
            <th class="text-center py-3 px-4 text-obsidian-400 font-medium">Implied Prob</th>
            <th class="text-center py-3 px-4 text-obsidian-400 font-medium">Breakeven</th>
            <th class="text-center py-3 px-4 text-obsidian-400 font-medium">House Edge @ 50%</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-obsidian-800">
          {#each [
            { type: 'Standard Over/Under', payout: 1.91, implied: 52.4 },
            { type: 'Power Play (3-leg)', payout: 2.25, implied: 44.4 },
            { type: 'Flex Play (2-leg)', payout: 3.0, implied: 33.3 },
            { type: 'Demon Mode (5-leg)', payout: 10.0, implied: 10.0 },
            { type: 'Fair Odds (coin flip)', payout: 2.0, implied: 50.0 }
          ] as row}
            <tr class="hover:bg-obsidian-800/30">
              <td class="py-3 px-4 text-obsidian-200">{row.type}</td>
              <td class="py-3 px-4 text-center font-mono text-amber-350">{row.payout}x</td>
              <td class="py-3 px-4 text-center font-mono">{row.implied.toFixed(1)}%</td>
              <td class="py-3 px-4 text-center font-mono">{(100/row.payout).toFixed(1)}%</td>
              <td class="py-3 px-4 text-center font-mono text-crimson-400">
                {((row.implied/100 - 0.5) * 100).toFixed(1)}%
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- House Perspective -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏦 The House Perspective</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Pricing Strategy</h3>
        <ul class="space-y-2 text-sm text-obsidian-300">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">1.</span>
            <span><strong>Estimate True Probability:</strong> Use models to predict actual over/under probability</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">2.</span>
            <span><strong>Add House Edge:</strong> Set payout so implied prob > true prob (from house's perspective)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">3.</span>
            <span><strong>Balance Book:</strong> Adjust to avoid one-sided liability</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">4.</span>
            <span><strong>Monitor Sharp Action:</strong> Re-price if sophisticated bettors find edge</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">EV in Product Design</h3>
        <div class="space-y-3">
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <span class="text-jade-400 font-semibold">Higher Payouts:</span>
            <span class="text-obsidian-300"> Attract users, increase volume. Risk: thin margins.</span>
          </div>
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <span class="text-amber-350 font-semibold">Lower Payouts:</span>
            <span class="text-obsidian-300"> Higher margin, lower volume. Risk: users leave.</span>
          </div>
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <span class="text-blue-400 font-semibold">Optimal Point:</span>
            <span class="text-obsidian-300"> Maximize revenue = price elasticity × margin</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Expected Value Calculator
calculate_ev &lt;- function(win_prob, payout, stake = 1) {'{'} 
  win_prob * (payout * stake) - (1 - win_prob) * stake
{'}'}

# Implied probability from payout
implied_prob &lt;- function(payout) 1 / payout

# House edge calculation
house_edge &lt;- function(true_prob, payout) {'{'} 
  implied &lt;- implied_prob(payout)
  implied - true_prob  # Positive = house wins
{'}'}

# Example
ev &lt;- calculate_ev(win_prob = {winProbability}, payout = {payout}, stake = {stake})
cat(sprintf("EV: $%.2f\n", ev))
cat(sprintf("ROI: %.2f%%\n", (ev / {stake}) * 100))
cat(sprintf("House edge: %.2f%%\n", house_edge({winProbability}, {payout}) * 100))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• EV = probability × payout − 1 (per unit stake)</li>
        <li>• House always sets negative EV for bettors</li>
        <li>• Implied probability = 1/payout tells you breakeven</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Long-run results converge to EV line</li>
        <li>• Edge = True Prob − Implied Prob</li>
        <li>• All pricing decisions stem from EV math</li>
      </ul>
    </div>
  </div>
</div>

