<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';

  // Prisoner's Dilemma payoffs
  let cooperateCooperate = $state(3);
  let cooperateDefect = $state(0);
  let defectCooperate = $state(5);
  let defectDefect = $state(1);

  // Nash equilibrium check
  const isNashDefectDefect = $derived(
    defectDefect >= cooperateDefect && defectDefect >= defectCooperate
  );

  // Pricing game scenario
  let yourHold = $state(5);
  let competitorHold = $state(5);

  // Payoff calculation (simplified market share model)
  const calculatePayoff = (myHold: number, theirHold: number) => {
    const holdDiff = theirHold - myHold;
    const baseShare = 50;
    const shareGain = holdDiff * 5; // 5% share per 1% hold difference
    const myShare = Math.max(10, Math.min(90, baseShare + shareGain));
    const profit = myShare * myHold / 100; // Share × margin
    return { share: myShare, profit };
  };

  const yourPayoff = $derived(calculatePayoff(yourHold, competitorHold));
  const competitorPayoff = $derived(calculatePayoff(competitorHold, yourHold));

  // Game types
  const gameTypes = [
    {
      name: "Prisoner's Dilemma",
      desc: 'Both better off cooperating, but each has incentive to defect',
      example: 'Price wars: both cut prices, both lose margin',
      equilibrium: 'Defect-Defect (suboptimal)'
    },
    {
      name: 'Chicken',
      desc: 'Worst outcome if both stay aggressive',
      example: 'Promotional spending: who backs down first?',
      equilibrium: 'One aggressive, one passive'
    },
    {
      name: 'Coordination',
      desc: 'Both benefit from choosing same strategy',
      example: 'Market standards, feature matching',
      equilibrium: 'Multiple equilibria exist'
    }
  ];

  // Best response analysis
  const bestResponseYou = $derived(() => {
    // Given competitor's hold, what maximizes your profit?
    let bestHold = 2;
    let bestProfit = 0;
    for (let h = 2; h <= 10; h += 0.5) {
      const { profit } = calculatePayoff(h, competitorHold);
      if (profit > bestProfit) {
        bestProfit = profit;
        bestHold = h;
      }
    }
    return { hold: bestHold, profit: bestProfit };
  });
</script>

<svelte:head>
  <title>Game Theory | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Market Analysis</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Game Theory</h1>
    <p class="section-subtitle max-w-3xl">
      Strategic interaction between competitors. Understanding Nash equilibrium
      and best responses for pricing decisions in competitive markets.
    </p>
  </div>

  <!-- Prisoner's Dilemma -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🔒 The Prisoner's Dilemma</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th class="p-2"></th>
              <th class="p-2 text-jade-400">Competitor Cooperates</th>
              <th class="p-2 text-crimson-400">Competitor Defects</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th class="p-2 text-left text-jade-400">You Cooperate</th>
              <td class="p-2">
                <div class="w-20 h-20 bg-jade-500/20 border border-jade-500/30 rounded-lg flex items-center justify-center">
                  <div class="text-center">
                    <div class="font-mono text-jade-400">{cooperateCooperate}, {cooperateCooperate}</div>
                    <div class="text-xs text-obsidian-400">Both win</div>
                  </div>
                </div>
              </td>
              <td class="p-2">
                <div class="w-20 h-20 bg-crimson-500/20 border border-crimson-500/30 rounded-lg flex items-center justify-center">
                  <div class="text-center">
                    <div class="font-mono text-crimson-400">{cooperateDefect}, {defectCooperate}</div>
                    <div class="text-xs text-obsidian-400">You lose</div>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <th class="p-2 text-left text-crimson-400">You Defect</th>
              <td class="p-2">
                <div class="w-20 h-20 bg-amber-350/20 border border-amber-350/30 rounded-lg flex items-center justify-center">
                  <div class="text-center">
                    <div class="font-mono text-amber-350">{defectCooperate}, {cooperateDefect}</div>
                    <div class="text-xs text-obsidian-400">You win</div>
                  </div>
                </div>
              </td>
              <td class="p-2">
                <div class="w-20 h-20 bg-obsidian-800/50 rounded-lg flex items-center justify-center border-2 border-amber-350">
                  <div class="text-center">
                    <div class="font-mono text-amber-350">{defectDefect}, {defectDefect}</div>
                    <div class="text-xs text-amber-350">Nash Eq</div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">In Pricing Terms</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">Cooperate:</span>
            <span>Keep hold rates reasonable</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">Defect:</span>
            <span>Slash hold to steal market share</span>
          </li>
        </ul>
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <p class="text-sm text-obsidian-400">
            <strong class="text-amber-350">Insight:</strong> Both firms are better off with moderate hold (3,3), 
            but each has incentive to cut prices, leading to (1,1).
          </p>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Pricing Game -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Pricing Decisions</h3>
        <div class="space-y-4">
          <Slider bind:value={yourHold} min={2} max={10} step={0.5} label="Your Hold Rate (%)" />
          <Slider bind:value={competitorHold} min={2} max={10} step={0.5} label="Competitor Hold (%)" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Best Response</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Competitor's Hold</span>
            <span class="font-mono text-obsidian-200">{competitorHold}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Your Best Response</span>
            <span class="font-mono text-jade-400">{bestResponseYou().hold}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Expected Profit</span>
            <span class="font-mono text-amber-350">{bestResponseYou().profit.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Market Outcome -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Market Outcome</h3>
        <div class="grid grid-cols-2 gap-6">
          <div class="p-6 bg-jade-500/10 border border-jade-500/30 rounded-xl">
            <h4 class="text-jade-400 font-semibold mb-4">You</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-obsidian-300">Hold Rate</span>
                <span class="font-mono text-jade-400">{yourHold}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-obsidian-300">Market Share</span>
                <span class="font-mono text-jade-400">{yourPayoff.share.toFixed(0)}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-obsidian-300">Profit Score</span>
                <span class="font-mono text-xl text-jade-400">{yourPayoff.profit.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div class="p-6 bg-crimson-500/10 border border-crimson-500/30 rounded-xl">
            <h4 class="text-crimson-400 font-semibold mb-4">Competitor</h4>
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-obsidian-300">Hold Rate</span>
                <span class="font-mono text-crimson-400">{competitorHold}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-obsidian-300">Market Share</span>
                <span class="font-mono text-crimson-400">{competitorPayoff.share.toFixed(0)}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-obsidian-300">Profit Score</span>
                <span class="font-mono text-xl text-crimson-400">{competitorPayoff.profit.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 p-4 bg-obsidian-800/50 rounded-lg">
          <p class="text-sm text-obsidian-400">
            {#if yourHold < competitorHold}
              <span class="text-jade-400">You're undercutting:</span> Higher share, lower margin per bet.
            {:else if yourHold > competitorHold}
              <span class="text-crimson-400">Competitor undercutting:</span> They're taking share with lower prices.
            {:else}
              <span class="text-amber-350">Matched pricing:</span> Equal share, competing on other dimensions.
            {/if}
          </p>
        </div>
      </div>

      <!-- Game Types -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Common Game Structures</h3>
        <div class="grid grid-cols-3 gap-4">
          {#each gameTypes as game}
            <div class="p-4 bg-obsidian-800/50 rounded-lg">
              <h4 class="text-amber-350 font-semibold mb-2">{game.name}</h4>
              <p class="text-xs text-obsidian-300 mb-2">{game.desc}</p>
              <p class="text-xs text-obsidian-400 mb-2">{game.example}</p>
              <p class="text-xs text-jade-400">{game.equilibrium}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Strategic Considerations -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">♟️ Strategic Considerations</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Competitive Dynamics</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Monitor competitor pricing in real-time</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Consider long-term reputation effects</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Repeated games allow for cooperation</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Differentiation can escape price wars</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Signaling & Commitment</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Price matching guarantees signal commitment</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Public pricing = credible commitment</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Promotional "shots across the bow"</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Tit-for-tat builds cooperation</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Game theory payoff analysis
calculate_payoff &lt;- function(my_hold, their_hold) {'{'} 
  hold_diff &lt;- their_hold - my_hold
  base_share &lt;- 50
  share_gain &lt;- hold_diff * 5  # 5% share per 1% hold diff
  my_share &lt;- pmax(10, pmin(90, base_share + share_gain))
  profit &lt;- my_share * my_hold / 100
  return(list(share = my_share, profit = profit))
{'}'}

# Find best response
best_response &lt;- function(their_hold) {'{'} 
  holds &lt;- seq(2, 10, by = 0.5)
  profits &lt;- sapply(holds, function(h) calculate_payoff(h, their_hold)$profit)
  best_idx &lt;- which.max(profits)
  return(list(hold = holds[best_idx], profit = profits[best_idx]))
{'}'}

# Nash equilibrium search
find_nash &lt;- function() {'{'} 
  for (h1 in seq(2, 10, by = 0.5)) {'{'} 
    for (h2 in seq(2, 10, by = 0.5)) {'{'} 
      br1 &lt;- best_response(h2)$hold
      br2 &lt;- best_response(h1)$hold
      if (h1 == br1 && h2 == br2) return(c(h1, h2))
    {'}'}
  {'}'}
{'}'}</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Nash equilibrium: no one benefits from changing</li>
        <li>• Price wars often lead to lose-lose outcomes</li>
        <li>• Best response depends on competitor actions</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Differentiation can escape price competition</li>
        <li>• Repeated games allow cooperation to emerge</li>
        <li>• Signaling and commitment matter</li>
      </ul>
    </div>
  </div>
</div>

