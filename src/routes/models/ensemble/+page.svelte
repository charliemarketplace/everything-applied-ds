<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Individual model performances
  let model1Accuracy = $state(68);
  let model2Accuracy = $state(65);
  let model3Accuracy = $state(62);
  let correlationBetweenModels = $state(0.3);

  // Ensemble weights
  let weight1 = $state(0.4);
  let weight2 = $state(0.35);
  let weight3 = $state(0.25);

  // Calculate ensemble accuracy (simplified)
  const ensembleAccuracy = $derived(() => {
    // Weighted average with diversity bonus
    const baseAccuracy = model1Accuracy * weight1 + model2Accuracy * weight2 + model3Accuracy * weight3;
    // Diversity bonus: lower correlation = higher bonus
    const diversityBonus = (1 - correlationBetweenModels) * 3;
    return Math.min(85, baseAccuracy + diversityBonus);
  });

  // Simulate predictions
  const simulatePredictions = $derived(() => {
    const rng = createRNG(42);
    const n = 100;
    const predictions: Array<{ 
      model1: number, model2: number, model3: number, 
      ensemble: number, actual: number, correct: boolean 
    }> = [];

    for (let i = 0; i < n; i++) {
      const actual = rng() > 0.5 ? 1 : 0;
      
      // Individual model predictions
      const m1 = rng() < model1Accuracy / 100 ? actual : 1 - actual;
      const m2 = correlationBetweenModels > rng() ? m1 : (rng() < model2Accuracy / 100 ? actual : 1 - actual);
      const m3 = correlationBetweenModels > rng() ? m1 : (rng() < model3Accuracy / 100 ? actual : 1 - actual);
      
      // Ensemble vote (weighted)
      const ensembleScore = m1 * weight1 + m2 * weight2 + m3 * weight3;
      const ensemble = ensembleScore > 0.5 ? 1 : 0;
      
      predictions.push({
        model1: m1,
        model2: m2, 
        model3: m3,
        ensemble,
        actual,
        correct: ensemble === actual
      });
    }

    return predictions;
  });

  // Calculate actual accuracies from simulation
  const simAccuracies = $derived(() => {
    const preds = simulatePredictions();
    return {
      model1: preds.filter(p => p.model1 === p.actual).length,
      model2: preds.filter(p => p.model2 === p.actual).length,
      model3: preds.filter(p => p.model3 === p.actual).length,
      ensemble: preds.filter(p => p.correct).length
    };
  });

  // Methods
  const methods = [
    {
      name: 'Bagging',
      desc: 'Train on bootstrap samples, average predictions',
      example: 'Random Forest',
      icon: '🎒'
    },
    {
      name: 'Boosting',
      desc: 'Sequential training, focus on errors',
      example: 'XGBoost, LightGBM',
      icon: '🚀'
    },
    {
      name: 'Stacking',
      desc: 'Meta-model learns to combine base models',
      example: 'Blending layers',
      icon: '📚'
    },
    {
      name: 'Voting',
      desc: 'Simple majority or weighted vote',
      example: 'VotingClassifier',
      icon: '🗳️'
    }
  ];
</script>

<svelte:head>
  <title>Ensemble Methods | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Core Statistical Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Ensemble Methods</h1>
    <p class="section-subtitle max-w-3xl">
      Combine multiple models for better predictions. Ensembles reduce variance,
      improve robustness, and often outperform any single model.
    </p>
  </div>

  <!-- Why Ensembles Work -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🧠 Why Ensembles Work</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">📉</div>
        <h3 class="text-jade-400 font-semibold mb-2">Reduce Variance</h3>
        <p class="text-sm text-obsidian-300">
          Averaging predictions smooths out noise from individual models.
        </p>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg text-center">
        <div class="text-3xl mb-2">🎯</div>
        <h3 class="text-amber-350 font-semibold mb-2">Reduce Bias</h3>
        <p class="text-sm text-obsidian-300">
          Different models capture different patterns in the data.
        </p>
      </div>
      <div class="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">🛡️</div>
        <h3 class="text-blue-400 font-semibold mb-2">Robustness</h3>
        <p class="text-sm text-obsidian-300">
          Less sensitive to outliers and edge cases.
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Individual Models</h3>
        <div class="space-y-4">
          <Slider bind:value={model1Accuracy} min={50} max={80} step={1} label="Model 1 Accuracy (%)" />
          <Slider bind:value={model2Accuracy} min={50} max={80} step={1} label="Model 2 Accuracy (%)" />
          <Slider bind:value={model3Accuracy} min={50} max={80} step={1} label="Model 3 Accuracy (%)" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Ensemble Settings</h3>
        <div class="space-y-4">
          <Slider bind:value={correlationBetweenModels} min={0} max={0.9} step={0.05} label="Model Correlation" />
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <p class="text-xs text-obsidian-400">
              Lower correlation = more diversity = bigger ensemble boost
            </p>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Weights</h3>
        <div class="space-y-4">
          <Slider bind:value={weight1} min={0.1} max={0.6} step={0.05} label="Model 1 Weight" />
          <Slider bind:value={weight2} min={0.1} max={0.6} step={0.05} label="Model 2 Weight" />
          <Slider bind:value={weight3} min={0.1} max={0.6} step={0.05} label="Model 3 Weight" />
        </div>
        <div class="mt-3 p-3 bg-obsidian-800/50 rounded-lg">
          <div class="flex justify-between text-sm">
            <span class="text-obsidian-300">Total Weight</span>
            <span class="font-mono {Math.abs(weight1 + weight2 + weight3 - 1) < 0.01 ? 'text-jade-400' : 'text-crimson-400'}">
              {((weight1 + weight2 + weight3) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Accuracy Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Accuracy Comparison</h3>
        <div class="grid grid-cols-4 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Model 1</div>
            <div class="font-mono text-2xl text-obsidian-200">{simAccuracies().model1}%</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Model 2</div>
            <div class="font-mono text-2xl text-obsidian-200">{simAccuracies().model2}%</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Model 3</div>
            <div class="font-mono text-2xl text-obsidian-200">{simAccuracies().model3}%</div>
          </div>
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-jade-400 mb-1">Ensemble</div>
            <div class="font-mono text-2xl text-jade-400">{simAccuracies().ensemble}%</div>
          </div>
        </div>
        <div class="mt-4 p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Ensemble Boost</span>
            <span class="font-mono text-lg text-amber-350">
              +{(simAccuracies().ensemble - Math.max(simAccuracies().model1, simAccuracies().model2, simAccuracies().model3)).toFixed(0)}%
            </span>
          </div>
          <p class="text-xs text-obsidian-400 mt-1">
            vs best individual model
          </p>
        </div>
      </div>

      <!-- Visualization -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Accuracy Breakdown</h3>
        <div class="h-48">
          <BarChart 
            labels={['Model 1', 'Model 2', 'Model 3', 'Ensemble']}
            data={[simAccuracies().model1, simAccuracies().model2, simAccuracies().model3, simAccuracies().ensemble]}
            color="#f5c542"
          />
        </div>
      </div>

      <!-- Diversity Impact -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">The Diversity Principle</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
            <h4 class="text-crimson-400 font-semibold mb-2">High Correlation (Bad)</h4>
            <p class="text-xs text-obsidian-300">
              Models make same errors. Ensemble = single model.
              No diversity benefit.
            </p>
          </div>
          <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
            <h4 class="text-jade-400 font-semibold mb-2">Low Correlation (Good)</h4>
            <p class="text-xs text-obsidian-300">
              Models make different errors. Errors cancel out.
              Maximum diversity benefit.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Methods -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔧 Ensemble Methods</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each methods as method}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <div class="text-2xl mb-2">{method.icon}</div>
          <h3 class="text-amber-350 font-semibold mb-2">{method.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{method.desc}</p>
          <div class="text-xs text-obsidian-400">
            Example: <span class="text-jade-400">{method.example}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Sports Application -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Sports Pricing Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Player Projection Ensemble</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Model 1: Season average regression</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Model 2: Recent form weighted</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Model 3: Matchup-based adjustment</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Ensemble: Weighted combination</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Win Probability Ensemble</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Model 1: Elo ratings</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Model 2: Vegas line implied</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Model 3: Advanced stats model</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Ensemble: Calibrated blend</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Simple weighted ensemble
weighted_ensemble &lt;- function(predictions, weights) {'{'} 
  # predictions: list of model predictions
  # weights: vector of weights (should sum to 1)
  
  ensemble &lt;- Reduce(`+`, Map(`*`, predictions, weights))
  return(ensemble)
{'}'}

# Stacking with meta-learner
library(caret)
stack_models &lt;- function(train_data, models) {'{'} 
  # Get predictions from base models
  base_preds &lt;- lapply(models, function(m) predict(m, train_data))
  meta_features &lt;- do.call(cbind, base_preds)
  
  # Train meta-learner
  meta_model &lt;- train(meta_features, train_data$y, method = "glm")
  return(meta_model)
{'}'}

# Example
weights &lt;- c({weight1}, {weight2}, {weight3})
ensemble_pred &lt;- weighted_ensemble(
  list(model1_pred, model2_pred, model3_pred),
  weights
)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Ensembles usually beat single models</li>
        <li>• Diversity is key—uncorrelated errors cancel</li>
        <li>• Weight by performance or learn meta-model</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Bagging reduces variance, boosting reduces bias</li>
        <li>• Stacking is most flexible but complex</li>
        <li>• Blend different model types for best results</li>
      </ul>
    </div>
  </div>
</div>

