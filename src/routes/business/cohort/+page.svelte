<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG } from '$lib/utils/synthetic-data';

  // Cohort parameters
  let initialCohortSize = $state(1000);
  let month1Retention = $state(70);
  let month2Retention = $state(55);
  let month3Retention = $state(45);
  let monthlyDecay = $state(8);

  // Generate cohort retention
  const generateCohort = $derived((startRetention: number) => {
    const retention = [100];
    let current = startRetention;
    
    for (let m = 1; m <= 12; m++) {
      if (m === 1) retention.push(month1Retention);
      else if (m === 2) retention.push(month2Retention);
      else if (m === 3) retention.push(month3Retention);
      else {
        current = retention[m] * (1 - monthlyDecay / 100);
        retention.push(Math.max(5, current));
      }
    }
    
    return retention;
  });

  // Multiple cohorts for comparison
  const cohorts = $derived(() => {
    const jan = generateCohort(month1Retention);
    const feb = generateCohort(month1Retention * 0.95);
    const mar = generateCohort(month1Retention * 1.05);
    
    return { jan, feb, mar };
  });

  const monthLabels = ['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12'];

  // Calculate LTV by cohort
  const cohortLTV = $derived(() => {
    const avgMonthlyRev = 25;
    const janLTV = cohorts().jan.reduce((sum, r) => sum + r * avgMonthlyRev / 100, 0);
    const febLTV = cohorts().feb.reduce((sum, r) => sum + r * avgMonthlyRev / 100, 0);
    const marLTV = cohorts().mar.reduce((sum, r) => sum + r * avgMonthlyRev / 100, 0);
    
    return { jan: janLTV, feb: febLTV, mar: marLTV };
  });

  // Cohort analysis use cases
  const useCases = [
    { name: 'Retention Curves', desc: 'Track how each signup cohort retains over time' },
    { name: 'A/B Test Impact', desc: 'Compare cohorts with different treatments' },
    { name: 'Seasonality', desc: 'Understand if summer vs winter signups behave differently' },
    { name: 'LTV by Acquisition', desc: 'Which channels bring highest LTV cohorts?' }
  ];
</script>

<svelte:head>
  <title>Cohort Analysis | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Business Framework</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Cohort Analysis</h1>
    <p class="section-subtitle max-w-3xl">
      Group users by signup date and track behavior over time. Essential for
      understanding retention, LTV evolution, and comparing user groups.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 What is Cohort Analysis?</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <p class="text-sm text-obsidian-300 mb-3">
          Group users by when they joined (cohort), then track a metric over time.
          This reveals patterns hidden in aggregate data.
        </p>
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h4 class="text-amber-350 font-semibold mb-2">Why It Matters</h4>
          <ul class="text-xs text-obsidian-400 space-y-1">
            <li>• Aggregate retention can improve while cohort retention worsens (Simpson's paradox)</li>
            <li>• Different cohorts have different behaviors</li>
            <li>• See true product improvements over time</li>
          </ul>
        </div>
      </div>
      <div class="grid grid-cols-4 gap-1 text-xs">
        <div class="p-2 bg-obsidian-800/50 text-obsidian-400">Cohort</div>
        <div class="p-2 bg-obsidian-800/50 text-obsidian-400">M1</div>
        <div class="p-2 bg-obsidian-800/50 text-obsidian-400">M2</div>
        <div class="p-2 bg-obsidian-800/50 text-obsidian-400">M3</div>
        
        <div class="p-2 bg-amber-350/20 text-amber-350">Jan</div>
        <div class="p-2 bg-jade-500/30 text-jade-400">70%</div>
        <div class="p-2 bg-jade-500/20 text-jade-400">55%</div>
        <div class="p-2 bg-jade-500/10 text-jade-400">45%</div>
        
        <div class="p-2 bg-amber-350/20 text-amber-350">Feb</div>
        <div class="p-2 bg-jade-500/25 text-jade-400">65%</div>
        <div class="p-2 bg-jade-500/15 text-jade-400">50%</div>
        <div class="p-2 bg-obsidian-700 text-obsidian-400">-</div>
        
        <div class="p-2 bg-amber-350/20 text-amber-350">Mar</div>
        <div class="p-2 bg-jade-500/35 text-jade-400">75%</div>
        <div class="p-2 bg-obsidian-700 text-obsidian-400">-</div>
        <div class="p-2 bg-obsidian-700 text-obsidian-400">-</div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Retention Settings</h3>
        <div class="space-y-4">
          <Slider bind:value={month1Retention} min={40} max={90} step={5} label="Month 1 Retention (%)" />
          <Slider bind:value={month2Retention} min={30} max={80} step={5} label="Month 2 Retention (%)" />
          <Slider bind:value={month3Retention} min={20} max={70} step={5} label="Month 3 Retention (%)" />
          <Slider bind:value={monthlyDecay} min={2} max={15} step={1} label="Monthly Decay (%)" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Cohort LTV</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">January Cohort</span>
            <span class="font-mono text-lg text-jade-400">${cohortLTV().jan.toFixed(0)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">February Cohort</span>
            <span class="font-mono text-lg text-obsidian-200">${cohortLTV().feb.toFixed(0)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">March Cohort</span>
            <span class="font-mono text-lg text-amber-350">${cohortLTV().mar.toFixed(0)}</span>
          </div>
        </div>
        <p class="text-xs text-obsidian-400 mt-4">
          LTV = Σ (retention × monthly revenue)
        </p>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Retention Curves -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Retention Curves by Cohort</h3>
        <div class="h-56">
          <LineChart 
            labels={monthLabels}
            datasets={[
              {
                label: 'January Cohort',
                data: cohorts().jan,
                borderColor: '#34d399',
                fill: false
              },
              {
                label: 'February Cohort',
                data: cohorts().feb,
                borderColor: '#60a5fa',
                fill: false
              },
              {
                label: 'March Cohort',
                data: cohorts().mar,
                borderColor: '#f5c542',
                fill: false
              }
            ]}
            xAxisLabel="Months Since Signup"
            yAxisLabel="Retention %"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Each line = one cohort's retention journey. Compare cohorts to identify improvements.
        </p>
      </div>

      <!-- Cohort Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Month 3 Retention Comparison</h3>
        <div class="h-40">
          <BarChart 
            labels={['January', 'February', 'March']}
            data={[cohorts().jan[3], cohorts().feb[3], cohorts().mar[3]]}
            color="#f5c542"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Use Cases -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎯 Use Cases</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each useCases as useCase}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{useCase.name}</h3>
          <p class="text-xs text-obsidian-300">{useCase.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Betting Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Sports Betting Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Acquisition Quality</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Compare LTV by acquisition channel</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Identify which campaigns bring quality users</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Track promo impact on future behavior</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Product Improvements</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Did new feature improve retention?</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Compare pre/post cohorts fairly</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Seasonality analysis (NFL season vs off-season)</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Cohort analysis
library(dplyr)
library(tidyr)

create_cohort_table &lt;- function(users, activity) {'{'} 
  users %&gt;%
    mutate(cohort = floor_date(signup_date, "month")) %&gt;%
    left_join(activity, by = "user_id") %&gt;%
    mutate(months_since = interval(cohort, activity_date) %/% months(1)) %&gt;%
    group_by(cohort, months_since) %&gt;%
    summarise(
      active = n_distinct(user_id),
      .groups = "drop"
    ) %&gt;%
    left_join(
      users %&gt;%
        mutate(cohort = floor_date(signup_date, "month")) %&gt;%
        group_by(cohort) %&gt;%
        summarise(cohort_size = n()),
      by = "cohort"
    ) %&gt;%
    mutate(retention = active / cohort_size * 100)
{'}'}

# Calculate cohort LTV
cohort_ltv &lt;- function(retention_curve, avg_monthly_rev) {'{'} 
  sum(retention_curve * avg_monthly_rev / 100)
{'}'}

# Example
retention &lt;- c(100, {month1Retention}, {month2Retention}, {month3Retention})
ltv &lt;- cohort_ltv(retention, 25)
cat(sprintf("Cohort LTV: $%.0f\n", ltv))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Group users by signup period (cohort)</li>
        <li>• Track metrics over time for each cohort</li>
        <li>• Reveals patterns hidden in aggregate data</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Compare cohorts to measure improvement</li>
        <li>• Essential for LTV and retention analysis</li>
        <li>• Identify acquisition channel quality</li>
      </ul>
    </div>
  </div>
</div>

