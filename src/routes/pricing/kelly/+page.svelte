<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { kellyFraction, createRNG } from '$lib/utils/synthetic-data';

  // Kelly parameters
  let winProbability = $state(0.55);
  let decimalOdds = $state(2.0);
  let bankroll = $state(10000);
  let fractionalKelly = $state(0.5); // Half-Kelly is common
  let useFullKelly = $state(false);

  // Calculate Kelly
  const fullKelly = $derived(kellyFraction(winProbability, decimalOdds));
  const effectiveKelly = $derived(useFullKelly ? fullKelly : fullKelly * fractionalKelly);
  const betSize = $derived(Math.max(0, effectiveKelly * bankroll));
  const expectedValue = $derived(winProbability * decimalOdds - 1);
  const impliedProb = $derived(1 / decimalOdds);
  const edge = $derived(winProbability - impliedProb);

  // Boolean flags for template (avoid > in class directives)
  const isPositiveKelly = $derived(fullKelly > 0);
  const isPositiveEdge = $derived(edge > 0);
  const isPositiveEV = $derived(expectedValue > 0);

  // Growth simulation
  const numBets = 100;
  
  function simulateBankroll(kelly: number, seed = 42): number[] {
    const rng = createRNG(seed);
    let br = bankroll;
    const history = [br];
    
    for (let i = 0; i < numBets; i++) {
      const bet = Math.max(0, kelly * br);
      if (rng() < winProbability) {
        br += bet * (decimalOdds - 1);
      } else {
        br -= bet;
      }
      history.push(Math.max(0, br));
    }
    return history;
  }

  const fullKellyPath = $derived(simulateBankroll(fullKelly, 42));
  const halfKellyPath = $derived(simulateBankroll(fullKelly * 0.5, 42));
  const quarterKellyPath = $derived(simulateBankroll(fullKelly * 0.25, 42));
  const doubleKellyPath = $derived(simulateBankroll(fullKelly * 2, 42));

  const simulationLabels = $derived(
    Array.from({ length: numBets + 1 }, (_, i) => String(i))
  );

  const simulationDatasets = $derived([
    { label: 'Full Kelly', data: fullKellyPath, borderColor: '#f5c542', fill: false },
    { label: 'Half Kelly', data: halfKellyPath, borderColor: '#34d399', fill: false },
    { label: 'Quarter Kelly', data: quarterKellyPath, borderColor: '#60a5fa', fill: false },
    { label: 'Double Kelly (⚠️)', data: doubleKellyPath, borderColor: '#f87171', fill: false }
  ]);

  // Kelly curve data
  const kellyCurveLabels = $derived(
    Array.from({ length: 21 }, (_, i) => (i * 0.05).toFixed(2))
  );

  const expectedGrowthRate = $derived(
    kellyCurveLabels.map(f => {
      const fraction = parseFloat(f);
      // Expected log growth rate
      const growth = winProbability * Math.log(1 + fraction * (decimalOdds - 1)) + 
                    (1 - winProbability) * Math.log(1 - fraction);
      return isFinite(growth) ? growth * 100 : -100;
    })
  );
</script>

<svelte:head>
  <title>Kelly Criterion | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Pricing Framework</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Kelly Criterion</h1>
    <p class="section-subtitle max-w-3xl">
      The mathematically optimal bet sizing formula for maximizing long-term growth.
      Critical for bankroll management, exposure limits, and pricing margin optimization.
    </p>
  </div>

  <!-- Formula Card -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📐 The Kelly Formula</h2>
    <div class="flex flex-col md:flex-row items-center gap-8">
      <div class="formula text-xl md:text-2xl">
        f* = (bp - q) / b
      </div>
      <div class="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="p-3 bg-obsidian-800/50 rounded-lg">
          <span class="text-amber-350 font-mono font-bold">f*</span>
          <p class="text-obsidian-400">Optimal fraction of bankroll to bet</p>
        </div>
        <div class="p-3 bg-obsidian-800/50 rounded-lg">
          <span class="text-amber-350 font-mono font-bold">b</span>
          <p class="text-obsidian-400">Decimal odds - 1 (net odds)</p>
        </div>
        <div class="p-3 bg-obsidian-800/50 rounded-lg">
          <span class="text-amber-350 font-mono font-bold">p</span>
          <p class="text-obsidian-400">Probability of winning</p>
        </div>
        <div class="p-3 bg-obsidian-800/50 rounded-lg">
          <span class="text-amber-350 font-mono font-bold">q</span>
          <p class="text-obsidian-400">Probability of losing (1-p)</p>
        </div>
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
            bind:value={decimalOdds} 
            min={1.2} max={5.0} step={0.1} 
            label="Decimal Odds" 
            unit="x" 
          />
          <Slider 
            bind:value={bankroll} 
            min={1000} max={100000} step={1000} 
            label="Bankroll" 
            unit="$" 
          />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Kelly Adjustment</h3>
        <div class="space-y-4">
          <Toggle 
            bind:checked={useFullKelly} 
            label="Use Full Kelly" 
            description="Most bettors use fractional Kelly for safety" 
          />
          {#if !useFullKelly}
            <Slider 
              bind:value={fractionalKelly} 
              min={0.1} max={1.0} step={0.1} 
              label="Kelly Fraction" 
            />
          {/if}
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Results</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Full Kelly %</span>
            <span class="font-mono text-xl" class:text-jade-400={isPositiveKelly} class:text-crimson-400={!isPositiveKelly}>
              {(fullKelly * 100).toFixed(1)}%
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Effective Kelly %</span>
            <span class="font-mono text-xl text-amber-350">{(effectiveKelly * 100).toFixed(1)}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Bet Size</span>
            <span class="font-mono text-xl text-amber-350">${betSize.toFixed(0)}</span>
          </div>
          <hr class="border-obsidian-700">
          <div class="flex justify-between items-center text-sm">
            <span class="text-obsidian-400">Edge (p - implied)</span>
            <span class="font-mono" class:text-jade-400={isPositiveEdge} class:text-crimson-400={!isPositiveEdge}>
              {(edge * 100).toFixed(1)}%
            </span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-obsidian-400">Expected Value</span>
            <span class="font-mono" class:text-jade-400={isPositiveEV} class:text-crimson-400={!isPositiveEV}>
              {(expectedValue * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">
          Bankroll Simulation (100 bets)
        </h3>
        <div class="h-72">
          <LineChart 
            labels={simulationLabels}
            datasets={simulationDatasets}
            xAxisLabel="Bet Number"
            yAxisLabel="Bankroll ($)"
          />
        </div>
        <div class="mt-4 p-4 bg-obsidian-950 rounded-lg">
          <p class="text-sm text-obsidian-300">
            <strong class="text-amber-350">Key Insight:</strong> Full Kelly maximizes growth rate but has high variance. 
            Double Kelly can lead to ruin. Half Kelly provides ~75% of full Kelly's growth with much less volatility.
          </p>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">
          Expected Growth Rate vs Bet Size
        </h3>
        <div class="h-56">
          <LineChart 
            labels={kellyCurveLabels}
            datasets={[{
              label: 'Expected Log Growth Rate',
              data: expectedGrowthRate,
              borderColor: '#f5c542',
              fill: true
            }]}
            xAxisLabel="Bet Fraction"
            yAxisLabel="Growth Rate (%)"
          />
        </div>
        <p class="mt-4 text-sm text-obsidian-400">
          The peak of this curve is at <span class="text-amber-350 font-mono">{(fullKelly * 100).toFixed(1)}%</span> (Full Kelly).
          Betting more than Full Kelly actually decreases expected growth!
        </p>
      </div>
    </div>
  </div>

  <!-- Practical Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Sports Pricing Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">For the House (PrizePicks)</h3>
        <ul class="space-y-2 text-sm text-obsidian-300">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>Exposure Limits:</strong> Cap max bet on any single line using Kelly-based thinking</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>Risk Budget:</strong> Allocate risk capital across different games/sports optimally</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>Pricing Margins:</strong> Set vig/hold to ensure house always has positive Kelly</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">For Sharp Bettors (Detection)</h3>
        <ul class="space-y-2 text-sm text-obsidian-300">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>Syndicate Detection:</strong> Sharps bet Kelly-optimal amounts - watch for consistent sizing</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>Line Movement:</strong> Price adjust based on Kelly-implied edge of sharp action</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>CLV Tracking:</strong> Sharp bettors consistently beat closing lines</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Common Mistakes -->
  <div class="glass-card p-6 border-crimson-500/30">
    <h2 class="font-display text-xl font-semibold text-crimson-400 mb-4">⚠️ Common Pitfalls</h2>
    <div class="grid md:grid-cols-3 gap-4 text-sm">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="font-semibold text-obsidian-100 mb-2">Overestimating Edge</h3>
        <p class="text-obsidian-400">If your true probability estimate is wrong, Kelly can suggest dangerously large bets. Use fractional Kelly as insurance.</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="font-semibold text-obsidian-100 mb-2">Ignoring Correlation</h3>
        <p class="text-obsidian-400">Multiple bets on correlated outcomes require adjusted Kelly sizing to avoid over-concentration.</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="font-semibold text-obsidian-100 mb-2">Short-Term Variance</h3>
        <p class="text-obsidian-400">Kelly optimizes long-run growth. Short-term drawdowns can be severe even with correct Kelly.</p>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Kelly Criterion Calculator
kelly_fraction &lt;- function(win_prob, decimal_odds) {'{'} 
  b &lt;- decimal_odds - 1  # Net odds
  q &lt;- 1 - win_prob       # Loss probability
  
  f &lt;- (b * win_prob - q) / b
  max(0, f)  # Can't bet negative
{'}'}

# Simulate bankroll growth
simulate_kelly &lt;- function(win_prob, odds, bankroll, kelly_mult = 1, n_bets = 100) {'{'} 
  f &lt;- kelly_fraction(win_prob, odds) * kelly_mult
  history &lt;- numeric(n_bets + 1)
  history[1] &lt;- bankroll
  
  for (i in 1:n_bets) {'{'} 
    bet &lt;- f * history[i]
    if (runif(1) &lt; win_prob) {'{'} 
      history[i + 1] &lt;- history[i] + bet * (odds - 1)
    {'}'} else {'{'} 
      history[i + 1] &lt;- history[i] - bet
    {'}'}
  {'}'}
  history
{'}'}

# Example
f &lt;- kelly_fraction({winProbability}, {decimalOdds})
cat(sprintf("Optimal Kelly: %.1f%%\n", f * 100))
cat(sprintf("Bet size: $%.0f\n", f * {bankroll}))</code></pre>
  </div>
</div>

