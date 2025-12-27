<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import NumberInput from '$lib/components/widgets/NumberInput.svelte';

  // Conversion parameters
  let decimalOdds = $state(1.91);
  let americanOdds = $state(-110);
  let fractionalOdds = $state('10/11');

  // Derived calculations
  const impliedFromDecimal = $derived(1 / decimalOdds);
  const houseEdgeFromDecimal = $derived((impliedFromDecimal - 0.5) * 2); // Assuming fair = 50%

  // Convert between formats
  const decimalToAmerican = (decimal: number) => {
    if (decimal >= 2) {
      return Math.round((decimal - 1) * 100);
    } else {
      return Math.round(-100 / (decimal - 1));
    }
  };

  const americanToDecimal = (american: number) => {
    if (american > 0) {
      return american / 100 + 1;
    } else {
      return 100 / Math.abs(american) + 1;
    }
  };

  const decimalToFractional = (decimal: number) => {
    const profit = decimal - 1;
    // Simplify fraction (approximate)
    const denominator = 100;
    const numerator = Math.round(profit * denominator);
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const g = gcd(numerator, denominator);
    return `${numerator / g}/${denominator / g}`;
  };

  // Sync conversions
  $effect(() => {
    americanOdds = decimalToAmerican(decimalOdds);
  });

  // Payout comparison table
  const payoutExamples = [
    { type: 'Even Money', decimal: 2.0, american: '+100' },
    { type: 'Standard Vig', decimal: 1.91, american: '-110' },
    { type: 'Heavy Favorite', decimal: 1.25, american: '-400' },
    { type: 'Underdog', decimal: 3.0, american: '+200' },
    { type: 'Long Shot', decimal: 10.0, american: '+900' }
  ];
</script>

<svelte:head>
  <title>Implied Probability | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Pricing Framework</span>
      <span class="badge-jade">Fundamental</span>
    </div>
    <h1 class="section-title">Implied Probability</h1>
    <p class="section-subtitle max-w-3xl">
      Convert betting odds to probabilities. The implied probability reveals
      what the odds assume about win likelihood—and the house edge built in.
    </p>
  </div>

  <!-- Core Formula -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🔮 The Conversion Formula</h2>
    <div class="flex flex-col md:flex-row items-center gap-8">
      <div class="formula text-xl md:text-2xl">
        Implied Probability = 1 / Decimal Odds
      </div>
      <div class="flex-1 p-4 bg-obsidian-800/50 rounded-lg">
        <p class="text-sm text-obsidian-300">
          <strong class="text-amber-350">Example:</strong> 
          At 1.91x payout, implied probability = 1/1.91 = <span class="text-jade-400">52.4%</span>.
          For a true 50/50 bet, the extra 2.4% is the house edge.
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Converter -->
  <div class="grid lg:grid-cols-2 gap-6">
    <div class="glass-card p-6">
      <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Odds Converter</h3>
      <div class="space-y-6">
        <div>
          <Slider bind:value={decimalOdds} min={1.01} max={10} step={0.01} label="Decimal Odds" unit="x" />
        </div>
        
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Decimal</div>
            <div class="font-mono text-xl text-amber-350">{decimalOdds.toFixed(2)}</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">American</div>
            <div class="font-mono text-xl text-amber-350">
              {americanOdds > 0 ? '+' : ''}{americanOdds}
            </div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Fractional</div>
            <div class="font-mono text-xl text-amber-350">{decimalToFractional(decimalOdds)}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="glass-card p-6 border-amber-350/30">
      <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Implied Analysis</h3>
      <div class="space-y-4">
        <div class="flex justify-between items-center p-4 bg-obsidian-800/50 rounded-lg">
          <span class="text-obsidian-300">Implied Probability</span>
          <span class="font-mono text-2xl text-amber-350">{(impliedFromDecimal * 100).toFixed(2)}%</span>
        </div>
        
        <div class="flex justify-between items-center p-4 bg-obsidian-800/50 rounded-lg">
          <span class="text-obsidian-300">Breakeven Win Rate</span>
          <span class="font-mono text-lg text-jade-400">{(impliedFromDecimal * 100).toFixed(2)}%</span>
        </div>
        
        <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">House Edge (vs 50%)</span>
            <span class="font-mono text-lg text-crimson-400">{(houseEdgeFromDecimal * 100).toFixed(1)}%</span>
          </div>
          <p class="text-xs text-obsidian-400 mt-2">
            If true probability is 50%, the house keeps {(houseEdgeFromDecimal * 100).toFixed(1)}% on average.
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Odds Format Reference -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📋 Common Odds Reference</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-obsidian-700">
            <th class="text-left py-3 px-4 text-obsidian-400 font-medium">Description</th>
            <th class="text-center py-3 px-4 text-obsidian-400 font-medium">Decimal</th>
            <th class="text-center py-3 px-4 text-obsidian-400 font-medium">American</th>
            <th class="text-center py-3 px-4 text-obsidian-400 font-medium">Implied %</th>
            <th class="text-center py-3 px-4 text-obsidian-400 font-medium">$100 Profit</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-obsidian-800">
          {#each payoutExamples as row}
            <tr class="hover:bg-obsidian-800/30">
              <td class="py-3 px-4 text-obsidian-200">{row.type}</td>
              <td class="py-3 px-4 text-center font-mono text-amber-350">{row.decimal.toFixed(2)}</td>
              <td class="py-3 px-4 text-center font-mono text-obsidian-200">{row.american}</td>
              <td class="py-3 px-4 text-center font-mono text-jade-400">
                {(100 / row.decimal).toFixed(1)}%
              </td>
              <td class="py-3 px-4 text-center font-mono text-obsidian-200">
                ${((row.decimal - 1) * 100).toFixed(0)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Overround / Vig -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📈 Overround (Total Vig)</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <p class="text-sm text-obsidian-300">
          For a two-sided market (Over/Under), the overround is the sum of implied probabilities minus 100%:
        </p>
        <div class="formula">
          Overround = Σ(Implied Probs) - 100%
        </div>
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <p class="text-sm text-obsidian-300">
            <strong>Example:</strong> Over at 1.91 (52.4%) + Under at 1.91 (52.4%) = 104.7%<br>
            Overround = 4.7% (house edge split across both sides)
          </p>
        </div>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Why It Matters</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Higher overround = more house edge = worse for bettors</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Sharp bettors seek lowest vig markets</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>For pricing: balance vig against user retention</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- True vs Implied -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🎯 True Probability vs Implied</h2>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <h3 class="text-amber-350 font-semibold mb-2">True Probability</h3>
        <p class="text-sm text-obsidian-300">
          The actual likelihood of an outcome occurring. What your models predict.
        </p>
        <div class="mt-2 font-mono text-2xl text-amber-350">50.0%</div>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <h3 class="text-crimson-400 font-semibold mb-2">Implied Probability</h3>
        <p class="text-sm text-obsidian-300">
          What the odds suggest. Includes house edge baked in.
        </p>
        <div class="mt-2 font-mono text-2xl text-crimson-400">52.4%</div>
      </div>
      <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
        <h3 class="text-jade-400 font-semibold mb-2">Your Edge</h3>
        <p class="text-sm text-obsidian-300">
          When true > implied, you have +EV. This is the gap.
        </p>
        <div class="mt-2 font-mono text-2xl text-jade-400">-2.4%</div>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Odds conversion functions
implied_prob &lt;- function(decimal_odds) 1 / decimal_odds

decimal_to_american &lt;- function(decimal) {'{'} 
  ifelse(decimal &gt;= 2, 
         round((decimal - 1) * 100),
         round(-100 / (decimal - 1)))
{'}'}

american_to_decimal &lt;- function(american) {'{'} 
  ifelse(american &gt; 0,
         american / 100 + 1,
         100 / abs(american) + 1)
{'}'}

# Calculate overround
overround &lt;- function(odds_over, odds_under) {'{'} 
  implied_prob(odds_over) + implied_prob(odds_under) - 1
{'}'}

# Example
decimal &lt;- {decimalOdds}
cat(sprintf("Implied: %.2f%%\n", implied_prob(decimal) * 100))
cat(sprintf("American: %+d\n", decimal_to_american(decimal)))
cat(sprintf("Overround (vs 1.91 under): %.2f%%\n", overround(decimal, 1.91) * 100))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Implied probability = 1 / decimal odds</li>
        <li>• Overround measures total house edge</li>
        <li>• Standard vig (-110/-110) = 4.5% overround</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Edge = True probability - Implied probability</li>
        <li>• Positive edge → bet is +EV</li>
        <li>• Convert between formats to compare across books</li>
      </ul>
    </div>
  </div>
</div>

