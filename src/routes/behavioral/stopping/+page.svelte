<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Secretary problem parameters
  let numCandidates = $state(20);
  let lookPercent = $state(37);

  // Simulate secretary problem
  const simulate = $derived(() => {
    const rng = createRNG(42);
    const trials = 1000;
    const lookN = Math.floor(numCandidates * lookPercent / 100);
    
    let wins = 0;
    
    for (let t = 0; t < trials; t++) {
      // Generate random candidate qualities
      const candidates = Array.from({ length: numCandidates }, () => rng());
      const bestIdx = candidates.indexOf(Math.max(...candidates));
      
      // Look phase: observe first lookN, record best
      const lookBest = Math.max(...candidates.slice(0, lookN));
      
      // Leap phase: pick first candidate better than lookBest
      let picked = -1;
      for (let i = lookN; i < numCandidates; i++) {
        if (candidates[i] > lookBest) {
          picked = i;
          break;
        }
      }
      
      // If no one picked, take the last
      if (picked === -1) picked = numCandidates - 1;
      
      if (picked === bestIdx) wins++;
    }
    
    return wins / trials * 100;
  });

  // Optimal stopping rule
  const optimalLook = $derived(100 / Math.E); // ~37%
  const optimalSuccessRate = $derived(100 / Math.E); // ~37%

  // Generate success rate curve
  const successCurve = $derived(() => {
    const rng = createRNG(42);
    const trials = 500;
    const percents: number[] = [];
    const rates: number[] = [];
    
    for (let pct = 5; pct <= 80; pct += 5) {
      const lookN = Math.floor(numCandidates * pct / 100);
      let wins = 0;
      
      for (let t = 0; t < trials; t++) {
        const candidates = Array.from({ length: numCandidates }, () => rng());
        const bestIdx = candidates.indexOf(Math.max(...candidates));
        const lookBest = Math.max(...candidates.slice(0, Math.max(1, lookN)));
        
        let picked = -1;
        for (let i = lookN; i < numCandidates; i++) {
          if (candidates[i] > lookBest) { picked = i; break; }
        }
        if (picked === -1) picked = numCandidates - 1;
        if (picked === bestIdx) wins++;
      }
      
      percents.push(pct);
      rates.push(wins / trials * 100);
    }
    
    return { percents, rates };
  });

  // Betting applications
  const applications = [
    { scenario: 'Line Shopping', rule: 'Check 37% of books, then take first that beats best seen' },
    { scenario: 'Player Selection', rule: 'Evaluate 37% of options, then pick first above threshold' },
    { scenario: 'Cashout Decision', rule: 'Wait until 37% of game, then cashout if value exceeds best prior' },
    { scenario: 'Season Betting', rule: 'Observe 37% of season, then bet when pattern beats baseline' }
  ];
</script>

<svelte:head>
  <title>Optimal Stopping | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Behavioral Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Optimal Stopping</h1>
    <p class="section-subtitle max-w-3xl">
      The 37% rule: explore first, then commit to the first option that beats your best.
      Mathematically optimal strategy for sequential decision-making.
    </p>
  </div>

  <!-- The Problem -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🎯 The Secretary Problem</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <p class="text-sm text-obsidian-300 mb-3">
          You must hire one candidate from N applicants. You interview them one at a time,
          and must decide immediately (accept or reject forever). How do you maximize your
          chance of picking the best?
        </p>
        <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg">
          <h4 class="text-amber-350 font-semibold mb-2">The 37% Rule</h4>
          <ol class="text-sm text-obsidian-300 space-y-1">
            <li>1. <strong>Look:</strong> Reject the first ~37% of candidates</li>
            <li>2. <strong>Note:</strong> Record the best you've seen</li>
            <li>3. <strong>Leap:</strong> Pick the first one who beats that benchmark</li>
          </ol>
        </div>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h4 class="text-amber-350 font-semibold mb-2">Why 37%?</h4>
        <div class="formula text-lg mb-2">1/e ≈ 36.8%</div>
        <p class="text-sm text-obsidian-300">
          This is the mathematically optimal explore/exploit boundary.
          It gives you a ~37% chance of picking the best candidate.
        </p>
        <p class="text-xs text-obsidian-400 mt-2">
          Better than guessing (1/N) and better than any other fixed rule.
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={numCandidates} min={5} max={50} step={1} label="Number of Options" />
          <Slider bind:value={lookPercent} min={5} max={80} step={1} label="Look/Explore Phase (%)" />
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Reject first</span>
            <span class="font-mono text-amber-350">{Math.floor(numCandidates * lookPercent / 100)} candidates</span>
          </div>
          <div class="flex justify-between mt-1">
            <span class="text-obsidian-300">Then pick best</span>
            <span class="font-mono text-jade-400">from remaining {numCandidates - Math.floor(numCandidates * lookPercent / 100)}</span>
          </div>
        </div>
      </div>

      <div class="glass-card p-6 border-{Math.abs(lookPercent - 37) < 5 ? 'jade-500' : 'amber-350'}/30">
        <h3 class="font-display text-lg font-semibold {Math.abs(lookPercent - 37) < 5 ? 'text-jade-400' : 'text-amber-350'} mb-4">
          📊 Simulation Results
        </h3>
        <div class="text-center">
          <div class="font-mono text-5xl {Math.abs(lookPercent - 37) < 5 ? 'text-jade-400' : 'text-amber-350'}">
            {simulate().toFixed(1)}%
          </div>
          <div class="text-sm text-obsidian-400 mt-2">Success Rate (1000 trials)</div>
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-xs text-obsidian-400">
          {#if Math.abs(lookPercent - 37) < 5}
            ✅ Near optimal! You're using the 37% rule.
          {:else if lookPercent < 20}
            ⚠️ Exploring too little. You're committing too early.
          {:else}
            ⚠️ Exploring too much. Best option may have passed.
          {/if}
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Success Rate Curve -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Success Rate by Explore %</h3>
        <div class="h-56">
          <LineChart 
            labels={successCurve().percents.map(p => `${p}%`)}
            datasets={[
              {
                label: 'Success Rate',
                data: successCurve().rates,
                borderColor: '#f5c542',
                fill: true,
                backgroundColor: 'rgba(245, 197, 66, 0.1)'
              }
            ]}
            xAxisLabel="Explore Phase (%)"
            yAxisLabel="Success Rate (%)"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Peak around 35-40%. Both too little and too much exploration hurt performance.
        </p>
      </div>

      <!-- Theory -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">The Mathematics</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">Optimal Threshold</h4>
            <div class="formula text-lg mb-2">n/e ≈ 0.368n</div>
            <p class="text-xs text-obsidian-400">
              Reject the first n/e candidates, then take first that beats best seen.
            </p>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">Success Probability</h4>
            <div class="formula text-lg mb-2">≈ 1/e ≈ 36.8%</div>
            <p class="text-xs text-obsidian-400">
              Probability of picking the absolute best candidate.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Betting Applications</h2>
    <div class="grid md:grid-cols-2 gap-4">
      {#each applications as app}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{app.scenario}</h3>
          <p class="text-sm text-obsidian-300">{app.rule}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Optimal stopping simulation
secretary_problem &lt;- function(n, look_pct = 1/exp(1), trials = 1000) {'{'} 
  look_n &lt;- floor(n * look_pct)
  wins &lt;- 0
  
  for (t in 1:trials) {'{'} 
    candidates &lt;- runif(n)
    best_idx &lt;- which.max(candidates)
    
    # Look phase
    look_best &lt;- max(candidates[1:look_n])
    
    # Leap phase
    picked &lt;- NA
    for (i in (look_n + 1):n) {'{'} 
      if (candidates[i] &gt; look_best) {'{'} 
        picked &lt;- i
        break
      {'}'}
    {'}'}
    if (is.na(picked)) picked &lt;- n
    
    if (picked == best_idx) wins &lt;- wins + 1
  {'}'}
  
  return(wins / trials)
{'}'}

# Test different look percentages
results &lt;- sapply(seq(0.1, 0.8, by = 0.05), function(p) secretary_problem({numCandidates}, p))
cat(sprintf("Optimal at ~37%%: %.1f%% success\n", secretary_problem({numCandidates}) * 100))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• 37% rule: explore first, then commit</li>
        <li>• Gives ~37% chance of picking the best</li>
        <li>• Better than guessing or any fixed strategy</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Apply to line shopping, player selection</li>
        <li>• Too little exploration = poor benchmark</li>
        <li>• Too much exploration = best option passed</li>
      </ul>
    </div>
  </div>
</div>

