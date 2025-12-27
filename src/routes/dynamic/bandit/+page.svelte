<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG } from '$lib/utils/synthetic-data';

  // Arm parameters (true probabilities - hidden from algorithm)
  let arm1TrueProb = $state(0.08);
  let arm2TrueProb = $state(0.12);
  let arm3TrueProb = $state(0.05);
  let epsilon = $state(0.1);
  let totalPulls = $state(1000);

  // Thompson Sampling simulation
  const runSimulation = $derived(() => {
    const rng = createRNG(42);
    const arms = [
      { alpha: 1, beta: 1, trueProb: arm1TrueProb, pulls: 0, rewards: 0 },
      { alpha: 1, beta: 1, trueProb: arm2TrueProb, pulls: 0, rewards: 0 },
      { alpha: 1, beta: 1, trueProb: arm3TrueProb, pulls: 0, rewards: 0 }
    ];
    
    const regretHistory: number[] = [];
    const armPullHistory: number[][] = [[], [], []];
    let totalRegret = 0;
    const bestArm = Math.max(arm1TrueProb, arm2TrueProb, arm3TrueProb);

    for (let t = 0; t < totalPulls; t++) {
      // Sample from Beta distributions (Thompson Sampling)
      const samples = arms.map(a => betaSample(rng, a.alpha, a.beta));
      
      // Choose arm with highest sample (with epsilon exploration)
      let chosenArm: number;
      if (rng() < epsilon) {
        chosenArm = Math.floor(rng() * 3);
      } else {
        chosenArm = samples.indexOf(Math.max(...samples));
      }

      // Pull arm and observe reward
      const reward = rng() < arms[chosenArm].trueProb ? 1 : 0;
      
      // Update beliefs
      arms[chosenArm].alpha += reward;
      arms[chosenArm].beta += 1 - reward;
      arms[chosenArm].pulls++;
      arms[chosenArm].rewards += reward;

      // Track regret
      totalRegret += bestArm - arms[chosenArm].trueProb;
      
      if (t % 50 === 0 || t === totalPulls - 1) {
        regretHistory.push(totalRegret);
        arms.forEach((a, i) => armPullHistory[i].push(a.pulls));
      }
    }

    return { arms, regretHistory, armPullHistory, totalRegret };
  });

  // Beta distribution sample (approximation)
  function betaSample(rng: () => number, alpha: number, beta: number): number {
    // Use inverse CDF approximation for beta distribution
    const u = rng();
    // Simple approximation - for demo purposes
    const mean = alpha / (alpha + beta);
    const variance = (alpha * beta) / ((alpha + beta) ** 2 * (alpha + beta + 1));
    const std = Math.sqrt(variance);
    // Box-Muller for normal, then truncate
    const u1 = rng();
    const u2 = rng();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.max(0, Math.min(1, mean + z * std));
  }

  const timeLabels = $derived(
    Array.from({ length: Math.ceil(totalPulls / 50) + 1 }, (_, i) => String(i * 50))
  );

  // Estimated probabilities
  const estimatedProbs = $derived(
    runSimulation().arms.map(a => a.alpha / (a.alpha + a.beta))
  );

  // Algorithms comparison
  const algorithms = [
    { 
      name: 'ε-Greedy', 
      desc: 'Explore ε% of time, exploit best (1-ε)%',
      pros: 'Simple to implement',
      cons: 'Fixed exploration, not adaptive'
    },
    { 
      name: 'Thompson Sampling', 
      desc: 'Sample from posterior, choose highest',
      pros: 'Naturally adaptive, theoretically optimal',
      cons: 'Requires Bayesian framework'
    },
    { 
      name: 'UCB', 
      desc: 'Upper Confidence Bound - optimism in uncertainty',
      pros: 'Deterministic, strong guarantees',
      cons: 'Less practical for complex rewards'
    }
  ];
</script>

<svelte:head>
  <title>Multi-Armed Bandit | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Dynamic Pricing</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Multi-Armed Bandit</h1>
    <p class="section-subtitle max-w-3xl">
      Balance exploration vs exploitation for learning optimal pricing in real-time.
      Test different strategies while minimizing regret.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🎰 The Exploration-Exploitation Tradeoff</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">Exploitation</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Use current best option. Maximize immediate reward.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• "Play it safe with what works"</li>
          <li>• Risk: stuck on suboptimal arm</li>
          <li>• Example: Always use 1.9x payout</li>
        </ul>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Exploration</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Try alternatives to learn more. Sacrifice short-term for information.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• "Gather more data on options"</li>
          <li>• Risk: wasting resources on bad arms</li>
          <li>• Example: Test 2.1x on 10% of users</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">True Arm Probabilities</h3>
        <p class="text-xs text-obsidian-400 mb-4">(Hidden from algorithm)</p>
        <div class="space-y-4">
          <Slider bind:value={arm1TrueProb} min={0.01} max={0.2} step={0.01} label="Arm 1 (Payout A)" />
          <Slider bind:value={arm2TrueProb} min={0.01} max={0.2} step={0.01} label="Arm 2 (Payout B)" />
          <Slider bind:value={arm3TrueProb} min={0.01} max={0.2} step={0.01} label="Arm 3 (Payout C)" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Algorithm Settings</h3>
        <div class="space-y-4">
          <Slider bind:value={epsilon} min={0} max={0.3} step={0.01} label="Epsilon (exploration rate)" />
          <Slider bind:value={totalPulls} min={100} max={5000} step={100} label="Total Trials" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Results</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Total Regret</span>
            <span class="font-mono text-lg text-crimson-400">{runSimulation().totalRegret.toFixed(1)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Regret/Trial</span>
            <span class="font-mono text-obsidian-200">{(runSimulation().totalRegret / totalPulls).toFixed(4)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Best Arm Pulls</span>
            <span class="font-mono text-jade-400">
              {runSimulation().arms[
                [arm1TrueProb, arm2TrueProb, arm3TrueProb].indexOf(Math.max(arm1TrueProb, arm2TrueProb, arm3TrueProb))
              ].pulls}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Learned vs True -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Learned vs True Probabilities</h3>
        <div class="grid grid-cols-3 gap-4">
          {#each [0, 1, 2] as i}
            {@const sim = runSimulation()}
            {@const trueProb = [arm1TrueProb, arm2TrueProb, arm3TrueProb][i]}
            {@const estProb = estimatedProbs[i]}
            {@const isBest = trueProb === Math.max(arm1TrueProb, arm2TrueProb, arm3TrueProb)}
            <div class="p-4 rounded-lg {isBest ? 'bg-jade-500/10 border border-jade-500/30' : 'bg-obsidian-800/50'}">
              <div class="text-sm text-obsidian-400 mb-2">Arm {i + 1}</div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-obsidian-400">True:</span>
                <span class="font-mono text-obsidian-200">{(trueProb * 100).toFixed(1)}%</span>
              </div>
              <div class="flex justify-between text-xs mb-1">
                <span class="text-obsidian-400">Estimated:</span>
                <span class="font-mono text-amber-350">{(estProb * 100).toFixed(1)}%</span>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-obsidian-400">Pulls:</span>
                <span class="font-mono {isBest ? 'text-jade-400' : 'text-obsidian-300'}">{sim.arms[i].pulls}</span>
              </div>
              <div class="mt-2 h-2 bg-obsidian-800 rounded-full overflow-hidden">
                <div 
                  class="h-full {isBest ? 'bg-jade-500' : 'bg-amber-350'}"
                  style="width: {sim.arms[i].pulls / totalPulls * 100}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Regret Chart -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Cumulative Regret Over Time</h3>
        <div class="h-48">
          <LineChart 
            labels={timeLabels}
            datasets={[{
              label: 'Cumulative Regret',
              data: runSimulation().regretHistory,
              borderColor: '#dc2626',
              fill: true,
              backgroundColor: 'rgba(220, 38, 38, 0.1)'
            }]}
            xAxisLabel="Trial"
            yAxisLabel="Regret"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Regret = sum of (best arm reward - chosen arm reward). Good algorithms have sublinear regret.
        </p>
      </div>
    </div>
  </div>

  <!-- Algorithm Comparison -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔬 Bandit Algorithms</h2>
    <div class="grid md:grid-cols-3 gap-4">
      {#each algorithms as algo}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{algo.name}</h3>
          <p class="text-xs text-obsidian-300 mb-3">{algo.desc}</p>
          <div class="text-xs space-y-1">
            <div class="text-jade-400">✓ {algo.pros}</div>
            <div class="text-crimson-400">✗ {algo.cons}</div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Pricing Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💰 Pricing Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">What to Test</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Different payout multipliers (1.8x vs 1.9x vs 2.0x)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Hold rates by market type</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Promotional offers and bonuses</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>UI variations for conversion</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Why Bandits Beat A/B Tests</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Less regret—shift to winners faster</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Continuous learning, not fixed sample</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Handle changing environments</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Optimal for limited traffic</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Thompson Sampling for multi-armed bandit
thompson_sampling &lt;- function(true_probs, n_trials, epsilon = 0.1) {'{'} 
  n_arms &lt;- length(true_probs)
  alpha &lt;- rep(1, n_arms)  # Beta prior
  beta &lt;- rep(1, n_arms)
  pulls &lt;- rep(0, n_arms)
  rewards &lt;- rep(0, n_arms)
  
  for (t in 1:n_trials) {'{'} 
    # Sample from posterior
    samples &lt;- rbeta(n_arms, alpha, beta)
    
    # Epsilon-greedy exploration
    if (runif(1) &lt; epsilon) {'{'} 
      chosen &lt;- sample(n_arms, 1)
    {'}'} else {'{'} 
      chosen &lt;- which.max(samples)
    {'}'}
    
    # Observe reward
    reward &lt;- rbinom(1, 1, true_probs[chosen])
    
    # Update beliefs
    alpha[chosen] &lt;- alpha[chosen] + reward
    beta[chosen] &lt;- beta[chosen] + 1 - reward
    pulls[chosen] &lt;- pulls[chosen] + 1
    rewards[chosen] &lt;- rewards[chosen] + reward
  {'}'}
  
  return(list(pulls = pulls, rewards = rewards, 
              estimated = alpha / (alpha + beta)))
{'}'}

# Run simulation
result &lt;- thompson_sampling(c({arm1TrueProb}, {arm2TrueProb}, {arm3TrueProb}), {totalPulls}, {epsilon})
print(result)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Balance exploration vs exploitation</li>
        <li>• Thompson Sampling is Bayesian and adaptive</li>
        <li>• Minimize regret, not just find best arm</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Bandits beat A/B for limited traffic</li>
        <li>• Use for real-time pricing optimization</li>
        <li>• Algorithms converge to best arm over time</li>
      </ul>
    </div>
  </div>
</div>

