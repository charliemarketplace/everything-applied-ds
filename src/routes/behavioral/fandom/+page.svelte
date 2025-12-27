<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Team popularity and betting flow
  let lakers = $state(true);
  let cowboys = $state(true);
  let patriots = $state(false);
  let yankees = $state(true);

  // Bias parameters
  let homeFieldBias = $state(3);
  let popularityBias = $state(5);
  let recencyBias = $state(2);

  // True line (fair line)
  let trueLine = $state(-3);

  // Market line (adjusted for public bias)
  const marketLine = $derived(() => {
    let adjustment = 0;
    
    // Popular team penalty
    if (lakers || cowboys) adjustment -= popularityBias * 0.4;
    if (yankees) adjustment -= popularityBias * 0.3;
    
    // Home field gets shaded
    adjustment -= homeFieldBias * 0.5;
    
    return trueLine - adjustment;
  });

  // Calculate edge
  const edge = $derived(marketLine() - trueLine);

  // Simulate betting patterns
  const bettingFlow = $derived(() => {
    const rng = createRNG(42);
    const publicBets = 65 + (lakers ? 10 : 0) + (cowboys ? 8 : 0) + (yankees ? 5 : 0);
    const publicMoney = 60 + (lakers ? 5 : 0) + (cowboys ? 5 : 0);
    
    return {
      publicBets: Math.min(85, publicBets),
      publicMoney: Math.min(75, publicMoney),
      sharpMoney: 100 - Math.min(75, publicMoney)
    };
  });

  // Popular team biases
  const teamBiases = [
    { team: 'Dallas Cowboys', sport: 'NFL', bias: 'America\'s Team, massive public action' },
    { team: 'LA Lakers', sport: 'NBA', bias: 'Largest fanbase, national TV favorites' },
    { team: 'NY Yankees', sport: 'MLB', bias: 'Historic brand, heavy public betting' },
    { team: 'Notre Dame', sport: 'CFB', bias: 'National following, inflated lines' },
    { team: 'Ohio State', sport: 'CFB', bias: 'Huge alumni base, public favorite' },
    { team: 'Manchester United', sport: 'Soccer', bias: 'Global fanbase, retail favorite' }
  ];
</script>

<svelte:head>
  <title>Home/Fandom Bias | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Behavioral Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Home & Fandom Bias</h1>
    <p class="section-subtitle max-w-3xl">
      Public bettors overbet popular teams and home favorites. Identify mispriced
      lines created by emotional betting patterns.
    </p>
  </div>

  <!-- The Bias -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🏠 The Bias Pattern</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">Home Field Bias</h3>
        <p class="text-sm text-obsidian-300 mb-3">
          Public overvalues home field advantage by 1-3 points on average.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Actual HFA: ~2.5 pts (NFL), ~3 pts (NBA)</li>
          <li>• Public perception: often 4-5 pts</li>
          <li>• Creates fade opportunity on road teams</li>
        </ul>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Fandom Bias</h3>
        <p class="text-sm text-obsidian-300 mb-3">
          Popular/national TV teams attract disproportionate betting action.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Cowboys, Lakers get 60-70% of public bets</li>
          <li>• Lines shade 1-2 points against them</li>
          <li>• Contrarian value on small market teams</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Scenario Setup</h3>
        <div class="space-y-4">
          <div class="p-3 bg-obsidian-800/50 rounded-lg">
            <p class="text-xs text-obsidian-400 mb-2">Select popular teams playing:</p>
            <div class="space-y-2">
              <Toggle bind:checked={lakers} label="Lakers (home)" />
              <Toggle bind:checked={cowboys} label="Cowboys (home)" />
              <Toggle bind:checked={yankees} label="Yankees (home)" />
            </div>
          </div>
          <Slider bind:value={trueLine} min={-10} max={10} step={0.5} label="True Fair Line" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Bias Strength</h3>
        <div class="space-y-4">
          <Slider bind:value={homeFieldBias} min={0} max={5} step={0.5} label="Home Field Overvalue" />
          <Slider bind:value={popularityBias} min={0} max={8} step={0.5} label="Popularity Overvalue" />
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Line Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Line Movement</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">True Fair Line</div>
            <div class="font-mono text-3xl text-obsidian-200">{trueLine > 0 ? '+' : ''}{trueLine}</div>
            <div class="text-xs text-obsidian-400">No bias</div>
          </div>
          <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
            <div class="text-xs text-amber-350 mb-1">Market Line</div>
            <div class="font-mono text-3xl text-amber-350">{marketLine() > 0 ? '+' : ''}{marketLine().toFixed(1)}</div>
            <div class="text-xs text-obsidian-400">With public bias</div>
          </div>
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-jade-400 mb-1">Edge Available</div>
            <div class="font-mono text-3xl {edge > 0 ? 'text-jade-400' : 'text-crimson-400'}">{edge > 0 ? '+' : ''}{edge.toFixed(1)}</div>
            <div class="text-xs text-obsidian-400">{edge > 0 ? 'Fade popular team' : 'Take popular team'}</div>
          </div>
        </div>
      </div>

      <!-- Betting Flow -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Betting Action Distribution</h3>
        <div class="space-y-4">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-obsidian-300">% of Bets on Popular Team</span>
              <span class="font-mono text-amber-350">{bettingFlow().publicBets}%</span>
            </div>
            <div class="h-4 bg-obsidian-800 rounded-full overflow-hidden">
              <div class="h-full bg-amber-350" style="width: {bettingFlow().publicBets}%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-obsidian-300">% of Money on Popular Team</span>
              <span class="font-mono text-amber-350">{bettingFlow().publicMoney}%</span>
            </div>
            <div class="h-4 bg-obsidian-800 rounded-full overflow-hidden">
              <div class="h-full bg-amber-350" style="width: {bettingFlow().publicMoney}%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-obsidian-300">Sharp Money on Underdog</span>
              <span class="font-mono text-jade-400">{bettingFlow().sharpMoney}%</span>
            </div>
            <div class="h-4 bg-obsidian-800 rounded-full overflow-hidden">
              <div class="h-full bg-jade-500" style="width: {bettingFlow().sharpMoney}%"></div>
            </div>
          </div>
        </div>
        <p class="mt-4 text-xs text-obsidian-400">
          When bet count and money % diverge, sharps are on the other side.
        </p>
      </div>
    </div>
  </div>

  <!-- Popular Teams -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏆 Most Biased Teams</h2>
    <div class="grid md:grid-cols-3 gap-4">
      {#each teamBiases as team}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-amber-350 font-semibold">{team.team}</h3>
            <span class="text-xs px-2 py-0.5 rounded-full bg-jade-500/20 text-jade-400">{team.sport}</span>
          </div>
          <p class="text-xs text-obsidian-300">{team.bias}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Strategy -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💰 Pricing Strategy</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">For the House</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Shade lines against popular teams (capture public action)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Watch bet count vs money % for sharp action</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Prime time games get extra juice</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">For Bettors (to model)</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Fade public teams when line moves against value</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Small market road dogs are undervalued</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Track closing line value to validate edge</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calculate public bias adjustment
calculate_bias_adjustment &lt;- function(is_popular, is_home, 
                                       pop_bias = 3, home_bias = 2) {'{'} 
  adjustment &lt;- 0
  
  if (is_popular) adjustment &lt;- adjustment - pop_bias
  if (is_home) adjustment &lt;- adjustment - home_bias * 0.5
  
  return(adjustment)
{'}'}

# Shade line for public action
shade_line &lt;- function(true_line, is_popular_home, 
                       public_pct = 0.65, target_balance = 0.5) {'{'} 
  # Higher public % = more shading
  imbalance &lt;- public_pct - target_balance
  shade_factor &lt;- imbalance * 3  # ~1.5 pts for 10% imbalance
  
  if (is_popular_home) {'{'} 
    return(true_line - shade_factor)
  {'}'} else {'{'} 
    return(true_line + shade_factor)
  {'}'}
{'}'}

# Example
true_line &lt;- {trueLine}
market_line &lt;- shade_line(true_line, TRUE, 0.70)
edge &lt;- market_line - true_line
cat(sprintf("True: %+.1f, Market: %+.1f, Edge: %+.1f\n", 
            true_line, market_line, edge))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Public overvalues home field by 1-3 points</li>
        <li>• Popular teams attract 60-70% of public bets</li>
        <li>• Lines shade against public favorites</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Sharps fade popular teams, take road dogs</li>
        <li>• Bet count vs money % reveals sharp action</li>
        <li>• Small market teams = contrarian value</li>
      </ul>
    </div>
  </div>
</div>

