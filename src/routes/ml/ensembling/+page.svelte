<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Model ensemble configuration
  let numModels = $state(5);
  let avgAccuracy = $state(65);
  let diversityLevel = $state(0.4);

  // Generate synthetic model performances
  const modelPerformances = $derived(() => {
    const rng = createRNG(42);
    const models: Array<{ name: string; accuracy: number; type: string }> = [];
    const types = ['XGBoost', 'RF', 'LightGBM', 'CatBoost', 'Linear', 'NN', 'SVM'];
    
    for (let i = 0; i < numModels; i++) {
      const variance = 10 * diversityLevel;
      const accuracy = Math.max(50, Math.min(85, avgAccuracy + normalRandom(rng, 0, variance)));
      models.push({
        name: `Model ${i + 1}`,
        accuracy: accuracy,
        type: types[i % types.length]
      });
    }
    return models.sort((a, b) => b.accuracy - a.accuracy);
  });

  // Calculate ensemble performance (Condorcet jury theorem inspired)
  const ensemblePerformance = $derived(() => {
    const models = modelPerformances();
    const avgAcc = models.reduce((s, m) => s + m.accuracy, 0) / models.length / 100;
    
    // Diversity bonus: more diverse models = more gain
    const diversityBonus = diversityLevel * (1 - avgAcc) * 0.5;
    
    // Ensemble effect: combining independent judges
    const n = models.length;
    const ensembleProb = avgAcc + diversityBonus + Math.log(n) * 0.02;
    
    return Math.min(90, ensembleProb * 100);
  });

  // Stacking layers example
  const stackingLayers = [
    { layer: 'Base Models', models: ['XGBoost', 'Random Forest', 'LightGBM', 'CatBoost'], desc: 'Diverse tree-based models' },
    { layer: 'Meta Features', models: ['OOF Predictions', 'Rank Features', 'Confidence'], desc: 'Out-of-fold predictions' },
    { layer: 'Meta Learner', models: ['Logistic Regression', 'Ridge'], desc: 'Learn optimal blend' }
  ];

  // Blending strategies
  const strategies = [
    { name: 'Simple Average', formula: '(1/n) × Σ predictions', when: 'Equal model quality', icon: '➗' },
    { name: 'Weighted Average', formula: 'Σ wᵢ × predictionᵢ', when: 'Known model quality', icon: '⚖️' },
    { name: 'Rank Average', formula: 'Average of ranks', when: 'Different scales', icon: '📊' },
    { name: 'Geometric Mean', formula: '∏ predictions^(1/n)', when: 'Multiplicative effects', icon: '✖️' }
  ];
</script>

<svelte:head>
  <title>Model Ensembling | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Machine Learning</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Model Ensembling</h1>
    <p class="section-subtitle max-w-3xl">
      Combine predictions from multiple models for better accuracy. Learn stacking, 
      blending, and optimal weight selection for sports prediction models.
    </p>
  </div>

  <!-- Key Insight -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🎯 The Wisdom of Crowds</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">👥</div>
        <h3 class="text-jade-400 font-semibold mb-2">Condorcet Jury</h3>
        <p class="text-sm text-obsidian-300">
          If each model is &gt; 50% accurate, majority vote approaches 100% as n increases.
        </p>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg text-center">
        <div class="text-3xl mb-2">🎲</div>
        <h3 class="text-amber-350 font-semibold mb-2">Error Cancellation</h3>
        <p class="text-sm text-obsidian-300">
          Independent errors average out. Bias remains, variance decreases.
        </p>
      </div>
      <div class="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">🧩</div>
        <h3 class="text-blue-400 font-semibold mb-2">Complementarity</h3>
        <p class="text-sm text-obsidian-300">
          Different models capture different patterns in the data.
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Ensemble Configuration</h3>
        <div class="space-y-4">
          <Slider bind:value={numModels} min={2} max={10} step={1} label="Number of Models" />
          <Slider bind:value={avgAccuracy} min={55} max={75} step={1} label="Avg Model Accuracy (%)" />
          <Slider bind:value={diversityLevel} min={0.1} max={0.8} step={0.05} label="Diversity Level" />
        </div>
      </div>

      <div class="glass-card p-6 border-jade-500/30">
        <h3 class="font-display text-lg font-semibold text-jade-400 mb-4">📊 Ensemble Result</h3>
        <div class="space-y-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Best Single Model</div>
            <div class="font-mono text-2xl text-obsidian-200">
              {modelPerformances()[0]?.accuracy.toFixed(1)}%
            </div>
          </div>
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-jade-400 mb-1">Ensemble Accuracy</div>
            <div class="font-mono text-3xl text-jade-400">
              {ensemblePerformance().toFixed(1)}%
            </div>
          </div>
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <div class="flex justify-between text-sm">
              <span class="text-obsidian-300">Ensemble Lift</span>
              <span class="font-mono text-amber-350">
                +{(ensemblePerformance() - modelPerformances()[0]?.accuracy).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Model Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Individual Model Accuracies</h3>
        <div class="h-48">
          <BarChart 
            labels={[...modelPerformances().map(m => m.name), 'Ensemble']}
            data={[...modelPerformances().map(m => m.accuracy), ensemblePerformance()]}
            color="#f5c542"
          />
        </div>
        <div class="mt-4 flex flex-wrap gap-2">
          {#each modelPerformances() as model}
            <span class="px-2 py-1 bg-obsidian-800 rounded text-xs text-obsidian-300">
              {model.type}
            </span>
          {/each}
        </div>
      </div>

      <!-- Stacking Architecture -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Stacking Architecture</h3>
        <div class="space-y-4">
          {#each stackingLayers as layer, i}
            <div class="flex items-center gap-4">
              <div class="w-24 text-xs text-obsidian-400 text-right">{layer.layer}</div>
              <div class="flex-1 p-3 bg-obsidian-800/50 rounded-lg">
                <div class="flex flex-wrap gap-2">
                  {#each layer.models as model}
                    <span class="px-2 py-1 bg-{i === 0 ? 'jade' : i === 1 ? 'amber-350' : 'blue'}-500/20 rounded text-xs text-{i === 0 ? 'jade-400' : i === 1 ? 'amber-350' : 'blue-400'}">
                      {model}
                    </span>
                  {/each}
                </div>
                <p class="text-xs text-obsidian-400 mt-2">{layer.desc}</p>
              </div>
            </div>
            {#if i < stackingLayers.length - 1}
              <div class="flex justify-center">
                <span class="text-obsidian-500">↓</span>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Blending Strategies -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔀 Blending Strategies</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each strategies as strategy}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <div class="text-2xl mb-2">{strategy.icon}</div>
          <h3 class="text-amber-350 font-semibold mb-2">{strategy.name}</h3>
          <code class="text-xs text-jade-400 block mb-2">{strategy.formula}</code>
          <p class="text-xs text-obsidian-400">Best when: {strategy.when}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Practical Tips -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💡 Practical Tips for Sports Models</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Model Selection</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Include different algorithm families (trees, linear, neural)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Use different feature subsets per model</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Vary hyperparameters for diversity</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Remove highly correlated models (&gt; 0.9)</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Weight Optimization</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Use cross-validation for weight selection</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Constrain weights to sum to 1 (convex combination)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Consider time-weighted ensembles for drift</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Simple average often beats complex optimization</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Model stacking with caret
library(caret)
library(caretEnsemble)

# Define base models
model_list &lt;- caretList(
  outcome ~ .,
  data = train_data,
  trControl = trainControl(
    method = "cv",
    number = 5,
    savePredictions = "final"
  ),
  methodList = c("xgbTree", "rf", "glmnet")
)

# Check model correlations
modelCor(resamples(model_list))

# Stack with meta-learner
stack &lt;- caretStack(
  model_list,
  method = "glm",  # Simple meta-learner
  trControl = trainControl(method = "cv", number = 5)
)

# Predict
ensemble_pred &lt;- predict(stack, test_data)

# Simple weighted ensemble
blend_predictions &lt;- function(predictions, weights = NULL) {'{'} 
  if (is.null(weights)) {'{'} 
    weights &lt;- rep(1/ncol(predictions), ncol(predictions))
  {'}'}
  as.vector(as.matrix(predictions) %*% weights)
{'}'}</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Diversity is more important than individual accuracy</li>
        <li>• Stacking: train meta-learner on OOF predictions</li>
        <li>• Simple averaging is a strong baseline</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• More models = diminishing returns after 5-7</li>
        <li>• Validate ensemble on holdout, not CV</li>
        <li>• Remove correlated models to improve diversity</li>
      </ul>
    </div>
  </div>
</div>

