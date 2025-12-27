<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Simulation parameters
  let numSims = $state(1000);
  let parallelization = $state(4);

  // Estimated runtime
  const estimatedRuntime = $derived(() => {
    const baseTimePerSim = 0.1; // seconds
    return (numSims * baseTimePerSim / parallelization).toFixed(1);
  });

  // Simulation types
  const simTypes = [
    { 
      name: 'Season Simulation',
      desc: 'Simulate entire season outcomes',
      inputs: ['Team ratings', 'Schedule', 'Injury probabilities'],
      outputs: ['Win totals', 'Playoff odds', 'Championship %']
    },
    { 
      name: 'Game Simulation',
      desc: 'Play-by-play game modeling',
      inputs: ['Player stats', 'Pace', 'Play distributions'],
      outputs: ['Final score', 'Player stats', 'Game flow']
    },
    { 
      name: 'Bankroll Simulation',
      desc: 'Test betting strategies',
      inputs: ['Win rates', 'Bet sizing', 'Correlation'],
      outputs: ['Final bankroll', 'Drawdown', 'Bust rate']
    },
    { 
      name: 'Market Simulation',
      desc: 'Model order flow and pricing',
      inputs: ['Arrival rates', 'Bet sizes', 'Sharp %'],
      outputs: ['PnL distribution', 'Max exposure']
    }
  ];

  // Architecture components
  const components = [
    { name: 'RNG Engine', icon: '🎲', desc: 'Fast, reproducible random numbers' },
    { name: 'State Manager', icon: '📊', desc: 'Track game/season state' },
    { name: 'Event Queue', icon: '📋', desc: 'Process events in order' },
    { name: 'Parallel Runner', icon: '⚡', desc: 'Distribute across cores' },
    { name: 'Results Aggregator', icon: '📈', desc: 'Collect and summarize' },
    { name: 'Cache Layer', icon: '💾', desc: 'Reuse expensive computations' }
  ];

  // Performance tips
  const tips = [
    { tip: 'Use NumPy vectorization', impact: '10-100x faster' },
    { tip: 'Pre-compute lookup tables', impact: 'Avoid repeated calcs' },
    { tip: 'Parallel processing (multiprocessing)', impact: 'Linear speedup' },
    { tip: 'JIT compilation (Numba)', impact: '10-50x faster' },
    { tip: 'Seed management for reproducibility', impact: 'Debugging' },
    { tip: 'Early termination conditions', impact: 'Skip unnecessary work' }
  ];
</script>

<svelte:head>
  <title>Simulation Engines | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Infrastructure</span>
    </div>
    <h1 class="section-title">Simulation Engines</h1>
    <p class="section-subtitle max-w-3xl">
      Build fast, scalable Monte Carlo engines. Power season projections,
      game simulations, and risk analysis.
    </p>
  </div>

  <!-- Simulation Types -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎮 Simulation Types</h2>
    <div class="grid md:grid-cols-2 gap-4">
      {#each simTypes as sim}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{sim.name}</h3>
          <p class="text-xs text-obsidian-300 mb-3">{sim.desc}</p>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-obsidian-400">Inputs:</span>
              <ul class="text-obsidian-300 mt-1">
                {#each sim.inputs as input}
                  <li>• {input}</li>
                {/each}
              </ul>
            </div>
            <div>
              <span class="text-jade-400">Outputs:</span>
              <ul class="text-jade-400 mt-1">
                {#each sim.outputs as output}
                  <li>• {output}</li>
                {/each}
              </ul>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Interactive Config -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="glass-card p-6">
      <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Simulation Config</h3>
      <div class="space-y-4">
        <Slider bind:value={numSims} min={100} max={10000} step={100} label="# Simulations" />
        <Slider bind:value={parallelization} min={1} max={16} step={1} label="Parallel Workers" />
      </div>
      <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg">
        <div class="flex justify-between text-sm">
          <span class="text-obsidian-300">Est. Runtime</span>
          <span class="font-mono text-amber-350">{estimatedRuntime}s</span>
        </div>
        <div class="flex justify-between text-sm mt-2">
          <span class="text-obsidian-300">Throughput</span>
          <span class="font-mono text-jade-400">{(numSims / parseFloat(estimatedRuntime)).toFixed(0)} sims/sec</span>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 glass-card p-6">
      <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Architecture Components</h3>
      <div class="grid grid-cols-3 gap-4">
        {#each components as comp}
          <div class="p-3 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-2xl mb-1">{comp.icon}</div>
            <h4 class="text-amber-350 font-semibold text-sm">{comp.name}</h4>
            <p class="text-xs text-obsidian-400 mt-1">{comp.desc}</p>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Performance Tips -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">⚡ Performance Optimization</h2>
    <div class="grid md:grid-cols-3 gap-4">
      {#each tips as tip}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-jade-400 font-semibold mb-1">{tip.tip}</h3>
          <p class="text-xs text-obsidian-400">Impact: {tip.impact}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Code Example -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">Python</span> Simulation Engine
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Fast season simulation with Numba
import numpy as np
from numba import jit, prange
from concurrent.futures import ProcessPoolExecutor

@jit(nopython=True, parallel=True)
def simulate_season_batch(team_ratings, schedule, n_sims):
    """Vectorized season simulation"""
    n_teams = len(team_ratings)
    n_games = len(schedule)
    
    # Pre-allocate results
    win_totals = np.zeros((n_sims, n_teams))
    
    for sim in prange(n_sims):
        # Seed for reproducibility
        np.random.seed(42 + sim)
        
        for game_idx in range(n_games):
            home, away = schedule[game_idx]
            
            # Win probability from ratings
            diff = team_ratings[home] - team_ratings[away] + 3  # Home advantage
            home_win_prob = 1 / (1 + 10 ** (-diff / 400))
            
            # Simulate game
            if np.random.random() &lt; home_win_prob:
                win_totals[sim, home] += 1
            else:
                win_totals[sim, away] += 1
    
    return win_totals

# Run simulation
results = simulate_season_batch(ratings, schedule, {numSims})

# Aggregate results
playoff_odds = (results &gt;= 45).mean(axis=0)
championship_odds = (results.argmax(axis=1) == team_idx).mean()</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Simulations power projections and risk analysis</li>
        <li>• Vectorize with NumPy for 10-100x speedup</li>
        <li>• Use Numba JIT for tight loops</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Parallelize across cores for linear scaling</li>
        <li>• Seed management for reproducibility</li>
        <li>• Cache expensive intermediate results</li>
      </ul>
    </div>
  </div>
</div>

