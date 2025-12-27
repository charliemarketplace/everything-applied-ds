<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG } from '$lib/utils/synthetic-data';

  // Resource allocation problem
  let marketingBudget = $state(100);
  let socialCost = $state(5);
  let searchCost = $state(10);
  let displayCost = $state(8);
  let socialReturn = $state(1.5);
  let searchReturn = $state(2.0);
  let displayReturn = $state(1.8);

  // Constraints
  let maxSocialPct = $state(40);
  let maxSearchPct = $state(50);
  let minDisplayPct = $state(10);

  // Solve (greedy approximation for demo)
  const solution = $derived(() => {
    const channels = [
      { name: 'Social', cost: socialCost, return: socialReturn, roi: socialReturn / socialCost },
      { name: 'Search', cost: searchCost, return: searchReturn, roi: searchReturn / searchCost },
      { name: 'Display', cost: displayCost, return: displayReturn, roi: displayReturn / displayCost }
    ].sort((a, b) => b.roi - a.roi);

    // Apply constraints
    const maxAllocations: Record<string, number> = {
      'Social': marketingBudget * maxSocialPct / 100,
      'Search': marketingBudget * maxSearchPct / 100,
      'Display': marketingBudget * (100 - minDisplayPct) / 100
    };
    const minAllocations: Record<string, number> = {
      'Social': 0,
      'Search': 0,
      'Display': marketingBudget * minDisplayPct / 100
    };

    // Allocate budget
    let remaining = marketingBudget;
    const allocations: Record<string, number> = { Social: 0, Search: 0, Display: 0 };

    // First satisfy minimums
    for (const channel of Object.keys(allocations)) {
      const min = minAllocations[channel];
      allocations[channel] = min;
      remaining -= min;
    }

    // Then allocate rest by ROI
    for (const channel of channels) {
      const max = maxAllocations[channel.name];
      const current = allocations[channel.name];
      const canAdd = Math.min(remaining, max - current);
      allocations[channel.name] += canAdd;
      remaining -= canAdd;
    }

    // Calculate total return
    let totalReturn = 0;
    totalReturn += allocations.Social / socialCost * socialReturn;
    totalReturn += allocations.Search / searchCost * searchReturn;
    totalReturn += allocations.Display / displayCost * displayReturn;

    return { allocations, totalReturn, remaining };
  });

  // Compare to equal allocation
  const equalAllocation = $derived(() => {
    const equal = marketingBudget / 3;
    let totalReturn = 0;
    totalReturn += equal / socialCost * socialReturn;
    totalReturn += equal / searchCost * searchReturn;
    totalReturn += equal / displayCost * displayReturn;
    return totalReturn;
  });

  // LP Components
  const lpComponents = [
    { name: 'Decision Variables', desc: 'What you control (allocations, prices, quantities)', example: 'x₁ = social budget, x₂ = search budget...' },
    { name: 'Objective Function', desc: 'What to maximize/minimize', example: 'max: 1.5x₁ + 2.0x₂ + 1.8x₃' },
    { name: 'Constraints', desc: 'Limits and requirements', example: 'x₁ + x₂ + x₃ ≤ 100, x₃ ≥ 10' },
    { name: 'Non-negativity', desc: 'Variables must be ≥ 0', example: 'x₁, x₂, x₃ ≥ 0' }
  ];
</script>

<svelte:head>
  <title>Linear Programming | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Optimization</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Linear Programming</h1>
    <p class="section-subtitle max-w-3xl">
      Optimize resource allocation under constraints. Find the best budget split,
      pricing mix, or exposure limits to maximize profit.
    </p>
  </div>

  <!-- Framework -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📐 LP Framework</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each lpComponents as comp}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{comp.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{comp.desc}</p>
          <code class="text-xs text-jade-400 block">{comp.example}</code>
        </div>
      {/each}
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Budget & Returns</h3>
        <div class="space-y-4">
          <Slider bind:value={marketingBudget} min={50} max={500} step={10} label="Total Budget ($K)" />
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <div class="grid grid-cols-3 gap-2 text-xs">
              <div class="text-center">
                <div class="text-obsidian-400">Social</div>
                <div class="text-amber-350">ROI: {(socialReturn / socialCost).toFixed(2)}</div>
              </div>
              <div class="text-center">
                <div class="text-obsidian-400">Search</div>
                <div class="text-amber-350">ROI: {(searchReturn / searchCost).toFixed(2)}</div>
              </div>
              <div class="text-center">
                <div class="text-obsidian-400">Display</div>
                <div class="text-amber-350">ROI: {(displayReturn / displayCost).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Constraints</h3>
        <div class="space-y-4">
          <Slider bind:value={maxSocialPct} min={10} max={80} step={5} label="Max Social (%)" />
          <Slider bind:value={maxSearchPct} min={10} max={80} step={5} label="Max Search (%)" />
          <Slider bind:value={minDisplayPct} min={5} max={40} step={5} label="Min Display (%)" />
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Solution -->
      <div class="glass-card p-6 border-jade-500/30">
        <h3 class="font-display text-lg font-semibold text-jade-400 mb-4">🎯 Optimal Allocation</h3>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Social</div>
            <div class="font-mono text-2xl text-blue-400">${solution().allocations.Social.toFixed(0)}K</div>
            <div class="text-xs text-obsidian-400">{(solution().allocations.Social / marketingBudget * 100).toFixed(0)}%</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Search</div>
            <div class="font-mono text-2xl text-jade-400">${solution().allocations.Search.toFixed(0)}K</div>
            <div class="text-xs text-obsidian-400">{(solution().allocations.Search / marketingBudget * 100).toFixed(0)}%</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Display</div>
            <div class="font-mono text-2xl text-amber-350">${solution().allocations.Display.toFixed(0)}K</div>
            <div class="text-xs text-obsidian-400">{(solution().allocations.Display / marketingBudget * 100).toFixed(0)}%</div>
          </div>
        </div>
        <div class="h-40">
          <BarChart 
            labels={['Social', 'Search', 'Display']}
            data={[solution().allocations.Social, solution().allocations.Search, solution().allocations.Display]}
            color="#f5c542"
          />
        </div>
      </div>

      <!-- Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">📊 Performance Comparison</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Optimal Allocation</div>
            <div class="font-mono text-3xl text-jade-400">{solution().totalReturn.toFixed(1)}</div>
            <div class="text-xs text-jade-400">Total Return Units</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Equal Allocation</div>
            <div class="font-mono text-3xl text-obsidian-300">{equalAllocation().toFixed(1)}</div>
            <div class="text-xs text-obsidian-400">Total Return Units</div>
          </div>
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-center">
          <span class="text-amber-350">Optimization gain: </span>
          <span class="font-mono text-jade-400">+{((solution().totalReturn / equalAllocation() - 1) * 100).toFixed(1)}%</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Betting Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Sports Betting Applications</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Liability Management</h3>
        <p class="text-xs text-obsidian-300 mb-2">
          Maximize expected profit while limiting exposure per game, sport, or outcome.
        </p>
        <code class="text-xs text-jade-400">
          max profit s.t. exposure_i ≤ limit_i
        </code>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Promo Budget Allocation</h3>
        <p class="text-xs text-obsidian-300 mb-2">
          Allocate bonus budget across user segments to maximize LTV.
        </p>
        <code class="text-xs text-jade-400">
          max Σ ROI_i × spend_i s.t. Σ spend ≤ B
        </code>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Market Mix</h3>
        <p class="text-xs text-obsidian-300 mb-2">
          Optimize bet offering across markets (spreads, totals, props) for margin.
        </p>
        <code class="text-xs text-jade-400">
          max margin s.t. diversity constraints
        </code>
      </div>
    </div>
  </div>

  <!-- Standard Form -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📝 Standard Form</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h3 class="text-amber-350 font-semibold mb-3">LP Standard Form</h3>
        <pre class="code-block text-sm"><code class="text-obsidian-300">Maximize:   c'x
Subject to: Ax ≤ b
            x ≥ 0</code></pre>
        <ul class="text-xs text-obsidian-400 mt-3 space-y-1">
          <li>• <span class="text-amber-350">c</span>: objective coefficients (returns)</li>
          <li>• <span class="text-amber-350">x</span>: decision variables (allocations)</li>
          <li>• <span class="text-amber-350">A</span>: constraint matrix</li>
          <li>• <span class="text-amber-350">b</span>: constraint bounds</li>
        </ul>
      </div>
      <div>
        <h3 class="text-amber-350 font-semibold mb-3">Solving Methods</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>Simplex:</strong> Classic algorithm, walks vertices</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>Interior Point:</strong> Faster for large problems</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span><strong>Tools:</strong> R (lpSolve), Python (scipy, cvxpy)</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Linear Programming with lpSolve
library(lpSolve)

# Objective: maximize returns
# Decision vars: [social, search, display]
obj_coef &lt;- c({(socialReturn / socialCost).toFixed(2)}, 
              {(searchReturn / searchCost).toFixed(2)}, 
              {(displayReturn / displayCost).toFixed(2)})

# Constraints matrix
# 1. social + search + display ≤ budget
# 2. social ≤ max_social%
# 3. search ≤ max_search%
# 4. display ≥ min_display%
const_mat &lt;- matrix(c(
  1, 1, 1,          # budget constraint
  1, 0, 0,          # social max
  0, 1, 0,          # search max
  0, 0, -1          # display min (negated for ≤ form)
), nrow = 4, byrow = TRUE)

const_rhs &lt;- c({marketingBudget}, 
               {marketingBudget * maxSocialPct / 100}, 
               {marketingBudget * maxSearchPct / 100}, 
               -{marketingBudget * minDisplayPct / 100})

const_dir &lt;- c("&lt;=", "&lt;=", "&lt;=", "&lt;=")

# Solve
solution &lt;- lp("max", obj_coef, const_mat, const_dir, const_rhs)
print(solution$solution)  # Optimal allocation
print(solution$objval)    # Maximum return</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• LP: optimize linear objective with linear constraints</li>
        <li>• Simplex/Interior Point algorithms solve efficiently</li>
        <li>• Use for budget allocation, liability limits</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Always check constraint feasibility</li>
        <li>• Shadow prices show constraint value</li>
        <li>• Extend to integer/quadratic for more complex cases</li>
      </ul>
    </div>
  </div>
</div>

