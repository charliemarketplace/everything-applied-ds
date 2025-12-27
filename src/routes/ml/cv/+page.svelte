<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // CV parameters
  let numFolds = $state(5);
  let dataSize = $state(100);

  // Simulate fold results
  const foldResults = $derived(() => {
    const rng = createRNG(42);
    const folds: number[] = [];
    const baseAcc = 0.68;
    
    for (let f = 0; f < numFolds; f++) {
      const acc = baseAcc + normalRandom(rng, 0, 0.05);
      folds.push(Math.max(0.5, Math.min(0.85, acc)) * 100);
    }
    
    return folds;
  });

  const meanAccuracy = $derived(foldResults().reduce((s, a) => s + a, 0) / numFolds);
  const stdAccuracy = $derived(() => {
    const mean = meanAccuracy;
    const variance = foldResults().reduce((s, a) => s + Math.pow(a - mean, 2), 0) / numFolds;
    return Math.sqrt(variance);
  });

  const foldLabels = $derived(Array.from({ length: numFolds }, (_, i) => `Fold ${i + 1}`));

  // Train/test split per fold
  const trainSize = $derived(Math.floor(dataSize * (numFolds - 1) / numFolds));
  const testSize = $derived(dataSize - trainSize);

  // CV methods
  const methods = [
    { name: 'K-Fold', desc: 'Split into K equal parts, rotate test set', use: 'General purpose', pros: 'Balanced, uses all data' },
    { name: 'Leave-One-Out', desc: 'K = N, one sample per test fold', use: 'Small datasets', pros: 'Max training data' },
    { name: 'Time Series', desc: 'Train on past, test on future', use: 'Sequential data', pros: 'Prevents leakage' },
    { name: 'Stratified', desc: 'Maintain class proportions in folds', use: 'Imbalanced data', pros: 'Representative folds' }
  ];
</script>

<svelte:head>
  <title>Cross-Validation | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Machine Learning</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Cross-Validation</h1>
    <p class="section-subtitle max-w-3xl">
      Estimate model performance on unseen data. Use all data for both training
      and testing by rotating through folds.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 How K-Fold CV Works</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <ol class="text-sm text-obsidian-300 space-y-2">
          <li>1. <strong>Split:</strong> Divide data into K equal folds</li>
          <li>2. <strong>Rotate:</strong> Use K-1 folds for training, 1 for testing</li>
          <li>3. <strong>Repeat:</strong> Train/test K times, each fold as test once</li>
          <li>4. <strong>Average:</strong> Report mean ± std of K scores</li>
        </ol>
      </div>
      <div class="space-y-2">
        {#each Array(5) as _, i}
          <div class="flex gap-1">
            {#each Array(5) as _, j}
              <div 
                class="flex-1 h-6 rounded {i === j ? 'bg-amber-350' : 'bg-jade-500/30'}"
                title="{i === j ? 'Test' : 'Train'}"
              ></div>
            {/each}
            <div class="w-16 text-xs text-obsidian-400 flex items-center">
              Fold {i + 1}
            </div>
          </div>
        {/each}
        <div class="flex gap-4 text-xs mt-2">
          <span class="text-jade-400">■ Train</span>
          <span class="text-amber-350">■ Test</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">CV Settings</h3>
        <div class="space-y-4">
          <Slider bind:value={numFolds} min={2} max={10} step={1} label="Number of Folds (K)" />
          <Slider bind:value={dataSize} min={50} max={500} step={50} label="Dataset Size" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Data Split</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Training samples</span>
            <span class="font-mono text-jade-400">{trainSize}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Test samples</span>
            <span class="font-mono text-amber-350">{testSize}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Test %</span>
            <span class="font-mono text-obsidian-200">{(100 / numFolds).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Fold Results -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Accuracy Per Fold</h3>
        <div class="h-48">
          <BarChart 
            labels={foldLabels}
            data={foldResults()}
            color="#f5c542"
          />
        </div>
      </div>

      <!-- Summary -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Cross-Validation Summary</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-jade-400 mb-1">Mean Accuracy</div>
            <div class="font-mono text-2xl text-jade-400">{meanAccuracy.toFixed(1)}%</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Std Dev</div>
            <div class="font-mono text-2xl text-obsidian-200">±{stdAccuracy().toFixed(1)}%</div>
          </div>
          <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
            <div class="text-xs text-amber-350 mb-1">95% CI</div>
            <div class="font-mono text-lg text-amber-350">
              {(meanAccuracy - 1.96 * stdAccuracy()).toFixed(1)}-{(meanAccuracy + 1.96 * stdAccuracy()).toFixed(1)}%
            </div>
          </div>
        </div>
        <p class="mt-4 text-xs text-obsidian-400">
          Report as: {meanAccuracy.toFixed(1)}% ± {stdAccuracy().toFixed(1)}% ({numFolds}-fold CV)
        </p>
      </div>
    </div>
  </div>

  <!-- CV Methods -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📋 CV Methods</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each methods as method}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{method.name}</h3>
          <p class="text-xs text-obsidian-300 mb-1">{method.desc}</p>
          <p class="text-xs text-jade-400">Best for: {method.use}</p>
          <p class="text-xs text-obsidian-400 mt-1">✓ {method.pros}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Time Series Warning -->
  <div class="glass-card p-6 border-crimson-500/30">
    <h2 class="font-display text-xl font-semibold text-crimson-400 mb-4">⚠️ Time Series Data Warning</h2>
    <p class="text-sm text-obsidian-300 mb-3">
      Standard K-Fold CV shuffles data randomly. For sports betting (sequential games):
    </p>
    <ul class="text-sm text-obsidian-300 space-y-1">
      <li>• <strong>Problem:</strong> Future games could appear in training, past in test (leakage)</li>
      <li>• <strong>Solution:</strong> Use time-series CV: always train on past, test on future</li>
      <li>• <strong>Expanding window:</strong> Train on all data before test period</li>
      <li>• <strong>Rolling window:</strong> Fixed training window, slides forward</li>
    </ul>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># K-Fold Cross-Validation
library(caret)

# Create folds
folds &lt;- createFolds(y, k = {numFolds}, returnTrain = TRUE)

# Manual CV loop
cv_results &lt;- sapply(folds, function(train_idx) {'{'} 
  model &lt;- train_model(X[train_idx, ], y[train_idx])
  predictions &lt;- predict(model, X[-train_idx, ])
  accuracy &lt;- mean(predictions == y[-train_idx])
  return(accuracy)
{'}'})

cat(sprintf("CV Accuracy: %.1f%% ± %.1f%%\n", 
            mean(cv_results) * 100, sd(cv_results) * 100))

# Time-series CV (expanding window)
library(rsample)
ts_cv &lt;- rolling_origin(data, initial = 80, assess = 20, cumulative = TRUE)

# Or using caret trainControl
ctrl &lt;- trainControl(method = "timeslice", 
                     initialWindow = 80, horizon = 20, fixedWindow = FALSE)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• CV uses all data for training AND testing</li>
        <li>• Report mean ± std across folds</li>
        <li>• K=5 or K=10 is standard</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Use time-series CV for sequential data</li>
        <li>• Stratified CV for imbalanced classes</li>
        <li>• LOOCV for small datasets</li>
      </ul>
    </div>
  </div>
</div>

