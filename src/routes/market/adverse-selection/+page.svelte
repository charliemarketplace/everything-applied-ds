<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Adverse selection parameters
  let sharpPct = $state(10);
  let sharpEdge = $state(5);
  let publicEdge = $state(-2);
  let holdRate = $state(5);

  // Calculate who bets
  const sharpWillBet = $derived(sharpEdge > holdRate / 2);
  const publicWillBet = $derived(true); // Public bets regardless

  // Expected value by segment
  const sharpEV = $derived(sharpEdge - holdRate);
  const publicEV = $derived(publicEdge - holdRate);

  // Book's expected profit
  const bookProfit = $derived(() => {
    const sharpBets = sharpPct / 100;
    const publicBets = 1 - sharpBets;
    
    // Book loses to sharps, wins from public
    const sharpLoss = sharpBets * sharpEV * -1; // Book's perspective
    const publicWin = publicBets * publicEV * -1;
    
    return sharpLoss + publicWin;
  });

  // Simulate betting pool composition
  const poolComposition = $derived(() => {
    const sharps = sharpWillBet ? sharpPct : 0;
    const publicPct = 100 - sharps;
    
    return { sharps, publicPct };
  });

  // Adverse selection examples
  const examples = [
    { 
      market: 'Early Lines',
      problem: 'Sharps bet first, get best prices',
      mitigation: 'Lower limits on openers'
    },
    { 
      market: 'Injury News',
      problem: 'Informed bettors exploit slow line moves',
      mitigation: 'Faster line updates, API monitoring'
    },
    { 
      market: 'Prop Bets',
      problem: 'DFS players have research edge',
      mitigation: 'Wider spreads on props'
    },
    { 
      market: 'Live Betting',
      problem: 'Bettors watching game vs book with delay',
      mitigation: 'Faster feeds, wider spreads'
    }
  ];

  // Strategies to combat
  const strategies = [
    { name: 'Screen', desc: 'Limit/ban sharp bettors' },
    { name: 'Price', desc: 'Widen spreads on vulnerable markets' },
    { name: 'Speed', desc: 'Faster line updates reduce info edge' },
    { name: 'Pool', desc: 'Attract more recreational bettors' }
  ];
</script>

<svelte:head>
  <title>Adverse Selection | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Market Analysis</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Adverse Selection</h1>
    <p class="section-subtitle max-w-3xl">
      When informed bettors have an edge, they bet more. The book's customer
      pool becomes adversely selected—dominated by those who beat the line.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🎯 The Adverse Selection Problem</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <p class="text-sm text-obsidian-300 mb-3">
          If your prices are wrong, the people who know they're wrong will bet more.
          You end up trading disproportionately with informed counterparties.
        </p>
        <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
          <h4 class="text-crimson-400 font-semibold mb-2">The Lemons Problem</h4>
          <p class="text-xs text-obsidian-300">
            Like used car markets: only owners of bad cars want to sell at average price.
            In betting: only bettors with edge want to bet against you.
          </p>
        </div>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h4 class="text-amber-350 font-semibold mb-2">Who Bets?</h4>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li><span class="text-jade-400">Sharp (+EV):</span> Bets when edge &gt; cost</li>
          <li><span class="text-crimson-400">Public (-EV):</span> Bets for entertainment</li>
        </ul>
        <p class="text-xs text-obsidian-400 mt-3">
          If sharps see +EV, they load up. Book's mix shifts toward losers (for the book).
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Market Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={sharpPct} min={1} max={30} step={1} label="Sharp % of Pool" />
          <Slider bind:value={sharpEdge} min={0} max={10} step={0.5} label="Sharp Edge (%)" />
          <Slider bind:value={holdRate} min={2} max={10} step={0.5} label="Hold Rate (%)" />
        </div>
      </div>

      <div class="glass-card p-6 border-{bookProfit() > 0 ? 'jade-500' : 'crimson-500'}/30">
        <h3 class="font-display text-lg font-semibold {bookProfit() > 0 ? 'text-jade-400' : 'text-crimson-400'} mb-4">
          📊 Book's Expected Profit
        </h3>
        <div class="text-center">
          <div class="font-mono text-4xl {bookProfit() > 0 ? 'text-jade-400' : 'text-crimson-400'}">
            {bookProfit() >= 0 ? '+' : ''}{bookProfit().toFixed(2)}%
          </div>
          <div class="text-sm text-obsidian-400 mt-2">per dollar wagered</div>
        </div>
        <div class="mt-4 space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">From Sharps</span>
            <span class="font-mono text-crimson-400">{(-sharpPct / 100 * sharpEV).toFixed(2)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">From Public</span>
            <span class="font-mono text-jade-400">{(-(100 - sharpPct) / 100 * publicEV).toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Pool Composition -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Betting Pool Composition</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="p-4 bg-crimson-500/20 border border-crimson-500/30 rounded-lg text-center">
            <div class="text-xs text-crimson-400 mb-1">Sharps (you lose to)</div>
            <div class="font-mono text-3xl text-crimson-400">{poolComposition().sharps}%</div>
          </div>
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-jade-400 mb-1">Public (you win from)</div>
            <div class="font-mono text-3xl text-jade-400">{poolComposition().publicPct}%</div>
          </div>
        </div>
        <div class="h-8 bg-obsidian-800 rounded-full overflow-hidden flex">
          <div class="h-full bg-crimson-500" style="width: {poolComposition().sharps}%"></div>
          <div class="h-full bg-jade-500" style="width: {poolComposition().publicPct}%"></div>
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          {#if sharpPct > 15}
            ⚠️ High sharp concentration. Consider tightening limits or improving lines.
          {:else}
            ✓ Healthy mix. Public volume covers sharp losses.
          {/if}
        </p>
      </div>

      <!-- Examples -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Common Adverse Selection Scenarios</h3>
        <div class="grid grid-cols-2 gap-4">
          {#each examples as ex}
            <div class="p-4 bg-obsidian-800/50 rounded-lg">
              <h4 class="text-amber-350 font-semibold mb-1">{ex.market}</h4>
              <p class="text-xs text-crimson-400 mb-1">⚠️ {ex.problem}</p>
              <p class="text-xs text-jade-400">✓ {ex.mitigation}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Mitigation Strategies -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🛡️ Mitigation Strategies</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each strategies as strategy}
        <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
          <h3 class="text-amber-350 font-semibold mb-2">{strategy.name}</h3>
          <p class="text-xs text-obsidian-300">{strategy.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Adverse selection model
calculate_book_profit &lt;- function(sharp_pct, sharp_edge, public_edge, hold) {'{'} 
  sharp_ev &lt;- sharp_edge - hold
  public_ev &lt;- public_edge - hold
  
  # Book's profit is negative of bettor EV
  sharp_loss &lt;- sharp_pct / 100 * sharp_ev * -1
  public_win &lt;- (1 - sharp_pct / 100) * public_ev * -1
  
  return(sharp_loss + public_win)
{'}'}

# Find break-even sharp %
break_even_sharp &lt;- function(sharp_edge, public_edge, hold) {'{'} 
  # At break-even: sharp_loss = public_win
  # s * (sharp_edge - hold) = (1-s) * (hold - public_edge)
  s &lt;- (hold - public_edge) / (sharp_edge - public_edge)
  return(s * 100)
{'}'}

profit &lt;- calculate_book_profit({sharpPct}, {sharpEdge}, {publicEdge}, {holdRate})
cat(sprintf("Book profit: %+.2f%%\n", profit))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Adverse selection: informed bettors bet more</li>
        <li>• Book's pool skews toward those with edge</li>
        <li>• Must win enough from public to cover sharp losses</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Screen: limit sharp bettors</li>
        <li>• Price: widen spreads on vulnerable markets</li>
        <li>• Speed: faster updates reduce info asymmetry</li>
      </ul>
    </div>
  </div>
</div>

