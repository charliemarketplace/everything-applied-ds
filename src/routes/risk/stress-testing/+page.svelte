<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Portfolio settings
  let totalExposure = $state(500000);
  let averageHold = $state(8);

  // Scenario settings
  let upsetRate = $state(20);
  let correlatedLosses = $state(40);
  let sharpAttack = $state(25);

  // Scenarios
  const scenarios = $derived(() => [
    {
      name: 'Base Case',
      description: 'Normal operation',
      lossRate: averageHold,
      exposure: totalExposure,
      loss: totalExposure * (averageHold / 100),
      severity: 'normal'
    },
    {
      name: 'Upset Heavy Slate',
      description: 'Multiple favorites lose across all games',
      lossRate: averageHold - upsetRate,
      exposure: totalExposure,
      loss: totalExposure * ((averageHold - upsetRate) / 100),
      severity: 'moderate'
    },
    {
      name: 'Correlated Losses',
      description: 'Same-game parlays all hit (QB + WR stacks)',
      lossRate: averageHold - correlatedLosses,
      exposure: totalExposure * 0.6, // SGP exposure
      loss: totalExposure * 0.6 * ((averageHold - correlatedLosses) / 100),
      severity: 'severe'
    },
    {
      name: 'Sharp Syndicate Attack',
      description: 'Coordinated sharp money exploits mispriced lines',
      lossRate: averageHold - sharpAttack,
      exposure: totalExposure * 0.3,
      loss: totalExposure * 0.3 * ((averageHold - sharpAttack) / 100),
      severity: 'severe'
    },
    {
      name: 'Black Swan Event',
      description: 'Star player injury mid-game, mass cancelations',
      lossRate: averageHold - 50,
      exposure: totalExposure * 0.2,
      loss: totalExposure * 0.2 * ((averageHold - 50) / 100),
      severity: 'catastrophic'
    },
    {
      name: 'Maximum Adversarial',
      description: 'Perfect storm: upsets + correlations + sharps',
      lossRate: averageHold - 60,
      exposure: totalExposure,
      loss: totalExposure * ((averageHold - 60) / 100),
      severity: 'catastrophic'
    }
  ]);

  // Aggregate results
  const worstCase = $derived(
    Math.min(...scenarios().map(s => s.loss))
  );

  const expectedLoss = $derived(
    scenarios()[0].loss
  );

  // Historical simulation
  const historicalSim = $derived(() => {
    const rng = createRNG(42);
    const days = 90;
    const results: number[] = [];
    let cumulative = 0;

    for (let d = 0; d < days; d++) {
      // Random daily outcome with occasional stress events
      const isStressDay = rng() < 0.05; // 5% chance of stress event
      const dailyReturn = isStressDay 
        ? normalRandom(rng, -totalExposure * 0.15, totalExposure * 0.05)
        : normalRandom(rng, totalExposure * (averageHold / 100) / 30, totalExposure * 0.02);
      
      cumulative += dailyReturn;
      results.push(cumulative);
    }

    return results;
  });

  const historyLabels = $derived(
    Array.from({ length: 90 }, (_, i) => `D${i + 1}`)
  );

  // Severity colors
  function getSeverityColor(severity: string): string {
    switch (severity) {
      case 'normal': return 'text-jade-400';
      case 'moderate': return 'text-amber-350';
      case 'severe': return 'text-orange-400';
      case 'catastrophic': return 'text-crimson-400';
      default: return 'text-obsidian-300';
    }
  }

  function getSeverityBg(severity: string): string {
    switch (severity) {
      case 'normal': return 'bg-jade-500/10 border-jade-500/30';
      case 'moderate': return 'bg-amber-350/10 border-amber-350/30';
      case 'severe': return 'bg-orange-500/10 border-orange-500/30';
      case 'catastrophic': return 'bg-crimson-500/10 border-crimson-500/30';
      default: return 'bg-obsidian-800/50 border-obsidian-700';
    }
  }
</script>

<svelte:head>
  <title>Stress Testing | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Risk Management</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Stress Testing</h1>
    <p class="section-subtitle max-w-3xl">
      Model worst-case scenarios and extreme events. Essential for business continuity, 
      reserve planning, and understanding tail risks.
    </p>
  </div>

  <!-- Key Questions -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">💪 Stress Testing Questions</h2>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <div class="text-2xl mb-2">🏈</div>
        <h3 class="text-amber-350 font-semibold">Event Risk</h3>
        <p class="text-sm text-obsidian-300 mt-2">
          "What if every NFL favorite loses this Sunday?"
        </p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <div class="text-2xl mb-2">🎯</div>
        <h3 class="text-amber-350 font-semibold">Sharp Attack</h3>
        <p class="text-sm text-obsidian-300 mt-2">
          "What if a syndicate targets our mispriced lines?"
        </p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <div class="text-2xl mb-2">🔗</div>
        <h3 class="text-amber-350 font-semibold">Correlation</h3>
        <p class="text-sm text-obsidian-300 mt-2">
          "What if all same-game parlays hit simultaneously?"
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Scenario Builder -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Portfolio Settings</h3>
        <div class="space-y-4">
          <Slider 
            bind:value={totalExposure} 
            min={100000} 
            max={2000000} 
            step={50000} 
            label="Total Daily Exposure ($)" 
          />
          <Slider 
            bind:value={averageHold} 
            min={2} 
            max={15} 
            step={0.5} 
            label="Average Hold Rate (%)" 
          />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Scenario Parameters</h3>
        <div class="space-y-4">
          <Slider 
            bind:value={upsetRate} 
            min={5} 
            max={40} 
            step={5} 
            label="Upset Impact (%)" 
          />
          <Slider 
            bind:value={correlatedLosses} 
            min={10} 
            max={60} 
            step={5} 
            label="Correlation Impact (%)" 
          />
          <Slider 
            bind:value={sharpAttack} 
            min={10} 
            max={50} 
            step={5} 
            label="Sharp Attack Impact (%)" 
          />
        </div>
      </div>

      <div class="glass-card p-6 border-crimson-500/30">
        <h3 class="font-display text-lg font-semibold text-crimson-400 mb-4">⚠️ Summary</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Expected Daily P&L</span>
            <span class="font-mono text-lg text-jade-400">
              +${expectedLoss.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Worst Case Loss</span>
            <span class="font-mono text-lg text-crimson-400">
              ${worstCase.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Loss Multiple</span>
            <span class="font-mono text-lg text-amber-350">
              {Math.abs(worstCase / expectedLoss).toFixed(1)}x expected
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Scenario Table -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Scenario Analysis</h3>
        <div class="space-y-3">
          {#each scenarios() as scenario}
            <div class="p-4 rounded-lg border {getSeverityBg(scenario.severity)}">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-semibold {getSeverityColor(scenario.severity)}">{scenario.name}</h4>
                  <p class="text-xs text-obsidian-400 mt-1">{scenario.description}</p>
                </div>
                <div class="text-right">
                  <div class="font-mono text-lg {scenario.loss >= 0 ? 'text-jade-400' : 'text-crimson-400'}">
                    {scenario.loss >= 0 ? '+' : ''}${scenario.loss.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </div>
                  <div class="text-xs text-obsidian-400">
                    {scenario.lossRate >= 0 ? '+' : ''}{scenario.lossRate.toFixed(1)}% margin
                  </div>
                </div>
              </div>
              <!-- Visual bar -->
              <div class="mt-3 h-2 bg-obsidian-800 rounded-full overflow-hidden">
                <div 
                  class="h-full transition-all {scenario.loss >= 0 ? 'bg-jade-500' : 'bg-crimson-500'}"
                  style="width: {Math.min(100, Math.abs(scenario.loss / totalExposure) * 100 * 5)}%"
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Historical Simulation -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">90-Day P&L Simulation with Stress Events</h3>
        <div class="h-56">
          <LineChart 
            labels={historyLabels}
            datasets={[{
              label: 'Cumulative P&L',
              data: historicalSim(),
              borderColor: historicalSim()[89] >= 0 ? '#34d399' : '#dc2626',
              fill: true,
              backgroundColor: historicalSim()[89] >= 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(220, 38, 38, 0.1)'
            }]}
            xAxisLabel="Day"
            yAxisLabel="Cumulative P&L ($)"
          />
        </div>
        <p class="mt-4 text-xs text-obsidian-400">
          Simulation includes 5% daily probability of stress event. Stress days show significant drawdowns.
        </p>
      </div>
    </div>
  </div>

  <!-- Mitigation Strategies -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🛡️ Risk Mitigation Strategies</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Exposure Limits</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Cap single-event exposure (e.g., 5% of daily)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Limit correlated parlay combinations</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Set per-player prop maximums</span>
          </li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Dynamic Adjustments</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Move lines to balance exposure</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Reduce payouts on heavy action</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Suspend betting on suspicious patterns</span>
          </li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Reserve Management</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Maintain cash reserves = 2-3x worst case</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Reinsurance for catastrophic events</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Circuit breakers for extreme losses</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Framework -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📋 Stress Testing Framework</h2>
    <div class="grid md:grid-cols-4 gap-4">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="w-8 h-8 rounded-full bg-amber-350 text-obsidian-900 flex items-center justify-center font-bold mx-auto mb-2">1</div>
        <h3 class="text-amber-350 font-semibold text-sm">Identify Risks</h3>
        <p class="text-xs text-obsidian-400 mt-1">Brainstorm worst cases</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="w-8 h-8 rounded-full bg-amber-350 text-obsidian-900 flex items-center justify-center font-bold mx-auto mb-2">2</div>
        <h3 class="text-amber-350 font-semibold text-sm">Quantify Impact</h3>
        <p class="text-xs text-obsidian-400 mt-1">Calculate $ exposure</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="w-8 h-8 rounded-full bg-amber-350 text-obsidian-900 flex items-center justify-center font-bold mx-auto mb-2">3</div>
        <h3 class="text-amber-350 font-semibold text-sm">Probability</h3>
        <p class="text-xs text-obsidian-400 mt-1">Estimate likelihood</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="w-8 h-8 rounded-full bg-amber-350 text-obsidian-900 flex items-center justify-center font-bold mx-auto mb-2">4</div>
        <h3 class="text-amber-350 font-semibold text-sm">Mitigate</h3>
        <p class="text-xs text-obsidian-400 mt-1">Implement controls</p>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Stress testing framework
run_stress_test &lt;- function(portfolio, scenarios) {'{'} 
  results &lt;- lapply(scenarios, function(scenario) {'{'} 
    # Apply scenario to portfolio
    stressed_pnl &lt;- portfolio$exposure * (portfolio$hold_rate - scenario$shock) / 100
    
    list(
      scenario = scenario$name,
      pnl = stressed_pnl,
      loss_multiple = stressed_pnl / portfolio$expected_pnl
    )
  {'}'})
  
  return(do.call(rbind, lapply(results, as.data.frame)))
{'}'}

# Define scenarios
scenarios &lt;- list(
  list(name = "Base Case", shock = 0),
  list(name = "Upset Heavy", shock = {upsetRate}),
  list(name = "Correlated Losses", shock = {correlatedLosses}),
  list(name = "Sharp Attack", shock = {sharpAttack}),
  list(name = "Black Swan", shock = 50)
)

# Run analysis
portfolio &lt;- list(exposure = {totalExposure}, hold_rate = {averageHold}, 
                  expected_pnl = {totalExposure} * {averageHold} / 100)

stress_results &lt;- run_stress_test(portfolio, scenarios)
print(stress_results)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Stress tests answer "what if worst case happens?"</li>
        <li>• Model correlation—independent bets rarely all lose</li>
        <li>• Reserve = 2-3x worst case scenario loss</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Combine historical and hypothetical scenarios</li>
        <li>• Update scenarios as business evolves</li>
        <li>• Test mitigations before crisis hits</li>
      </ul>
    </div>
  </div>
</div>

