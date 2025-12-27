<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG } from '$lib/utils/synthetic-data';

  // Scenario: actual outcome and predicted probability
  let predictedProb = $state(0.7);
  let actualOutcome = $state(1); // 1 = happened, 0 = didn't

  // Calculate Brier Score for single prediction
  const brierScore = $derived(Math.pow(predictedProb - actualOutcome, 2));

  // Generate sample predictions for calibration demo
  const samplePredictions = $derived(() => {
    const rng = createRNG(42);
    const predictions: Array<{ prob: number, actual: number, brier: number }> = [];
    
    for (let i = 0; i < 100; i++) {
      const prob = rng();
      // Actual outcome based on probability (well-calibrated model)
      const actual = rng() < prob ? 1 : 0;
      const brier = Math.pow(prob - actual, 2);
      predictions.push({ prob, actual, brier });
    }
    
    return predictions;
  });

  // Calculate average Brier score
  const averageBrier = $derived(() => {
    const preds = samplePredictions();
    return preds.reduce((sum, p) => sum + p.brier, 0) / preds.length;
  });

  // Calibration bins
  const calibrationBins = $derived(() => {
    const preds = samplePredictions();
    const bins: Array<{ range: string, predicted: number, actual: number, count: number }> = [];
    
    for (let i = 0; i < 10; i++) {
      const low = i / 10;
      const high = (i + 1) / 10;
      const inBin = preds.filter(p => p.prob >= low && p.prob < high);
      
      if (inBin.length > 0) {
        const avgPred = inBin.reduce((s, p) => s + p.prob, 0) / inBin.length;
        const avgActual = inBin.reduce((s, p) => s + p.actual, 0) / inBin.length;
        bins.push({
          range: `${(low * 100).toFixed(0)}-${(high * 100).toFixed(0)}%`,
          predicted: avgPred * 100,
          actual: avgActual * 100,
          count: inBin.length
        });
      }
    }
    
    return bins;
  });

  // Comparison models
  const models = [
    { name: 'Perfect', brier: 0, desc: 'Always predicts exactly right' },
    { name: 'Excellent', brier: 0.1, desc: 'Tournament winning' },
    { name: 'Good', brier: 0.2, desc: 'Useful for betting' },
    { name: 'Average', brier: 0.25, desc: 'Random baseline' },
    { name: 'Poor', brier: 0.35, desc: 'Worse than guessing' }
  ];

  function getBrierClass(score: number): string {
    if (score < 0.1) return 'text-jade-400';
    if (score < 0.2) return 'text-jade-400/70';
    if (score < 0.25) return 'text-amber-350';
    return 'text-crimson-400';
  }
</script>

<svelte:head>
  <title>Brier Score | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Metrics & Evaluation</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Brier Score</h1>
    <p class="section-subtitle max-w-3xl">
      Measure the accuracy of probabilistic predictions. Lower is better.
      Critical for evaluating calibration of betting models.
    </p>
  </div>

  <!-- Formula -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Brier Score Formula</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <div class="formula text-xl mb-4">
          BS = (1/N) × Σ(p_i - o_i)²
        </div>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li><span class="text-amber-350">p_i</span> = Predicted probability</li>
          <li><span class="text-amber-350">o_i</span> = Actual outcome (0 or 1)</li>
          <li><span class="text-amber-350">N</span> = Number of predictions</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Interpretation</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• <span class="text-jade-400">0.0</span> = Perfect predictions</li>
          <li>• <span class="text-amber-350">0.25</span> = Random guessing (50% each)</li>
          <li>• <span class="text-crimson-400">1.0</span> = Always 100% wrong</li>
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
          <Slider 
            bind:value={predictedProb} 
            min={0} max={1} step={0.05} 
            label="Predicted Probability" 
          />
          <div>
            <label class="text-sm text-obsidian-300 mb-2 block">Actual Outcome</label>
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
          </div>
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Result</h3>
        <div class="text-center">
          <div class="font-mono text-4xl {getBrierClass(brierScore)}">
            {brierScore.toFixed(4)}
          </div>
          <p class="text-sm text-obsidian-400 mt-2">
            ({predictedProb.toFixed(2)} - {actualOutcome})² = {brierScore.toFixed(4)}
          </p>
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg">
          <p class="text-xs text-obsidian-400">
            {#if brierScore < 0.1}
              Excellent prediction!
            {:else if brierScore < 0.25}
              Good prediction, useful for betting.
            {:else if brierScore < 0.5}
              Below average, needs calibration.
            {:else}
              Poor prediction, confidently wrong.
            {/if}
          </p>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Sample Model</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Predictions</span>
            <span class="font-mono text-obsidian-200">100</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Avg Brier Score</span>
            <span class="font-mono {getBrierClass(averageBrier())}">{averageBrier().toFixed(4)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Calibration Chart -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Calibration Chart</h3>
        <div class="h-56">
          <LineChart 
            labels={calibrationBins().map(b => b.range)}
            datasets={[
              {
                label: 'Predicted %',
                data: calibrationBins().map(b => b.predicted),
                borderColor: '#f5c542',
                fill: false
              },
              {
                label: 'Actual %',
                data: calibrationBins().map(b => b.actual),
                borderColor: '#34d399',
                fill: false
              },
              {
                label: 'Perfect Calibration',
                data: calibrationBins().map(b => b.predicted),
                borderColor: '#94a3b8',
                fill: false,
                borderDash: [5, 5]
              }
            ]}
            xAxisLabel="Predicted Probability Bin"
            yAxisLabel="Percentage"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Well-calibrated model: predicted % ≈ actual %. When you predict 70%, it should happen 70% of the time.
        </p>
      </div>

      <!-- Benchmark Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Brier Score Benchmarks</h3>
        <div class="space-y-3">
          {#each models as model}
            <div class="flex items-center gap-4">
              <div class="w-24 text-sm text-obsidian-300">{model.name}</div>
              <div class="flex-1 h-4 bg-obsidian-800 rounded-full overflow-hidden">
                <div 
                  class="h-full {model.brier < 0.1 ? 'bg-jade-500' : model.brier < 0.2 ? 'bg-jade-500/70' : model.brier < 0.25 ? 'bg-amber-350' : 'bg-crimson-500'}"
                  style="width: {model.brier * 100}%"
                ></div>
              </div>
              <div class="w-16 font-mono text-sm {getBrierClass(model.brier)}">{model.brier.toFixed(2)}</div>
              <div class="w-32 text-xs text-obsidian-400">{model.desc}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Decomposition -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔬 Brier Score Decomposition</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Calibration</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          How well predicted probabilities match observed frequencies.
        </p>
        <p class="text-xs text-obsidian-400">
          70% predictions should win ~70% of the time.
        </p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Resolution</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          How much predictions vary from base rate.
        </p>
        <p class="text-xs text-obsidian-400">
          Always predicting 50% = no resolution.
        </p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Uncertainty</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Inherent unpredictability of outcomes.
        </p>
        <p class="text-xs text-obsidian-400">
          Can't be reduced—max at 50% base rate.
        </p>
      </div>
    </div>
  </div>

  <!-- Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Sports Pricing Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Model Evaluation</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Compare different projection models</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Track model performance over time</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Identify miscalibrated probability bins</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Pricing Validation</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Verify implied probabilities are accurate</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Compare to closing line performance</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Segment by sport/market for tuning</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calculate Brier Score
brier_score &lt;- function(predicted, actual) {'{'} 
  mean((predicted - actual)^2)
{'}'}

# Calibration plot
plot_calibration &lt;- function(predicted, actual, n_bins = 10) {'{'} 
  bins &lt;- cut(predicted, breaks = seq(0, 1, length.out = n_bins + 1))
  
  calibration &lt;- data.frame(
    bin = levels(bins),
    predicted = tapply(predicted, bins, mean),
    actual = tapply(actual, bins, mean)
  )
  
  ggplot(calibration, aes(x = predicted)) +
    geom_line(aes(y = predicted), linetype = "dashed") +
    geom_point(aes(y = actual), color = "green") +
    labs(x = "Predicted", y = "Actual") +
    theme_minimal()
{'}'}

# Example
predicted &lt;- c({predictedProb})
actual &lt;- c({actualOutcome})
bs &lt;- brier_score(predicted, actual)
cat(sprintf("Brier Score: %.4f\n", bs))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Brier Score: lower = better (0 = perfect)</li>
        <li>• 0.25 is random guessing baseline</li>
        <li>• Penalizes confident wrong predictions heavily</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Use calibration plots to diagnose issues</li>
        <li>• Decompose into calibration + resolution</li>
        <li>• Track over time to detect model drift</li>
      </ul>
    </div>
  </div>
</div>

