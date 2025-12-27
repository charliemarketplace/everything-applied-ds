<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Hyperparameter search parameters
  let parameterRangeSize = $state(10);
  let gridDensity = $state(5);
  let randomTrials = $state(20);

  // Simulate validation curve
  const validationCurve = $derived(() => {
    const rng = createRNG(42);
    const points = gridDensity;
    const paramValues: number[] = [];
    const trainScores: number[] = [];
    const valScores: number[] = [];
    
    // Optimal around 0.4 of the range
    const optimal = 0.4 * parameterRangeSize;
    
    for (let i = 0; i < points; i++) {
      const param = i / (points - 1) * parameterRangeSize;
      paramValues.push(param);
      
      // Training score keeps improving (overfitting)
      const trainScore = 0.95 - 0.3 * Math.abs(param - parameterRangeSize) / parameterRangeSize;
      trainScores.push(trainScore + normalRandom(rng, 0, 0.01));
      
      // Validation peaks at optimal
      const distance = Math.abs(param - optimal);
      const valScore = 0.85 - 0.2 * (distance / parameterRangeSize) ** 1.5;
      valScores.push(Math.max(0.5, valScore + normalRandom(rng, 0, 0.02)));
    }
    
    return { paramValues, trainScores, valScores };
  });

  // Grid search results
  const gridSearchResults = $derived(() => {
    const curve = validationCurve();
    const bestIdx = curve.valScores.indexOf(Math.max(...curve.valScores));
    return {
      bestParam: curve.paramValues[bestIdx],
      bestScore: curve.valScores[bestIdx],
      totalTrials: gridDensity
    };
  });

  // Random search results
  const randomSearchResults = $derived(() => {
    const rng = createRNG(123);
    const optimal = 0.4 * parameterRangeSize;
    
    let bestParam = 0;
    let bestScore = 0;
    
    for (let i = 0; i < randomTrials; i++) {
      const param = rng() * parameterRangeSize;
      const distance = Math.abs(param - optimal);
      const score = 0.85 - 0.2 * (distance / parameterRangeSize) ** 1.5 + normalRandom(rng, 0, 0.02);
      
      if (score > bestScore) {
        bestScore = score;
        bestParam = param;
      }
    }
    
    return { bestParam, bestScore: Math.max(0.5, bestScore), totalTrials: randomTrials };
  });

  // Bayesian optimization (simulated)
  const bayesianResults = $derived(() => {
    const optimal = 0.4 * parameterRangeSize;
    // Bayesian is more efficient
    const effectiveTrials = Math.floor(randomTrials * 0.5);
    const distance = 0.1 * parameterRangeSize; // Gets closer with fewer trials
    const score = 0.85 - 0.2 * (distance / parameterRangeSize) ** 1.5;
    
    return { bestParam: optimal + 0.3, bestScore: score, totalTrials: effectiveTrials };
  });

  const paramLabels = $derived(validationCurve().paramValues.map(v => v.toFixed(1)));

  // Search methods
  const methods = [
    { name: 'Grid Search', pros: 'Exhaustive, reproducible', cons: 'Exponential in dims', when: '≤3 hyperparams' },
    { name: 'Random Search', pros: 'Efficient in high dims', cons: 'No learning', when: 'Many hyperparams' },
    { name: 'Bayesian', pros: 'Learns from trials', cons: 'Overhead, sequential', when: 'Expensive evaluations' }
  ];
</script>

<svelte:head>
  <title>Hyperparameter Tuning | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Machine Learning</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Hyperparameter Tuning</h1>
    <p class="section-subtitle max-w-3xl">
      Find optimal model settings. Grid search is exhaustive, random search is efficient,
      Bayesian optimization learns from past trials.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 Parameters vs Hyperparameters</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">Parameters</h3>
        <p class="text-sm text-obsidian-300 mb-2">Learned from data during training</p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Neural network weights</li>
          <li>• Regression coefficients</li>
          <li>• Tree split thresholds</li>
        </ul>
      </div>
      <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Hyperparameters</h3>
        <p class="text-sm text-obsidian-300 mb-2">Set before training, control learning</p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Learning rate, regularization</li>
          <li>• Number of trees, max depth</li>
          <li>• Number of layers, neurons</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Search Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={parameterRangeSize} min={5} max={20} step={1} label="Parameter Range" />
          <Slider bind:value={gridDensity} min={3} max={15} step={1} label="Grid Points" />
          <Slider bind:value={randomTrials} min={5} max={50} step={5} label="Random Trials" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Search Results</h3>
        <div class="space-y-4 text-sm">
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <div class="flex justify-between items-center mb-1">
              <span class="text-obsidian-300">Grid Search</span>
              <span class="font-mono text-obsidian-200">{gridSearchResults().bestScore.toFixed(3)}</span>
            </div>
            <div class="text-xs text-obsidian-400">{gridSearchResults().totalTrials} trials</div>
          </div>
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <div class="flex justify-between items-center mb-1">
              <span class="text-obsidian-300">Random Search</span>
              <span class="font-mono text-obsidian-200">{randomSearchResults().bestScore.toFixed(3)}</span>
            </div>
            <div class="text-xs text-obsidian-400">{randomSearchResults().totalTrials} trials</div>
          </div>
          <div class="p-3 bg-jade-500/10 border border-jade-500/30 rounded-lg">
            <div class="flex justify-between items-center mb-1">
              <span class="text-obsidian-300">Bayesian</span>
              <span class="font-mono text-jade-400">{bayesianResults().bestScore.toFixed(3)}</span>
            </div>
            <div class="text-xs text-jade-400">{bayesianResults().totalTrials} trials (most efficient)</div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Validation Curve -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Validation Curve</h3>
        <div class="h-48">
          <LineChart 
            labels={paramLabels}
            datasets={[
              {
                label: 'Training Score',
                data: validationCurve().trainScores,
                borderColor: '#34d399',
                fill: false
              },
              {
                label: 'Validation Score',
                data: validationCurve().valScores,
                borderColor: '#f5c542',
                fill: false
              }
            ]}
            xAxisLabel="Hyperparameter Value"
            yAxisLabel="Score"
          />
        </div>
        <div class="mt-4 grid grid-cols-2 gap-4 text-xs">
          <div class="p-2 bg-obsidian-800/50 rounded-lg">
            <span class="text-jade-400">Training score</span>: Always improves (overfitting)
          </div>
          <div class="p-2 bg-obsidian-800/50 rounded-lg">
            <span class="text-amber-350">Validation score</span>: Peaks at optimal
          </div>
        </div>
      </div>

      <!-- Search Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Search Method Comparison</h3>
        <div class="grid grid-cols-3 gap-4">
          {#each methods as method}
            <div class="p-4 bg-obsidian-800/50 rounded-lg">
              <h4 class="text-amber-350 font-semibold mb-2">{method.name}</h4>
              <div class="text-xs space-y-1">
                <p class="text-jade-400">✓ {method.pros}</p>
                <p class="text-crimson-400">✗ {method.cons}</p>
                <p class="text-obsidian-400 mt-2">Best for: {method.when}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Betting Examples -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏈 Hyperparameters in Betting Models</h2>
    <div class="grid md:grid-cols-4 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <h3 class="text-amber-350 font-semibold mb-2">XGBoost</h3>
        <p class="text-xs text-obsidian-400">max_depth, learning_rate, n_estimators, reg_lambda</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <h3 class="text-amber-350 font-semibold mb-2">Neural Net</h3>
        <p class="text-xs text-obsidian-400">layers, neurons, dropout, batch_size</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <h3 class="text-amber-350 font-semibold mb-2">Elo System</h3>
        <p class="text-xs text-obsidian-400">K-factor, home advantage, initial rating</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <h3 class="text-amber-350 font-semibold mb-2">Kelly</h3>
        <p class="text-xs text-obsidian-400">Fraction (full/half/quarter), bankroll</p>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Hyperparameter tuning with caret
library(caret)

# Grid search
grid &lt;- expand.grid(
  nrounds = c(50, 100, 150),
  max_depth = c(3, 5, 7),
  eta = c(0.01, 0.1, 0.3),
  gamma = 0,
  colsample_bytree = 0.8,
  min_child_weight = 1,
  subsample = 0.8
)

ctrl &lt;- trainControl(
  method = "cv",
  number = 5,
  search = "grid"
)

# Train with grid search
model &lt;- train(
  y ~ ., data = train_data,
  method = "xgbTree",
  trControl = ctrl,
  tuneGrid = grid
)

# Random search alternative
ctrl_random &lt;- trainControl(
  method = "cv",
  number = 5,
  search = "random"
)

model_random &lt;- train(
  y ~ ., data = train_data,
  method = "xgbTree",
  trControl = ctrl_random,
  tuneLength = {randomTrials}
)

# Best hyperparameters
print(model$bestTune)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Hyperparameters control the learning process</li>
        <li>• Grid search: exhaustive but slow</li>
        <li>• Random search: efficient in high dimensions</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Bayesian: learns from past trials</li>
        <li>• Always use validation set, not training</li>
        <li>• Cross-validation for robust estimates</li>
      </ul>
    </div>
  </div>
</div>

