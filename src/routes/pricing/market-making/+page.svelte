<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Market parameters
  let initialLine = $state(225.5);
  let trueTotal = $state(224);
  let overBets = $state(60);
  let underBets = $state(40);
  let sensitivity = $state(0.5);
  let showFlow = $state(true);

  // Calculate line adjustment based on bet flow
  const imbalance = $derived(overBets - underBets);
  const adjustedLine = $derived(initialLine + imbalance * sensitivity * 0.1);
  
  // Calculate implied probabilities
  const impliedOver = $derived(50 + imbalance * 0.25);
  const impliedUnder = $derived(100 - impliedOver);

  // Simulate bet flow over time
  const simulateBetFlow = $derived(() => {
    const rng = createRNG(42);
    const periods = 20;
    const overFlow: number[] = [];
    const underFlow: number[] = [];
    const lines: number[] = [];
    let cumOver = 0;
    let cumUnder = 0;
    let currentLine = initialLine;

    for (let t = 0; t < periods; t++) {
      // Random bet arrivals with bias toward true value
      const overArrivals = Math.round(5 + normalRandom(rng, currentLine > trueTotal ? -1 : 1, 3));
      const underArrivals = Math.round(5 + normalRandom(rng, currentLine < trueTotal ? -1 : 1, 3));
      
      cumOver += Math.max(0, overArrivals);
      cumUnder += Math.max(0, underArrivals);
      
      overFlow.push(cumOver);
      underFlow.push(cumUnder);
      
      // Adjust line based on flow
      const netFlow = cumOver - cumUnder;
      currentLine = initialLine + netFlow * sensitivity * 0.05;
      lines.push(currentLine);
    }

    return { overFlow, underFlow, lines };
  });

  const flowLabels = $derived(
    Array.from({ length: 20 }, (_, i) => `T${i + 1}`)
  );

  // Exposure calculation
  const overExposure = $derived(overBets * 100 * 1.9);
  const underExposure = $derived(underBets * 100 * 1.9);
  const netExposure = $derived(Math.abs(overExposure - underExposure));
  const balanceRatio = $derived(Math.min(overBets, underBets) / Math.max(overBets, underBets) * 100);

  // Market maker P&L scenarios
  const scenarios = $derived(() => {
    const overWins = overExposure - underBets * 100;
    const underWins = underExposure - overBets * 100;
    const balanced = (overBets + underBets) * 100 * 0.045; // 4.5% hold on total
    
    return { overWins, underWins, balanced };
  });
</script>

<svelte:head>
  <title>Market Making | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Pricing Framework</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Market Making</h1>
    <p class="section-subtitle max-w-3xl">
      Balance the book by adjusting prices based on order flow. The goal is to profit 
      from the spread while minimizing directional exposure.
    </p>
  </div>

  <!-- Core Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">⚖️ The Market Maker's Role</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">📥</div>
        <h3 class="text-amber-350 font-semibold mb-2">Take Both Sides</h3>
        <p class="text-sm text-obsidian-300">
          Offer odds on OVER and UNDER. Collect bets from both sides of the market.
        </p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">⚖️</div>
        <h3 class="text-amber-350 font-semibold mb-2">Balance Exposure</h3>
        <p class="text-sm text-obsidian-300">
          Move lines to attract bets on the lighter side. Goal: equal $ on both sides.
        </p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">💰</div>
        <h3 class="text-amber-350 font-semibold mb-2">Profit from Spread</h3>
        <p class="text-sm text-obsidian-300">
          With balanced book, keep the vig regardless of outcome. Minimize risk.
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Line Movement -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Market Settings</h3>
        <div class="space-y-4">
          <Slider bind:value={initialLine} min={210} max={240} step={0.5} label="Opening Line" />
          <Slider bind:value={trueTotal} min={210} max={240} step={0.5} label="True Total (hidden)" />
          <Slider bind:value={sensitivity} min={0.1} max={1} step={0.1} label="Line Sensitivity" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Bet Flow (# of bets)</h3>
        <div class="space-y-4">
          <Slider bind:value={overBets} min={0} max={100} step={5} label="OVER Bets" />
          <Slider bind:value={underBets} min={0} max={100} step={5} label="UNDER Bets" />
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg">
          <div class="flex justify-between items-center text-sm">
            <span class="text-obsidian-300">Net Flow</span>
            <span class="font-mono {imbalance > 0 ? 'text-jade-400' : imbalance < 0 ? 'text-crimson-400' : 'text-obsidian-300'}">
              {imbalance > 0 ? '+' : ''}{imbalance} OVER
            </span>
          </div>
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Line Movement</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Opening Line</span>
            <span class="font-mono text-lg text-obsidian-200">{initialLine.toFixed(1)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Current Line</span>
            <span class="font-mono text-xl text-amber-350">{adjustedLine.toFixed(1)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Movement</span>
            <span class="font-mono {adjustedLine > initialLine ? 'text-jade-400' : adjustedLine < initialLine ? 'text-crimson-400' : 'text-obsidian-300'}">
              {adjustedLine > initialLine ? '+' : ''}{(adjustedLine - initialLine).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Exposure Display -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Book Exposure</h3>
        <div class="grid grid-cols-3 gap-4 mb-6">
          <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">OVER Liability</div>
            <div class="font-mono text-xl text-jade-400">${overExposure.toLocaleString()}</div>
            <div class="text-xs text-obsidian-400">{overBets} bets × $190 payout</div>
          </div>
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">UNDER Liability</div>
            <div class="font-mono text-xl text-crimson-400">${underExposure.toLocaleString()}</div>
            <div class="text-xs text-obsidian-400">{underBets} bets × $190 payout</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Net Exposure</div>
            <div class="font-mono text-xl text-amber-350">${netExposure.toLocaleString()}</div>
            <div class="text-xs text-obsidian-400">Balance: {balanceRatio.toFixed(0)}%</div>
          </div>
        </div>

        <!-- Balance indicator -->
        <div class="relative h-8 bg-obsidian-800 rounded-full overflow-hidden">
          <div 
            class="absolute top-0 left-0 h-full bg-jade-500/50"
            style="width: {overBets / (overBets + underBets) * 100}%"
          ></div>
          <div 
            class="absolute top-0 right-0 h-full bg-crimson-500/50"
            style="width: {underBets / (overBets + underBets) * 100}%"
          ></div>
          <div class="absolute top-0 left-1/2 w-0.5 h-full bg-amber-350"></div>
          <div class="absolute inset-0 flex items-center justify-center text-xs font-mono text-obsidian-100">
            {(overBets / (overBets + underBets) * 100).toFixed(0)}% / {(underBets / (overBets + underBets) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <!-- P&L Scenarios -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">P&L Scenarios</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">If OVER Wins</div>
            <div class="font-mono text-xl {scenarios().overWins >= 0 ? 'text-jade-400' : 'text-crimson-400'}">
              {scenarios().overWins >= 0 ? '+' : ''}${scenarios().overWins.toLocaleString()}
            </div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">If UNDER Wins</div>
            <div class="font-mono text-xl {scenarios().underWins >= 0 ? 'text-jade-400' : 'text-crimson-400'}">
              {scenarios().underWins >= 0 ? '+' : ''}${scenarios().underWins.toLocaleString()}
            </div>
          </div>
          <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Balanced Book P&L</div>
            <div class="font-mono text-xl text-jade-400">
              +${scenarios().balanced.toLocaleString()}
            </div>
            <div class="text-xs text-obsidian-400">4.5% hold</div>
          </div>
        </div>
      </div>

      <!-- Simulated Flow -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Simulated Bet Flow & Line Movement</h3>
        <div class="h-48">
          <LineChart 
            labels={flowLabels}
            datasets={[
              {
                label: 'Over Bets (cumulative)',
                data: simulateBetFlow().overFlow,
                borderColor: '#34d399',
                fill: false
              },
              {
                label: 'Under Bets (cumulative)',
                data: simulateBetFlow().underFlow,
                borderColor: '#dc2626',
                fill: false
              }
            ]}
            xAxisLabel="Time Period"
            yAxisLabel="Cumulative Bets"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- AMM Comparison -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🔗 DeFi Parallel: AMMs</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Traditional Market Making</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>• Human/algo adjusts bid-ask based on flow</li>
          <li>• Move line to attract counter-bets</li>
          <li>• Goal: balanced book, profit from spread</li>
          <li>• Risk: directional exposure if unbalanced</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Automated Market Maker (AMM)</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>• Algorithm adjusts prices via bonding curve</li>
          <li>• x * y = k (constant product formula)</li>
          <li>• Goal: provide liquidity, earn fees</li>
          <li>• Risk: impermanent loss if prices diverge</li>
        </ul>
      </div>
    </div>
    <p class="mt-4 text-sm text-obsidian-400">
      <strong class="text-amber-350">Your hook:</strong> "I built AMM mechanics at Flipside—the same principles apply to sports market making."
    </p>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Market making simulation
simulate_market &lt;- function(opening_line, true_value, sensitivity = 0.5, n_periods = 20) {'{'} 
  current_line &lt;- opening_line
  over_bets &lt;- 0
  under_bets &lt;- 0
  lines &lt;- c(current_line)
  
  for (t in 1:n_periods) {'{'} 
    # Sharps bet toward true value
    over_flow &lt;- rpois(1, lambda = 5 + ifelse(current_line &gt; true_value, -1, 1))
    under_flow &lt;- rpois(1, lambda = 5 + ifelse(current_line &lt; true_value, -1, 1))
    
    over_bets &lt;- over_bets + over_flow
    under_bets &lt;- under_bets + under_flow
    
    # Adjust line based on imbalance
    imbalance &lt;- over_bets - under_bets
    current_line &lt;- opening_line + imbalance * sensitivity * 0.05
    lines &lt;- c(lines, current_line)
  {'}'}
  
  return(list(lines = lines, over = over_bets, under = under_bets))
{'}'}

# Run simulation
result &lt;- simulate_market({initialLine}, {trueTotal}, {sensitivity})
cat(sprintf("Final line: %.1f\n", tail(result$lines, 1)))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Goal: balanced book = riskless profit from vig</li>
        <li>• Move lines to attract bets on light side</li>
        <li>• Sharp money provides price discovery</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Line movement reveals market sentiment</li>
        <li>• Similar to DeFi AMM mechanics</li>
        <li>• Sensitivity controls reactivity to flow</li>
      </ul>
    </div>
  </div>
</div>

