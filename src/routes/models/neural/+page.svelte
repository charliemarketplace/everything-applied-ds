<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Neural network parameters
  let hiddenLayers = $state(2);
  let neuronsPerLayer = $state(32);
  let learningRate = $state(0.01);
  let epochs = $state(100);
  let dropout = $state(0.2);

  // Simulate training
  const trainingCurve = $derived(() => {
    const rng = createRNG(42);
    const trainLoss: number[] = [];
    const valLoss: number[] = [];
    
    // Parameters affect convergence
    const convergenceRate = learningRate * 5;
    const complexity = hiddenLayers * neuronsPerLayer;
    const overfitRate = complexity / 1000 * (1 - dropout);
    
    for (let e = 0; e < epochs; e++) {
      const progress = e / epochs;
      
      // Training loss decreases
      const baseTrain = 1.0 * Math.exp(-convergenceRate * e * 0.5);
      trainLoss.push(baseTrain + normalRandom(rng, 0, 0.02));
      
      // Validation - starts similar, then diverges (overfitting)
      const baseVal = baseTrain + overfitRate * progress * 0.5;
      valLoss.push(Math.max(0.1, baseVal + normalRandom(rng, 0, 0.03)));
    }
    
    return { trainLoss, valLoss };
  });

  // Model capacity
  const modelCapacity = $derived(() => {
    const params = neuronsPerLayer * neuronsPerLayer * hiddenLayers;
    return params;
  });

  // Best validation epoch
  const bestEpoch = $derived(() => {
    const valLoss = trainingCurve().valLoss;
    const minLoss = Math.min(...valLoss);
    return valLoss.indexOf(minLoss);
  });

  const epochLabels = $derived(Array.from({ length: epochs }, (_, i) => (i + 1).toString()));

  // Architectures
  const architectures = [
    { name: 'MLP', desc: 'Dense layers, good for tabular data', example: 'Player projections' },
    { name: 'RNN/LSTM', desc: 'Sequential data, memory', example: 'Streak prediction' },
    { name: 'Embedding', desc: 'Learn player/team representations', example: 'Collaborative filtering' },
    { name: 'Attention', desc: 'Variable-length sequences', example: 'Play-by-play analysis' }
  ];
</script>

<svelte:head>
  <title>Neural Networks | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Statistical Models</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Neural Networks</h1>
    <p class="section-subtitle max-w-3xl">
      Deep learning for sports betting. Learn complex patterns from data, but
      watch for overfitting—small betting datasets are challenging.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 Neural Network Basics</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">📥</div>
        <h3 class="text-amber-350 font-semibold mb-2">Input Layer</h3>
        <p class="text-xs text-obsidian-400">Features: stats, odds, matchups</p>
      </div>
      <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
        <div class="text-3xl mb-2">🧠</div>
        <h3 class="text-amber-350 font-semibold mb-2">Hidden Layers</h3>
        <p class="text-xs text-obsidian-400">Learn complex patterns</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">📤</div>
        <h3 class="text-amber-350 font-semibold mb-2">Output Layer</h3>
        <p class="text-xs text-obsidian-400">Prediction: prob, points, etc.</p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Architecture</h3>
        <div class="space-y-4">
          <Slider bind:value={hiddenLayers} min={1} max={5} step={1} label="Hidden Layers" />
          <Slider bind:value={neuronsPerLayer} min={8} max={128} step={8} label="Neurons per Layer" />
          <Slider bind:value={dropout} min={0} max={0.5} step={0.05} label="Dropout Rate" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Training</h3>
        <div class="space-y-4">
          <Slider bind:value={learningRate} min={0.001} max={0.1} step={0.001} label="Learning Rate" />
          <Slider bind:value={epochs} min={50} max={200} step={10} label="Epochs" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Model Info</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Parameters</span>
            <span class="font-mono text-obsidian-200">~{modelCapacity().toLocaleString()}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Best Epoch</span>
            <span class="font-mono text-jade-400">{bestEpoch() + 1}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Overfit Risk</span>
            <span class="font-mono {modelCapacity() > 5000 ? 'text-crimson-400' : 'text-jade-400'}">
              {modelCapacity() > 5000 ? 'High' : modelCapacity() > 2000 ? 'Medium' : 'Low'}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Training Curve -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Training Curve</h3>
        <div class="h-48">
          <LineChart 
            labels={epochLabels}
            datasets={[
              {
                label: 'Training Loss',
                data: trainingCurve().trainLoss,
                borderColor: '#34d399',
                fill: false
              },
              {
                label: 'Validation Loss',
                data: trainingCurve().valLoss,
                borderColor: '#f5c542',
                fill: false
              }
            ]}
            xAxisLabel="Epoch"
            yAxisLabel="Loss"
          />
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-xs">
          {#if trainingCurve().valLoss[epochs - 1] > trainingCurve().valLoss[bestEpoch()] * 1.2}
            <span class="text-crimson-400">⚠️ Overfitting detected! Validation loss increasing after epoch {bestEpoch() + 1}. Use early stopping.</span>
          {:else}
            <span class="text-jade-400">✓ Good convergence. Training and validation tracking well.</span>
          {/if}
        </div>
      </div>

      <!-- Network Visualization -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Network Architecture</h3>
        <div class="flex items-center justify-center gap-8 p-6 bg-obsidian-800/50 rounded-lg overflow-x-auto">
          <!-- Input -->
          <div class="flex flex-col gap-1 items-center">
            <div class="text-xs text-obsidian-400 mb-2">Input</div>
            {#each Array(4) as _, i}
              <div class="w-8 h-8 rounded-full bg-jade-500/30 border border-jade-500/50"></div>
            {/each}
          </div>
          
          <!-- Hidden layers -->
          {#each Array(hiddenLayers) as _, layer}
            <div class="text-jade-400">→</div>
            <div class="flex flex-col gap-1 items-center">
              <div class="text-xs text-obsidian-400 mb-2">H{layer + 1}</div>
              {#each Array(Math.min(6, Math.ceil(neuronsPerLayer / 16))) as _, i}
                <div class="w-8 h-8 rounded-full bg-amber-350/30 border border-amber-350/50"></div>
              {/each}
              {#if neuronsPerLayer > 16}
                <div class="text-xs text-obsidian-500">+{neuronsPerLayer - Math.ceil(neuronsPerLayer / 16) * 3}</div>
              {/if}
            </div>
          {/each}
          
          <div class="text-jade-400">→</div>
          
          <!-- Output -->
          <div class="flex flex-col gap-1 items-center">
            <div class="text-xs text-obsidian-400 mb-2">Output</div>
            <div class="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-500/50"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Architectures -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🧠 Architectures for Betting</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each architectures as arch}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{arch.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{arch.desc}</p>
          <p class="text-xs text-jade-400">Ex: {arch.example}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> / Python Code
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Keras (via reticulate or keras R package)
library(keras)

model &lt;- keras_model_sequential() %&gt;%
  layer_dense(units = {neuronsPerLayer}, activation = "relu", input_shape = c(n_features)) %&gt;%
  layer_dropout(rate = {dropout})
  
# Add hidden layers
for (i in 1:{hiddenLayers - 1}) {'{'} 
  model &lt;- model %&gt;%
    layer_dense(units = {neuronsPerLayer}, activation = "relu") %&gt;%
    layer_dropout(rate = {dropout})
{'}'}

# Output layer
model &lt;- model %&gt;%
  layer_dense(units = 1, activation = "sigmoid")

model %&gt;% compile(
  optimizer = optimizer_adam(learning_rate = {learningRate}),
  loss = "binary_crossentropy",
  metrics = c("accuracy")
)

# Train with early stopping
history &lt;- model %&gt;% fit(
  x_train, y_train,
  epochs = {epochs},
  validation_split = 0.2,
  callbacks = list(callback_early_stopping(patience = 10))
)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Neural nets learn complex nonlinear patterns</li>
        <li>• Prone to overfitting with small datasets</li>
        <li>• Use dropout and early stopping</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Start simple—often XGBoost beats NNs on tabular</li>
        <li>• Embeddings useful for categorical features</li>
        <li>• LSTMs for time series (streaks, form)</li>
      </ul>
    </div>
  </div>
</div>

