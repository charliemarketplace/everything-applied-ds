<script lang="ts">
  import { createRNG } from '$lib/utils/synthetic-data';

  // Dashboard components
  const components = [
    { name: 'KPI Cards', icon: '📊', desc: 'Key metrics at a glance', example: 'GGR, Handle, Win Rate' },
    { name: 'Time Series', icon: '📈', desc: 'Trends over time', example: 'Daily revenue, user signups' },
    { name: 'Tables', icon: '📋', desc: 'Detailed data exploration', example: 'Top players, open bets' },
    { name: 'Filters', icon: '🔍', desc: 'Slice and dice data', example: 'Date range, sport, market' },
    { name: 'Alerts', icon: '🚨', desc: 'Real-time notifications', example: 'Liability exceeded, fraud' },
    { name: 'Drill-down', icon: '🔎', desc: 'From summary to detail', example: 'Click metric → breakdown' }
  ];

  // Dashboard types
  const dashboards = [
    { 
      name: 'Trading Dashboard',
      users: 'Traders',
      metrics: ['Live liability', 'Sharp action', 'Line movement'],
      refresh: 'Real-time'
    },
    { 
      name: 'Executive Dashboard',
      users: 'Leadership',
      metrics: ['GGR', 'Handle', 'Customer count'],
      refresh: 'Daily'
    },
    { 
      name: 'Risk Dashboard',
      users: 'Risk team',
      metrics: ['VaR', 'Correlation', 'Concentration'],
      refresh: 'Hourly'
    },
    { 
      name: 'Model Performance',
      users: 'Data science',
      metrics: ['Accuracy', 'CLV', 'Calibration'],
      refresh: 'Daily'
    }
  ];

  // Tools
  const tools = [
    { name: 'Tableau', type: 'BI Platform', strength: 'Enterprise, drag-drop' },
    { name: 'Looker', type: 'BI Platform', strength: 'LookML, governance' },
    { name: 'Metabase', type: 'Open Source', strength: 'Simple, SQL-based' },
    { name: 'Superset', type: 'Open Source', strength: 'Python, extensible' },
    { name: 'Grafana', type: 'Monitoring', strength: 'Time series, alerts' },
    { name: 'Streamlit', type: 'Python Apps', strength: 'Rapid prototyping' }
  ];

  // Sample KPIs
  const sampleKPIs = [
    { name: 'Handle (24h)', value: '$2.4M', change: '+12%', positive: true },
    { name: 'GGR (24h)', value: '$186K', change: '+8%', positive: true },
    { name: 'Active Users', value: '12,450', change: '-3%', positive: false },
    { name: 'Hold %', value: '7.8%', change: '+0.4pp', positive: true }
  ];
</script>

<svelte:head>
  <title>Dashboards | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Infrastructure</span>
    </div>
    <h1 class="section-title">Dashboards</h1>
    <p class="section-subtitle max-w-3xl">
      Visualize metrics, monitor operations, and enable data-driven decisions.
      The interface between data and action.
    </p>
  </div>

  <!-- Sample Dashboard -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 Sample Trading Dashboard</h2>
    
    <!-- KPI Row -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      {#each sampleKPIs as kpi}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <div class="text-xs text-obsidian-400 mb-1">{kpi.name}</div>
          <div class="text-2xl font-mono text-obsidian-100">{kpi.value}</div>
          <div class="text-xs {kpi.positive ? 'text-jade-400' : 'text-crimson-400'} mt-1">
            {kpi.change} vs yesterday
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Chart Area -->
    <div class="grid grid-cols-3 gap-4">
      <div class="col-span-2 h-48 bg-obsidian-800/50 rounded-lg p-4">
        <div class="text-xs text-obsidian-400 mb-2">Handle by Hour</div>
        <div class="h-32 flex items-end gap-1">
          {#each Array(24) as _, i}
            <div 
              class="flex-1 bg-amber-350/60 rounded-t"
              style="height: {Math.random() * 80 + 20}%"
            ></div>
          {/each}
        </div>
        <div class="flex justify-between text-xs text-obsidian-500 mt-1">
          <span>12am</span>
          <span>12pm</span>
          <span>Now</span>
        </div>
      </div>
      
      <div class="h-48 bg-obsidian-800/50 rounded-lg p-4">
        <div class="text-xs text-obsidian-400 mb-2">Handle by Sport</div>
        <div class="space-y-2 mt-4">
          <div class="flex items-center gap-2">
            <span class="text-xs w-16">NFL</span>
            <div class="flex-1 h-4 bg-obsidian-700 rounded">
              <div class="h-full bg-jade-500 rounded" style="width: 45%"></div>
            </div>
            <span class="text-xs text-obsidian-300">45%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-16">NBA</span>
            <div class="flex-1 h-4 bg-obsidian-700 rounded">
              <div class="h-full bg-amber-350 rounded" style="width: 30%"></div>
            </div>
            <span class="text-xs text-obsidian-300">30%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-16">MLB</span>
            <div class="flex-1 h-4 bg-obsidian-700 rounded">
              <div class="h-full bg-blue-500 rounded" style="width: 15%"></div>
            </div>
            <span class="text-xs text-obsidian-300">15%</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs w-16">Other</span>
            <div class="flex-1 h-4 bg-obsidian-700 rounded">
              <div class="h-full bg-purple-500 rounded" style="width: 10%"></div>
            </div>
            <span class="text-xs text-obsidian-300">10%</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Dashboard Types -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📺 Dashboard Types</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each dashboards as dashboard}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{dashboard.name}</h3>
          <p class="text-xs text-obsidian-400 mb-2">Users: {dashboard.users}</p>
          <ul class="text-xs text-obsidian-300 space-y-1 mb-2">
            {#each dashboard.metrics as metric}
              <li>• {metric}</li>
            {/each}
          </ul>
          <p class="text-xs text-jade-400">⏱️ {dashboard.refresh}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Components -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🧩 Dashboard Components</h2>
    <div class="grid md:grid-cols-3 gap-4">
      {#each components as comp}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">{comp.icon}</span>
            <h3 class="text-amber-350 font-semibold">{comp.name}</h3>
          </div>
          <p class="text-xs text-obsidian-300 mb-1">{comp.desc}</p>
          <p class="text-xs text-jade-400">Ex: {comp.example}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Tools -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔧 Dashboard Tools</h2>
    <div class="grid md:grid-cols-6 gap-4">
      {#each tools as tool}
        <div class="p-3 bg-obsidian-800/50 rounded-lg text-center">
          <h3 class="text-amber-350 font-semibold mb-1">{tool.name}</h3>
          <p class="text-xs text-obsidian-400 mb-1">{tool.type}</p>
          <p class="text-xs text-jade-400">{tool.strength}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Best Practices -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">✅ Best Practices</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-3">
        <h3 class="text-jade-400 font-semibold">Do</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>✓ Start with user needs and questions</li>
          <li>✓ Show context (trends, benchmarks)</li>
          <li>✓ Enable drill-down from summary to detail</li>
          <li>✓ Set up alerting for anomalies</li>
          <li>✓ Document metric definitions</li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-crimson-400 font-semibold">Don't</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>✗ Overcrowd with too many metrics</li>
          <li>✗ Use misleading visualizations</li>
          <li>✗ Ignore mobile/different screen sizes</li>
          <li>✗ Forget about data freshness</li>
          <li>✗ Skip performance optimization</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Design for specific user personas</li>
        <li>• Real-time for trading, daily for exec</li>
        <li>• KPIs → trends → details hierarchy</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Alerting is as important as visualization</li>
        <li>• Self-service with guardrails</li>
        <li>• Performance matters at scale</li>
      </ul>
    </div>
  </div>
</div>

