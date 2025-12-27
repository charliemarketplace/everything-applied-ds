<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // IV parameters
  let instrumentStrength = $state(0.7);
  let confoundingBias = $state(5);
  let sampleSize = $state(100);

  // Generate data
  const data = $derived(() => {
    const rng = createRNG(42);
    const points: Array<{ x: number, y: number, z: number }> = [];
    
    for (let i = 0; i < sampleSize; i++) {
      // Z = instrument (marketing spend)
      const z = normalRandom(rng, 50, 15);
      
      // Confounder (affluence - affects both X and Y)
      const confounder = normalRandom(rng, 0, 10);
      
      // X = treatment (betting volume) - caused by Z and confounder
      const x = 10 + instrumentStrength * z + 0.8 * confounder + normalRandom(rng, 0, 5);
      
      // Y = outcome (revenue) - true causal effect of X is 2, but confounder adds bias
      const trueEffect = 2;
      const y = 100 + trueEffect * x + confoundingBias * confounder + normalRandom(rng, 0, 20);
      
      points.push({ x, y, z });
    }
    
    return points;
  });

  // OLS estimate (biased)
  const olsEstimate = $derived(() => {
    const pts = data();
    const meanX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const meanY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    
    const covXY = pts.reduce((s, p) => s + (p.x - meanX) * (p.y - meanY), 0);
    const varX = pts.reduce((s, p) => s + Math.pow(p.x - meanX, 2), 0);
    
    return covXY / varX;
  });

  // IV estimate (unbiased)
  const ivEstimate = $derived(() => {
    const pts = data();
    const meanX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const meanY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const meanZ = pts.reduce((s, p) => s + p.z, 0) / pts.length;
    
    const covZY = pts.reduce((s, p) => s + (p.z - meanZ) * (p.y - meanY), 0);
    const covZX = pts.reduce((s, p) => s + (p.z - meanZ) * (p.x - meanX), 0);
    
    return covZY / covZX;
  });

  // First stage F-stat (instrument strength)
  const firstStageF = $derived(() => {
    const pts = data();
    const meanX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const meanZ = pts.reduce((s, p) => s + p.z, 0) / pts.length;
    
    const covZX = pts.reduce((s, p) => s + (p.z - meanZ) * (p.x - meanX), 0);
    const varZ = pts.reduce((s, p) => s + Math.pow(p.z - meanZ, 2), 0);
    
    const beta = covZX / varZ;
    const predicted = pts.map(p => meanX + beta * (p.z - meanZ));
    const ssr = predicted.reduce((s, pred, i) => s + Math.pow(pred - meanX, 2), 0);
    const sse = pts.reduce((s, p, i) => s + Math.pow(p.x - predicted[i], 2), 0);
    
    return (ssr / 1) / (sse / (pts.length - 2));
  });

  const trueEffect = 2;
</script>

<svelte:head>
  <title>IV / Causal Inference | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Econometrics</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Instrumental Variables</h1>
    <p class="section-subtitle max-w-3xl">
      Isolate causal effects when there's confounding. Use an "instrument" that
      affects treatment but not outcome directly—revealing true causal impact.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Endogeneity Problem</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <p class="text-sm text-obsidian-300 mb-3">
          When X and Y share a common cause (confounder), OLS is biased. We can't tell if
          X causes Y or if both are driven by the confounder.
        </p>
        <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
          <h4 class="text-crimson-400 font-semibold mb-2">Example</h4>
          <p class="text-xs text-obsidian-300">
            Does advertising increase revenue, or do successful companies advertise more?
            "Success" is a confounder affecting both.
          </p>
        </div>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h4 class="text-amber-350 font-semibold mb-2">The IV Solution</h4>
        <div class="text-sm text-obsidian-300 space-y-2">
          <p>Find Z that:</p>
          <ul class="list-disc list-inside text-xs space-y-1">
            <li><span class="text-jade-400">Relevance:</span> Z affects X</li>
            <li><span class="text-jade-400">Exclusion:</span> Z only affects Y through X</li>
            <li><span class="text-jade-400">Independence:</span> Z uncorrelated with confounder</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={instrumentStrength} min={0.1} max={1.0} step={0.1} label="Instrument Strength" />
          <Slider bind:value={confoundingBias} min={0} max={10} step={1} label="Confounding Bias" />
          <Slider bind:value={sampleSize} min={50} max={200} step={25} label="Sample Size" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Estimates</h3>
        <div class="space-y-4">
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-obsidian-300 text-sm">True Effect</span>
              <span class="font-mono text-jade-400">{trueEffect.toFixed(2)}</span>
            </div>
          </div>
          <div class="p-3 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-obsidian-300 text-sm">OLS (biased)</span>
              <span class="font-mono text-crimson-400">{olsEstimate().toFixed(2)}</span>
            </div>
            <div class="text-xs text-crimson-400 mt-1">
              Bias: {(olsEstimate() - trueEffect).toFixed(2)}
            </div>
          </div>
          <div class="p-3 bg-jade-500/10 border border-jade-500/30 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-obsidian-300 text-sm">IV (unbiased)</span>
              <span class="font-mono text-jade-400">{ivEstimate().toFixed(2)}</span>
            </div>
            <div class="text-xs text-jade-400 mt-1">
              Error: {(ivEstimate() - trueEffect).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Diagnostics -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">IV Diagnostics</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">First Stage F-stat</div>
            <div class="font-mono text-2xl {firstStageF() > 10 ? 'text-jade-400' : 'text-crimson-400'}">
              {firstStageF().toFixed(1)}
            </div>
            <div class="text-xs {firstStageF() > 10 ? 'text-jade-400' : 'text-crimson-400'} mt-1">
              {firstStageF() > 10 ? '✓ Strong instrument' : '⚠️ Weak instrument'}
            </div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">OLS Bias</div>
            <div class="font-mono text-2xl text-crimson-400">
              +{((olsEstimate() / trueEffect - 1) * 100).toFixed(0)}%
            </div>
            <div class="text-xs text-obsidian-400 mt-1">
              Overestimating effect
            </div>
          </div>
        </div>
        <p class="mt-4 text-xs text-obsidian-400">
          {#if instrumentStrength < 0.3}
            ⚠️ Weak instrument! IV estimate will have high variance.
          {:else if confoundingBias > 7}
            Notice how OLS is heavily biased, but IV recovers the true effect.
          {:else}
            ✓ Good setup. IV is closer to truth than OLS.
          {/if}
        </p>
      </div>

      <!-- DAG -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Causal Diagram</h3>
        <div class="flex items-center justify-center gap-4 p-6 bg-obsidian-800/50 rounded-lg">
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-jade-500/20 border border-jade-500/30 flex items-center justify-center text-jade-400 font-semibold">Z</div>
            <div class="text-xs text-obsidian-400 mt-1">Instrument</div>
          </div>
          <div class="text-jade-400">→</div>
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-amber-350/20 border border-amber-350/30 flex items-center justify-center text-amber-350 font-semibold">X</div>
            <div class="text-xs text-obsidian-400 mt-1">Treatment</div>
          </div>
          <div class="text-jade-400">→</div>
          <div class="text-center">
            <div class="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold">Y</div>
            <div class="text-xs text-obsidian-400 mt-1">Outcome</div>
          </div>
        </div>
        <div class="text-center mt-3">
          <div class="inline-block text-center">
            <div class="w-12 h-12 rounded-full bg-crimson-500/20 border border-crimson-500/30 flex items-center justify-center text-crimson-400 font-semibold mx-auto">U</div>
            <div class="text-xs text-crimson-400 mt-1">Confounder (unobserved)</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Betting Examples -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏈 Betting IV Examples</h2>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Promo Effect</h3>
        <p class="text-xs text-obsidian-300 mb-2">
          <strong>Q:</strong> Do promos increase LTV?
        </p>
        <p class="text-xs text-jade-400">
          <strong>IV:</strong> Random promo assignment (A/B test)
        </p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Line Movement</h3>
        <p class="text-xs text-obsidian-300 mb-2">
          <strong>Q:</strong> Do sharp bets cause line moves?
        </p>
        <p class="text-xs text-jade-400">
          <strong>IV:</strong> Sharp bettor availability (travel schedule)
        </p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Live Betting</h3>
        <p class="text-xs text-obsidian-300 mb-2">
          <strong>Q:</strong> Does live betting increase engagement?
        </p>
        <p class="text-xs text-jade-400">
          <strong>IV:</strong> Staggered state rollout
        </p>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Instrumental variables with 2SLS
library(AER)

# Simulate data
set.seed(42)
n &lt;- {sampleSize}
confounder &lt;- rnorm(n, 0, 10)
z &lt;- rnorm(n, 50, 15)  # Instrument
x &lt;- 10 + {instrumentStrength} * z + 0.8 * confounder + rnorm(n, 0, 5)
y &lt;- 100 + 2 * x + {confoundingBias} * confounder + rnorm(n, 0, 20)

# OLS (biased)
ols_model &lt;- lm(y ~ x)
cat("OLS estimate:", coef(ols_model)["x"], "\n")

# 2SLS (unbiased)
iv_model &lt;- ivreg(y ~ x | z)
cat("IV estimate:", coef(iv_model)["x"], "\n")

# First stage F-stat
first_stage &lt;- lm(x ~ z)
cat("First stage F:", summary(first_stage)$fstatistic[1], "\n")</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• IV solves endogeneity (confounding)</li>
        <li>• Need valid instrument: affects X, not Y directly</li>
        <li>• Check first-stage F greater than 10 (strong instrument)</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• 2SLS: regress X on Z, then Y on predicted X</li>
        <li>• Common IVs: randomization, policy changes</li>
        <li>• IV estimate has higher variance than OLS</li>
      </ul>
    </div>
  </div>
</div>

