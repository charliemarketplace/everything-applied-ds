<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Customer parameters
  let avgBetPerMonth = $state(200);
  let holdRate = $state(8);
  let monthlyChurnRate = $state(5);
  let acquisitionCost = $state(150);
  let discountRate = $state(10);

  // LTV calculations
  const monthlyRevenue = $derived(avgBetPerMonth * holdRate / 100);
  const expectedLifetimeMonths = $derived(1 / (monthlyChurnRate / 100));
  
  // Simple LTV = Monthly Revenue / Churn Rate
  const simpleLTV = $derived(monthlyRevenue / (monthlyChurnRate / 100));
  
  // DCF LTV (with discount rate)
  const dcfLTV = $derived(() => {
    const monthlyDiscount = discountRate / 100 / 12;
    const months = 60; // 5 year horizon
    let pv = 0;
    let survivalProb = 1;
    
    for (let m = 1; m <= months; m++) {
      survivalProb *= (1 - monthlyChurnRate / 100);
      const discountFactor = 1 / Math.pow(1 + monthlyDiscount, m);
      pv += monthlyRevenue * survivalProb * discountFactor;
    }
    
    return pv;
  });

  // LTV/CAC ratio
  const ltvCacRatio = $derived(simpleLTV / acquisitionCost);
  const paybackMonths = $derived(acquisitionCost / monthlyRevenue);

  // LTV distribution simulation
  const ltvDistribution = $derived(() => {
    const rng = createRNG(42);
    const customers = 500;
    const ltvs: number[] = [];
    
    for (let c = 0; c < customers; c++) {
      // Random lifetime based on churn rate
      let lifetime = 0;
      let active = true;
      while (active && lifetime < 60) {
        if (rng() < monthlyChurnRate / 100) active = false;
        else lifetime++;
      }
      
      // Random spend per month
      const avgSpend = normalRandom(rng, avgBetPerMonth, avgBetPerMonth * 0.5);
      const ltv = lifetime * avgSpend * holdRate / 100;
      ltvs.push(ltv);
    }
    
    return ltvs.sort((a, b) => a - b);
  });

  // Segment by LTV
  const segments = $derived(() => {
    const ltvs = ltvDistribution();
    const p25 = ltvs[Math.floor(ltvs.length * 0.25)];
    const p50 = ltvs[Math.floor(ltvs.length * 0.5)];
    const p75 = ltvs[Math.floor(ltvs.length * 0.75)];
    const p95 = ltvs[Math.floor(ltvs.length * 0.95)];
    const avg = ltvs.reduce((a, b) => a + b, 0) / ltvs.length;
    
    return { p25, p50, p75, p95, avg };
  });

  // Health indicators
  function getLtvCacColor(ratio: number): string {
    if (ratio >= 3) return 'text-jade-400';
    if (ratio >= 1) return 'text-amber-350';
    return 'text-crimson-400';
  }

  function getLtvCacLabel(ratio: number): string {
    if (ratio >= 3) return 'Excellent';
    if (ratio >= 1) return 'Break-even';
    return 'Losing money';
  }
</script>

<svelte:head>
  <title>Customer LTV | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Business Framework</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Customer Lifetime Value (LTV)</h1>
    <p class="section-subtitle max-w-3xl">
      Calculate the total revenue expected from a customer over their lifetime.
      Critical for acquisition budgets, retention investment, and unit economics.
    </p>
  </div>

  <!-- Formula -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 LTV Formulas</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Simple LTV</h3>
        <div class="formula text-lg mb-2">LTV = ARPU / Churn Rate</div>
        <p class="text-xs text-obsidian-400">Average revenue per user divided by monthly churn</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">DCF LTV</h3>
        <div class="formula text-lg mb-2">LTV = Σ (ARPU × P(survive) / (1+r)^t)</div>
        <p class="text-xs text-obsidian-400">Discounted sum of expected future revenues</p>
      </div>
    </div>
  </div>

  <!-- Interactive Calculator -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Customer Inputs</h3>
        <div class="space-y-4">
          <Slider bind:value={avgBetPerMonth} min={50} max={1000} step={25} label="Avg Monthly Bets ($)" />
          <Slider bind:value={holdRate} min={2} max={15} step={0.5} label="Hold Rate (%)" />
          <Slider bind:value={monthlyChurnRate} min={1} max={20} step={0.5} label="Monthly Churn (%)" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Economics</h3>
        <div class="space-y-4">
          <Slider bind:value={acquisitionCost} min={25} max={500} step={25} label="Acquisition Cost ($)" />
          <Slider bind:value={discountRate} min={0} max={20} step={1} label="Discount Rate (%/yr)" />
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- LTV Results -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">LTV Calculations</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Simple LTV</div>
            <div class="font-mono text-3xl text-jade-400">${simpleLTV.toFixed(0)}</div>
            <div class="text-xs text-obsidian-400 mt-1">Rev/Churn</div>
          </div>
          <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">DCF LTV</div>
            <div class="font-mono text-3xl text-amber-350">${dcfLTV().toFixed(0)}</div>
            <div class="text-xs text-obsidian-400 mt-1">Time-discounted</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Expected Lifetime</div>
            <div class="font-mono text-3xl text-obsidian-200">{expectedLifetimeMonths.toFixed(1)}</div>
            <div class="text-xs text-obsidian-400 mt-1">months</div>
          </div>
        </div>
      </div>

      <!-- Unit Economics -->
      <div class="glass-card p-6 border {ltvCacRatio >= 3 ? 'border-jade-500/30' : ltvCacRatio >= 1 ? 'border-amber-350/30' : 'border-crimson-500/30'}">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">📊 Unit Economics</h3>
        <div class="grid grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-xs text-obsidian-400 mb-1">Monthly Revenue</div>
            <div class="font-mono text-xl text-obsidian-200">${monthlyRevenue.toFixed(0)}</div>
          </div>
          <div class="text-center">
            <div class="text-xs text-obsidian-400 mb-1">CAC</div>
            <div class="font-mono text-xl text-obsidian-200">${acquisitionCost}</div>
          </div>
          <div class="text-center">
            <div class="text-xs text-obsidian-400 mb-1">LTV/CAC Ratio</div>
            <div class="font-mono text-2xl {getLtvCacColor(ltvCacRatio)}">{ltvCacRatio.toFixed(1)}x</div>
          </div>
          <div class="text-center">
            <div class="text-xs text-obsidian-400 mb-1">Payback Period</div>
            <div class="font-mono text-xl text-obsidian-200">{paybackMonths.toFixed(1)} mo</div>
          </div>
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-center">
          <span class="text-sm {getLtvCacColor(ltvCacRatio)}">{getLtvCacLabel(ltvCacRatio)}</span>
          <span class="text-xs text-obsidian-400 ml-2">
            (Target: 3x+ LTV/CAC, &lt;12mo payback)
          </span>
        </div>
      </div>

      <!-- Distribution -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">LTV Distribution (Simulated)</h3>
        <div class="grid grid-cols-5 gap-4 mb-4">
          <div class="text-center p-3 bg-obsidian-800/50 rounded-lg">
            <div class="text-xs text-obsidian-400">P25</div>
            <div class="font-mono text-sm text-obsidian-300">${segments().p25.toFixed(0)}</div>
          </div>
          <div class="text-center p-3 bg-obsidian-800/50 rounded-lg">
            <div class="text-xs text-obsidian-400">Median</div>
            <div class="font-mono text-sm text-obsidian-300">${segments().p50.toFixed(0)}</div>
          </div>
          <div class="text-center p-3 bg-amber-350/20 rounded-lg">
            <div class="text-xs text-amber-350">Mean</div>
            <div class="font-mono text-sm text-amber-350">${segments().avg.toFixed(0)}</div>
          </div>
          <div class="text-center p-3 bg-obsidian-800/50 rounded-lg">
            <div class="text-xs text-obsidian-400">P75</div>
            <div class="font-mono text-sm text-obsidian-300">${segments().p75.toFixed(0)}</div>
          </div>
          <div class="text-center p-3 bg-jade-500/20 rounded-lg">
            <div class="text-xs text-jade-400">P95 (Whales)</div>
            <div class="font-mono text-sm text-jade-400">${segments().p95.toFixed(0)}</div>
          </div>
        </div>
        <p class="text-xs text-obsidian-400">
          LTV is highly skewed. Top 5% (whales) may generate 50%+ of revenue.
        </p>
      </div>
    </div>
  </div>

  <!-- Segmentation -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">👥 LTV Segmentation</h2>
    <div class="grid md:grid-cols-4 gap-4">
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
        <h3 class="text-crimson-400 font-semibold mb-2">Churners</h3>
        <p class="text-sm text-obsidian-300 mb-2">Low LTV, high churn risk</p>
        <ul class="text-xs text-obsidian-400">
          <li>• Minimal investment</li>
          <li>• Let them go gracefully</li>
        </ul>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Casuals</h3>
        <p class="text-sm text-obsidian-300 mb-2">Low LTV, low churn</p>
        <ul class="text-xs text-obsidian-400">
          <li>• Low-touch engagement</li>
          <li>• Upsell opportunities</li>
        </ul>
      </div>
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">Regulars</h3>
        <p class="text-sm text-obsidian-300 mb-2">High LTV, stable</p>
        <ul class="text-xs text-obsidian-400">
          <li>• Retention focus</li>
          <li>• Loyalty rewards</li>
        </ul>
      </div>
      <div class="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h3 class="text-blue-400 font-semibold mb-2">Whales</h3>
        <p class="text-sm text-obsidian-300 mb-2">Highest LTV</p>
        <ul class="text-xs text-obsidian-400">
          <li>• VIP treatment</li>
          <li>• Personal outreach</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># LTV calculations
calculate_ltv &lt;- function(arpu, churn_rate) {'{'} 
  arpu / churn_rate
{'}'}

calculate_dcf_ltv &lt;- function(arpu, churn_rate, discount_rate, months = 60) {'{'} 
  monthly_discount &lt;- discount_rate / 12
  survival_prob &lt;- 1
  pv &lt;- 0
  
  for (m in 1:months) {'{'} 
    survival_prob &lt;- survival_prob * (1 - churn_rate)
    discount_factor &lt;- 1 / (1 + monthly_discount)^m
    pv &lt;- pv + arpu * survival_prob * discount_factor
  {'}'}
  
  return(pv)
{'}'}

# Example
arpu &lt;- {monthlyRevenue.toFixed(2)}
churn &lt;- {monthlyChurnRate / 100}
simple_ltv &lt;- calculate_ltv(arpu, churn)
dcf_ltv &lt;- calculate_dcf_ltv(arpu, churn, {discountRate / 100})

cat(sprintf("Simple LTV: $%.0f, DCF LTV: $%.0f\n", simple_ltv, dcf_ltv))
cat(sprintf("LTV/CAC: %.1fx\n", simple_ltv / {acquisitionCost}))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• LTV = Revenue / Churn Rate (simple)</li>
        <li>• Target 3x+ LTV/CAC ratio</li>
        <li>• DCF accounts for time value of money</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• LTV is highly skewed (whales matter)</li>
        <li>• Segment and treat customers differently</li>
        <li>• Small churn improvements = huge LTV gains</li>
      </ul>
    </div>
  </div>
</div>

