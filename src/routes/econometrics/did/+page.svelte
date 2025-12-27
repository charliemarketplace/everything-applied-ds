<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // DiD parameters
  let treatmentEffect = $state(15);
  let baselineLevel = $state(50);
  let timeEffect = $state(5);
  let groupDifference = $state(10);

  // Generate synthetic data
  const generateData = $derived(() => {
    const rng = createRNG(42);
    const periods = 10;
    const treatmentPeriod = 5;
    
    const control: number[] = [];
    const treatment: number[] = [];
    
    for (let t = 0; t < periods; t++) {
      const baseControl = baselineLevel + timeEffect * t + normalRandom(rng, 0, 3);
      const baseTreatment = baselineLevel + groupDifference + timeEffect * t + normalRandom(rng, 0, 3);
      
      control.push(baseControl);
      
      if (t >= treatmentPeriod) {
        treatment.push(baseTreatment + treatmentEffect);
      } else {
        treatment.push(baseTreatment);
      }
    }
    
    return { control, treatment };
  });

  const periodLabels = $derived(
    Array.from({ length: 10 }, (_, i) => `T${i}`)
  );

  // Calculate DiD estimate
  const didEstimate = $derived(() => {
    const data = generateData();
    
    // Pre-treatment averages (T0-T4)
    const controlPre = data.control.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    const treatmentPre = data.treatment.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
    
    // Post-treatment averages (T5-T9)
    const controlPost = data.control.slice(5).reduce((a, b) => a + b, 0) / 5;
    const treatmentPost = data.treatment.slice(5).reduce((a, b) => a + b, 0) / 5;
    
    // DiD = (Treatment Post - Treatment Pre) - (Control Post - Control Pre)
    const treatmentChange = treatmentPost - treatmentPre;
    const controlChange = controlPost - controlPre;
    const did = treatmentChange - controlChange;
    
    return { controlPre, controlPost, treatmentPre, treatmentPost, 
             treatmentChange, controlChange, did };
  });

  // Assumptions
  const assumptions = [
    { name: 'Parallel Trends', desc: 'Without treatment, groups would have followed same trajectory', critical: true },
    { name: 'No Spillovers', desc: 'Treatment doesn\'t affect control group', critical: true },
    { name: 'Stable Composition', desc: 'Group membership doesn\'t change due to treatment', critical: false },
    { name: 'No Anticipation', desc: 'Behavior doesn\'t change before treatment', critical: false }
  ];
</script>

<svelte:head>
  <title>Difference-in-Differences | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Econometrics</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Difference-in-Differences</h1>
    <p class="section-subtitle max-w-3xl">
      Estimate causal treatment effects by comparing changes over time between 
      treatment and control groups. The gold standard for policy evaluation.
    </p>
  </div>

  <!-- Core Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The DiD Framework</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <div class="formula text-lg mb-4">
          DiD = (Y_T,post - Y_T,pre) - (Y_C,post - Y_C,pre)
        </div>
        <p class="text-sm text-obsidian-300 mb-3">
          Compare the change in treatment group to the change in control group.
          The difference removes time trends affecting both.
        </p>
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <p class="text-xs text-obsidian-400">
            <strong class="text-amber-350">Key Insight:</strong> If both groups would have changed equally without treatment,
            any extra change in treatment group = causal effect.
          </p>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-obsidian-700">
              <th class="p-2 text-left text-obsidian-400"></th>
              <th class="p-2 text-center text-obsidian-400">Pre</th>
              <th class="p-2 text-center text-obsidian-400">Post</th>
              <th class="p-2 text-center text-amber-350">Change</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-obsidian-800">
              <td class="p-2 text-jade-400">Treatment</td>
              <td class="p-2 text-center font-mono">{didEstimate().treatmentPre.toFixed(1)}</td>
              <td class="p-2 text-center font-mono">{didEstimate().treatmentPost.toFixed(1)}</td>
              <td class="p-2 text-center font-mono text-jade-400">+{didEstimate().treatmentChange.toFixed(1)}</td>
            </tr>
            <tr class="border-b border-obsidian-800">
              <td class="p-2 text-crimson-400">Control</td>
              <td class="p-2 text-center font-mono">{didEstimate().controlPre.toFixed(1)}</td>
              <td class="p-2 text-center font-mono">{didEstimate().controlPost.toFixed(1)}</td>
              <td class="p-2 text-center font-mono text-crimson-400">+{didEstimate().controlChange.toFixed(1)}</td>
            </tr>
            <tr>
              <td class="p-2 text-amber-350 font-semibold">DiD</td>
              <td class="p-2"></td>
              <td class="p-2"></td>
              <td class="p-2 text-center font-mono text-xl text-amber-350">{didEstimate().did.toFixed(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={treatmentEffect} min={-20} max={30} step={1} label="True Treatment Effect" />
          <Slider bind:value={baselineLevel} min={30} max={70} step={5} label="Baseline Level" />
          <Slider bind:value={timeEffect} min={0} max={10} step={1} label="Time Trend (per period)" />
          <Slider bind:value={groupDifference} min={0} max={20} step={2} label="Pre-existing Group Diff" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Estimates</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">True Effect</span>
            <span class="font-mono text-lg text-obsidian-200">{treatmentEffect}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">DiD Estimate</span>
            <span class="font-mono text-lg text-amber-350">{didEstimate().did.toFixed(1)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Estimation Error</span>
            <span class="font-mono text-sm {Math.abs(didEstimate().did - treatmentEffect) < 3 ? 'text-jade-400' : 'text-crimson-400'}">
              {(didEstimate().did - treatmentEffect).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Visualization -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Treatment vs Control Over Time</h3>
        <div class="h-56">
          <LineChart 
            labels={periodLabels}
            datasets={[
              {
                label: 'Treatment',
                data: generateData().treatment,
                borderColor: '#34d399',
                fill: false
              },
              {
                label: 'Control',
                data: generateData().control,
                borderColor: '#dc2626',
                fill: false
              },
              {
                label: 'Counterfactual (Treatment w/o effect)',
                data: generateData().control.map((c, i) => c + groupDifference),
                borderColor: '#94a3b8',
                fill: false,
                borderDash: [5, 5]
              }
            ]}
            xAxisLabel="Time Period (Treatment at T5)"
            yAxisLabel="Outcome"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Vertical gap after T5 between green line and dashed gray = treatment effect.
          DiD estimates this by comparing changes.
        </p>
      </div>

      <!-- Parallel Trends -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">The Parallel Trends Assumption</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
            <h4 class="text-jade-400 font-semibold mb-2">✓ Valid DiD</h4>
            <p class="text-xs text-obsidian-300">
              Pre-treatment trends are parallel. Any difference post-treatment
              is attributable to the intervention.
            </p>
          </div>
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
            <h4 class="text-crimson-400 font-semibold mb-2">✗ Invalid DiD</h4>
            <p class="text-xs text-obsidian-300">
              Pre-treatment trends diverge. Groups were already on different
              trajectories—DiD estimate is biased.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Assumptions -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">⚠️ Key Assumptions</h2>
    <div class="grid md:grid-cols-2 gap-4">
      {#each assumptions as assumption}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-amber-350 font-semibold">{assumption.name}</h3>
            {#if assumption.critical}
              <span class="text-xs px-2 py-0.5 rounded-full bg-crimson-500/20 text-crimson-400">Critical</span>
            {/if}
          </div>
          <p class="text-xs text-obsidian-300">{assumption.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Pricing Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💰 Pricing Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">What to Test</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>New pricing tier impact (launch in one region first)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Promotional campaign effectiveness</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Feature launch impact on engagement</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Regulatory change effects</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">When to Use DiD vs A/B</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">DiD:</span>
            <span>Can't randomize, observational data, policy changes</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-amber-350">A/B:</span>
            <span>Can randomize, want cleanest causal estimate</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Difference-in-Differences regression
library(fixest)

# Prepare data
panel_data &lt;- data.frame(
  id = rep(1:n_units, each = n_periods),
  time = rep(1:n_periods, n_units),
  treated = rep(c(0, 1), each = n_units/2 * n_periods),
  post = as.numeric(time &gt; treatment_period),
  outcome = y
)

# DiD regression with fixed effects
did_model &lt;- feols(outcome ~ treated * post | id + time, 
                   data = panel_data)

# The coefficient on 'treated:post' is the DiD estimate
summary(did_model)

# Event study (test parallel trends)
event_study &lt;- feols(outcome ~ i(time, treated, ref = treatment_period) | id + time,
                     data = panel_data)
iplot(event_study)  # Should be flat pre-treatment</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• DiD estimates causal effects from observational data</li>
        <li>• Parallel trends assumption is critical</li>
        <li>• Compare CHANGES, not levels</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Use when randomization isn't possible</li>
        <li>• Validate with pre-treatment trend tests</li>
        <li>• Works for policy/feature rollouts</li>
      </ul>
    </div>
  </div>
</div>

