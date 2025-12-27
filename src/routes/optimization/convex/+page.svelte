<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Convex optimization parameters
  let learningRate = $state(0.1);
  let iterations = $state(50);
  let startX = $state(8);

  // Objective function: f(x) = x^2 + 2x + 1 (convex parabola)
  const f = (x: number) => x * x + 2 * x + 1;
  const df = (x: number) => 2 * x + 2;
  const optimum = -1; // f'(x) = 0 → x = -1

  // Gradient descent simulation
  const gradientDescent = $derived(() => {
    const path: Array<{ x: number, y: number }> = [];
    let x = startX;
    
    for (let i = 0; i <= iterations; i++) {
      path.push({ x, y: f(x) });
      x = x - learningRate * df(x);
    }
    
    return path;
  });

  // Final values (cache gradient descent result)
  const finalPoint = $derived(() => {
    const path = gradientDescent();
    return path[path.length - 1];
  });
  const finalX = $derived(finalPoint().x);
  const finalY = $derived(finalPoint().y);
  const convergenceError = $derived(Math.abs(finalX - optimum));

  // Convex properties
  const properties = [
    { name: 'Global Minimum', desc: 'Local minimum = global minimum', why: 'No "traps"' },
    { name: 'Guaranteed Convergence', desc: 'Gradient descent converges', why: 'Smooth landscape' },
    { name: 'Efficient Algorithms', desc: 'Polynomial time solutions', why: 'Well-studied theory' },
    { name: 'Duality', desc: 'Strong duality often holds', why: 'Bounds on optimum' }
  ];

  // Examples
  const examples = [
    { name: 'Portfolio Optimization', obj: 'Minimize variance', constraint: 'Target return' },
    { name: 'Liability Hedging', obj: 'Minimize cost', constraint: 'Risk limits' },
    { name: 'Odds Calibration', obj: 'Minimize Brier score', constraint: 'Probs sum to 1' },
    { name: 'Resource Allocation', obj: 'Maximize profit', constraint: 'Budget limits' }
  ];
</script>

<svelte:head>
  <title>Convex Optimization | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Optimization</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Convex Optimization</h1>
    <p class="section-subtitle max-w-3xl">
      When the problem is convex, local optima are global optima. Efficient
      algorithms guarantee finding the best solution.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 What is Convex?</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Convex Set</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Line between any two points in the set stays inside the set.
        </p>
        <div class="flex justify-center gap-4">
          <div class="text-center">
            <div class="w-16 h-16 bg-jade-500/30 rounded-full border-2 border-jade-500"></div>
            <p class="text-xs text-jade-400 mt-1">✓ Convex</p>
          </div>
          <div class="text-center">
            <div class="w-16 h-16 bg-crimson-500/30 border-2 border-crimson-500" style="clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%, 30% 50%)"></div>
            <p class="text-xs text-crimson-400 mt-1">✗ Non-convex</p>
          </div>
        </div>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Convex Function</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          "Bowl-shaped" — line between any two points lies above the curve.
        </p>
        <div class="formula text-center">
          f(λx + (1-λ)y) ≤ λf(x) + (1-λ)f(y)
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Gradient Descent</h3>
        <div class="space-y-4">
          <Slider bind:value={startX} min={-8} max={8} step={0.5} label="Starting Point (x)" />
          <Slider bind:value={learningRate} min={0.01} max={0.5} step={0.01} label="Learning Rate" />
          <Slider bind:value={iterations} min={10} max={100} step={5} label="Iterations" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Optimization Result</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Optimum x*</span>
            <span class="font-mono text-jade-400">{optimum}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Found x</span>
            <span class="font-mono text-obsidian-200">{finalX.toFixed(4)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">f(x)</span>
            <span class="font-mono text-obsidian-200">{finalY.toFixed(4)}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-obsidian-700">
            <span class="text-obsidian-300">Error |x - x*|</span>
            <span class="font-mono {convergenceError < 0.01 ? 'text-jade-400' : 'text-amber-350'}">
              {convergenceError.toExponential(2)}
            </span>
          </div>
        </div>
        <div class="mt-3 p-2 bg-obsidian-800/50 rounded-lg text-xs">
          {#if convergenceError < 0.001}
            <span class="text-jade-400">✓ Converged to optimum</span>
          {:else if learningRate > 0.3}
            <span class="text-crimson-400">⚠️ Learning rate too high—oscillating</span>
          {:else}
            <span class="text-amber-350">⚡ Still converging—increase iterations</span>
          {/if}
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Visualization -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Gradient Descent Path</h3>
        <div class="relative h-64 bg-obsidian-800/50 rounded-lg overflow-hidden">
          <!-- Draw parabola -->
          <svg class="absolute inset-0 w-full h-full" viewBox="-10 -5 20 70" preserveAspectRatio="none">
            <!-- Function curve -->
            <path 
              d="M -10 {f(-10)} Q 0 {f(0)} 10 {f(10)}"
              fill="none"
              stroke="#f5c542"
              stroke-width="0.5"
            />
            <!-- Optimum point -->
            <circle cx={optimum} cy={f(optimum)} r="0.5" fill="#34d399" />
            <!-- Gradient descent path -->
            {#each gradientDescent() as point, i}
              {#if i < gradientDescent().length - 1}
                <line 
                  x1={point.x} 
                  y1={point.y} 
                  x2={gradientDescent()[i + 1].x}
                  y2={gradientDescent()[i + 1].y}
                  stroke="#3b82f6"
                  stroke-width="0.3"
                />
              {/if}
              <circle cx={point.x} cy={point.y} r="0.3" fill={i === 0 ? '#ef4444' : i === gradientDescent().length - 1 ? '#34d399' : '#3b82f6'} />
            {/each}
          </svg>
        </div>
        <div class="mt-4 flex justify-center gap-6 text-xs">
          <span class="flex items-center gap-1">
            <div class="w-3 h-3 bg-crimson-500 rounded-full"></div>
            Start
          </span>
          <span class="flex items-center gap-1">
            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
            Path
          </span>
          <span class="flex items-center gap-1">
            <div class="w-3 h-3 bg-jade-500 rounded-full"></div>
            End
          </span>
          <span class="flex items-center gap-1">
            <div class="w-6 h-0.5 bg-amber-350"></div>
            f(x) = x² + 2x + 1
          </span>
        </div>
      </div>

      <!-- Properties -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Why Convexity Matters</h3>
        <div class="grid grid-cols-2 gap-4">
          {#each properties as prop}
            <div class="p-3 bg-obsidian-800/50 rounded-lg">
              <h4 class="text-amber-350 font-semibold mb-1">{prop.name}</h4>
              <p class="text-xs text-obsidian-300">{prop.desc}</p>
              <p class="text-xs text-jade-400">→ {prop.why}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Examples -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎰 Betting Applications</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each examples as ex}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{ex.name}</h3>
          <p class="text-xs text-jade-400 mb-1">Obj: {ex.obj}</p>
          <p class="text-xs text-obsidian-400">s.t. {ex.constraint}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R/Python Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">Python</span> Code
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Convex optimization with CVXPY
import cvxpy as cp
import numpy as np

# Portfolio optimization (minimize variance)
n_assets = 5
expected_returns = np.array([0.12, 0.10, 0.08, 0.15, 0.11])
cov_matrix = np.random.randn(n_assets, n_assets)
cov_matrix = cov_matrix @ cov_matrix.T  # Make positive semidefinite

# Decision variables
weights = cp.Variable(n_assets)

# Objective: minimize portfolio variance
objective = cp.Minimize(cp.quad_form(weights, cov_matrix))

# Constraints
constraints = [
    cp.sum(weights) == 1,          # Weights sum to 1
    weights &gt;= 0,                   # No short selling
    weights @ expected_returns &gt;= 0.10  # Target return
]

# Solve
problem = cp.Problem(objective, constraints)
problem.solve()

print(f"Optimal weights: {'{'}weights.value{'}'}")
print(f"Portfolio variance: {'{'}problem.value{'}'}")</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Convex = no local minima traps</li>
        <li>• Gradient descent guaranteed to converge</li>
        <li>• Many betting problems are convex</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Use CVXPY (Python) or cvx (MATLAB)</li>
        <li>• Check if problem is convex before solving</li>
        <li>• Non-convex: use multiple restarts</li>
      </ul>
    </div>
  </div>
</div>

