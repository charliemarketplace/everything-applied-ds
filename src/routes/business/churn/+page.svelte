<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // User behavior features
  let daysSinceLastBet = $state(7);
  let betsPerWeek = $state(5);
  let winRate = $state(45);
  let avgBetSize = $state(25);
  let depositsLast30 = $state(2);
  let accountAge = $state(90);

  // Calculate churn probability
  const churnScore = $derived(() => {
    let score = 0;
    
    // Days since last bet (most important)
    if (daysSinceLastBet > 14) score += 40;
    else if (daysSinceLastBet > 7) score += 20;
    else if (daysSinceLastBet > 3) score += 10;
    
    // Activity level
    if (betsPerWeek < 2) score += 20;
    else if (betsPerWeek < 5) score += 10;
    
    // Win rate (losers churn faster)
    if (winRate < 40) score += 15;
    else if (winRate < 45) score += 5;
    else if (winRate > 55) score -= 10; // Winners stay
    
    // Engagement signals
    if (depositsLast30 === 0) score += 15;
    if (accountAge < 30) score += 10; // New users churn more
    
    return Math.min(95, Math.max(5, score));
  });

  // Risk level
  const riskLevel = $derived(() => {
    const score = churnScore();
    if (score >= 60) return { label: 'High Risk', color: 'text-crimson-400', bg: 'bg-crimson-500/20 border-crimson-500/30' };
    if (score >= 30) return { label: 'Medium Risk', color: 'text-amber-350', bg: 'bg-amber-350/20 border-amber-350/30' };
    return { label: 'Low Risk', color: 'text-jade-400', bg: 'bg-jade-500/20 border-jade-500/30' };
  });

  // Simulate user cohort survival
  const survivalCurve = $derived(() => {
    const rng = createRNG(42);
    const weeks = 12;
    const initialUsers = 1000;
    const surviving: number[] = [initialUsers];
    let current = initialUsers;
    
    for (let w = 1; w <= weeks; w++) {
      // Churn rate decreases over time (survivors are stickier)
      const baseChurnRate = 0.15 / Math.sqrt(w);
      const churned = Math.round(current * baseChurnRate);
      current -= churned;
      surviving.push(current);
    }
    
    return surviving;
  });

  const weekLabels = $derived(
    Array.from({ length: 13 }, (_, i) => `W${i}`)
  );

  // Retention rate
  const retentionRate = $derived(() => {
    const curve = survivalCurve();
    return (curve[12] / curve[0] * 100).toFixed(1);
  });

  // Churn drivers
  const churnDrivers = [
    { factor: 'Inactivity (days)', weight: 35, desc: 'Days since last bet' },
    { factor: 'Losing streak', weight: 25, desc: 'Recent win rate below average' },
    { factor: 'Low engagement', weight: 20, desc: 'Bets/week declining' },
    { factor: 'No deposits', weight: 15, desc: 'No deposits in 30 days' },
    { factor: 'New user', weight: 5, desc: 'Account < 30 days old' }
  ];

  // Intervention strategies
  const interventions = [
    { 
      trigger: 'Inactive 5+ days',
      action: 'Push notification with personalized pick',
      expectedLift: '15%'
    },
    { 
      trigger: 'Losing streak (3+ losses)',
      action: 'Free bet or odds boost on next wager',
      expectedLift: '25%'
    },
    { 
      trigger: 'High churn score + high LTV',
      action: 'Personalized outreach / VIP offer',
      expectedLift: '40%'
    },
    { 
      trigger: 'Declining bet frequency',
      action: 'Feature highlight or new market promo',
      expectedLift: '10%'
    }
  ];
</script>

<svelte:head>
  <title>Churn Prediction | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Business Framework</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Churn Prediction</h1>
    <p class="section-subtitle max-w-3xl">
      Identify users likely to leave before they do. Enable proactive retention
      interventions for high-value customers at risk.
    </p>
  </div>

  <!-- Why It Matters -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">💰 Why Churn Matters</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg text-center">
        <div class="font-mono text-3xl text-crimson-400 mb-2">5-25x</div>
        <p class="text-sm text-obsidian-300">
          Cost to acquire new customer vs retain existing
        </p>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg text-center">
        <div class="font-mono text-3xl text-amber-350 mb-2">5%</div>
        <p class="text-sm text-obsidian-300">
          Retention improvement can increase profit by 25-95%
        </p>
      </div>
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
        <div class="font-mono text-3xl text-jade-400 mb-2">60%</div>
        <p class="text-sm text-obsidian-300">
          Of churn can be prevented with timely intervention
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Calculator -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">User Behavior</h3>
        <div class="space-y-4">
          <Slider bind:value={daysSinceLastBet} min={0} max={30} step={1} label="Days Since Last Bet" />
          <Slider bind:value={betsPerWeek} min={0} max={20} step={1} label="Bets Per Week (avg)" />
          <Slider bind:value={winRate} min={30} max={70} step={1} label="Recent Win Rate (%)" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Account Info</h3>
        <div class="space-y-4">
          <Slider bind:value={avgBetSize} min={5} max={200} step={5} label="Avg Bet Size ($)" />
          <Slider bind:value={depositsLast30} min={0} max={10} step={1} label="Deposits (Last 30 Days)" />
          <Slider bind:value={accountAge} min={1} max={365} step={1} label="Account Age (Days)" />
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Churn Score -->
      <div class="glass-card p-6 border {riskLevel().bg}">
        <h3 class="font-display text-lg font-semibold {riskLevel().color} mb-4">📊 Churn Risk Assessment</h3>
        <div class="grid grid-cols-2 gap-6">
          <div class="text-center">
            <div class="font-mono text-5xl {riskLevel().color} mb-2">{churnScore()}%</div>
            <div class="text-sm text-obsidian-400">Churn Probability</div>
          </div>
          <div class="text-center">
            <div class="font-mono text-3xl {riskLevel().color} mb-2">{riskLevel().label}</div>
            <div class="text-sm text-obsidian-400">Risk Classification</div>
          </div>
        </div>
        <div class="mt-6 h-4 bg-obsidian-800 rounded-full overflow-hidden">
          <div 
            class="h-full transition-all duration-300 {churnScore() >= 60 ? 'bg-crimson-500' : churnScore() >= 30 ? 'bg-amber-350' : 'bg-jade-500'}"
            style="width: {churnScore()}%"
          ></div>
        </div>
        <div class="mt-4 grid grid-cols-3 text-center text-xs text-obsidian-400">
          <div class="text-jade-400">Low (0-30%)</div>
          <div class="text-amber-350">Medium (30-60%)</div>
          <div class="text-crimson-400">High (60%+)</div>
        </div>
      </div>

      <!-- Survival Curve -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Cohort Survival Curve</h3>
        <div class="h-48">
          <LineChart 
            labels={weekLabels}
            datasets={[{
              label: 'Surviving Users',
              data: survivalCurve(),
              borderColor: '#34d399',
              fill: true,
              backgroundColor: 'rgba(52, 211, 153, 0.1)'
            }]}
            xAxisLabel="Weeks Since Signup"
            yAxisLabel="Users"
          />
        </div>
        <div class="mt-4 flex justify-between text-sm">
          <span class="text-obsidian-400">Initial: 1,000 users</span>
          <span class="text-jade-400">12-Week Retention: {retentionRate()}%</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Churn Drivers -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔍 Churn Drivers (Feature Importance)</h2>
    <div class="space-y-4">
      {#each churnDrivers as driver}
        <div class="flex items-center gap-4">
          <div class="w-40 text-sm text-obsidian-300">{driver.factor}</div>
          <div class="flex-1 h-6 bg-obsidian-800 rounded-full overflow-hidden">
            <div 
              class="h-full bg-amber-350"
              style="width: {driver.weight}%"
            ></div>
          </div>
          <div class="w-12 font-mono text-sm text-amber-350">{driver.weight}%</div>
          <div class="w-48 text-xs text-obsidian-400">{driver.desc}</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Intervention Strategies -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎯 Intervention Strategies</h2>
    <div class="grid md:grid-cols-2 gap-4">
      {#each interventions as intervention}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-amber-350 font-semibold text-sm">{intervention.trigger}</h3>
            <span class="text-xs px-2 py-0.5 rounded-full bg-jade-500/20 text-jade-400">
              +{intervention.expectedLift} retention
            </span>
          </div>
          <p class="text-xs text-obsidian-300">{intervention.action}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Model Features -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔧 Model Features</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Activity Features</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• Days since last bet</li>
          <li>• Bets per week (rolling)</li>
          <li>• Session frequency</li>
          <li>• Time in app</li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Financial Features</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• Win rate (recent vs lifetime)</li>
          <li>• Deposit frequency</li>
          <li>• Average bet size</li>
          <li>• Withdrawal behavior</li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Engagement Features</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• Feature adoption</li>
          <li>• Notification response</li>
          <li>• Promo usage</li>
          <li>• Support tickets</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Churn prediction model
library(tidymodels)

# Prepare features
churn_data &lt;- users %&gt;%
  mutate(
    days_inactive = as.numeric(Sys.Date() - last_bet_date),
    bets_per_week = total_bets / account_age_weeks,
    recent_win_rate = wins_last_30 / bets_last_30,
    churned = ifelse(days_inactive &gt; 30, 1, 0)
  )

# Train model
churn_model &lt;- logistic_reg() %&gt;%
  set_engine("glm") %&gt;%
  fit(churned ~ days_inactive + bets_per_week + recent_win_rate + 
      deposits_30d + account_age, data = churn_data)

# Score users
predictions &lt;- predict(churn_model, new_users, type = "prob")

# Prioritize interventions
at_risk &lt;- new_users %&gt;%
  bind_cols(predictions) %&gt;%
  filter(.pred_1 &gt; 0.6) %&gt;%
  arrange(desc(ltv * .pred_1))  # Impact = LTV × churn prob</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Inactivity is the #1 churn predictor</li>
        <li>• Losing streaks accelerate churn</li>
        <li>• Intervene BEFORE users leave</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Prioritize by LTV × churn probability</li>
        <li>• Test intervention effectiveness</li>
        <li>• 5% retention improvement = major profit impact</li>
      </ul>
    </div>
  </div>
</div>

