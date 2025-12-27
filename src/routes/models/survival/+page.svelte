<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Survival parameters
  let baseHazard = $state(0.05);
  let treatmentEffect = $state(0.6);
  let censoringRate = $state(20);

  // Generate survival curves
  const survivalCurves = $derived(() => {
    const timePoints = 24; // months
    const controlSurvival: number[] = [];
    const treatmentSurvival: number[] = [];
    
    let sControl = 1.0;
    let sTreatment = 1.0;
    
    for (let t = 0; t <= timePoints; t++) {
      controlSurvival.push(sControl);
      treatmentSurvival.push(sTreatment);
      
      // Exponential survival model
      sControl *= (1 - baseHazard);
      sTreatment *= (1 - baseHazard * treatmentEffect);
    }
    
    return { controlSurvival, treatmentSurvival };
  });

  // Hazard ratio
  const hazardRatio = $derived(treatmentEffect);

  // Median survival time
  const medianSurvival = $derived(() => {
    const control = survivalCurves().controlSurvival;
    const treatment = survivalCurves().treatmentSurvival;
    
    const findMedian = (s: number[]) => {
      const idx = s.findIndex(v => v <= 0.5);
      return idx === -1 ? s.length : idx;
    };
    
    return {
      control: findMedian(control),
      treatment: findMedian(treatment)
    };
  });

  // 12-month survival
  const survival12 = $derived({
    control: (survivalCurves().controlSurvival[12] * 100).toFixed(0),
    treatment: (survivalCurves().treatmentSurvival[12] * 100).toFixed(0)
  });

  const timeLabels = Array.from({ length: 25 }, (_, i) => i.toString());

  // Use cases
  const useCases = [
    { name: 'Churn', desc: 'Time until customer stops betting', metric: 'Retention rate' },
    { name: 'First Deposit', desc: 'Time from signup to first bet', metric: 'Conversion time' },
    { name: 'VIP Upgrade', desc: 'Time until tier promotion', metric: 'Upgrade rate' },
    { name: 'Injury Recovery', desc: 'Time until player returns', metric: 'Games missed' }
  ];
</script>

<svelte:head>
  <title>Survival Analysis | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Statistical Models</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Survival Analysis</h1>
    <p class="section-subtitle max-w-3xl">
      Model time-to-event data. How long until a customer churns? When will an
      injured player return? Handle censored observations properly.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 Key Concepts</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Survival Function S(t)</h3>
        <div class="formula text-sm mb-2">P(T &gt; t)</div>
        <p class="text-xs text-obsidian-400">Probability of surviving past time t</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Hazard Function h(t)</h3>
        <div class="formula text-sm mb-2">P(event at t | survived to t)</div>
        <p class="text-xs text-obsidian-400">Instantaneous risk of event</p>
      </div>
      <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Censoring</h3>
        <p class="text-xs text-obsidian-400">Event hasn't happened yet—but we know they survived at least this long</p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={baseHazard} min={0.01} max={0.15} step={0.01} label="Base Hazard Rate" />
          <Slider bind:value={treatmentEffect} min={0.3} max={1.0} step={0.05} label="Treatment HR" />
          <Slider bind:value={censoringRate} min={0} max={50} step={5} label="Censoring Rate (%)" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Results</h3>
        <div class="space-y-4 text-sm">
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="text-obsidian-300">Hazard Ratio</span>
              <span class="font-mono text-{hazardRatio < 1 ? 'jade-400' : 'crimson-400'}">{hazardRatio.toFixed(2)}</span>
            </div>
            <div class="text-xs text-obsidian-400 mt-1">
              {hazardRatio < 1 ? `${((1 - hazardRatio) * 100).toFixed(0)}% lower risk` : 'Higher risk'}
            </div>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">12-mo Survival (Control)</span>
            <span class="font-mono text-obsidian-200">{survival12.control}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">12-mo Survival (Treatment)</span>
            <span class="font-mono text-jade-400">{survival12.treatment}%</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-obsidian-700">
            <span class="text-obsidian-300">Median (Control)</span>
            <span class="font-mono text-obsidian-200">{medianSurvival().control} mo</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Median (Treatment)</span>
            <span class="font-mono text-jade-400">{medianSurvival().treatment} mo</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Survival Curves -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Kaplan-Meier Survival Curves</h3>
        <div class="h-48">
          <LineChart 
            labels={timeLabels}
            datasets={[
              {
                label: 'Control',
                data: survivalCurves().controlSurvival,
                borderColor: '#ef4444',
                fill: false
              },
              {
                label: 'Treatment',
                data: survivalCurves().treatmentSurvival,
                borderColor: '#34d399',
                fill: false
              }
            ]}
            xAxisLabel="Time (months)"
            yAxisLabel="Survival Probability"
          />
        </div>
        <div class="mt-4 flex gap-4 text-xs">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-crimson-500 rounded-full"></div>
            <span class="text-obsidian-300">Control group (no intervention)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-jade-500 rounded-full"></div>
            <span class="text-obsidian-300">Treatment group (with intervention)</span>
          </div>
        </div>
      </div>

      <!-- Cox Model -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Cox Proportional Hazards</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">The Model</h4>
            <div class="formula text-sm mb-2">h(t|X) = h₀(t) × exp(βX)</div>
            <p class="text-xs text-obsidian-400">Hazard depends on baseline and covariates</p>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">Interpretation</h4>
            <p class="text-xs text-obsidian-300 mb-2">HR = exp(β)</p>
            <ul class="text-xs text-obsidian-400 space-y-1">
              <li>• HR &lt; 1: Treatment reduces risk</li>
              <li>• HR = 1: No effect</li>
              <li>• HR &gt; 1: Treatment increases risk</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Use Cases -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎰 Betting Applications</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each useCases as useCase}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{useCase.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{useCase.desc}</p>
          <p class="text-xs text-jade-400">Metric: {useCase.metric}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Survival analysis
library(survival)
library(survminer)

# Create survival object
surv_obj &lt;- Surv(time = df$time, event = df$churned)

# Kaplan-Meier curves
km_fit &lt;- survfit(surv_obj ~ treatment, data = df)
ggsurvplot(km_fit, data = df, 
           pval = TRUE, 
           risk.table = TRUE)

# Cox proportional hazards model
cox_model &lt;- coxph(surv_obj ~ treatment + age + deposit_amount, data = df)
summary(cox_model)

# Hazard ratios
exp(coef(cox_model))

# Check proportional hazards assumption
cox.zph(cox_model)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Survival analysis models time-to-event</li>
        <li>• Handles censoring (incomplete observation)</li>
        <li>• Kaplan-Meier for curves, Cox for covariates</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Hazard Ratio = relative risk</li>
        <li>• Use for churn, conversion, injury recovery</li>
        <li>• Check proportional hazards assumption</li>
      </ul>
    </div>
  </div>
</div>

