<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // DFS constraints
  let salaryCap = $state(50000);
  let usedSalary = $state(0);

  // Player pool
  const players = $state([
    { name: 'LeBron James', pos: 'SF', salary: 10500, proj: 52, selected: false },
    { name: 'Jayson Tatum', pos: 'SF', salary: 9800, proj: 48, selected: false },
    { name: 'Luka Doncic', pos: 'PG', salary: 11000, proj: 55, selected: false },
    { name: 'Giannis', pos: 'PF', salary: 10800, proj: 54, selected: false },
    { name: 'Jokic', pos: 'C', salary: 11500, proj: 58, selected: false },
    { name: 'Trae Young', pos: 'PG', salary: 8500, proj: 42, selected: false },
    { name: 'Bam Adebayo', pos: 'C', salary: 7200, proj: 36, selected: false },
    { name: 'Brandon Miller', pos: 'SF', salary: 5500, proj: 28, selected: true },
    { name: 'Ayo Dosunmu', pos: 'PG', salary: 4200, proj: 22, selected: true },
    { name: 'Isaiah Stewart', pos: 'C', salary: 3800, proj: 18, selected: true }
  ]);

  // Toggle selection
  function togglePlayer(index: number) {
    players[index].selected = !players[index].selected;
  }

  // Calculate stats
  const selectedPlayers = $derived(players.filter(p => p.selected));
  const totalSalary = $derived(selectedPlayers.reduce((s, p) => s + p.salary, 0));
  const totalProjection = $derived(selectedPlayers.reduce((s, p) => s + p.proj, 0));
  const remainingSalary = $derived(salaryCap - totalSalary);
  const avgValuePerDollar = $derived(totalProjection / totalSalary * 1000);

  // Value calculation
  const playerValues = $derived(players.map(p => ({
    ...p,
    value: p.proj / p.salary * 1000
  })).sort((a, b) => b.value - a.value));

  // Optimization approaches
  const approaches = [
    { name: 'Cash Game', desc: 'Consistent floor, low variance', strategy: 'Chalk + value plays' },
    { name: 'GPP/Tournament', desc: 'Need ceiling, differentiation', strategy: 'Contrarian + ceiling' },
    { name: 'Single Entry', desc: 'One optimal lineup', strategy: 'Balanced approach' },
    { name: 'Multi-Entry', desc: 'Portfolio of lineups', strategy: 'Maximize unique exposure' }
  ];
</script>

<svelte:head>
  <title>Lineup Optimization | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Sports Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Lineup Optimization</h1>
    <p class="section-subtitle max-w-3xl">
      Build optimal DFS lineups under salary constraints. Balance projection,
      value, and correlation to maximize expected points.
    </p>
  </div>

  <!-- Salary Cap Info -->
  <div class="glass-card p-6">
    <div class="grid md:grid-cols-4 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-xs text-obsidian-400 mb-1">Salary Cap</div>
        <div class="font-mono text-2xl text-obsidian-200">${salaryCap.toLocaleString()}</div>
      </div>
      <div class="p-4 bg-{totalSalary > salaryCap ? 'crimson-500' : 'jade-500'}/20 border border-{totalSalary > salaryCap ? 'crimson-500' : 'jade-500'}/30 rounded-lg text-center">
        <div class="text-xs text-obsidian-400 mb-1">Used</div>
        <div class="font-mono text-2xl {totalSalary > salaryCap ? 'text-crimson-400' : 'text-jade-400'}">${totalSalary.toLocaleString()}</div>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-xs text-obsidian-400 mb-1">Remaining</div>
        <div class="font-mono text-2xl {remainingSalary < 0 ? 'text-crimson-400' : 'text-obsidian-200'}">${remainingSalary.toLocaleString()}</div>
      </div>
      <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
        <div class="text-xs text-amber-350 mb-1">Total Projection</div>
        <div class="font-mono text-2xl text-amber-350">{totalProjection.toFixed(1)} pts</div>
      </div>
    </div>
  </div>

  <!-- Player Selection -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Player Pool</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-obsidian-700">
                <th class="p-2 text-left text-obsidian-400">Player</th>
                <th class="p-2 text-center text-obsidian-400">Pos</th>
                <th class="p-2 text-center text-obsidian-400">Salary</th>
                <th class="p-2 text-center text-obsidian-400">Proj</th>
                <th class="p-2 text-center text-obsidian-400">Value</th>
                <th class="p-2 text-center text-obsidian-400">Select</th>
              </tr>
            </thead>
            <tbody>
              {#each playerValues as player, i}
                {@const origIndex = players.findIndex(p => p.name === player.name)}
                <tr class="border-b border-obsidian-800 {player.selected ? 'bg-jade-500/10' : ''}">
                  <td class="p-2 {player.selected ? 'text-jade-400' : 'text-obsidian-200'}">{player.name}</td>
                  <td class="p-2 text-center text-obsidian-400">{player.pos}</td>
                  <td class="p-2 text-center font-mono text-obsidian-300">${player.salary.toLocaleString()}</td>
                  <td class="p-2 text-center font-mono text-amber-350">{player.proj}</td>
                  <td class="p-2 text-center font-mono {player.value > 4.5 ? 'text-jade-400' : player.value > 4 ? 'text-amber-350' : 'text-obsidian-400'}">
                    {player.value.toFixed(2)}
                  </td>
                  <td class="p-2 text-center">
                    <button
                      class="px-3 py-1 rounded text-xs {player.selected ? 'bg-jade-500 text-white' : 'bg-obsidian-700 text-obsidian-300 hover:bg-obsidian-600'}"
                      onclick={() => togglePlayer(origIndex)}
                    >
                      {player.selected ? '✓' : '+'}
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="text-xs text-obsidian-400 mt-3">
          Value = Projection / Salary × 1000. Higher = better bang for buck.
        </p>
      </div>
    </div>

    <div class="space-y-6">
      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Lineup Summary</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Players</span>
            <span class="font-mono text-obsidian-200">{selectedPlayers.length}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Total Projection</span>
            <span class="font-mono text-amber-350">{totalProjection.toFixed(1)} pts</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Avg Value</span>
            <span class="font-mono {avgValuePerDollar > 4.5 ? 'text-jade-400' : 'text-obsidian-300'}">
              {avgValuePerDollar ? avgValuePerDollar.toFixed(2) : '-'}
            </span>
          </div>
        </div>
        <div class="mt-4">
          <h4 class="text-xs text-obsidian-400 mb-2">Selected:</h4>
          <div class="space-y-1">
            {#each selectedPlayers as p}
              <div class="flex justify-between text-xs">
                <span class="text-obsidian-200">{p.name}</span>
                <span class="font-mono text-amber-350">{p.proj} pts</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Optimization Tip</h3>
        <p class="text-sm text-obsidian-300">
          {#if remainingSalary > 5000}
            💡 You have ${remainingSalary.toLocaleString()} left. Consider upgrading a player!
          {:else if remainingSalary < 0}
            ⚠️ Over salary cap by ${(-remainingSalary).toLocaleString()}. Remove a player.
          {:else if avgValuePerDollar < 4.2}
            📉 Lineup value is low ({avgValuePerDollar.toFixed(2)}). Find better value plays.
          {:else}
            ✅ Good lineup efficiency! Value at {avgValuePerDollar.toFixed(2)}.
          {/if}
        </p>
      </div>
    </div>
  </div>

  <!-- Approaches -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎯 Optimization Approaches</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each approaches as approach}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{approach.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{approach.desc}</p>
          <p class="text-xs text-jade-400">{approach.strategy}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># DFS lineup optimization with integer programming
library(lpSolve)

optimize_lineup &lt;- function(players, cap = 50000, roster_size = 8) {'{'} 
  n &lt;- nrow(players)
  
  # Objective: maximize total projection
  obj &lt;- players$projection
  
  # Constraints
  # 1. Salary cap
  # 2. Roster size
  # 3. Position requirements
  const_mat &lt;- rbind(
    players$salary,    # Salary constraint
    rep(1, n)          # Roster size
  )
  const_rhs &lt;- c(cap, roster_size)
  const_dir &lt;- c("&lt;=", "=")
  
  # Binary: each player in or out
  result &lt;- lp("max", obj, const_mat, const_dir, const_rhs, 
               binary.vec = 1:n)
  
  selected &lt;- which(result$solution == 1)
  list(
    lineup = players[selected, ],
    total_proj = sum(players$projection[selected]),
    total_salary = sum(players$salary[selected])
  )
{'}'}</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Maximize projection under salary constraint</li>
        <li>• Value = Projection / Salary</li>
        <li>• Balance studs with value plays</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Cash games: prioritize floor</li>
        <li>• GPPs: prioritize ceiling + differentiation</li>
        <li>• Integer programming for optimal solution</li>
      </ul>
    </div>
  </div>
</div>

