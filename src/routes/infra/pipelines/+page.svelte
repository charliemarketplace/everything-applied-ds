<script lang="ts">
  import { createRNG } from '$lib/utils/synthetic-data';

  // Pipeline stages
  const stages = [
    { name: 'Ingest', icon: '📥', desc: 'Collect raw data from sources', tools: ['Kafka', 'Airflow', 'Fivetran'] },
    { name: 'Transform', icon: '🔄', desc: 'Clean, validate, feature eng', tools: ['dbt', 'Spark', 'Pandas'] },
    { name: 'Store', icon: '💾', desc: 'Data warehouse/lake', tools: ['Snowflake', 'BigQuery', 'S3'] },
    { name: 'Serve', icon: '🚀', desc: 'APIs, dashboards, models', tools: ['FastAPI', 'Tableau', 'MLflow'] }
  ];

  // Data sources
  const sources = [
    { name: 'Odds Feeds', frequency: 'Real-time', volume: 'High', example: 'Pinnacle, Betfair API' },
    { name: 'Stats Providers', frequency: 'Daily', volume: 'Medium', example: 'Sportradar, Stats LLC' },
    { name: 'Betting Activity', frequency: 'Real-time', volume: 'Very High', example: 'Internal DB' },
    { name: 'External Data', frequency: 'Weekly', volume: 'Low', example: 'Weather, injuries' }
  ];

  // Best practices
  const practices = [
    { name: 'Idempotency', desc: 'Same input → same output, safe to retry' },
    { name: 'Backfill Support', desc: 'Ability to reprocess historical data' },
    { name: 'Schema Evolution', desc: 'Handle changing data formats gracefully' },
    { name: 'Data Quality', desc: 'Validation, anomaly detection, alerts' },
    { name: 'Lineage Tracking', desc: 'Know where data came from' },
    { name: 'Monitoring', desc: 'Latency, freshness, error rates' }
  ];

  // Sample pipeline status
  const rng = createRNG(42);
  const pipelineStatus = [
    { name: 'odds_ingest', status: 'running', lastRun: '2 min ago', duration: '45s' },
    { name: 'player_stats_daily', status: 'success', lastRun: '4h ago', duration: '12m' },
    { name: 'feature_engineering', status: 'success', lastRun: '1h ago', duration: '8m' },
    { name: 'model_training', status: 'pending', lastRun: 'scheduled', duration: '-' },
    { name: 'liability_snapshot', status: 'failed', lastRun: '30 min ago', duration: '2m' }
  ];
</script>

<svelte:head>
  <title>Data Pipelines | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Infrastructure</span>
    </div>
    <h1 class="section-title">Data Pipelines</h1>
    <p class="section-subtitle max-w-3xl">
      Move data from sources to destinations reliably. The backbone of
      any data-driven betting operation.
    </p>
  </div>

  <!-- Pipeline Flow -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📊 ETL/ELT Pipeline Stages</h2>
    <div class="flex items-center justify-between gap-4">
      {#each stages as stage, i}
        <div class="flex-1 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-amber-350/20 border-2 border-amber-350/50 flex items-center justify-center text-2xl mb-2">
            {stage.icon}
          </div>
          <h3 class="text-amber-350 font-semibold">{stage.name}</h3>
          <p class="text-xs text-obsidian-400 mt-1">{stage.desc}</p>
          <div class="mt-2 flex flex-wrap justify-center gap-1">
            {#each stage.tools as tool}
              <span class="text-xs bg-obsidian-700 px-2 py-0.5 rounded">{tool}</span>
            {/each}
          </div>
        </div>
        {#if i < stages.length - 1}
          <div class="text-amber-350 text-2xl">→</div>
        {/if}
      {/each}
    </div>
  </div>

  <!-- Data Sources -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📥 Betting Data Sources</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each sources as source}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{source.name}</h3>
          <div class="text-xs space-y-1">
            <div class="flex justify-between">
              <span class="text-obsidian-400">Frequency</span>
              <span class="text-obsidian-300">{source.frequency}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-obsidian-400">Volume</span>
              <span class="text-obsidian-300">{source.volume}</span>
            </div>
          </div>
          <p class="text-xs text-jade-400 mt-2">{source.example}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Pipeline Status Dashboard -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🖥️ Pipeline Status</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-obsidian-400 border-b border-obsidian-700">
            <th class="pb-2">Pipeline</th>
            <th class="pb-2">Status</th>
            <th class="pb-2">Last Run</th>
            <th class="pb-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {#each pipelineStatus as pipeline}
            <tr class="border-b border-obsidian-800">
              <td class="py-2 font-mono text-obsidian-200">{pipeline.name}</td>
              <td class="py-2">
                <span class="px-2 py-0.5 rounded text-xs {
                  pipeline.status === 'success' ? 'bg-jade-500/20 text-jade-400' :
                  pipeline.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  pipeline.status === 'failed' ? 'bg-crimson-500/20 text-crimson-400' :
                  'bg-obsidian-700 text-obsidian-300'
                }">
                  {pipeline.status}
                </span>
              </td>
              <td class="py-2 text-obsidian-400">{pipeline.lastRun}</td>
              <td class="py-2 text-obsidian-400">{pipeline.duration}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
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
      <span class="text-blue-400">Python</span> / Airflow Example
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Airflow DAG for odds ingestion
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

default_args = {'{'} 
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
{'}'}

def ingest_odds():
    """Fetch odds from API and store in raw layer"""
    import requests
    response = requests.get("https://api.oddsapi.com/v4/sports/...")
    # Store to S3/GCS
    
def transform_odds():
    """Clean and standardize odds data"""
    # dbt run --select odds_staging
    
def validate_data():
    """Run data quality checks"""
    # Check for nulls, outliers, staleness

with DAG('odds_pipeline', 
         schedule_interval='*/5 * * * *',  # Every 5 min
         default_args=default_args) as dag:
    
    ingest = PythonOperator(task_id='ingest', python_callable=ingest_odds)
    transform = PythonOperator(task_id='transform', python_callable=transform_odds)
    validate = PythonOperator(task_id='validate', python_callable=validate_data)
    
    ingest &gt;&gt; transform &gt;&gt; validate</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Pipelines: Extract → Transform → Load</li>
        <li>• Real-time for odds, batch for stats</li>
        <li>• Idempotency enables safe retries</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Use Airflow/Prefect for orchestration</li>
        <li>• dbt for transformations in warehouse</li>
        <li>• Monitor freshness and data quality</li>
      </ul>
    </div>
  </div>
</div>

