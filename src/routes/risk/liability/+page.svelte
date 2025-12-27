<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Book exposure
  let totalHandle = $state(100000);
  let homeTeamBets = $state(55);
  let avgBetSize = $state(100);
  let maxSingleBet = $state(5000);

  // Calculate exposure
  const awayTeamBets = $derived(100 - homeTeamBets);
  const homeExposure = $derived(totalHandle * homeTeamBets / 100);
  const awayExposure = $derived(totalHandle * awayTeamBets / 100);
  const imbalance = $derived(Math.abs(homeExposure - awayExposure));

  // Outcome scenarios
  const scenarios = $derived(() => {
    const vig = 0.0476; // ~-110 both sides
    const homeWinPayout = homeExposure * (1 + 1/1.1);
    const awayWinPayout = awayExposure * (1 + 1/1.1);
    
    return {
      homeWins: {
        payOut: homeWinPayout,
        keepFrom: awayExposure,
        net: awayExposure - homeWinPayout + homeExposure
      },
      awayWins: {
        payOut: awayWinPayout,
        keepFrom: homeExposure,
        net: homeExposure - awayWinPayout + awayExposure
      },
      balanced: {
        homeNet: (totalHandle * vig / 2),
        awayNet: (totalHandle * vig / 2),
        total: totalHandle * vig
      }
    };
  });

  // Worst case
  const worstCase = $derived(() => {
    if (homeTeamBets > 50) {
      return { outcome: 'Home Wins', loss: scenarios().homeWins.net, exposure: homeExposure };
    }
    return { outcome: 'Away Wins', loss: scenarios().awayWins.net, exposure: awayExposure };
  });

  // Liability management strategies
  const strategies = [
    { name: 'Line Movement', desc: 'Move line to attract bets on other side', when: 'Imbalance > 10%' },
    { name: 'Limit Reduction', desc: 'Lower max bet on overloaded side', when: 'Sharp action detected' },
    { name: 'Hedge', desc: 'Bet at another book to offset exposure', when: 'Large single bet' },
    { name: 'Lay Off', desc: 'Syndicate with other books', when: 'Extreme imbalance' }
  ];
</script>

<svelte:head>
  <title>Liability Management | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Risk Management</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Liability Management</h1>
    <p class="section-subtitle max-w-3xl">
      Balance the book to minimize outcome variance. Move lines, adjust limits,
      and hedge to control maximum loss scenarios.
    </p>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Book Parameters</h3>
        <div class="space-y-4">
          <Slider bind:value={totalHandle} min={10000} max={500000} step={10000} label="Total Handle ($)" />
          <Slider bind:value={homeTeamBets} min={30} max={70} step={1} label="% on Home Team" />
          <Slider bind:value={maxSingleBet} min={500} max={25000} step={500} label="Max Single Bet ($)" />
        </div>
      </div>

      <div class="glass-card p-6 border-{imbalance > totalHandle * 0.1 ? 'crimson-500' : 'jade-500'}/30">
        <h3 class="font-display text-lg font-semibold {imbalance > totalHandle * 0.1 ? 'text-crimson-400' : 'text-jade-400'} mb-4">
          📊 Book Balance
        </h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Home Exposure</span>
            <span class="font-mono text-obsidian-200">${(homeExposure / 1000).toFixed(1)}K</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Away Exposure</span>
            <span class="font-mono text-obsidian-200">${(awayExposure / 1000).toFixed(1)}K</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-obsidian-700">
            <span class="text-obsidian-300">Imbalance</span>
            <span class="font-mono {imbalance > totalHandle * 0.1 ? 'text-crimson-400' : 'text-jade-400'}">
              ${(imbalance / 1000).toFixed(1)}K ({(imbalance / totalHandle * 100).toFixed(0)}%)
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Exposure Visualization -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Exposure Distribution</h3>
        <div class="h-40">
          <BarChart 
            labels={['Home Team', 'Away Team']}
            data={[homeExposure / 1000, awayExposure / 1000]}
            color="#f5c542"
          />
        </div>
        <div class="mt-4 h-4 bg-obsidian-800 rounded-full overflow-hidden flex">
          <div class="h-full bg-jade-500" style="width: {homeTeamBets}%"></div>
          <div class="h-full bg-crimson-500" style="width: {awayTeamBets}%"></div>
        </div>
        <div class="flex justify-between text-xs text-obsidian-400 mt-1">
          <span>Home: {homeTeamBets}%</span>
          <span>Away: {awayTeamBets}%</span>
        </div>
      </div>

      <!-- Outcome Scenarios -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Outcome Scenarios</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">If Home Wins</h4>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-obsidian-400">Pay out:</span>
                <span class="font-mono text-crimson-400">-${(scenarios().homeWins.payOut / 1000).toFixed(1)}K</span>
              </div>
              <div class="flex justify-between">
                <span class="text-obsidian-400">Keep:</span>
                <span class="font-mono text-jade-400">+${(scenarios().homeWins.keepFrom / 1000).toFixed(1)}K</span>
              </div>
            </div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <h4 class="text-amber-350 font-semibold mb-2">If Away Wins</h4>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between">
                <span class="text-obsidian-400">Pay out:</span>
                <span class="font-mono text-crimson-400">-${(scenarios().awayWins.payOut / 1000).toFixed(1)}K</span>
              </div>
              <div class="flex justify-between">
                <span class="text-obsidian-400">Keep:</span>
                <span class="font-mono text-jade-400">+${(scenarios().awayWins.keepFrom / 1000).toFixed(1)}K</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 p-4 bg-{worstCase().loss < 0 ? 'crimson-500' : 'jade-500'}/10 border border-{worstCase().loss < 0 ? 'crimson-500' : 'jade-500'}/30 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Worst Case ({worstCase().outcome})</span>
            <span class="font-mono text-xl {worstCase().loss < 0 ? 'text-crimson-400' : 'text-jade-400'}">
              {worstCase().loss >= 0 ? '+' : ''}${(worstCase().loss / 1000).toFixed(1)}K
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Management Strategies -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎯 Management Strategies</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each strategies as strategy}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{strategy.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{strategy.desc}</p>
          <p class="text-xs text-jade-400">When: {strategy.when}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Liability management
calculate_exposure &lt;- function(handle, home_pct, vig = 0.0476) {'{'} 
  home_exp &lt;- handle * home_pct / 100
  away_exp &lt;- handle * (100 - home_pct) / 100
  imbalance &lt;- abs(home_exp - away_exp)
  
  list(
    home = home_exp, away = away_exp,
    imbalance = imbalance,
    imbalance_pct = imbalance / handle * 100,
    expected_profit = handle * vig
  )
{'}'}

# Line movement to balance
suggest_line_move &lt;- function(exposure, target_balance = 0.5) {'{'} 
  current_pct &lt;- exposure$home / (exposure$home + exposure$away)
  needed_shift &lt;- target_balance - current_pct
  # Roughly 0.5pt move = 2-3% shift
  pts_to_move &lt;- needed_shift / 0.025
  return(pts_to_move)
{'}'}

exp &lt;- calculate_exposure({totalHandle}, {homeTeamBets})
cat(sprintf("Imbalance: %.1f%%\n", exp$imbalance_pct))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Balanced book = guaranteed profit (the vig)</li>
        <li>• Imbalanced book = variance exposure</li>
        <li>• Move lines to attract opposite side</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Large single bets create concentration risk</li>
        <li>• Hedge or lay off extreme exposures</li>
        <li>• Real-time monitoring is essential</li>
      </ul>
    </div>
  </div>
</div>

