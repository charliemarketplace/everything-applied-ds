<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Experiment parameters
  let controlConversion = $state(5);
  let treatmentLift = $state(10);
  let sampleSizePerGroup = $state(1000);
  let confidenceLevel = $state(95);

  // Calculate treatment conversion
  const treatmentConversion = $derived(controlConversion * (1 + treatmentLift / 100));

  // Calculate statistics
  const controlSuccess = $derived(Math.round(sampleSizePerGroup * controlConversion / 100));
  const treatmentSuccess = $derived(Math.round(sampleSizePerGroup * treatmentConversion / 100));

  // Pooled proportion and standard error
  const pooledP = $derived((controlSuccess + treatmentSuccess) / (2 * sampleSizePerGroup));
  const standardError = $derived(
    Math.sqrt(pooledP * (1 - pooledP) * (2 / sampleSizePerGroup))
  );

  // Z-score and p-value
  const observedDiff = $derived(treatmentConversion / 100 - controlConversion / 100);
  const zScore = $derived(observedDiff / standardError);
  const pValue = $derived(2 * (1 - normalCDF(Math.abs(zScore))));

  // Is significant?
  const alpha = $derived((100 - confidenceLevel) / 100);
  const isSignificant = $derived(pValue < alpha);

  // Required sample size for 80% power
  const requiredSampleSize = $derived(() => {
    const zAlpha = zFromConfidence(confidenceLevel);
    const zBeta = 0.84; // 80% power
    const p1 = controlConversion / 100;
    const p2 = treatmentConversion / 100;
    const delta = Math.abs(p2 - p1);
    const pBar = (p1 + p2) / 2;
    
    if (delta === 0) return Infinity;
    
    const n = (
      Math.pow(zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2)
    ) / Math.pow(delta, 2);
    
    return Math.ceil(n);
  });

  // Helper functions
  function normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);
    
    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return 0.5 * (1 + sign * y);
  }

  function zFromConfidence(conf: number): number {
    const zScores: Record<number, number> = { 90: 1.645, 95: 1.96, 99: 2.576 };
    return zScores[conf] || 1.96;
  }

  // Simulate experiment results over time
  const simulateExperiment = $derived(() => {
    const rng = createRNG(42);
    const days = 30;
    const controlResults: number[] = [];
    const treatmentResults: number[] = [];
    let cumControl = 0;
    let cumTreatment = 0;
    const dailySamples = Math.ceil(sampleSizePerGroup / 30);

    for (let d = 0; d < days; d++) {
      // Simulate daily conversions
      for (let i = 0; i < dailySamples; i++) {
        if (rng() < controlConversion / 100) cumControl++;
        if (rng() < treatmentConversion / 100) cumTreatment++;
      }
      controlResults.push(cumControl / ((d + 1) * dailySamples) * 100);
      treatmentResults.push(cumTreatment / ((d + 1) * dailySamples) * 100);
    }

    return { controlResults, treatmentResults };
  });

  const dayLabels = $derived(
    Array.from({ length: 30 }, (_, i) => `D${i + 1}`)
  );

  // Common A/B test scenarios
  const scenarios = [
    { name: 'Payout Structure', control: '2x multiplier', treatment: '1.9x + bonus', metric: 'Retention' },
    { name: 'Hold Rate', control: '5% hold', treatment: '4% hold', metric: 'Handle Volume' },
    { name: 'UI Design', control: 'Current', treatment: 'New parlay flow', metric: 'Entries/User' },
    { name: 'Promo Type', control: '$10 free bet', treatment: '50% deposit match', metric: 'Deposits' }
  ];
</script>

<svelte:head>
  <title>A/B Testing | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Dynamic Pricing</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">A/B Testing Frameworks</h1>
    <p class="section-subtitle max-w-3xl">
      Design and analyze experiments to test pricing changes, payout structures, 
      and features with statistical rigor.
    </p>
  </div>

  <!-- Key Concepts -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🔬 A/B Testing Fundamentals</h2>
    <div class="grid md:grid-cols-4 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-2xl mb-2">🎯</div>
        <h3 class="text-amber-350 font-semibold text-sm">Hypothesis</h3>
        <p class="text-xs text-obsidian-400 mt-1">Treatment will improve metric by X%</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-2xl mb-2">👥</div>
        <h3 class="text-amber-350 font-semibold text-sm">Randomization</h3>
        <p class="text-xs text-obsidian-400 mt-1">Random assignment to control/treatment</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-2xl mb-2">📊</div>
        <h3 class="text-amber-350 font-semibold text-sm">Sample Size</h3>
        <p class="text-xs text-obsidian-400 mt-1">Enough data for statistical power</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-2xl mb-2">✅</div>
        <h3 class="text-amber-350 font-semibold text-sm">Significance</h3>
        <p class="text-xs text-obsidian-400 mt-1">p-value determines if real effect</p>
      </div>
    </div>
  </div>

  <!-- Interactive Calculator -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Experiment Settings</h3>
        <div class="space-y-4">
          <Slider bind:value={controlConversion} min={1} max={20} step={0.5} label="Control Conversion (%)" />
          <Slider bind:value={treatmentLift} min={-20} max={50} step={1} label="Expected Lift (%)" />
          <Slider bind:value={sampleSizePerGroup} min={100} max={10000} step={100} label="Sample Size per Group" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Confidence Level</h3>
        <div class="grid grid-cols-3 gap-2">
          {#each [90, 95, 99] as level}
            <button
              class="px-3 py-2 rounded-lg text-sm font-mono transition-colors {confidenceLevel === level ? 'bg-amber-350 text-obsidian-900' : 'bg-obsidian-800 text-obsidian-300 hover:bg-obsidian-700'}"
              onclick={() => confidenceLevel = level}
            >
              {level}%
            </button>
          {/each}
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Higher confidence = fewer false positives, but need more samples
        </p>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Required Sample Size</h3>
        <div class="text-center">
          <div class="font-mono text-3xl text-amber-350">
            {requiredSampleSize() === Infinity ? '∞' : requiredSampleSize().toLocaleString()}
          </div>
          <p class="text-xs text-obsidian-400 mt-2">
            Per group for 80% power at {confidenceLevel}% confidence
          </p>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Results -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Experiment Results</h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Control</div>
            <div class="font-mono text-2xl text-obsidian-200">{controlConversion.toFixed(1)}%</div>
            <div class="text-xs text-obsidian-400">{controlSuccess} / {sampleSizePerGroup}</div>
          </div>
          <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Treatment</div>
            <div class="font-mono text-2xl text-jade-400">{treatmentConversion.toFixed(1)}%</div>
            <div class="text-xs text-obsidian-400">{treatmentSuccess} / {sampleSizePerGroup}</div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Observed Lift</div>
            <div class="font-mono text-lg {treatmentLift > 0 ? 'text-jade-400' : 'text-crimson-400'}">
              {treatmentLift > 0 ? '+' : ''}{treatmentLift.toFixed(1)}%
            </div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Z-Score</div>
            <div class="font-mono text-lg text-amber-350">{zScore.toFixed(2)}</div>
          </div>
          <div class="p-4 rounded-lg text-center {isSignificant ? 'bg-jade-500/20 border border-jade-500/30' : 'bg-crimson-500/20 border border-crimson-500/30'}">
            <div class="text-xs text-obsidian-400 mb-1">p-value</div>
            <div class="font-mono text-lg {isSignificant ? 'text-jade-400' : 'text-crimson-400'}">
              {pValue < 0.001 ? '<0.001' : pValue.toFixed(3)}
            </div>
            <div class="text-xs {isSignificant ? 'text-jade-400' : 'text-crimson-400'}">
              {isSignificant ? '✓ Significant' : '✗ Not Significant'}
            </div>
          </div>
        </div>
      </div>

      <!-- Convergence Chart -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Conversion Rate Over Time</h3>
        <div class="h-48">
          <LineChart 
            labels={dayLabels}
            datasets={[
              {
                label: 'Control',
                data: simulateExperiment().controlResults,
                borderColor: '#94a3b8',
                fill: false
              },
              {
                label: 'Treatment',
                data: simulateExperiment().treatmentResults,
                borderColor: '#34d399',
                fill: false
              }
            ]}
            xAxisLabel="Day"
            yAxisLabel="Conversion Rate (%)"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Rates converge as sample size increases. Early reads are noisy!
        </p>
      </div>
    </div>
  </div>

  <!-- Common Experiments -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🧪 Common Pricing Experiments</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each scenarios as scenario}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{scenario.name}</h3>
          <div class="text-xs text-obsidian-400 space-y-1">
            <div><span class="text-obsidian-300">A:</span> {scenario.control}</div>
            <div><span class="text-obsidian-300">B:</span> {scenario.treatment}</div>
            <div class="pt-1 border-t border-obsidian-700">
              <span class="text-jade-400">Metric:</span> {scenario.metric}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Best Practices -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">✅ A/B Testing Best Practices</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Do</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">✓</span>
            <span>Pre-register hypothesis and sample size</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">✓</span>
            <span>Run until predetermined sample reached</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">✓</span>
            <span>Use guardrail metrics (retention, complaints)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">✓</span>
            <span>Segment results (new vs returning users)</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-crimson-400 font-semibold">Don't</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">✗</span>
            <span>Peek at results and stop early if significant</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">✗</span>
            <span>Run multiple tests without correction</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">✗</span>
            <span>Ignore long-term effects (measure for weeks)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">✗</span>
            <span>Test on small segments then assume full rollout same</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># A/B test analysis
ab_test &lt;- function(control_conv, treatment_conv, n_per_group) {'{'} 
  # Proportions
  p1 &lt;- control_conv / n_per_group
  p2 &lt;- treatment_conv / n_per_group
  
  # Pooled proportion and SE
  p_pooled &lt;- (control_conv + treatment_conv) / (2 * n_per_group)
  se &lt;- sqrt(p_pooled * (1 - p_pooled) * 2 / n_per_group)
  
  # Z-test
  z &lt;- (p2 - p1) / se
  p_value &lt;- 2 * (1 - pnorm(abs(z)))
  
  return(list(lift = (p2/p1 - 1) * 100, z = z, p_value = p_value))
{'}'}

# Sample size calculation
required_n &lt;- power.prop.test(
  p1 = {controlConversion / 100},
  p2 = {treatmentConversion / 100},
  power = 0.8,
  sig.level = {alpha}
)$n

# Run test
result &lt;- ab_test({controlSuccess}, {treatmentSuccess}, {sampleSizePerGroup})
cat(sprintf("Lift: %.1f%%\np-value: %.4f\n", result$lift, result$p_value))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Calculate required sample size BEFORE starting</li>
        <li>• Don't peek—wait for full sample</li>
        <li>• p-value &lt; 0.05 = statistically significant</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Small effects need large samples to detect</li>
        <li>• Consider practical significance, not just statistical</li>
        <li>• Use guardrail metrics to catch negative effects</li>
      </ul>
    </div>
  </div>
</div>

