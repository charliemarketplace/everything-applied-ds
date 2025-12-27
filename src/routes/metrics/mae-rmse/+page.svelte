<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Error simulation
  let bias = $state(0);
  let spread = $state(3);
  let outlierPct = $state(10);

  // Generate predictions and actuals
  const errors = $derived(() => {
    const rng = createRNG(42);
    const n = 50;
    const data: Array<{ actual: number, pred: number, error: number }> = [];
    
    for (let i = 0; i < n; i++) {
      const actual = normalRandom(rng, 22, 5);
      let error = normalRandom(rng, bias, spread);
      
      // Add outliers
      if (rng() < outlierPct / 100) {
        error += (rng() > 0.5 ? 1 : -1) * 10;
      }
      
      const pred = actual + error;
      data.push({ actual, pred, error });
    }
    
    return data;
  });

  // Calculate metrics
  const mae = $derived(() => {
    const errs = errors();
    return errs.reduce((s, e) => s + Math.abs(e.error), 0) / errs.length;
  });

  const rmse = $derived(() => {
    const errs = errors();
    const mse = errs.reduce((s, e) => s + Math.pow(e.error, 2), 0) / errs.length;
    return Math.sqrt(mse);
  });

  const mse = $derived(() => {
    const errs = errors();
    return errs.reduce((s, e) => s + Math.pow(e.error, 2), 0) / errs.length;
  });

  const meanError = $derived(() => {
    const errs = errors();
    return errs.reduce((s, e) => s + e.error, 0) / errs.length;
  });

  // Error distribution
  const errorBins = $derived(() => {
    const errs = errors().map(e => e.error);
    const bins = [-10, -6, -3, 0, 3, 6, 10];
    const counts = bins.slice(0, -1).map((_, i) => 
      errs.filter(e => e >= bins[i] && e < bins[i + 1]).length
    );
    return { labels: bins.slice(0, -1).map((b, i) => `${b} to ${bins[i + 1]}`), counts };
  });

  // Metric comparison
  const metrics = [
    { name: 'MAE', formula: 'Mean(|error|)', value: mae(), penalizes: 'Linear penalty', use: 'Robust to outliers' },
    { name: 'MSE', formula: 'Mean(error²)', value: mse(), penalizes: 'Squared penalty', use: 'Differentiable' },
    { name: 'RMSE', formula: '√MSE', value: rmse(), penalizes: 'Same units as target', use: 'Interpretable' }
  ];
</script>

<svelte:head>
  <title>MAE/RMSE | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Metrics & Evaluation</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">MAE & RMSE</h1>
    <p class="section-subtitle max-w-3xl">
      Measure regression model accuracy. MAE = average error, RMSE = penalizes
      large errors more. Essential for player projection evaluation.
    </p>
  </div>

  <!-- Formulas -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Formulas</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">MAE</h3>
        <div class="formula text-lg mb-2">1/n × Σ|y - ŷ|</div>
        <p class="text-xs text-obsidian-400">Mean Absolute Error. Average of absolute errors.</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">MSE</h3>
        <div class="formula text-lg mb-2">1/n × Σ(y - ŷ)²</div>
        <p class="text-xs text-obsidian-400">Mean Squared Error. Squares penalize large errors.</p>
      </div>
      <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">RMSE</h3>
        <div class="formula text-lg mb-2">√MSE</div>
        <p class="text-xs text-obsidian-400">Root MSE. Same units as target variable.</p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Error Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={bias} min={-5} max={5} step={0.5} label="Bias (systematic error)" />
          <Slider bind:value={spread} min={1} max={8} step={0.5} label="Spread (random error)" />
          <Slider bind:value={outlierPct} min={0} max={30} step={5} label="Outlier % (large errors)" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Error Metrics</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Mean Error</span>
            <span class="font-mono text-lg {Math.abs(meanError()) > 1 ? 'text-crimson-400' : 'text-jade-400'}">
              {meanError() >= 0 ? '+' : ''}{meanError().toFixed(2)}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">MAE</span>
            <span class="font-mono text-lg text-obsidian-200">{mae().toFixed(2)} pts</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">RMSE</span>
            <span class="font-mono text-lg text-amber-350">{rmse().toFixed(2)} pts</span>
          </div>
          <div class="flex justify-between items-center pt-2 border-t border-obsidian-700">
            <span class="text-obsidian-300">RMSE / MAE</span>
            <span class="font-mono text-xs {rmse() / mae() > 1.3 ? 'text-crimson-400' : 'text-jade-400'}">
              {(rmse() / mae()).toFixed(2)} {rmse() / mae() > 1.3 ? '(outliers!)' : '(clean)'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Error Distribution -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Error Distribution</h3>
        <div class="h-48">
          <BarChart 
            labels={errorBins().labels}
            data={errorBins().counts}
            color="#f5c542"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          {#if Math.abs(meanError()) > 1}
            ⚠️ Distribution is biased ({meanError() > 0 ? 'over' : 'under'}predicting)
          {:else if rmse() / mae() > 1.3}
            ⚠️ High RMSE/MAE ratio suggests outliers
          {:else}
            ✓ Errors centered around zero with manageable spread
          {/if}
        </p>
      </div>

      <!-- Metric Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Metric Comparison</h3>
        <div class="grid grid-cols-3 gap-4">
          {#each metrics as metric}
            <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
              <h4 class="text-amber-350 font-semibold mb-1">{metric.name}</h4>
              <div class="font-mono text-2xl text-obsidian-200 mb-2">{metric.value.toFixed(2)}</div>
              <p class="text-xs text-obsidian-400">{metric.penalizes}</p>
              <p class="text-xs text-jade-400">{metric.use}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- When to Use -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎯 When to Use Each</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-3">Use MAE When...</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>• Outliers are expected and shouldn't dominate</li>
          <li>• All errors matter equally (cost is linear)</li>
          <li>• You want median-like behavior</li>
          <li>• Interpretability is key ("avg 3 pts off")</li>
        </ul>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-3">Use RMSE When...</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>• Large errors are especially bad</li>
          <li>• Cost grows with error magnitude (squared)</li>
          <li>• You need differentiable loss for training</li>
          <li>• Data is relatively clean</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calculate error metrics
calculate_metrics &lt;- function(actual, predicted) {'{'} 
  error &lt;- predicted - actual
  
  mae &lt;- mean(abs(error))
  mse &lt;- mean(error^2)
  rmse &lt;- sqrt(mse)
  me &lt;- mean(error)  # Mean error (bias)
  
  list(
    mae = mae,
    mse = mse,
    rmse = rmse,
    bias = me,
    rmse_mae_ratio = rmse / mae  # &gt;1.25 suggests outliers
  )
{'}'}

# Example
actual &lt;- c(22.5, 18.3, 25.1, 20.8)
predicted &lt;- c(23.1, 17.5, 26.0, 19.2)

metrics &lt;- calculate_metrics(actual, predicted)
cat(sprintf("MAE: %.2f, RMSE: %.2f\n", metrics$mae, metrics$rmse))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• MAE = average absolute error (robust)</li>
        <li>• RMSE = penalizes large errors more</li>
        <li>• RMSE ≥ MAE always (equality when all errors equal)</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• High RMSE/MAE ratio → outliers present</li>
        <li>• Check bias (mean error) separately</li>
        <li>• For player props: MAE often more practical</li>
      </ul>
    </div>
  </div>
</div>

