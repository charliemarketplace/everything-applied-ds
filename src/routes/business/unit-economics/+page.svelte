<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Unit economics parameters
  let cac = $state(150);
  let ltv = $state(400);
  let avgBetsPerMonth = $state(20);
  let avgBetSize = $state(50);
  let holdRate = $state(8);
  let costPerBet = $state(0.5);

  // Derived metrics
  const monthlyRevenue = $derived(avgBetsPerMonth * avgBetSize * holdRate / 100);
  const monthlyCost = $derived(avgBetsPerMonth * costPerBet);
  const monthlyContribution = $derived(monthlyRevenue - monthlyCost);
  const paybackMonths = $derived(monthlyContribution > 0 ? cac / monthlyContribution : Infinity);
  const ltvCacRatio = $derived(ltv / cac);

  // Contribution margin breakdown
  const breakdown = $derived(() => {
    return [
      { label: 'Gross Revenue', value: monthlyRevenue, color: '#34d399' },
      { label: 'Payment Processing', value: monthlyRevenue * 0.03, color: '#ef4444' },
      { label: 'Ops Cost', value: monthlyCost, color: '#ef4444' },
      { label: 'Net Contribution', value: monthlyContribution * 0.97, color: '#f5c542' }
    ];
  });

  // LTV/CAC scenarios
  const scenarios = [
    { ratio: 1, status: 'Break-even', color: 'text-obsidian-300' },
    { ratio: 2, status: 'Minimum healthy', color: 'text-amber-350' },
    { ratio: 3, status: 'Target', color: 'text-jade-400' },
    { ratio: 5, status: 'Excellent', color: 'text-jade-400' }
  ];

  // Key metrics
  const metrics = [
    { name: 'CAC', formula: 'Marketing Spend / New Customers', desc: 'Cost to acquire one customer' },
    { name: 'LTV', formula: 'ARPU × Avg Lifespan', desc: 'Total revenue from one customer' },
    { name: 'ARPU', formula: 'Revenue / Active Users', desc: 'Average revenue per user' },
    { name: 'Payback', formula: 'CAC / Monthly Contribution', desc: 'Months to recover CAC' }
  ];
</script>

<svelte:head>
  <title>Unit Economics | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Business Frameworks</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Unit Economics</h1>
    <p class="section-subtitle max-w-3xl">
      Understand the profitability of each customer. LTV/CAC ratio determines
      whether growth is sustainable or burning cash.
    </p>
  </div>

  <!-- Core Formula -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Core Question</h2>
    <div class="text-center p-6 bg-obsidian-800/50 rounded-lg">
      <div class="text-2xl text-obsidian-200 mb-4">
        Is <span class="text-jade-400">LTV</span> &gt; <span class="text-crimson-400">CAC</span>?
      </div>
      <div class="grid md:grid-cols-3 gap-4 text-sm">
        <div class="p-3 bg-jade-500/10 border border-jade-500/30 rounded-lg">
          <span class="text-jade-400 font-semibold">LTV</span>
          <p class="text-xs text-obsidian-400">What customer is worth</p>
        </div>
        <div class="p-3 bg-obsidian-700/50 rounded-lg">
          <span class="text-obsidian-300">vs</span>
        </div>
        <div class="p-3 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
          <span class="text-crimson-400 font-semibold">CAC</span>
          <p class="text-xs text-obsidian-400">What it costs to get them</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Customer Metrics</h3>
        <div class="space-y-4">
          <Slider bind:value={cac} min={50} max={500} step={25} label="CAC ($)" />
          <Slider bind:value={ltv} min={100} max={1000} step={50} label="LTV ($)" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Behavioral Inputs</h3>
        <div class="space-y-4">
          <Slider bind:value={avgBetsPerMonth} min={5} max={50} step={5} label="Bets/Month" />
          <Slider bind:value={avgBetSize} min={10} max={200} step={10} label="Avg Bet Size ($)" />
          <Slider bind:value={holdRate} min={3} max={15} step={0.5} label="Hold Rate (%)" />
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Key Results -->
      <div class="glass-card p-6 border-{ltvCacRatio >= 3 ? 'jade-500' : ltvCacRatio >= 2 ? 'amber-350' : 'crimson-500'}/30">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">📊 Unit Economics Summary</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">LTV / CAC</div>
            <div class="font-mono text-3xl {ltvCacRatio >= 3 ? 'text-jade-400' : ltvCacRatio >= 2 ? 'text-amber-350' : 'text-crimson-400'}">
              {ltvCacRatio.toFixed(1)}x
            </div>
            <div class="text-xs {ltvCacRatio >= 3 ? 'text-jade-400' : ltvCacRatio >= 2 ? 'text-amber-350' : 'text-crimson-400'} mt-1">
              {ltvCacRatio >= 3 ? '✓ Healthy' : ltvCacRatio >= 2 ? '⚠️ OK' : '✗ Unprofitable'}
            </div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Payback Period</div>
            <div class="font-mono text-3xl text-obsidian-200">
              {paybackMonths < 100 ? paybackMonths.toFixed(1) : '∞'}
            </div>
            <div class="text-xs text-obsidian-400 mt-1">months</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Monthly Contribution</div>
            <div class="font-mono text-3xl {monthlyContribution > 0 ? 'text-jade-400' : 'text-crimson-400'}">
              ${monthlyContribution.toFixed(0)}
            </div>
            <div class="text-xs text-obsidian-400 mt-1">per customer</div>
          </div>
        </div>
      </div>

      <!-- Revenue Breakdown -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Monthly Revenue Breakdown</h3>
        <div class="space-y-3">
          <div class="flex items-center gap-4">
            <span class="text-sm text-obsidian-300 w-32">Gross Revenue</span>
            <div class="flex-1 h-6 bg-obsidian-800 rounded-full overflow-hidden">
              <div class="h-full bg-jade-500" style="width: 100%"></div>
            </div>
            <span class="font-mono text-sm text-jade-400">${monthlyRevenue.toFixed(0)}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-obsidian-300 w-32">- Processing (3%)</span>
            <div class="flex-1 h-6 bg-obsidian-800 rounded-full overflow-hidden">
              <div class="h-full bg-crimson-500" style="width: {3}%"></div>
            </div>
            <span class="font-mono text-sm text-crimson-400">-${(monthlyRevenue * 0.03).toFixed(0)}</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-obsidian-300 w-32">- Ops Cost</span>
            <div class="flex-1 h-6 bg-obsidian-800 rounded-full overflow-hidden">
              <div class="h-full bg-crimson-500" style="width: {monthlyCost / monthlyRevenue * 100}%"></div>
            </div>
            <span class="font-mono text-sm text-crimson-400">-${monthlyCost.toFixed(0)}</span>
          </div>
          <div class="flex items-center gap-4 pt-2 border-t border-obsidian-700">
            <span class="text-sm text-amber-350 w-32 font-semibold">Net Contribution</span>
            <div class="flex-1 h-6 bg-obsidian-800 rounded-full overflow-hidden">
              <div class="h-full bg-amber-350" style="width: {(monthlyContribution * 0.97) / monthlyRevenue * 100}%"></div>
            </div>
            <span class="font-mono text-sm text-amber-350">${(monthlyContribution * 0.97).toFixed(0)}</span>
          </div>
        </div>
      </div>

      <!-- LTV/CAC Benchmark -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">LTV/CAC Benchmarks</h3>
        <div class="grid grid-cols-4 gap-4">
          {#each scenarios as scenario}
            <div class="p-3 bg-obsidian-800/50 rounded-lg text-center {ltvCacRatio >= scenario.ratio ? 'ring-2 ring-jade-500/50' : ''}">
              <div class="font-mono text-lg {scenario.color}">{scenario.ratio}x</div>
              <div class="text-xs text-obsidian-400">{scenario.status}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <!-- Key Metrics -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📊 Key Metrics</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each metrics as metric}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{metric.name}</h3>
          <div class="font-mono text-xs text-obsidian-300 mb-2">{metric.formula}</div>
          <p class="text-xs text-obsidian-400">{metric.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Unit economics calculation
calculate_unit_economics &lt;- function(cac, ltv, monthly_revenue, monthly_cost) {'{'} 
  contribution &lt;- monthly_revenue - monthly_cost
  payback_months &lt;- cac / contribution
  ltv_cac_ratio &lt;- ltv / cac
  
  list(
    ltv_cac = ltv_cac_ratio,
    payback = payback_months,
    monthly_contribution = contribution,
    profitable = ltv &gt; cac
  )
{'}'}

# Example
metrics &lt;- calculate_unit_economics(
  cac = {cac},
  ltv = {ltv},
  monthly_revenue = {monthlyRevenue.toFixed(0)},
  monthly_cost = {monthlyCost.toFixed(0)}
)

cat(sprintf("LTV/CAC: %.1fx, Payback: %.1f months\n", 
    metrics$ltv_cac, metrics$payback))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• LTV/CAC &gt; 3x is healthy for SaaS-like businesses</li>
        <li>• Payback period &lt; 12 months is ideal</li>
        <li>• Monitor both acquisition and retention</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Improve by: increasing LTV or reducing CAC</li>
        <li>• Cohort analysis reveals true LTV</li>
        <li>• Account for variable costs per bet</li>
      </ul>
    </div>
  </div>
</div>

