<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Anomaly detection parameters
  let threshold = $state(2.5);
  let anomalyRate = $state(5);
  let sampleSize = $state(100);

  // Generate data with anomalies
  const data = $derived(() => {
    const rng = createRNG(42);
    const points: Array<{ x: number, y: number, isAnomaly: boolean }> = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const isAnomaly = rng() < anomalyRate / 100;
      
      if (isAnomaly) {
        // Anomalies are far from center
        const angle = rng() * 2 * Math.PI;
        const r = 5 + rng() * 3;
        points.push({
          x: r * Math.cos(angle),
          y: r * Math.sin(angle),
          isAnomaly: true
        });
      } else {
        // Normal points clustered in center
        points.push({
          x: normalRandom(rng, 0, 1.5),
          y: normalRandom(rng, 0, 1.5),
          isAnomaly: false
        });
      }
    }
    
    return points;
  });

  // Calculate z-scores and detect
  const detectionResults = $derived(() => {
    const pts = data();
    const meanX = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const meanY = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    const stdX = Math.sqrt(pts.reduce((s, p) => s + Math.pow(p.x - meanX, 2), 0) / pts.length);
    const stdY = Math.sqrt(pts.reduce((s, p) => s + Math.pow(p.y - meanY, 2), 0) / pts.length);
    
    let truePositive = 0;
    let falsePositive = 0;
    let trueNegative = 0;
    let falseNegative = 0;
    
    for (const p of pts) {
      const zScore = Math.sqrt(Math.pow((p.x - meanX) / stdX, 2) + Math.pow((p.y - meanY) / stdY, 2));
      const detected = zScore > threshold;
      
      if (detected && p.isAnomaly) truePositive++;
      else if (detected && !p.isAnomaly) falsePositive++;
      else if (!detected && p.isAnomaly) falseNegative++;
      else trueNegative++;
    }
    
    const precision = truePositive / (truePositive + falsePositive) || 0;
    const recall = truePositive / (truePositive + falseNegative) || 0;
    const f1 = 2 * precision * recall / (precision + recall) || 0;
    
    return { truePositive, falsePositive, trueNegative, falseNegative, precision, recall, f1 };
  });

  // Methods
  const methods = [
    { name: 'Z-Score', desc: 'Distance from mean in std devs', best: 'Normal data, univariate' },
    { name: 'IQR', desc: 'Outside 1.5×IQR from quartiles', best: 'Robust to skew' },
    { name: 'Isolation Forest', desc: 'Random splits to isolate', best: 'High-dimensional' },
    { name: 'DBSCAN', desc: 'Density-based clustering', best: 'Clusters of anomalies' }
  ];

  // Use cases
  const useCases = [
    { name: 'Fraud Detection', example: 'Unusual betting patterns' },
    { name: 'Sharp Detection', example: 'CLV > expected' },
    { name: 'Line Errors', example: 'Odds far from consensus' },
    { name: 'Data Quality', example: 'Stats outside possible range' }
  ];
</script>

<svelte:head>
  <title>Anomaly Detection | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Machine Learning</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Anomaly Detection</h1>
    <p class="section-subtitle max-w-3xl">
      Find unusual patterns that don't conform to expected behavior. Essential
      for fraud detection, sharp identification, and data quality.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 Types of Anomalies</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">📍</div>
        <h3 class="text-amber-350 font-semibold mb-2">Point Anomalies</h3>
        <p class="text-xs text-obsidian-400">Single data point is unusual</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">📈</div>
        <h3 class="text-amber-350 font-semibold mb-2">Contextual</h3>
        <p class="text-xs text-obsidian-400">Unusual for this context/time</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">📊</div>
        <h3 class="text-amber-350 font-semibold mb-2">Collective</h3>
        <p class="text-xs text-obsidian-400">Group of points is unusual together</p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Detection Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={threshold} min={1} max={4} step={0.25} label="Z-Score Threshold" />
          <Slider bind:value={anomalyRate} min={1} max={15} step={1} label="True Anomaly Rate (%)" />
          <Slider bind:value={sampleSize} min={50} max={200} step={25} label="Sample Size" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Detection Performance</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Precision</span>
            <span class="font-mono text-jade-400">{(detectionResults().precision * 100).toFixed(0)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Recall</span>
            <span class="font-mono text-jade-400">{(detectionResults().recall * 100).toFixed(0)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">F1 Score</span>
            <span class="font-mono text-amber-350">{(detectionResults().f1 * 100).toFixed(0)}%</span>
          </div>
          <div class="pt-2 border-t border-obsidian-700">
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div class="p-2 bg-jade-500/10 rounded text-center">
                <span class="text-jade-400">TP: {detectionResults().truePositive}</span>
              </div>
              <div class="p-2 bg-crimson-500/10 rounded text-center">
                <span class="text-crimson-400">FP: {detectionResults().falsePositive}</span>
              </div>
              <div class="p-2 bg-crimson-500/10 rounded text-center">
                <span class="text-crimson-400">FN: {detectionResults().falseNegative}</span>
              </div>
              <div class="p-2 bg-jade-500/10 rounded text-center">
                <span class="text-jade-400">TN: {detectionResults().trueNegative}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Visualization -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Data Visualization</h3>
        <div class="relative h-64 bg-obsidian-800/50 rounded-lg p-4">
          <!-- Simple scatter visualization -->
          <div class="absolute inset-4 border border-obsidian-600 rounded">
            {#each data() as point}
              <div 
                class="absolute w-2 h-2 rounded-full transform -translate-x-1 -translate-y-1 {point.isAnomaly ? 'bg-crimson-500' : 'bg-jade-500'}"
                style="left: {(point.x + 10) / 20 * 100}%; top: {(10 - point.y) / 20 * 100}%"
              ></div>
            {/each}
            <!-- Threshold circle (conceptual) -->
            <div 
              class="absolute w-48 h-48 border-2 border-amber-350/30 border-dashed rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style="left: 50%; top: 50%"
            ></div>
          </div>
        </div>
        <div class="mt-4 flex justify-center gap-6 text-xs">
          <span class="flex items-center gap-1">
            <div class="w-3 h-3 bg-jade-500 rounded-full"></div>
            Normal points
          </span>
          <span class="flex items-center gap-1">
            <div class="w-3 h-3 bg-crimson-500 rounded-full"></div>
            True anomalies
          </span>
          <span class="flex items-center gap-1">
            <div class="w-6 h-6 border-2 border-amber-350/50 border-dashed rounded-full"></div>
            Detection boundary
          </span>
        </div>
      </div>

      <!-- Trade-off -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Threshold Trade-off</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">↓ Lower Threshold</h4>
            <ul class="text-xs text-obsidian-300 space-y-1">
              <li class="text-jade-400">✓ Higher recall (catch more)</li>
              <li class="text-crimson-400">✗ More false positives</li>
            </ul>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">↑ Higher Threshold</h4>
            <ul class="text-xs text-obsidian-300 space-y-1">
              <li class="text-jade-400">✓ Higher precision (fewer alerts)</li>
              <li class="text-crimson-400">✗ Miss more anomalies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Methods -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔧 Detection Methods</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each methods as method}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{method.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{method.desc}</p>
          <p class="text-xs text-jade-400">Best for: {method.best}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Use Cases -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎰 Betting Applications</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each useCases as useCase}
        <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
          <h3 class="text-amber-350 font-semibold mb-2">{useCase.name}</h3>
          <p class="text-xs text-obsidian-400">{useCase.example}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Anomaly detection methods
library(isotree)

# Z-score method
zscore_anomaly &lt;- function(x, threshold = {threshold}) {'{'} 
  z &lt;- scale(x)
  abs(z) &gt; threshold
{'}'}

# IQR method
iqr_anomaly &lt;- function(x, k = 1.5) {'{'} 
  q1 &lt;- quantile(x, 0.25)
  q3 &lt;- quantile(x, 0.75)
  iqr &lt;- q3 - q1
  x &lt; (q1 - k * iqr) | x &gt; (q3 + k * iqr)
{'}'}

# Isolation Forest
iforest_anomaly &lt;- function(df, contamination = 0.05) {'{'} 
  model &lt;- isolation.forest(df, ntrees = 100)
  scores &lt;- predict(model, df)
  scores &gt; quantile(scores, 1 - contamination)
{'}'}

# Apply
anomalies &lt;- zscore_anomaly(df$feature)
cat(sprintf("Detected %d anomalies (%.1f%%)\n", 
    sum(anomalies), mean(anomalies) * 100))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Anomaly detection finds unusual patterns</li>
        <li>• Trade-off between precision and recall</li>
        <li>• Z-score works for normal data</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Isolation Forest for high dimensions</li>
        <li>• Define "anomaly" based on business context</li>
        <li>• Use for fraud, sharps, data quality</li>
      </ul>
    </div>
  </div>
</div>

