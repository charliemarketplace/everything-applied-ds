<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';

  // Vig parameters
  let trueProb = $state(50);
  let vigPercent = $state(4.5);
  let betAmount = $state(100);

  // Calculate implied odds with vig
  const impliedProbOver = $derived(trueProb / 100 + vigPercent / 200);
  const impliedProbUnder = $derived((100 - trueProb) / 100 + vigPercent / 200);
  
  const decimalOddsOver = $derived(1 / impliedProbOver);
  const decimalOddsUnder = $derived(1 / impliedProbUnder);
  
  const americanOddsOver = $derived(
    decimalOddsOver >= 2 
      ? Math.round((decimalOddsOver - 1) * 100) 
      : Math.round(-100 / (decimalOddsOver - 1))
  );
  const americanOddsUnder = $derived(
    decimalOddsUnder >= 2 
      ? Math.round((decimalOddsUnder - 1) * 100) 
      : Math.round(-100 / (decimalOddsUnder - 1))
  );

  // Calculate overround
  const overround = $derived((impliedProbOver + impliedProbUnder - 1) * 100);

  // Expected house profit
  const houseProfit = $derived(betAmount * (vigPercent / 100));

  // Payout comparison
  const fairPayout = $derived(betAmount * (100 / trueProb));
  const actualPayout = $derived(betAmount * decimalOddsOver);
  const payoutDiff = $derived(fairPayout - actualPayout);

  // Vig impact chart - how hold varies with vig
  const vigLevels = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15];
  const holdByVig = $derived(
    vigLevels.map(v => ({
      vig: v,
      hold: v,
      impliedOver: 50 + v / 2,
      impliedUnder: 50 + v / 2
    }))
  );

  // Competitor comparison
  const competitors = [
    { name: 'Sharp Book', vig: 2.5, color: '#34d399' },
    { name: 'Standard', vig: 4.5, color: '#f5c542' },
    { name: 'Retail', vig: 6.0, color: '#f87171' },
    { name: 'High Margin', vig: 10.0, color: '#dc2626' }
  ];

  function getVigClass(vig: number): string {
    if (vig <= 3) return 'text-jade-400';
    if (vig <= 5) return 'text-amber-350';
    if (vig <= 8) return 'text-orange-400';
    return 'text-crimson-400';
  }
</script>

<svelte:head>
  <title>Vig / Juice / Hold | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Pricing Framework</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Vig / Juice / Hold</h1>
    <p class="section-subtitle max-w-3xl">
      The house edge built into pricing. Understanding how to balance profitability
      with user experience and competitive positioning.
    </p>
  </div>

  <!-- Terminology -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📖 Terminology</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Vig (Vigorish)</h3>
        <p class="text-sm text-obsidian-300">
          The commission charged by the house. A $110 to win $100 bet has 10% vig on the profit.
        </p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Juice</h3>
        <p class="text-sm text-obsidian-300">
          Same as vig. "The juice is -110" means you pay $110 to win $100.
        </p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Hold</h3>
        <p class="text-sm text-obsidian-300">
          The percentage of total wagered that the house keeps. Also called the "overround" or "margin."
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Calculator -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Market Settings</h3>
        <div class="space-y-4">
          <Slider bind:value={trueProb} min={20} max={80} step={1} label="True Probability (Over)" unit="%" />
          <Slider bind:value={vigPercent} min={0} max={15} step={0.5} label="Total Vig/Hold" unit="%" />
          <Slider bind:value={betAmount} min={10} max={1000} step={10} label="Bet Amount" unit="$" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 House Edge</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Overround</span>
            <span class="font-mono text-lg {getVigClass(overround)}">{overround.toFixed(1)}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Expected Profit</span>
            <span class="font-mono text-lg text-jade-400">${houseProfit.toFixed(2)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Bettor Disadvantage</span>
            <span class="font-mono text-lg text-crimson-400">${payoutDiff.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Odds Display -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Implied Odds (with Vig)</h3>
        <div class="grid grid-cols-2 gap-6">
          <div class="p-6 bg-jade-500/10 border border-jade-500/30 rounded-xl text-center">
            <div class="text-sm text-obsidian-400 mb-2">OVER</div>
            <div class="font-mono text-3xl text-jade-400 mb-2">
              {americanOddsOver > 0 ? '+' : ''}{americanOddsOver}
            </div>
            <div class="text-sm text-obsidian-300">
              Implied: {(impliedProbOver * 100).toFixed(1)}%
            </div>
            <div class="text-xs text-obsidian-400">
              True: {trueProb}% | Vig bump: +{(impliedProbOver * 100 - trueProb).toFixed(1)}%
            </div>
          </div>
          <div class="p-6 bg-crimson-500/10 border border-crimson-500/30 rounded-xl text-center">
            <div class="text-sm text-obsidian-400 mb-2">UNDER</div>
            <div class="font-mono text-3xl text-crimson-400 mb-2">
              {americanOddsUnder > 0 ? '+' : ''}{americanOddsUnder}
            </div>
            <div class="text-sm text-obsidian-300">
              Implied: {(impliedProbUnder * 100).toFixed(1)}%
            </div>
            <div class="text-xs text-obsidian-400">
              True: {100 - trueProb}% | Vig bump: +{(impliedProbUnder * 100 - (100 - trueProb)).toFixed(1)}%
            </div>
          </div>
        </div>
        <div class="mt-4 p-4 bg-obsidian-800/50 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Total Implied</span>
            <span class="font-mono text-lg text-amber-350">
              {((impliedProbOver + impliedProbUnder) * 100).toFixed(1)}%
            </span>
          </div>
          <p class="text-xs text-obsidian-400 mt-1">
            Fair market = 100%. Anything over 100% is the house edge.
          </p>
        </div>
      </div>

      <!-- Payout Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Payout Impact</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Fair Payout (0% vig)</div>
            <div class="font-mono text-xl text-jade-400">${fairPayout.toFixed(2)}</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Actual Payout ({vigPercent}% vig)</div>
            <div class="font-mono text-xl text-amber-350">${actualPayout.toFixed(2)}</div>
          </div>
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Bettor Loses</div>
            <div class="font-mono text-xl text-crimson-400">${payoutDiff.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Competitor Comparison -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏁 Competitive Landscape</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each competitors as comp}
        <div class="p-4 rounded-lg border border-obsidian-700 hover:border-obsidian-500 transition-colors">
          <h3 class="font-semibold text-obsidian-100 mb-2">{comp.name}</h3>
          <div class="font-mono text-2xl mb-2" style="color: {comp.color}">{comp.vig}%</div>
          <div class="text-xs text-obsidian-400">
            -110/-110 → -{Math.round(100 + comp.vig * 11 / 2)}/{Math.round(100 + comp.vig * 11 / 2)}
          </div>
        </div>
      {/each}
    </div>
    <p class="mt-4 text-sm text-obsidian-400">
      <strong class="text-amber-350">Trade-off:</strong> Lower vig attracts sharp bettors and volume, 
      but reduces per-bet profit. Higher vig maximizes profit per bet but loses price-sensitive customers.
    </p>
  </div>

  <!-- Vig Setting Strategy -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">⚖️ Vig Optimization</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">When to Lower Vig</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>High-volume markets (NFL, NBA primetime)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Attracting sharp money for price discovery</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Competitive markets with many alternatives</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Building user acquisition and retention</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">When to Raise Vig</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">→</span>
            <span>Exotic/niche markets (lower volume)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">→</span>
            <span>Uncertain pricing (injury news, weather)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">→</span>
            <span>High-correlation parlay combinations</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">→</span>
            <span>One-sided action requiring balance</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calculate vig/hold from odds
calculate_hold &lt;- function(odds_over, odds_under) {'{'} 
  implied_over &lt;- 1 / odds_over
  implied_under &lt;- 1 / odds_under
  hold &lt;- (implied_over + implied_under - 1) * 100
  return(hold)
{'}'}

# Remove vig to get true probabilities
remove_vig &lt;- function(odds_over, odds_under) {'{'} 
  implied_over &lt;- 1 / odds_over
  implied_under &lt;- 1 / odds_under
  total &lt;- implied_over + implied_under
  
  true_over &lt;- implied_over / total
  true_under &lt;- implied_under / total
  return(list(over = true_over, under = true_under))
{'}'}

# Add vig to true probability
add_vig &lt;- function(true_prob, total_vig) {'{'} 
  # Split vig evenly
  implied &lt;- true_prob + total_vig / 2 / 100
  decimal_odds &lt;- 1 / implied
  return(decimal_odds)
{'}'}

# Example
hold &lt;- calculate_hold({decimalOddsOver.toFixed(4)}, {decimalOddsUnder.toFixed(4)})
cat(sprintf("Hold: %.2f%%\n", hold))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Standard -110/-110 = 4.5% hold</li>
        <li>• Overround = sum of implied probs - 100%</li>
        <li>• Higher vig = more profit per bet, less volume</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Sharp books run 2-3%, retail up to 10%+</li>
        <li>• Vig is split across both sides of market</li>
        <li>• Remove vig to calculate true probabilities</li>
      </ul>
    </div>
  </div>
</div>

