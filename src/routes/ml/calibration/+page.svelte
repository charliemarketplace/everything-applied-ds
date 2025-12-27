<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Model calibration parameters
  let baseAccuracy = $state(70);
  let calibrationError = $state(10);
  let overConfidence = $state(15);

  // Generate calibration data
  const generateCalibrationData = $derived(() => {
    const rng = createRNG(42);
    const n = 500;
    const bins = 10;
    
    // Generate predictions and outcomes
    const predictions: Array<{ prob: number, actual: number }> = [];
    
    for (let i = 0; i < n; i++) {
      // True probability (what should happen)
      const trueProb = rng();
      
      // Model prediction (with calibration error)
      let modelProb = trueProb;
      
      // Add overconfidence (push away from 0.5)
      if (overConfidence > 0) {
        const direction = modelProb > 0.5 ? 1 : -1;
        modelProb = 0.5 + (modelProb - 0.5) * (1 + overConfidence / 100);
        modelProb = Math.max(0.01, Math.min(0.99, modelProb));
      }
      
      // Add random noise
      modelProb += normalRandom(rng, 0, calibrationError / 100);
      modelProb = Math.max(0.01, Math.min(0.99, modelProb));
      
      // Actual outcome based on true probability
      const actual = rng() < trueProb ? 1 : 0;
      
      predictions.push({ prob: modelProb, actual });
    }
    
    // Bin predictions
    const binData: Array<{ binMid: number, predicted: number, actual: number, count: number }> = [];
    
    for (let b = 0; b < bins; b++) {
      const low = b / bins;
      const high = (b + 1) / bins;
      const inBin = predictions.filter(p => p.prob >= low && p.prob < high);
      
      if (inBin.length > 0) {
        const avgPred = inBin.reduce((s, p) => s + p.prob, 0) / inBin.length;
        const avgActual = inBin.reduce((s, p) => s + p.actual, 0) / inBin.length;
        binData.push({
          binMid: (low + high) / 2,
          predicted: avgPred * 100,
          actual: avgActual * 100,
          count: inBin.length
        });
      }
    }
    
    return { predictions, binData };
  });

  // Expected Calibration Error
  const ece = $derived(() => {
    const data = generateCalibrationData();
    let weightedError = 0;
    let totalCount = data.predictions.length;
    
    for (const bin of data.binData) {
      const error = Math.abs(bin.predicted - bin.actual);
      weightedError += (bin.count / totalCount) * error;
    }
    
    return weightedError;
  });

  // Brier score
  const brierScore = $derived(() => {
    const preds = generateCalibrationData().predictions;
    return preds.reduce((s, p) => s + Math.pow(p.prob - p.actual, 2), 0) / preds.length;
  });

  // Calibration methods
  const methods = [
    { name: 'Platt Scaling', desc: 'Fit sigmoid to outputs', type: 'Parametric' },
    { name: 'Isotonic Regression', desc: 'Non-parametric monotonic fit', type: 'Non-parametric' },
    { name: 'Temperature Scaling', desc: 'Single parameter softmax', type: 'Parametric' },
    { name: 'Histogram Binning', desc: 'Bin-specific corrections', type: 'Non-parametric' }
  ];
</script>

<svelte:head>
  <title>Model Calibration | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Machine Learning</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Model Calibration</h1>
    <p class="section-subtitle max-w-3xl">
      Ensure predicted probabilities match observed frequencies. A 70% prediction
      should win 70% of the time. Critical for pricing and risk assessment.
    </p>
  </div>

  <!-- Why Calibration -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🎯 Why Calibration Matters</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">📊</div>
        <h3 class="text-jade-400 font-semibold mb-2">Accurate Pricing</h3>
        <p class="text-xs text-obsidian-300">
          Miscalibrated probabilities = mispriced lines. You either give edge or lose customers.
        </p>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg text-center">
        <div class="text-3xl mb-2">⚖️</div>
        <h3 class="text-amber-350 font-semibold mb-2">Risk Assessment</h3>
        <p class="text-xs text-obsidian-300">
          VaR and stress tests need calibrated probabilities for valid estimates.
        </p>
      </div>
      <div class="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">🎰</div>
        <h3 class="text-blue-400 font-semibold mb-2">Bettor Trust</h3>
        <p class="text-xs text-obsidian-300">
          Well-calibrated odds feel fair. Builds long-term customer relationships.
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Model Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={calibrationError} min={0} max={30} step={2} label="Calibration Error (%)" />
          <Slider bind:value={overConfidence} min={-20} max={40} step={5} label="Overconfidence (%)" />
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-xs text-obsidian-400">
          <p><strong class="text-amber-350">Overconfidence:</strong> Model pushes predictions away from 50%</p>
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Metrics</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">ECE (Expected Cal. Error)</span>
            <span class="font-mono text-lg {ece() < 5 ? 'text-jade-400' : ece() < 10 ? 'text-amber-350' : 'text-crimson-400'}">
              {ece().toFixed(1)}%
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Brier Score</span>
            <span class="font-mono text-lg {brierScore() < 0.2 ? 'text-jade-400' : 'text-amber-350'}">
              {brierScore().toFixed(3)}
            </span>
          </div>
        </div>
        <div class="mt-4 h-2 bg-obsidian-800 rounded-full overflow-hidden">
          <div 
            class="h-full transition-all duration-300 {ece() < 5 ? 'bg-jade-500' : ece() < 10 ? 'bg-amber-350' : 'bg-crimson-500'}"
            style="width: {Math.min(100, ece() * 5)}%"
          ></div>
        </div>
        <p class="text-xs text-obsidian-400 mt-2">
          {ece() < 5 ? 'Well calibrated!' : ece() < 10 ? 'Acceptable calibration' : 'Needs calibration correction'}
        </p>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Calibration Plot -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Reliability Diagram</h3>
        <div class="h-64">
          <LineChart 
            labels={generateCalibrationData().binData.map(b => `${(b.binMid * 100).toFixed(0)}%`)}
            datasets={[
              {
                label: 'Model Predictions',
                data: generateCalibrationData().binData.map(b => b.predicted),
                borderColor: '#f5c542',
                fill: false
              },
              {
                label: 'Actual Outcomes',
                data: generateCalibrationData().binData.map(b => b.actual),
                borderColor: '#34d399',
                fill: false
              },
              {
                label: 'Perfect Calibration',
                data: generateCalibrationData().binData.map(b => b.binMid * 100),
                borderColor: '#94a3b8',
                fill: false,
                borderDash: [5, 5]
              }
            ]}
            xAxisLabel="Predicted Probability"
            yAxisLabel="Actual Frequency (%)"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Perfect calibration: line follows diagonal. Above = underconfident, Below = overconfident.
        </p>
      </div>

      <!-- Interpretation -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Reading the Chart</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
            <h4 class="text-jade-400 font-semibold mb-2">Well Calibrated</h4>
            <p class="text-xs text-obsidian-300">
              Green (actual) line follows yellow (predicted) line closely.
              70% predictions win ~70% of the time.
            </p>
          </div>
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
            <h4 class="text-crimson-400 font-semibold mb-2">Overconfident</h4>
            <p class="text-xs text-obsidian-300">
              Actual outcomes lower than predictions for high probabilities.
              Model says 80%, actually happens 60%.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Calibration Methods -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔧 Calibration Methods</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each methods as method}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-amber-350 font-semibold">{method.name}</h3>
            <span class="text-xs px-2 py-0.5 rounded-full bg-jade-500/20 text-jade-400">{method.type}</span>
          </div>
          <p class="text-xs text-obsidian-300">{method.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Practical Tips -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💡 Practical Tips</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">When to Calibrate</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>After training any classifier (SVM, NN, tree-based)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Before using probabilities for pricing</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Regularly as model drifts</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Best Practices</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Use holdout set for calibration (not training)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Platt scaling works well with enough data</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Temperature scaling for neural networks</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calibration analysis
library(CalibrationCurves)

# Calculate Expected Calibration Error
calculate_ece &lt;- function(predictions, actuals, n_bins = 10) {'{'} 
  bins &lt;- cut(predictions, breaks = seq(0, 1, length.out = n_bins + 1))
  
  ece &lt;- 0
  n_total &lt;- length(predictions)
  
  for (b in levels(bins)) {'{'} 
    in_bin &lt;- which(bins == b)
    if (length(in_bin) &gt; 0) {'{'} 
      avg_pred &lt;- mean(predictions[in_bin])
      avg_actual &lt;- mean(actuals[in_bin])
      weight &lt;- length(in_bin) / n_total
      ece &lt;- ece + weight * abs(avg_pred - avg_actual)
    {'}'}
  {'}'}
  
  return(ece)
{'}'}

# Platt scaling calibration
platt_calibrate &lt;- function(predictions, actuals) {'{'} 
  model &lt;- glm(actuals ~ predictions, family = binomial)
  calibrated &lt;- predict(model, type = "response")
  return(calibrated)
{'}'}

# Temperature scaling (for neural nets)
temperature_scale &lt;- function(logits, temperature) {'{'} 
  scaled &lt;- logits / temperature
  probs &lt;- exp(scaled) / (1 + exp(scaled))
  return(probs)
{'}'}</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• 70% prediction should win 70% of the time</li>
        <li>• Use reliability diagrams to visualize calibration</li>
        <li>• ECE measures overall calibration quality</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Platt scaling and isotonic regression are common fixes</li>
        <li>• Always calibrate on held-out data</li>
        <li>• Re-calibrate as model drifts</li>
      </ul>
    </div>
  </div>
</div>

