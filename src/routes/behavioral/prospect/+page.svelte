<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG } from '$lib/utils/synthetic-data';

  // Prospect Theory parameters
  let alpha = $state(0.88); // Diminishing sensitivity
  let lambda = $state(2.25); // Loss aversion
  let referencePoint = $state(0);

  // Value function: v(x) = x^α for gains, -λ(-x)^α for losses
  const valueFunction = $derived(() => {
    const points: number[] = [];
    for (let x = -100; x <= 100; x += 5) {
      const adjusted = x - referencePoint;
      let value: number;
      if (adjusted >= 0) {
        value = Math.pow(adjusted, alpha);
      } else {
        value = -lambda * Math.pow(-adjusted, alpha);
      }
      points.push(value);
    }
    return points;
  });

  const xLabels = $derived(
    Array.from({ length: 41 }, (_, i) => String(-100 + i * 5))
  );

  // Expected utility vs Expected value example
  let gambleAmount = $state(100);
  let winProb = $state(0.5);
  
  const expectedValue = $derived(gambleAmount * winProb - gambleAmount * (1 - winProb));
  
  // Prospect theory value
  const prospectValue = $derived(() => {
    const gainValue = Math.pow(gambleAmount, alpha);
    const lossValue = -lambda * Math.pow(gambleAmount, alpha);
    return winProb * gainValue + (1 - winProb) * lossValue;
  });

  // Key concepts
  const concepts = [
    {
      name: 'Loss Aversion',
      formula: 'Losses hurt 2-2.5x more than equivalent gains',
      example: 'Losing $100 feels worse than winning $100 feels good',
      implication: 'Users avoid risky bets even with +EV'
    },
    {
      name: 'Diminishing Sensitivity',
      formula: 'Value function is concave for gains, convex for losses',
      example: '$100→$200 feels bigger than $1000→$1100',
      implication: 'Small wins feel proportionally better'
    },
    {
      name: 'Reference Point',
      formula: 'Gains/losses evaluated vs reference, not absolute',
      example: 'Winning $50 after expecting to win $100 = loss',
      implication: 'Frame outcomes relative to expectations'
    }
  ];
</script>

<svelte:head>
  <title>Prospect Theory | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Behavioral Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Prospect Theory</h1>
    <p class="section-subtitle max-w-3xl">
      People feel losses 2x more than equivalent gains. Understanding loss aversion
      enables better payout structures and promotion design.
    </p>
  </div>

  <!-- Key Insight -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🧠 The Core Insight</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-6 bg-crimson-500/10 border border-crimson-500/30 rounded-xl text-center">
        <div class="text-4xl mb-3">😢</div>
        <div class="font-mono text-3xl text-crimson-400 mb-2">-$100</div>
        <div class="text-obsidian-300">Feels like losing</div>
        <div class="font-mono text-2xl text-crimson-400 mt-2">-225 utils</div>
      </div>
      <div class="p-6 bg-jade-500/10 border border-jade-500/30 rounded-xl text-center">
        <div class="text-4xl mb-3">😊</div>
        <div class="font-mono text-3xl text-jade-400 mb-2">+$100</div>
        <div class="text-obsidian-300">Feels like gaining</div>
        <div class="font-mono text-2xl text-jade-400 mt-2">+100 utils</div>
      </div>
    </div>
    <p class="mt-4 text-center text-sm text-obsidian-400">
      Loss aversion coefficient λ ≈ 2.25: losses hurt more than twice as much as equivalent gains please.
    </p>
  </div>

  <!-- Interactive Value Function -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Value Function Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={alpha} min={0.5} max={1} step={0.02} label="α (Sensitivity)" />
          <Slider bind:value={lambda} min={1} max={4} step={0.25} label="λ (Loss Aversion)" />
          <Slider bind:value={referencePoint} min={-50} max={50} step={5} label="Reference Point" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Current Settings</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Gain sensitivity</span>
            <span class="font-mono text-jade-400">{alpha.toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Loss multiplier</span>
            <span class="font-mono text-crimson-400">{lambda.toFixed(2)}x</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Break-even ratio</span>
            <span class="font-mono text-amber-350">Win ${(lambda * 100).toFixed(0)} to offset $100 loss</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Value Function Chart -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Prospect Theory Value Function</h3>
        <div class="h-64">
          <LineChart 
            labels={xLabels}
            datasets={[
              {
                label: 'Subjective Value',
                data: valueFunction(),
                borderColor: '#f5c542',
                fill: false
              },
              {
                label: 'Linear (Expected Utility)',
                data: xLabels.map(x => parseFloat(x) - referencePoint),
                borderColor: '#94a3b8',
                fill: false,
                borderDash: [5, 5]
              }
            ]}
            xAxisLabel="Objective Gain/Loss ($)"
            yAxisLabel="Subjective Value"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Note: Curve is steeper for losses (left) than gains (right). This asymmetry = loss aversion.
        </p>
      </div>

      <!-- Gamble Evaluation -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Gamble Evaluation</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <Slider bind:value={gambleAmount} min={10} max={500} step={10} label="Gamble Amount ($)" />
          <Slider bind:value={winProb} min={0.1} max={0.9} step={0.05} label="Win Probability" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Expected Value</div>
            <div class="font-mono text-xl {expectedValue >= 0 ? 'text-jade-400' : 'text-crimson-400'}">
              {expectedValue >= 0 ? '+' : ''}${expectedValue.toFixed(0)}
            </div>
            <div class="text-xs text-obsidian-400 mt-1">Rational: {expectedValue >= 0 ? 'Take it' : 'Pass'}</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Prospect Value</div>
            <div class="font-mono text-xl {prospectValue() >= 0 ? 'text-jade-400' : 'text-crimson-400'}">
              {prospectValue() >= 0 ? '+' : ''}{prospectValue().toFixed(0)}
            </div>
            <div class="text-xs text-obsidian-400 mt-1">Behavioral: {prospectValue() >= 0 ? 'Take it' : 'Pass'}</div>
          </div>
        </div>
        <p class="mt-4 text-sm text-obsidian-400">
          {#if expectedValue >= 0 && prospectValue() < 0}
            <span class="text-amber-350">⚠️ Loss aversion makes people reject this +EV gamble!</span>
          {:else if expectedValue < 0 && prospectValue() >= 0}
            <span class="text-amber-350">⚠️ Risk-seeking in loss domain makes people accept this -EV gamble!</span>
          {/if}
        </p>
      </div>
    </div>
  </div>

  <!-- Key Concepts -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📚 Key Concepts</h2>
    <div class="grid md:grid-cols-3 gap-6">
      {#each concepts as concept}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{concept.name}</h3>
          <p class="text-xs text-jade-400 mb-2">{concept.formula}</p>
          <p class="text-xs text-obsidian-300 mb-2">{concept.example}</p>
          <p class="text-xs text-obsidian-400 border-t border-obsidian-700 pt-2 mt-2">
            <span class="text-amber-350">Implication:</span> {concept.implication}
          </p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Pricing Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💰 Pricing Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Payout Design</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Smaller, more frequent wins feel better than rare big wins</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Insurance/cashout options appeal to loss-averse users</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Frame bonuses as gains, not reduced losses</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Promotion Design</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>"Win $20 free" beats "Get 20% back on losses"</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Loss rebates feel 2x as valuable as equivalent bonuses</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Streak bonuses leverage reference point shifts</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Prospect Theory value function
prospect_value &lt;- function(x, alpha = {alpha}, lambda = {lambda}, ref = 0) {'{'} 
  adjusted &lt;- x - ref
  ifelse(adjusted &gt;= 0,
         adjusted^alpha,
         -lambda * (-adjusted)^alpha)
{'}'}

# Evaluate a gamble
evaluate_gamble &lt;- function(win_amount, lose_amount, win_prob,
                            alpha = {alpha}, lambda = {lambda}) {'{'} 
  ev &lt;- win_prob * win_amount - (1 - win_prob) * lose_amount
  pv &lt;- win_prob * prospect_value(win_amount, alpha, lambda) +
        (1 - win_prob) * prospect_value(-lose_amount, alpha, lambda)
  
  list(expected_value = ev, prospect_value = pv,
       rational_choice = ev &gt;= 0, behavioral_choice = pv &gt;= 0)
{'}'}

# Example: 50/50 bet for $100
result &lt;- evaluate_gamble({gambleAmount}, {gambleAmount}, {winProb})
cat(sprintf("EV: $%.0f | PV: %.0f | Take it: %s\n",
            result$expected_value, result$prospect_value,
            result$behavioral_choice))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Losses hurt ~2.25x more than gains please</li>
        <li>• People reject +EV gambles due to loss aversion</li>
        <li>• Frame outcomes relative to reference points</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Frequent small wins &gt; rare big wins psychologically</li>
        <li>• Insurance/cashout taps into loss aversion</li>
        <li>• Loss rebates have outsized perceived value</li>
      </ul>
    </div>
  </div>
</div>

