<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Player parameters
  let starPlayerUsage = $state(28);
  let starPlayerPoints = $state(27);
  let starPlayerAssists = $state(7);
  let isStarOut = $state(false);

  // Team adjustment when star is out
  const usageRedistribution = $derived(() => {
    if (!isStarOut) return { player2: 22, player3: 18, player4: 16, player5: 16 };
    
    // Redistribute star's usage
    const extraUsage = starPlayerUsage;
    return {
      player2: 22 + extraUsage * 0.35,
      player3: 18 + extraUsage * 0.25,
      player4: 16 + extraUsage * 0.20,
      player5: 16 + extraUsage * 0.20
    };
  });

  // Projected stats adjustment
  const playerProjections = $derived(() => {
    const base = [
      { name: 'Star Player', pts: starPlayerPoints, ast: starPlayerAssists, usage: starPlayerUsage },
      { name: 'Player 2', pts: 18, ast: 4, usage: 22 },
      { name: 'Player 3', pts: 14, ast: 3, usage: 18 },
      { name: 'Player 4', pts: 12, ast: 2, usage: 16 },
      { name: 'Player 5', pts: 10, ast: 5, usage: 16 }
    ];

    if (!isStarOut) return base;

    // Adjust when star is out
    const usageMult = (newUsage: number, oldUsage: number) => Math.sqrt(newUsage / oldUsage);
    
    return [
      { name: 'Star Player', pts: 0, ast: 0, usage: 0 },
      { name: 'Player 2', pts: 18 * usageMult(usageRedistribution().player2, 22), ast: 4 + 2, usage: usageRedistribution().player2 },
      { name: 'Player 3', pts: 14 * usageMult(usageRedistribution().player3, 18), ast: 3 + 1, usage: usageRedistribution().player3 },
      { name: 'Player 4', pts: 12 * usageMult(usageRedistribution().player4, 16), ast: 2, usage: usageRedistribution().player4 },
      { name: 'Player 5', pts: 10 * usageMult(usageRedistribution().player5, 16), ast: 5 + 2, usage: usageRedistribution().player5 }
    ];
  });

  // Team total impact
  const teamTotalImpact = $derived(() => {
    const fullStrength = starPlayerPoints + 18 + 14 + 12 + 10; // Starters only
    const withoutStar = playerProjections().reduce((sum, p) => sum + p.pts, 0);
    return {
      full: 110, // Typical team total
      adjusted: isStarOut ? 110 - (starPlayerPoints * 0.4) : 110, // Not all production is lost
      difference: isStarOut ? -(starPlayerPoints * 0.4) : 0
    };
  });

  // Injury types and recovery
  const injuryTypes = [
    { type: 'DNP - Rest', impact: 'Out 1 game', lineMoveIn: '0.5-1 pt', propsImpact: 'Moderate' },
    { type: 'Ankle Sprain', impact: 'Out 1-3 weeks', lineMoveIn: '2-4 pts', propsImpact: 'High' },
    { type: 'Concussion', impact: 'Variable (protocol)', lineMoveIn: '2-3 pts', propsImpact: 'High' },
    { type: 'Knee Injury', impact: 'Weeks to Season', lineMoveIn: '3-6 pts', propsImpact: 'Very High' },
    { type: 'ACL Tear', impact: 'Season-ending', lineMoveIn: '4-7 pts', propsImpact: 'Extreme' }
  ];
</script>

<svelte:head>
  <title>Injury Impact Models | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Sports Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Injury Impact Models</h1>
    <p class="section-subtitle max-w-3xl">
      Quantify how player absences affect team totals and prop lines. Model usage
      redistribution and pricing adjustments.
    </p>
  </div>

  <!-- Key Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🩹 The Replacement Problem</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">📉</div>
        <h3 class="text-crimson-400 font-semibold mb-2">Production Lost</h3>
        <p class="text-xs text-obsidian-300">
          Star's points/assists/rebounds no longer contributed
        </p>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg text-center">
        <div class="text-3xl mb-2">🔄</div>
        <h3 class="text-amber-350 font-semibold mb-2">Usage Redistribution</h3>
        <p class="text-xs text-obsidian-300">
          Other players get more touches, shots, minutes
        </p>
      </div>
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
        <div class="text-3xl mb-2">📊</div>
        <h3 class="text-jade-400 font-semibold mb-2">Net Impact</h3>
        <p class="text-xs text-obsidian-300">
          Usually 40-60% of production is replaced, 40-60% truly lost
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Star Player Profile</h3>
        <div class="space-y-4">
          <Slider bind:value={starPlayerPoints} min={15} max={35} step={1} label="Points Per Game" />
          <Slider bind:value={starPlayerAssists} min={2} max={12} step={0.5} label="Assists Per Game" />
          <Slider bind:value={starPlayerUsage} min={20} max={35} step={1} label="Usage Rate (%)" />
        </div>
      </div>

      <div class="glass-card p-6 border-crimson-500/30">
        <h3 class="font-display text-lg font-semibold text-crimson-400 mb-4">🩹 Injury Status</h3>
        <Toggle bind:checked={isStarOut} label="Star Player OUT" />
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-sm">
          {#if isStarOut}
            <span class="text-crimson-400">⚠️ Star is OUT</span>
            <p class="text-xs text-obsidian-400 mt-1">Usage redistributed, team total adjusted</p>
          {:else}
            <span class="text-jade-400">✓ Full strength</span>
            <p class="text-xs text-obsidian-400 mt-1">All players at baseline projections</p>
          {/if}
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Player Projections -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Player Projections</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-obsidian-700">
                <th class="p-2 text-left text-obsidian-400">Player</th>
                <th class="p-2 text-center text-obsidian-400">Usage %</th>
                <th class="p-2 text-center text-obsidian-400">Points</th>
                <th class="p-2 text-center text-obsidian-400">Assists</th>
              </tr>
            </thead>
            <tbody>
              {#each playerProjections() as player, i}
                <tr class="border-b border-obsidian-800 {i === 0 && isStarOut ? 'opacity-40' : ''}">
                  <td class="p-2 {i === 0 ? 'text-amber-350' : 'text-obsidian-200'}">{player.name}</td>
                  <td class="p-2 text-center font-mono {i > 0 && isStarOut ? 'text-jade-400' : 'text-obsidian-300'}">
                    {player.usage.toFixed(1)}%
                  </td>
                  <td class="p-2 text-center font-mono {i > 0 && isStarOut ? 'text-jade-400' : 'text-obsidian-300'}">
                    {player.pts.toFixed(1)}
                  </td>
                  <td class="p-2 text-center font-mono {i > 0 && isStarOut ? 'text-jade-400' : 'text-obsidian-300'}">
                    {player.ast.toFixed(1)}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Team Total Impact -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Team Total Impact</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Full Strength</div>
            <div class="font-mono text-2xl text-obsidian-200">{teamTotalImpact().full}</div>
          </div>
          <div class="p-4 bg-{isStarOut ? 'crimson-500' : 'jade-500'}/20 border border-{isStarOut ? 'crimson-500' : 'jade-500'}/30 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Adjusted Total</div>
            <div class="font-mono text-2xl {isStarOut ? 'text-crimson-400' : 'text-jade-400'}">
              {teamTotalImpact().adjusted.toFixed(1)}
            </div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Impact</div>
            <div class="font-mono text-2xl {teamTotalImpact().difference < 0 ? 'text-crimson-400' : 'text-obsidian-300'}">
              {teamTotalImpact().difference > 0 ? '+' : ''}{teamTotalImpact().difference.toFixed(1)}
            </div>
          </div>
        </div>
        <p class="mt-4 text-xs text-obsidian-400">
          {#if isStarOut}
            Note: ~{(100 - (starPlayerPoints * 0.4 / starPlayerPoints * 100)).toFixed(0)}% of star's production is replaced by teammates.
            Net loss is smaller than raw stats.
          {:else}
            Team at full strength. No injury adjustment needed.
          {/if}
        </p>
      </div>
    </div>
  </div>

  <!-- Injury Types -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📋 Injury Type Reference</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-obsidian-700">
            <th class="p-3 text-left text-obsidian-400">Injury Type</th>
            <th class="p-3 text-left text-obsidian-400">Typical Duration</th>
            <th class="p-3 text-left text-obsidian-400">Line Movement</th>
            <th class="p-3 text-left text-obsidian-400">Props Impact</th>
          </tr>
        </thead>
        <tbody>
          {#each injuryTypes as injury}
            <tr class="border-b border-obsidian-800">
              <td class="p-3 text-amber-350">{injury.type}</td>
              <td class="p-3 text-obsidian-300">{injury.impact}</td>
              <td class="p-3 font-mono text-obsidian-300">{injury.lineMoveIn}</td>
              <td class="p-3 text-obsidian-300">{injury.propsImpact}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Pricing Implications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💰 Pricing Implications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Team Totals</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Star out: Drop total by 40-60% of their scoring</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Public overreacts—line moves too much early</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Value often on OVER after big line drop</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Player Props</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Secondary players: Boost props (usage increase)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Point guards: Extra assists if scorer is out</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Efficiency may drop (harder shots, more attention)</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Injury impact model
calculate_injury_impact &lt;- function(star_pts, star_usage, replacement_pct = 0.5) {'{'} 
  # Net points lost = star production × (1 - replacement rate)
  net_loss &lt;- star_pts * (1 - replacement_pct)
  
  # Usage redistribution
  remaining_usage &lt;- star_usage
  # Top 4 teammates get proportional boost
  teammate_boosts &lt;- c(0.35, 0.25, 0.20, 0.20) * remaining_usage
  
  list(
    team_total_adjustment = -net_loss,
    teammate_usage_boosts = teammate_boosts,
    replacement_rate = replacement_pct
  )
{'}'}

# Example
impact &lt;- calculate_injury_impact({starPlayerPoints}, {starPlayerUsage}, 0.5)
cat(sprintf("Team total adjustment: %.1f points\n", impact$team_total_adjustment))
cat(sprintf("Usage boost to top teammate: +%.1f%%\n", impact$teammate_usage_boosts[1]))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• ~40-60% of star production is replaced</li>
        <li>• Team totals drop less than star's raw stats</li>
        <li>• Usage redistributes to remaining players</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Public often overreacts to injury news</li>
        <li>• Secondary player props rise</li>
        <li>• Efficiency may drop (harder role)</li>
      </ul>
    </div>
  </div>
</div>

