<script lang="ts">
  // MLOps lifecycle
  const lifecycle = [
    { name: 'Develop', icon: '💻', steps: ['Experiment tracking', 'Feature store', 'Notebooks'] },
    { name: 'Train', icon: '🏋️', steps: ['Hyperparameter tuning', 'Cross-validation', 'Model selection'] },
    { name: 'Deploy', icon: '🚀', steps: ['Model registry', 'CI/CD', 'Containerization'] },
    { name: 'Monitor', icon: '📊', steps: ['Drift detection', 'Performance tracking', 'Alerting'] }
  ];

  // Tools
  const tools = [
    { name: 'MLflow', category: 'Experiment Tracking', use: 'Log params, metrics, artifacts' },
    { name: 'Weights & Biases', category: 'Experiment Tracking', use: 'Visualization, collaboration' },
    { name: 'Kubeflow', category: 'Orchestration', use: 'ML pipelines on K8s' },
    { name: 'Seldon', category: 'Serving', use: 'Model deployment at scale' },
    { name: 'Feast', category: 'Feature Store', use: 'Consistent feature engineering' },
    { name: 'Great Expectations', category: 'Data Quality', use: 'Data validation' },
    { name: 'Evidently', category: 'Monitoring', use: 'Model drift detection' },
    { name: 'BentoML', category: 'Serving', use: 'Model packaging and serving' }
  ];

  // Model registry example
  const modelVersions = [
    { version: 'v3.2.1', stage: 'Production', accuracy: 0.742, deployed: '2024-01-15' },
    { version: 'v3.3.0', stage: 'Staging', accuracy: 0.751, deployed: '2024-01-20' },
    { version: 'v3.4.0', stage: 'Development', accuracy: 0.748, deployed: '-' }
  ];

  // Monitoring metrics
  const monitoringMetrics = [
    { name: 'Prediction Latency', value: '45ms', status: 'good' },
    { name: 'Requests/sec', value: '1,250', status: 'good' },
    { name: 'Model Drift', value: '0.12', status: 'warning' },
    { name: 'Data Quality', value: '99.2%', status: 'good' }
  ];
</script>

<svelte:head>
  <title>MLOps | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Infrastructure</span>
    </div>
    <h1 class="section-title">MLOps</h1>
    <p class="section-subtitle max-w-3xl">
      Machine Learning Operations: Deploy, monitor, and maintain ML models
      in production. Bridge the gap from notebook to reliable system.
    </p>
  </div>

  <!-- Lifecycle -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔄 ML Lifecycle</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each lifecycle as phase}
        <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
          <div class="text-3xl mb-2">{phase.icon}</div>
          <h3 class="text-amber-350 font-semibold mb-2">{phase.name}</h3>
          <ul class="text-xs text-obsidian-400 space-y-1">
            {#each phase.steps as step}
              <li>• {step}</li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </div>

  <!-- Model Registry -->
  <div class="grid lg:grid-cols-2 gap-6">
    <div class="glass-card p-6">
      <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📦 Model Registry</h2>
      <p class="text-sm text-obsidian-300 mb-4">
        Version control for models. Track lineage, promote through stages.
      </p>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-obsidian-400 border-b border-obsidian-700">
              <th class="pb-2">Version</th>
              <th class="pb-2">Stage</th>
              <th class="pb-2">Accuracy</th>
              <th class="pb-2">Deployed</th>
            </tr>
          </thead>
          <tbody>
            {#each modelVersions as model}
              <tr class="border-b border-obsidian-800">
                <td class="py-2 font-mono text-obsidian-200">{model.version}</td>
                <td class="py-2">
                  <span class="px-2 py-0.5 rounded text-xs {
                    model.stage === 'Production' ? 'bg-jade-500/20 text-jade-400' :
                    model.stage === 'Staging' ? 'bg-amber-350/20 text-amber-350' :
                    'bg-obsidian-700 text-obsidian-300'
                  }">
                    {model.stage}
                  </span>
                </td>
                <td class="py-2 text-obsidian-300">{(model.accuracy * 100).toFixed(1)}%</td>
                <td class="py-2 text-obsidian-400">{model.deployed}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="glass-card p-6">
      <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 Production Monitoring</h2>
      <p class="text-sm text-obsidian-300 mb-4">
        Track model health, detect drift, alert on degradation.
      </p>
      <div class="grid grid-cols-2 gap-4">
        {#each monitoringMetrics as metric}
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <div class="text-xs text-obsidian-400 mb-1">{metric.name}</div>
            <div class="flex items-center justify-between">
              <span class="font-mono text-lg text-obsidian-200">{metric.value}</span>
              <span class="w-3 h-3 rounded-full {
                metric.status === 'good' ? 'bg-jade-500' : 'bg-amber-350'
              }"></span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Tools -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔧 MLOps Tools</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each tools as tool}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-1">{tool.name}</h3>
          <p class="text-xs text-jade-400 mb-1">{tool.category}</p>
          <p class="text-xs text-obsidian-400">{tool.use}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- CI/CD for ML -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🔄 CI/CD for ML</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Continuous Integration</h3>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Unit tests for data pipelines</li>
          <li>• Data validation checks</li>
          <li>• Model training smoke tests</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Continuous Training</h3>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Scheduled retraining</li>
          <li>• Trigger on data drift</li>
          <li>• Auto hyperparameter tuning</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Continuous Deployment</h3>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Canary deployments</li>
          <li>• A/B testing models</li>
          <li>• Automatic rollback</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Code Example -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">Python</span> / MLflow Example
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># MLflow experiment tracking
import mlflow
from mlflow.tracking import MlflowClient

# Start experiment
mlflow.set_experiment("player_projection_model")

with mlflow.start_run():
    # Log parameters
    mlflow.log_param("model_type", "xgboost")
    mlflow.log_param("n_estimators", 100)
    mlflow.log_param("max_depth", 5)
    
    # Train model
    model = train_model(X_train, y_train)
    
    # Log metrics
    mlflow.log_metric("mae", 2.34)
    mlflow.log_metric("rmse", 3.12)
    mlflow.log_metric("r2", 0.78)
    
    # Log model
    mlflow.sklearn.log_model(model, "model")
    
    # Register model
    mlflow.register_model(
        f"runs:{'{'}mlflow.active_run().info.run_id{'}'}/model",
        "player_projection"
    )

# Promote to production
client = MlflowClient()
client.transition_model_version_stage(
    name="player_projection",
    version=3,
    stage="Production"
)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• MLOps = DevOps for machine learning</li>
        <li>• Track experiments, version models</li>
        <li>• Automate training and deployment</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Monitor for drift and degradation</li>
        <li>• Model registry for governance</li>
        <li>• Start simple, add complexity as needed</li>
      </ul>
    </div>
  </div>
</div>

