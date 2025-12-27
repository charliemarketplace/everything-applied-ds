<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Bayesian parameters
  let priorMean = $state(50);
  let priorStd = $state(10);
  let observedMean = $state(58);
  let sampleSize = $state(10);

  // Calculate posterior
  const posterior = $derived(() => {
    // Simplified conjugate normal-normal update
    const priorVar = priorStd * priorStd;
    const observedVar = 100; // Assumed known variance
    
    // Posterior parameters
    const posteriorVar = 1 / (1 / priorVar + sampleSize / observedVar);
    const posteriorMean = posteriorVar * (priorMean / priorVar + sampleSize * observedMean / observedVar);
    const posteriorStd = Math.sqrt(posteriorVar);
    
    return { mean: posteriorMean, std: posteriorStd };
  });

  // Generate distribution curves
  const distributions = $derived(() => {
    const points = 50;
    const xMin = 20;
    const xMax = 80;
    const x: number[] = [];
    const prior: number[] = [];
    const likelihood: number[] = [];
    const posteriorDist: number[] = [];
    
    const likelihoodStd = 10 / Math.sqrt(sampleSize);
    
    for (let i = 0; i <= points; i++) {
      const xVal = xMin + (i / points) * (xMax - xMin);
      x.push(xVal);
      
      // Normal PDF
      const normalPDF = (val: number, mean: number, std: number) => 
        Math.exp(-0.5 * Math.pow((val - mean) / std, 2)) / (std * Math.sqrt(2 * Math.PI));
      
      prior.push(normalPDF(xVal, priorMean, priorStd));
      likelihood.push(normalPDF(xVal, observedMean, likelihoodStd));
      posteriorDist.push(normalPDF(xVal, posterior().mean, posterior().std));
    }
    
    // Normalize for display
    const maxVal = Math.max(...prior, ...likelihood, ...posteriorDist);
    return {
      x: x.map(v => v.toFixed(0)),
      prior: prior.map(p => p / maxVal * 100),
      likelihood: likelihood.map(l => l / maxVal * 100),
      posterior: posteriorDist.map(p => p / maxVal * 100)
    };
  });

  // Weight of prior vs data
  const priorWeight = $derived(() => {
    const priorVar = priorStd * priorStd;
    const observedVar = 100;
    return (observedVar / sampleSize) / (priorVar + observedVar / sampleSize) * 100;
  });

  // Credible interval
  const credibleInterval = $derived({
    lower: posterior().mean - 1.96 * posterior().std,
    upper: posterior().mean + 1.96 * posterior().std
  });
</script>

<svelte:head>
  <title>Bayesian Updating | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Statistical Models</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Bayesian Updating</h1>
    <p class="section-subtitle max-w-3xl">
      Combine prior beliefs with new evidence. Start with what you know, update
      as data arrives. The foundation of rational inference under uncertainty.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 Bayes' Theorem</h2>
    <div class="text-center p-6 bg-obsidian-800/50 rounded-lg">
      <div class="formula text-2xl mb-4">
        P(θ | data) ∝ P(data | θ) × P(θ)
      </div>
      <div class="grid grid-cols-3 gap-4 text-sm">
        <div class="p-3 bg-jade-500/10 border border-jade-500/30 rounded-lg">
          <span class="text-jade-400 font-semibold">Posterior</span>
          <p class="text-xs text-obsidian-400">Updated belief after data</p>
        </div>
        <div class="p-3 bg-amber-350/10 border border-amber-350/30 rounded-lg">
          <span class="text-amber-350 font-semibold">Likelihood</span>
          <p class="text-xs text-obsidian-400">How likely is data given θ</p>
        </div>
        <div class="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <span class="text-blue-400 font-semibold">Prior</span>
          <p class="text-xs text-obsidian-400">Belief before data</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Prior Belief</h3>
        <div class="space-y-4">
          <Slider bind:value={priorMean} min={30} max={70} step={1} label="Prior Mean" />
          <Slider bind:value={priorStd} min={2} max={20} step={1} label="Prior Uncertainty (σ)" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Observed Data</h3>
        <div class="space-y-4">
          <Slider bind:value={observedMean} min={30} max={70} step={1} label="Sample Mean" />
          <Slider bind:value={sampleSize} min={1} max={50} step={1} label="Sample Size" />
        </div>
      </div>

      <div class="glass-card p-6 border-jade-500/30">
        <h3 class="font-display text-lg font-semibold text-jade-400 mb-4">📊 Posterior</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Posterior Mean</span>
            <span class="font-mono text-jade-400">{posterior().mean.toFixed(1)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Posterior σ</span>
            <span class="font-mono text-obsidian-200">{posterior().std.toFixed(2)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">95% Credible Int.</span>
            <span class="font-mono text-obsidian-200">[{credibleInterval.lower.toFixed(1)}, {credibleInterval.upper.toFixed(1)}]</span>
          </div>
          <div class="pt-2 border-t border-obsidian-700">
            <div class="flex justify-between">
              <span class="text-obsidian-300">Prior Weight</span>
              <span class="font-mono text-blue-400">{priorWeight().toFixed(0)}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-obsidian-300">Data Weight</span>
              <span class="font-mono text-amber-350">{(100 - priorWeight()).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Distribution Plot -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Distribution Evolution</h3>
        <div class="h-64">
          <LineChart 
            labels={distributions().x}
            datasets={[
              {
                label: 'Prior',
                data: distributions().prior,
                borderColor: '#3b82f6',
                fill: false,
                borderWidth: 2
              },
              {
                label: 'Likelihood',
                data: distributions().likelihood,
                borderColor: '#f5c542',
                fill: false,
                borderWidth: 2
              },
              {
                label: 'Posterior',
                data: distributions().posterior,
                borderColor: '#34d399',
                fill: false,
                borderWidth: 3
              }
            ]}
            xAxisLabel="θ (parameter value)"
            yAxisLabel="Density"
          />
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-xs text-obsidian-400">
          {#if sampleSize > 20}
            With n={sampleSize}, data dominates. Posterior ≈ likelihood.
          {:else if sampleSize < 5}
            With n={sampleSize}, prior has significant influence on posterior.
          {:else}
            Balanced update: both prior and data contribute to posterior.
          {/if}
        </div>
      </div>

      <!-- Key Properties -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Key Properties</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <h4 class="text-amber-350 font-semibold mb-2">Sequential</h4>
            <p class="text-xs text-obsidian-400">Today's posterior is tomorrow's prior</p>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <h4 class="text-amber-350 font-semibold mb-2">Shrinkage</h4>
            <p class="text-xs text-obsidian-400">Small samples → closer to prior</p>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <h4 class="text-amber-350 font-semibold mb-2">Uncertainty</h4>
            <p class="text-xs text-obsidian-400">Posterior width shows remaining uncertainty</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Betting Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏈 Betting Applications</h2>
    <div class="grid md:grid-cols-4 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Player Projections</h3>
        <p class="text-xs text-obsidian-400">Prior: historical/positional avg. Update with current season.</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Win Probability</h3>
        <p class="text-xs text-obsidian-400">Prior: preseason. Update in-game as plays unfold.</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Sharp Detection</h3>
        <p class="text-xs text-obsidian-400">Prior: new user is square. Update with betting patterns.</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Odds Setting</h3>
        <p class="text-xs text-obsidian-400">Prior: opening line. Update with market action.</p>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Bayesian update (conjugate normal-normal)
bayesian_update &lt;- function(prior_mean, prior_var, obs_mean, obs_var, n) {'{'} 
  # Posterior variance
  post_var &lt;- 1 / (1/prior_var + n/obs_var)
  
  # Posterior mean
  post_mean &lt;- post_var * (prior_mean/prior_var + n*obs_mean/obs_var)
  
  list(
    mean = post_mean,
    sd = sqrt(post_var),
    ci_lower = post_mean - 1.96 * sqrt(post_var),
    ci_upper = post_mean + 1.96 * sqrt(post_var)
  )
{'}'}

# Example
prior &lt;- list(mean = {priorMean}, var = {priorStd}^2)
data &lt;- list(mean = {observedMean}, var = 100, n = {sampleSize})

posterior &lt;- bayesian_update(prior$mean, prior$var, data$mean, data$var, data$n)
cat(sprintf("Posterior: %.1f (95%% CI: %.1f - %.1f)\n",
    posterior$mean, posterior$ci_lower, posterior$ci_upper))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Prior × Likelihood → Posterior</li>
        <li>• More data → posterior approaches MLE</li>
        <li>• Less data → posterior stays near prior</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Credible intervals have direct probability interpretation</li>
        <li>• Perfect for sequential updating</li>
        <li>• Regularizes naturally via prior</li>
      </ul>
    </div>
  </div>
</div>
