<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG } from '$lib/utils/synthetic-data';

  // Transition probabilities
  let winToWin = $state(0.6);
  let loseToLose = $state(0.55);

  // Derived probabilities
  const winToLose = $derived(1 - winToWin);
  const loseToWin = $derived(1 - loseToLose);

  // Steady state calculation
  const steadyState = $derived(() => {
    const pWin = loseToWin / (winToLose + loseToWin);
    const pLose = winToLose / (winToLose + loseToWin);
    return { win: pWin * 100, lose: pLose * 100 };
  });

  // Simulate sequence
  const simulation = $derived(() => {
    const rng = createRNG(42);
    const steps = 50;
    const states: number[] = [rng() < 0.5 ? 1 : 0]; // 1 = win, 0 = lose
    const cumWins: number[] = [states[0]];
    
    for (let s = 1; s < steps; s++) {
      const prev = states[s - 1];
      let next: number;
      
      if (prev === 1) {
        next = rng() < winToWin ? 1 : 0;
      } else {
        next = rng() < loseToWin ? 1 : 0;
      }
      
      states.push(next);
      cumWins.push(cumWins[s - 1] + next);
    }
    
    return { states, cumWins, winRate: cumWins[steps - 1] / steps * 100 };
  });

  const stepLabels = $derived(Array.from({ length: 50 }, (_, i) => String(i + 1)));

  // Sports applications
  const applications = [
    { name: 'Hot Streaks', desc: 'Model probability of continuing winning/losing streak' },
    { name: 'Injury Status', desc: 'Healthy → Injured → Out transition probabilities' },
    { name: 'Game Flow', desc: 'Leading → Close → Trailing state transitions' },
    { name: 'User Activity', desc: 'Active → Churned → Reactivated states' }
  ];
</script>

<svelte:head>
  <title>Markov Chains | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Core Statistical Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Markov Chains</h1>
    <p class="section-subtitle max-w-3xl">
      Model state transitions where the future depends only on the current state.
      Perfect for streaks, game flow, and user behavior modeling.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Markov Property</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <div class="formula text-lg mb-4">P(X_n+1 | X_n, X_n-1, ...) = P(X_n+1 | X_n)</div>
        <p class="text-sm text-obsidian-300 mb-3">
          The next state depends <strong>only</strong> on the current state, not on history.
          "Memoryless" property simplifies many real-world models.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Win/Lose streaks</li>
          <li>• Game momentum</li>
          <li>• User engagement states</li>
        </ul>
      </div>
      <div class="overflow-x-auto">
        <h4 class="text-amber-350 font-semibold mb-2">Transition Matrix</h4>
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-obsidian-700">
              <th class="p-2 text-obsidian-400"></th>
              <th class="p-2 text-center text-jade-400">To: Win</th>
              <th class="p-2 text-center text-crimson-400">To: Lose</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-obsidian-800">
              <td class="p-2 text-jade-400">From: Win</td>
              <td class="p-2 text-center font-mono text-jade-400">{winToWin.toFixed(2)}</td>
              <td class="p-2 text-center font-mono text-obsidian-300">{winToLose.toFixed(2)}</td>
            </tr>
            <tr>
              <td class="p-2 text-crimson-400">From: Lose</td>
              <td class="p-2 text-center font-mono text-obsidian-300">{loseToWin.toFixed(2)}</td>
              <td class="p-2 text-center font-mono text-crimson-400">{loseToLose.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Transition Probabilities</h3>
        <div class="space-y-4">
          <Slider bind:value={winToWin} min={0.3} max={0.9} step={0.05} label="P(Win → Win)" />
          <Slider bind:value={loseToLose} min={0.3} max={0.9} step={0.05} label="P(Lose → Lose)" />
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-xs text-obsidian-400">
          <p>Higher P(Win→Win) = stronger hot streaks</p>
          <p>Higher P(Lose→Lose) = harder to break slumps</p>
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Steady State</h3>
        <p class="text-xs text-obsidian-400 mb-3">
          Long-run probabilities (infinite time):
        </p>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="font-mono text-2xl text-jade-400">{steadyState().win.toFixed(1)}%</div>
            <div class="text-xs text-obsidian-400">Win</div>
          </div>
          <div class="p-4 bg-crimson-500/20 border border-crimson-500/30 rounded-lg text-center">
            <div class="font-mono text-2xl text-crimson-400">{steadyState().lose.toFixed(1)}%</div>
            <div class="text-xs text-obsidian-400">Lose</div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- State Sequence -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Simulated State Sequence</h3>
        <div class="flex flex-wrap gap-1 mb-4">
          {#each simulation().states as state, i}
            <div 
              class="w-6 h-6 rounded flex items-center justify-center text-xs font-mono
                {state === 1 ? 'bg-jade-500/50 text-jade-400' : 'bg-crimson-500/50 text-crimson-400'}"
              title="Step {i + 1}"
            >
              {state === 1 ? 'W' : 'L'}
            </div>
          {/each}
        </div>
        <div class="text-sm text-obsidian-400">
          Observed Win Rate: <span class="font-mono text-amber-350">{simulation().winRate.toFixed(1)}%</span>
          vs Steady State: <span class="font-mono text-jade-400">{steadyState().win.toFixed(1)}%</span>
        </div>
      </div>

      <!-- Cumulative Chart -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Cumulative Wins Over Time</h3>
        <div class="h-48">
          <LineChart 
            labels={stepLabels}
            datasets={[{
              label: 'Cumulative Wins',
              data: simulation().cumWins,
              borderColor: '#34d399',
              fill: true,
              backgroundColor: 'rgba(52, 211, 153, 0.1)'
            }]}
            xAxisLabel="Step"
            yAxisLabel="Total Wins"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Sports Betting Applications</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each applications as app}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{app.name}</h3>
          <p class="text-xs text-obsidian-300">{app.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Markov chain simulation
library(markovchain)

# Define transition matrix
tm &lt;- matrix(c({winToWin}, {winToLose}, {loseToWin}, {loseToLose}), 
             nrow = 2, byrow = TRUE)
rownames(tm) &lt;- colnames(tm) &lt;- c("Win", "Lose")

# Create Markov chain
mc &lt;- new("markovchain", transitionMatrix = tm)

# Steady state
steady &lt;- steadyStates(mc)
cat(sprintf("Steady state: Win=%.1f%%, Lose=%.1f%%\n", 
            steady[1] * 100, steady[2] * 100))

# Simulate
sim &lt;- rmarkovchain(n = 50, mc, t0 = "Win")
table(sim) / length(sim)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Markov: next state depends only on current</li>
        <li>• Transition matrix captures all probabilities</li>
        <li>• Steady state = long-run distribution</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Model streaks, game flow, user states</li>
        <li>• Estimate streak/slump probabilities</li>
        <li>• Foundation for more complex models</li>
      </ul>
    </div>
  </div>
</div>

