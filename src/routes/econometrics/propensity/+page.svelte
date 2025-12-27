<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Propensity matching parameters
  let selectionBias = $state(5);
  let treatmentEffect = $state(10);
  let sampleSize = $state(200);

  // Generate data
  const data = $derived(() => {
    const rng = createRNG(42);
    const subjects: Array<{
      x: number,
      propensity: number,
      treated: number,
      y: number
    }> = [];
    
    for (let i = 0; i < sampleSize; i++) {
      // Covariate (e.g., prior engagement)
      const x = normalRandom(rng, 50, 15);
      
      // Propensity to be treated (selection bias: high x more likely treated)
      const logit = -2 + selectionBias * 0.01 * x;
      const propensity = 1 / (1 + Math.exp(-logit));
      
      // Treatment assignment (biased)
      const treated = rng() < propensity ? 1 : 0;
      
      // Outcome (true effect is treatmentEffect, but x also affects y)
      const y = 100 + 0.5 * x + treated * treatmentEffect + normalRandom(rng, 0, 10);
      
      subjects.push({ x, propensity, treated, y });
    }
    
    return subjects;
  });

  // Naive comparison
  const naiveEffect = $derived(() => {
    const d = data();
    const treated = d.filter(s => s.treated === 1);
    const control = d.filter(s => s.treated === 0);
    
    const meanTreated = treated.reduce((s, p) => s + p.y, 0) / treated.length;
    const meanControl = control.reduce((s, p) => s + p.y, 0) / control.length;
    
    return meanTreated - meanControl;
  });

  // Propensity-matched estimate (simplified nearest neighbor)
  const matchedEffect = $derived(() => {
    const d = data();
    const treated = d.filter(s => s.treated === 1);
    const control = d.filter(s => s.treated === 0);
    
    let totalDiff = 0;
    let matched = 0;
    
    for (const t of treated) {
      // Find nearest control by propensity
      let best = control[0];
      let bestDist = Math.abs(t.propensity - control[0].propensity);
      
      for (const c of control) {
        const dist = Math.abs(t.propensity - c.propensity);
        if (dist < bestDist) {
          best = c;
          bestDist = dist;
        }
      }
      
      if (bestDist < 0.2) {
        totalDiff += t.y - best.y;
        matched++;
      }
    }
    
    return matched > 0 ? totalDiff / matched : 0;
  });

  // Propensity score distribution
  const propensityDist = $derived(() => {
    const d = data();
    const treated = d.filter(s => s.treated === 1);
    const control = d.filter(s => s.treated === 0);
    
    const bins = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    const labels = bins.slice(0, -1).map((b, i) => `${b.toFixed(1)}-${bins[i + 1].toFixed(1)}`);
    
    const treatedCounts = labels.map((_, i) => 
      treated.filter(t => t.propensity >= bins[i] && t.propensity < bins[i + 1]).length
    );
    const controlCounts = labels.map((_, i) => 
      control.filter(c => c.propensity >= bins[i] && c.propensity < bins[i + 1]).length
    );
    
    return { labels, treatedCounts, controlCounts };
  });

  // Common support region
  const overlapGood = $derived(() => {
    const d = data();
    const treated = d.filter(s => s.treated === 1);
    const control = d.filter(s => s.treated === 0);
    
    const tMin = Math.min(...treated.map(t => t.propensity));
    const tMax = Math.max(...treated.map(t => t.propensity));
    const cMin = Math.min(...control.map(c => c.propensity));
    const cMax = Math.max(...control.map(c => c.propensity));
    
    return Math.max(tMin, cMin) < Math.min(tMax, cMax);
  });
</script>

<svelte:head>
  <title>Propensity Matching | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Econometrics</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Propensity Score Matching</h1>
    <p class="section-subtitle max-w-3xl">
      Estimate treatment effects when randomization isn't possible. Match treated
      and control subjects with similar propensity scores to reduce selection bias.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Selection Bias Problem</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <p class="text-sm text-obsidian-300 mb-3">
          When treatment isn't random, treated and control groups differ systematically.
          Naive comparison conflates treatment effect with selection effect.
        </p>
        <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
          <h4 class="text-crimson-400 font-semibold mb-2">Example</h4>
          <p class="text-xs text-obsidian-300">
            VIP program members have higher LTV. But is it the VIP perks, or were they
            already high-value customers before joining?
          </p>
        </div>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h4 class="text-amber-350 font-semibold mb-2">The PSM Solution</h4>
        <div class="text-sm text-obsidian-300 space-y-2">
          <p>1. Estimate P(treatment | covariates)</p>
          <p>2. Match treated to controls with similar P</p>
          <p>3. Compare matched pairs only</p>
        </div>
        <p class="text-xs text-jade-400 mt-3">
          "Compare apples to apples" by matching on treatment propensity.
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
          <Slider bind:value={selectionBias} min={0} max={10} step={1} label="Selection Bias" />
          <Slider bind:value={treatmentEffect} min={0} max={20} step={2} label="True Treatment Effect" />
          <Slider bind:value={sampleSize} min={100} max={400} step={50} label="Sample Size" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Effect Estimates</h3>
        <div class="space-y-4">
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-obsidian-300 text-sm">True Effect</span>
              <span class="font-mono text-jade-400">{treatmentEffect.toFixed(1)}</span>
            </div>
          </div>
          <div class="p-3 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-obsidian-300 text-sm">Naive (biased)</span>
              <span class="font-mono text-crimson-400">{naiveEffect().toFixed(1)}</span>
            </div>
            <div class="text-xs text-crimson-400 mt-1">
              Bias: {(naiveEffect() - treatmentEffect).toFixed(1)}
            </div>
          </div>
          <div class="p-3 bg-jade-500/10 border border-jade-500/30 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-obsidian-300 text-sm">PSM Matched</span>
              <span class="font-mono text-jade-400">{matchedEffect().toFixed(1)}</span>
            </div>
            <div class="text-xs text-jade-400 mt-1">
              Error: {(matchedEffect() - treatmentEffect).toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Propensity Distribution -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Propensity Score Distribution</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h4 class="text-xs text-jade-400 mb-2 text-center">Treated</h4>
            <div class="h-32">
              <BarChart 
                labels={propensityDist().labels}
                data={propensityDist().treatedCounts}
                color="#34d399"
              />
            </div>
          </div>
          <div>
            <h4 class="text-xs text-obsidian-400 mb-2 text-center">Control</h4>
            <div class="h-32">
              <BarChart 
                labels={propensityDist().labels}
                data={propensityDist().controlCounts}
                color="#64748b"
              />
            </div>
          </div>
        </div>
        <div class="p-3 bg-obsidian-800/50 rounded-lg text-xs text-center {overlapGood() ? 'text-jade-400' : 'text-crimson-400'}">
          {#if overlapGood()}
            ✓ Good overlap in propensity scores - matching feasible
          {:else}
            ⚠️ Poor overlap - some treated subjects have no comparable controls
          {/if}
        </div>
      </div>

      <!-- Matching Process -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Matching Process</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-3xl mb-2">1️⃣</div>
            <h4 class="text-amber-350 font-semibold mb-1">Estimate Propensity</h4>
            <p class="text-xs text-obsidian-400">Logistic regression: P(T|X)</p>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-3xl mb-2">2️⃣</div>
            <h4 class="text-amber-350 font-semibold mb-1">Match</h4>
            <p class="text-xs text-obsidian-400">Pair treated with similar controls</p>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-3xl mb-2">3️⃣</div>
            <h4 class="text-amber-350 font-semibold mb-1">Compare</h4>
            <p class="text-xs text-obsidian-400">ATT = mean(Y_T - Y_C) for pairs</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Betting Examples -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎰 Betting Applications</h2>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">VIP Effect</h3>
        <p class="text-xs text-obsidian-300 mb-2">
          Match VIPs to non-VIPs with similar prior activity.
        </p>
        <p class="text-xs text-jade-400">Compare LTV post-enrollment.</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Promo Impact</h3>
        <p class="text-xs text-obsidian-300 mb-2">
          Match promo recipients to non-recipients by propensity.
        </p>
        <p class="text-xs text-jade-400">Estimate true promo ROI.</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Feature Adoption</h3>
        <p class="text-xs text-obsidian-300 mb-2">
          Match users who adopted new feature vs those who didn't.
        </p>
        <p class="text-xs text-jade-400">Measure engagement lift.</p>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Propensity score matching
library(MatchIt)

# Simulate data
set.seed(42)
n &lt;- {sampleSize}
x &lt;- rnorm(n, 50, 15)
propensity &lt;- plogis(-2 + {selectionBias} * 0.01 * x)
treated &lt;- rbinom(n, 1, propensity)
y &lt;- 100 + 0.5 * x + {treatmentEffect} * treated + rnorm(n, 0, 10)
df &lt;- data.frame(x, treated, y)

# Naive comparison
naive &lt;- mean(df$y[df$treated == 1]) - mean(df$y[df$treated == 0])
cat("Naive effect:", naive, "\n")

# Propensity score matching
m.out &lt;- matchit(treated ~ x, data = df, method = "nearest")
m.data &lt;- match.data(m.out)

# Matched comparison
matched_effect &lt;- mean(m.data$y[m.data$treated == 1]) - 
                  mean(m.data$y[m.data$treated == 0])
cat("Matched effect:", matched_effect, "\n")

# Check balance
summary(m.out)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• PSM reduces selection bias in observational data</li>
        <li>• Match on P(treatment | covariates)</li>
        <li>• Check for common support (overlap)</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• ATT: Average Treatment effect on Treated</li>
        <li>• Requires all confounders measured</li>
        <li>• Balance checks essential post-matching</li>
      </ul>
    </div>
  </div>
</div>

