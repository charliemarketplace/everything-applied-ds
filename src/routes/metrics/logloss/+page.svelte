<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG } from '$lib/utils/synthetic-data';

  // Single prediction demo
  let predictedProb = $state(0.7);
  let actualOutcome = $state(1);

  // Calculate log loss for single prediction
  const logLoss = $derived(() => {
    const eps = 1e-15;
    const p = Math.max(eps, Math.min(1 - eps, predictedProb));
    
    if (actualOutcome === 1) {
      return -Math.log(p);
    } else {
      return -Math.log(1 - p);
    }
  });

  // Generate log loss curve
  const logLossCurve = $derived(() => {
    const eps = 1e-15;
    const probs = [];
    const lossesPos = [];
    const lossesNeg = [];
    
    for (let p = 0.01; p <= 0.99; p += 0.02) {
      probs.push((p * 100).toFixed(0));
      lossesPos.push(-Math.log(Math.max(eps, p)));
      lossesNeg.push(-Math.log(Math.max(eps, 1 - p)));
    }
    
    return { probs, lossesPos, lossesNeg };
  });

  // Simulate model comparison
  const modelComparison = $derived(() => {
    const rng = createRNG(42);
    const n = 200;
    
    // Model A: well calibrated
    // Model B: overconfident
    let lossA = 0;
    let lossB = 0;
    const eps = 1e-15;
    
    for (let i = 0; i < n; i++) {
      const trueProb = rng();
      const actual = rng() < trueProb ? 1 : 0;
      
      // Model A: close to true prob
      const predA = Math.max(eps, Math.min(1 - eps, trueProb + (rng() - 0.5) * 0.1));
      
      // Model B: overconfident (push away from 0.5)
      let predB = trueProb;
      if (predB > 0.5) predB = 0.5 + (predB - 0.5) * 1.5;
      else predB = 0.5 - (0.5 - predB) * 1.5;
      predB = Math.max(eps, Math.min(1 - eps, predB));
      
      lossA += actual === 1 ? -Math.log(predA) : -Math.log(1 - predA);
      lossB += actual === 1 ? -Math.log(predB) : -Math.log(1 - predB);
    }
    
    return { 
      modelA: lossA / n, 
      modelB: lossB / n,
      baseline: Math.log(2) // random 50/50
    };
  });

  function getLogLossClass(loss: number): string {
    if (loss < 0.3) return 'text-jade-400';
    if (loss < 0.5) return 'text-amber-350';
    if (loss < 1) return 'text-amber-350/70';
    return 'text-crimson-400';
  }
</script>

<svelte:head>
  <title>Log Loss | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Metrics & Evaluation</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Log Loss (Cross-Entropy)</h1>
    <p class="section-subtitle max-w-3xl">
      Measure how well probability predictions match outcomes. Heavily penalizes
      confident wrong predictions. The standard loss for classification.
    </p>
  </div>

  <!-- Formula -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Log Loss Formula</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <div class="formula text-lg mb-4">
          LogLoss = -1/N × Σ[y·log(p) + (1-y)·log(1-p)]
        </div>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li><span class="text-amber-350">y</span> = Actual outcome (0 or 1)</li>
          <li><span class="text-amber-350">p</span> = Predicted probability</li>
          <li><span class="text-amber-350">N</span> = Number of predictions</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Key Properties</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• <span class="text-jade-400">0</span> = Perfect predictions</li>
          <li>• <span class="text-amber-350">0.693</span> = Random (50/50 guessing)</li>
          <li>• <span class="text-crimson-400">∞</span> = 100% confident and wrong</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Calculator -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Single Prediction</h3>
        <div class="space-y-4">
          <Slider bind:value={predictedProb} min={0.01} max={0.99} step={0.01} label="Predicted Probability" />
          <fieldset>
            <legend class="text-sm text-obsidian-300 mb-2 block">Actual Outcome</legend>
            <div class="grid grid-cols-2 gap-2">
              <button
                class="px-4 py-2 rounded-lg text-sm font-mono transition-colors {actualOutcome === 0 ? 'bg-crimson-500 text-white' : 'bg-obsidian-800 text-obsidian-300 hover:bg-obsidian-700'}"
                onclick={() => actualOutcome = 0}
              >
                0 (No)
              </button>
              <button
                class="px-4 py-2 rounded-lg text-sm font-mono transition-colors {actualOutcome === 1 ? 'bg-jade-500 text-white' : 'bg-obsidian-800 text-obsidian-300 hover:bg-obsidian-700'}"
                onclick={() => actualOutcome = 1}
              >
                1 (Yes)
              </button>
            </div>
          </fieldset>
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Result</h3>
        <div class="text-center">
          <div class="font-mono text-4xl {getLogLossClass(logLoss())}">
            {logLoss().toFixed(4)}
          </div>
          <p class="text-sm text-obsidian-400 mt-2">
            -log({actualOutcome === 1 ? predictedProb.toFixed(2) : (1 - predictedProb).toFixed(2)})
          </p>
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-xs text-obsidian-400">
          {#if logLoss() < 0.3}
            Excellent! High confidence, correct prediction.
          {:else if logLoss() < 0.7}
            Moderate loss. Prediction was uncertain.
          {:else if logLoss() < 2}
            High loss. Prediction was wrong and fairly confident.
          {:else}
            Very high loss! Confident wrong prediction is heavily penalized.
          {/if}
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Loss Curve -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Log Loss Penalty Curves</h3>
        <div class="h-56">
          <LineChart 
            labels={logLossCurve().probs}
            datasets={[
              {
                label: 'When Actual = 1',
                data: logLossCurve().lossesPos,
                borderColor: '#34d399',
                fill: false
              },
              {
                label: 'When Actual = 0',
                data: logLossCurve().lossesNeg,
                borderColor: '#dc2626',
                fill: false
              }
            ]}
            xAxisLabel="Predicted Probability (%)"
            yAxisLabel="Log Loss"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          When actual=1, low probability predictions get heavily penalized (green curve rises left).
          The opposite for actual=0 (red curve rises right).
        </p>
      </div>

      <!-- Model Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Model Comparison</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-jade-400 mb-1">Well-Calibrated Model</div>
            <div class="font-mono text-2xl text-jade-400">{modelComparison().modelA.toFixed(3)}</div>
          </div>
          <div class="p-4 bg-crimson-500/20 border border-crimson-500/30 rounded-lg text-center">
            <div class="text-xs text-crimson-400 mb-1">Overconfident Model</div>
            <div class="font-mono text-2xl text-crimson-400">{modelComparison().modelB.toFixed(3)}</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Random Baseline</div>
            <div class="font-mono text-2xl text-obsidian-300">{modelComparison().baseline.toFixed(3)}</div>
          </div>
        </div>
        <p class="mt-4 text-xs text-obsidian-400">
          <strong class="text-amber-350">Insight:</strong> Overconfident models get punished hard by log loss
          when they're wrong, even if their accuracy is similar.
        </p>
      </div>
    </div>
  </div>

  <!-- Log Loss vs Accuracy -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📊 Log Loss vs Accuracy</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-3">Accuracy</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Only cares about correct/incorrect. Ignores confidence.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• 51% prediction, actual=1 → ✓ Correct</li>
          <li>• 99% prediction, actual=1 → ✓ Correct (same credit)</li>
          <li>• Doesn't reward calibrated probabilities</li>
        </ul>
      </div>
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-3">Log Loss</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Measures confidence AND correctness. Penalizes overconfidence.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• 51% prediction, actual=1 → Loss: 0.67</li>
          <li>• 99% prediction, actual=1 → Loss: 0.01 (much better)</li>
          <li>• Rewards well-calibrated probabilities</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Sports Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Sports Betting Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">When to Use Log Loss</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Evaluating probability predictions (not just picks)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Training classification models</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Comparing model calibration</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Practical Tips</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Lower is better (unlike accuracy)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>0.693 = random baseline (beat this!)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Clip probabilities to [0.01, 0.99] for stability</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calculate Log Loss
log_loss &lt;- function(predicted, actual, eps = 1e-15) {'{'} 
  # Clip predictions to avoid log(0)
  predicted &lt;- pmax(eps, pmin(1 - eps, predicted))
  
  # Calculate loss
  loss &lt;- -(actual * log(predicted) + (1 - actual) * log(1 - predicted))
  
  return(mean(loss))
{'}'}

# Example
pred &lt;- c({predictedProb})
actual &lt;- c({actualOutcome})
ll &lt;- log_loss(pred, actual)
cat(sprintf("Log Loss: %.4f\n", ll))

# Compare to baseline
baseline_loss &lt;- log(2)  # Random 50/50
cat(sprintf("Baseline (random): %.4f\n", baseline_loss))
cat(sprintf("Improvement: %.1f%%\n", (1 - ll/baseline_loss) * 100))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Log loss: lower is better (0 = perfect)</li>
        <li>• Heavily penalizes confident wrong predictions</li>
        <li>• 0.693 = random baseline (50/50 guessing)</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Better than accuracy for probability evaluation</li>
        <li>• Use for training classification models</li>
        <li>• Clip predictions to avoid infinity</li>
      </ul>
    </div>
  </div>
</div>

