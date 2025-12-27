<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // QP parameters
  let targetReturn = $state(10);
  let riskAversion = $state(2);

  // Asset data
  const assets = [
    { name: 'Large Cap', return: 8, risk: 15 },
    { name: 'Small Cap', return: 12, risk: 25 },
    { name: 'Bonds', return: 4, risk: 5 },
    { name: 'International', return: 10, risk: 20 }
  ];

  // Correlation matrix (simplified)
  const correlations = [
    [1.0, 0.7, 0.2, 0.6],
    [0.7, 1.0, 0.1, 0.5],
    [0.2, 0.1, 1.0, 0.3],
    [0.6, 0.5, 0.3, 1.0]
  ];

  // Solve QP (simplified mean-variance)
  const optimalWeights = $derived(() => {
    // Simplified solution for demo
    // In practice, use cvxpy or quadprog
    const weights = assets.map((a, i) => {
      // Higher weight for assets that meet return target with lower risk
      const returnScore = a.return >= targetReturn ? 1 : 0.5;
      const riskPenalty = Math.pow(a.risk, riskAversion * 0.1);
      return returnScore / riskPenalty;
    });
    
    // Normalize to sum to 1
    const total = weights.reduce((s, w) => s + w, 0);
    return weights.map(w => w / total);
  });

  // Portfolio metrics (cache weights to avoid repeated computation)
  const portfolioMetrics = $derived(() => {
    const weights = optimalWeights();
    
    const portReturn = assets.reduce((s, a, i) => s + a.return * weights[i], 0);
    
    // Calculate variance using covariance matrix
    let variance = 0;
    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        variance += weights[i] * weights[j] * 
                    assets[i].risk * assets[j].risk * correlations[i][j] / 10000;
      }
    }
    const portRisk = Math.sqrt(variance) * 100;
    const sharpe = (portReturn - 2) / portRisk; // 2% risk-free rate
    
    return { return: portReturn, risk: portRisk, sharpe };
  });

  const portfolioReturn = $derived(portfolioMetrics().return);
  const portfolioRisk = $derived(portfolioMetrics().risk);
  const sharpeRatio = $derived(portfolioMetrics().sharpe);

  // QP form
  const qpForm = [
    { component: 'Objective', formula: 'min ½x\'Qx + c\'x', desc: 'Minimize risk + cost' },
    { component: 'Constraints', formula: 'Ax ≤ b', desc: 'Inequality constraints' },
    { component: 'Equality', formula: 'Ex = f', desc: 'Equality constraints' }
  ];

  // Betting applications
  const applications = [
    { name: 'Portfolio Allocation', desc: 'Optimal bet sizing across markets' },
    { name: 'Hedge Optimization', desc: 'Minimize cost to offset liability' },
    { name: 'Parlay Construction', desc: 'Maximize EV subject to correlation' },
    { name: 'Risk Parity', desc: 'Equal risk contribution per bet' }
  ];
</script>

<svelte:head>
  <title>Quadratic Programming | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Optimization</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Quadratic Programming</h1>
    <p class="section-subtitle max-w-3xl">
      Optimize with quadratic objectives and linear constraints. Powers
      portfolio optimization, hedging, and risk management.
    </p>
  </div>

  <!-- QP Form -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 QP Standard Form</h2>
    <div class="grid md:grid-cols-3 gap-4">
      {#each qpForm as form}
        <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
          <h3 class="text-amber-350 font-semibold mb-2">{form.component}</h3>
          <div class="formula text-lg mb-2">{form.formula}</div>
          <p class="text-xs text-obsidian-400">{form.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Preferences</h3>
        <div class="space-y-4">
          <Slider bind:value={targetReturn} min={4} max={12} step={0.5} label="Target Return (%)" />
          <Slider bind:value={riskAversion} min={0.5} max={5} step={0.5} label="Risk Aversion (λ)" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Portfolio Metrics</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Expected Return</span>
            <span class="font-mono text-jade-400">{portfolioReturn.toFixed(1)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Portfolio Risk (σ)</span>
            <span class="font-mono text-obsidian-200">{portfolioRisk.toFixed(1)}%</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-obsidian-700">
            <span class="text-obsidian-300">Sharpe Ratio</span>
            <span class="font-mono text-amber-350">{sharpeRatio.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Optimal Weights -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Optimal Allocation</h3>
        <div class="space-y-4">
          {#each assets as asset, i}
            <div class="flex items-center gap-4">
              <span class="text-sm text-obsidian-300 w-28">{asset.name}</span>
              <div class="flex-1 h-6 bg-obsidian-800 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-amber-350 transition-all duration-300"
                  style="width: {optimalWeights()[i] * 100}%"
                ></div>
              </div>
              <span class="font-mono text-sm text-obsidian-200 w-16 text-right">
                {(optimalWeights()[i] * 100).toFixed(1)}%
              </span>
            </div>
          {/each}
        </div>
        <div class="mt-4 grid grid-cols-4 gap-2 text-xs text-center">
          {#each assets as asset}
            <div class="p-2 bg-obsidian-800/50 rounded">
              <div class="text-obsidian-400">Return: {asset.return}%</div>
              <div class="text-obsidian-400">Risk: {asset.risk}%</div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Efficient Frontier -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Efficient Frontier</h3>
        <div class="relative h-48 bg-obsidian-800/50 rounded-lg p-4">
          <svg class="absolute inset-4 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            <!-- Efficient frontier curve -->
            <path 
              d="M 5 50 Q 30 45 50 30 Q 70 15 95 10"
              fill="none"
              stroke="#f5c542"
              stroke-width="1"
            />
            <!-- Individual assets -->
            {#each assets as asset, i}
              <circle 
                cx={asset.risk * 3} 
                cy={55 - asset.return * 4} 
                r="2" 
                fill="#64748b"
              />
            {/each}
            <!-- Optimal portfolio -->
            <circle 
              cx={portfolioRisk * 3} 
              cy={55 - portfolioReturn * 4} 
              r="3" 
              fill="#34d399"
            />
          </svg>
          <div class="absolute bottom-2 left-4 text-xs text-obsidian-400">Risk (σ) →</div>
          <div class="absolute top-2 left-2 text-xs text-obsidian-400" style="writing-mode: vertical-rl; transform: rotate(180deg)">Return →</div>
        </div>
        <div class="mt-4 flex justify-center gap-6 text-xs">
          <span class="flex items-center gap-1">
            <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
            Individual assets
          </span>
          <span class="flex items-center gap-1">
            <div class="w-3 h-3 bg-jade-500 rounded-full"></div>
            Optimal portfolio
          </span>
          <span class="flex items-center gap-1">
            <div class="w-6 h-0.5 bg-amber-350"></div>
            Efficient frontier
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- Betting Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎰 Betting Applications</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each applications as app}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{app.name}</h3>
          <p class="text-xs text-obsidian-400">{app.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Code Example -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">Python</span> / CVXPY
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Mean-variance portfolio optimization
import cvxpy as cp
import numpy as np

# Data
returns = np.array([0.08, 0.12, 0.04, 0.10])
cov_matrix = np.array([...])  # 4x4 covariance matrix

# Decision variable
weights = cp.Variable(4)

# Mean-variance objective
expected_return = returns @ weights
portfolio_variance = cp.quad_form(weights, cov_matrix)

# Risk aversion parameter
lambda_risk = {riskAversion}

# Objective: maximize return - lambda * variance
objective = cp.Maximize(expected_return - lambda_risk * portfolio_variance)

# Constraints
constraints = [
    cp.sum(weights) == 1,      # Fully invested
    weights &gt;= 0,              # No short selling
    expected_return &gt;= {targetReturn / 100}  # Minimum return
]

# Solve
problem = cp.Problem(objective, constraints)
problem.solve()

print(f"Optimal weights: {'{'}weights.value{'}'}")
print(f"Expected return: {'{'}expected_return.value * 100:.1f{'}'}}%")</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• QP: quadratic objective, linear constraints</li>
        <li>• Powers mean-variance optimization</li>
        <li>• Convex QP → global optimum guaranteed</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Use CVXPY or quadprog to solve</li>
        <li>• Risk aversion λ controls risk-return tradeoff</li>
        <li>• Foundation of portfolio theory</li>
      </ul>
    </div>
  </div>
</div>

