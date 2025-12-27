<script lang="ts">
  // Model version history
  const versionHistory = [
    { version: 'v1.0.0', date: '2023-06-01', change: 'Initial production model', metrics: { accuracy: 0.68 } },
    { version: 'v1.1.0', date: '2023-08-15', change: 'Added weather features', metrics: { accuracy: 0.71 } },
    { version: 'v2.0.0', date: '2023-11-20', change: 'Switched to XGBoost', metrics: { accuracy: 0.74 } },
    { version: 'v2.1.0', date: '2024-01-10', change: 'Hyperparameter tuning', metrics: { accuracy: 0.76 } },
    { version: 'v2.2.0', date: '2024-01-25', change: 'Feature engineering update', metrics: { accuracy: 0.75 } }
  ];

  // Versioning components
  const components = [
    { name: 'Code', icon: '💻', tool: 'Git', what: 'Training scripts, configs' },
    { name: 'Data', icon: '📊', tool: 'DVC', what: 'Training datasets, features' },
    { name: 'Model', icon: '🧠', tool: 'MLflow', what: 'Weights, artifacts' },
    { name: 'Experiments', icon: '🔬', tool: 'W&B', what: 'Hyperparams, metrics' }
  ];

  // Lineage tracking
  const lineage = [
    { stage: 'Data', items: ['raw_odds_2024.parquet', 'player_stats_v3.csv'] },
    { stage: 'Features', items: ['feature_store/nfl_v2', 'embeddings/team_v1'] },
    { stage: 'Training', items: ['config.yaml', 'train.py@a3f2d1'] },
    { stage: 'Model', items: ['model_v2.1.0.pkl', 'scaler.pkl'] },
    { stage: 'Deploy', items: ['Dockerfile', 'k8s/deployment.yaml'] }
  ];

  // Best practices
  const practices = [
    { name: 'Semantic Versioning', desc: 'MAJOR.MINOR.PATCH for clarity' },
    { name: 'Immutable Artifacts', desc: 'Never modify, always create new' },
    { name: 'Full Lineage', desc: 'Track data → code → model → predictions' },
    { name: 'Reproducibility', desc: 'Same inputs → same outputs' },
    { name: 'Rollback Ready', desc: 'Previous versions instantly deployable' },
    { name: 'A/B Comparison', desc: 'Compare versions in production' }
  ];
</script>

<svelte:head>
  <title>Model Versioning | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Infrastructure</span>
    </div>
    <h1 class="section-title">Model Versioning</h1>
    <p class="section-subtitle max-w-3xl">
      Track every model, dataset, and experiment. Enable reproducibility,
      rollback, and compliance in production ML.
    </p>
  </div>

  <!-- Version History -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📜 Version History</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-obsidian-400 border-b border-obsidian-700">
            <th class="pb-2">Version</th>
            <th class="pb-2">Date</th>
            <th class="pb-2">Change</th>
            <th class="pb-2">Accuracy</th>
            <th class="pb-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each versionHistory as ver, i}
            <tr class="border-b border-obsidian-800">
              <td class="py-2 font-mono text-obsidian-200">{ver.version}</td>
              <td class="py-2 text-obsidian-400">{ver.date}</td>
              <td class="py-2 text-obsidian-300">{ver.change}</td>
              <td class="py-2">
                <span class="text-{ver.metrics.accuracy > 0.74 ? 'jade-400' : 'obsidian-300'}">
                  {(ver.metrics.accuracy * 100).toFixed(1)}%
                </span>
              </td>
              <td class="py-2">
                <div class="flex gap-2">
                  <button class="text-xs px-2 py-1 bg-obsidian-700 rounded hover:bg-obsidian-600">Compare</button>
                  {#if i > 0}
                    <button class="text-xs px-2 py-1 bg-amber-350/20 text-amber-350 rounded hover:bg-amber-350/30">Rollback</button>
                  {:else}
                    <span class="text-xs px-2 py-1 bg-jade-500/20 text-jade-400 rounded">Current</span>
                  {/if}
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- What to Version -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📦 What to Version</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each components as comp}
        <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
          <div class="text-2xl mb-2">{comp.icon}</div>
          <h3 class="text-amber-350 font-semibold mb-1">{comp.name}</h3>
          <p class="text-xs text-jade-400 mb-1">Tool: {comp.tool}</p>
          <p class="text-xs text-obsidian-400">{comp.what}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Lineage Tracking -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔗 Lineage Tracking</h2>
    <div class="flex items-center justify-between gap-2">
      {#each lineage as stage, i}
        <div class="flex-1 text-center">
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h3 class="text-amber-350 font-semibold mb-2">{stage.stage}</h3>
            <ul class="text-xs text-obsidian-400 space-y-1">
              {#each stage.items as item}
                <li class="font-mono truncate">{item}</li>
              {/each}
            </ul>
          </div>
        </div>
        {#if i < lineage.length - 1}
          <div class="text-amber-350">→</div>
        {/if}
      {/each}
    </div>
    <p class="mt-4 text-xs text-obsidian-400 text-center">
      Full lineage: know exactly what data, code, and config produced each model
    </p>
  </div>

  <!-- Best Practices -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">✅ Best Practices</h2>
    <div class="grid md:grid-cols-3 gap-4">
      {#each practices as practice}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-jade-400 font-semibold mb-2">{practice.name}</h3>
          <p class="text-xs text-obsidian-400">{practice.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Code Example -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">DVC</span> + Git Example
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Initialize DVC in your repo
dvc init

# Track large data files
dvc add data/training_data.parquet
git add data/training_data.parquet.dvc .gitignore

# Track model files
dvc add models/player_projection_v2.pkl
git add models/player_projection_v2.pkl.dvc

# Commit everything together
git add .
git commit -m "v2.1.0: Add weather features"
git tag v2.1.0

# Push data to remote storage (S3, GCS)
dvc push

# Reproduce on another machine
git clone &lt;repo&gt;
git checkout v2.1.0
dvc pull  # Downloads data/models from remote

# Compare versions
dvc diff v2.0.0 v2.1.0
dvc metrics diff v2.0.0 v2.1.0</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Version code (Git), data (DVC), models (MLflow)</li>
        <li>• Use semantic versioning (MAJOR.MINOR.PATCH)</li>
        <li>• Never modify—always create new versions</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Track full lineage for reproducibility</li>
        <li>• Enable instant rollback in production</li>
        <li>• Required for audit and compliance</li>
      </ul>
    </div>
  </div>
</div>

