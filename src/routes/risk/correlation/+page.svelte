<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import { generateCorrelationMatrix, createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Correlation parameters
  let qbWrCorrelation = $state(0.65);
  let teammateCorrelation = $state(0.3);
  let sameGameCorrelation = $state(0.2);
  let numLegs = $state(3);
  let showHeatmap = $state(true);

  // Player examples
  const players = [
    { name: 'Mahomes', team: 'KC', position: 'QB' },
    { name: 'Kelce', team: 'KC', position: 'TE' },
    { name: 'Rice', team: 'KC', position: 'WR' },
    { name: 'Allen', team: 'BUF', position: 'QB' },
    { name: 'Diggs', team: 'BUF', position: 'WR' }
  ];

  // Build correlation matrix
  const correlationMatrix = $derived(() => {
    const n = players.length;
    const matrix: number[][] = [];
    
    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1;
        } else if (j < i) {
          matrix[i][j] = matrix[j][i];
        } else {
          const pi = players[i];
          const pj = players[j];
          
          // Same team correlations
          if (pi.team === pj.team) {
            if ((pi.position === 'QB' && ['WR', 'TE'].includes(pj.position)) ||
                (pj.position === 'QB' && ['WR', 'TE'].includes(pi.position))) {
              matrix[i][j] = qbWrCorrelation;
            } else {
              matrix[i][j] = teammateCorrelation;
            }
          } else {
            // Different teams in same game
            matrix[i][j] = sameGameCorrelation;
          }
        }
      }
    }
    return matrix;
  });

  // Calculate parlay risk metrics
  const uncorrelatedParlayProb = $derived(Math.pow(0.5, numLegs));
  
  const correlatedParlayProb = $derived(() => {
    // Simplified: correlated legs have higher joint probability
    // Using average correlation effect
    const avgCorr = (qbWrCorrelation + teammateCorrelation) / 2;
    const boost = 1 + avgCorr * 0.3; // Correlation boosts win rate
    return Math.pow(0.5, numLegs) * boost;
  });

  // Exposure calculation
  const exposureMultiplier = $derived(() => {
    // Correlated bets have higher effective exposure
    const avgCorr = (qbWrCorrelation + teammateCorrelation + sameGameCorrelation) / 3;
    return 1 + avgCorr * (numLegs - 1) * 0.5;
  });

  // Color scale for heatmap
  function getCorrelationColor(value: number): string {
    if (value === 1) return 'bg-amber-350';
    if (value > 0.5) return 'bg-jade-500/80';
    if (value > 0.3) return 'bg-jade-500/50';
    if (value > 0.1) return 'bg-jade-500/30';
    if (value > -0.1) return 'bg-obsidian-600';
    return 'bg-crimson-500/50';
  }
</script>

<svelte:head>
  <title>Correlation Analysis | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Risk Management</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Correlation Analysis</h1>
    <p class="section-subtitle max-w-3xl">
      Measure how picks move together. Critical for pricing correlated parlays 
      and managing exposure on same-game combinations.
    </p>
  </div>

  <!-- Key Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🔗 Understanding Correlation</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">Positive Correlation (+)</h3>
        <p class="text-sm text-obsidian-300">
          Outcomes move together. If QB throws well, his WR likely gets more receiving yards.
        </p>
        <div class="mt-2 text-2xl text-center">📈 ↔ 📈</div>
      </div>
      <div class="p-4 bg-obsidian-800/50 border border-obsidian-600 rounded-lg">
        <h3 class="text-obsidian-200 font-semibold mb-2">No Correlation (0)</h3>
        <p class="text-sm text-obsidian-300">
          Outcomes are independent. Players on different teams, different games.
        </p>
        <div class="mt-2 text-2xl text-center">📈 ⊥ 📉</div>
      </div>
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
        <h3 class="text-crimson-400 font-semibold mb-2">Negative Correlation (-)</h3>
        <p class="text-sm text-obsidian-300">
          Outcomes move opposite. If RB dominates, WR might get fewer targets.
        </p>
        <div class="mt-2 text-2xl text-center">📈 ↔ 📉</div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Correlation Settings</h3>
        <div class="space-y-4">
          <Slider 
            bind:value={qbWrCorrelation} 
            min={0} max={0.9} step={0.05} 
            label="QB-WR/TE Correlation" 
          />
          <Slider 
            bind:value={teammateCorrelation} 
            min={0} max={0.6} step={0.05} 
            label="Other Teammates" 
          />
          <Slider 
            bind:value={sameGameCorrelation} 
            min={-0.3} max={0.4} step={0.05} 
            label="Same Game (Diff Team)" 
          />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Parlay Settings</h3>
        <div class="space-y-4">
          <Slider bind:value={numLegs} min={2} max={6} step={1} label="Number of Legs" />
        </div>
      </div>

      <div class="glass-card p-6 border-crimson-500/30">
        <h3 class="font-display text-lg font-semibold text-crimson-400 mb-4">⚠️ Exposure Risk</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Effective Exposure</span>
            <span class="font-mono text-xl text-crimson-400">
              {exposureMultiplier().toFixed(2)}x
            </span>
          </div>
          <p class="text-xs text-obsidian-400">
            Correlated {numLegs}-leg parlay has exposure equivalent to 
            {(exposureMultiplier() * 1).toFixed(1)} independent bets.
          </p>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Correlation Heatmap -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Correlation Matrix</h3>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th class="p-2"></th>
                {#each players as player}
                  <th class="p-2 text-xs text-obsidian-400 font-normal">{player.name}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each players as rowPlayer, i}
                <tr>
                  <td class="p-2 text-xs text-obsidian-400">{rowPlayer.name}</td>
                  {#each players as _, j}
                    <td class="p-1">
                      <div 
                        class="w-12 h-12 rounded flex items-center justify-center text-xs font-mono
                               {getCorrelationColor(correlationMatrix()[i][j])}"
                      >
                        {correlationMatrix()[i][j].toFixed(2)}
                      </div>
                    </td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        
        <div class="mt-4 flex items-center gap-4 text-xs text-obsidian-400">
          <span>Correlation Scale:</span>
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 rounded bg-crimson-500/50"></div>
            <span>Negative</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 rounded bg-obsidian-600"></div>
            <span>~0</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 rounded bg-jade-500/50"></div>
            <span>Positive</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-4 h-4 rounded bg-amber-350"></div>
            <span>Perfect</span>
          </div>
        </div>
      </div>

      <!-- Parlay Impact -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Parlay Win Rate Impact</h3>
        <div class="grid grid-cols-2 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-3xl font-mono text-obsidian-300">
              {(uncorrelatedParlayProb * 100).toFixed(2)}%
            </div>
            <div class="text-sm text-obsidian-400 mt-1">Independent Legs</div>
            <div class="text-xs text-obsidian-500">0.5^{numLegs} = {uncorrelatedParlayProb.toFixed(4)}</div>
          </div>
          <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg text-center">
            <div class="text-3xl font-mono text-amber-350">
              {(correlatedParlayProb() * 100).toFixed(2)}%
            </div>
            <div class="text-sm text-obsidian-300 mt-1">Correlated Legs</div>
            <div class="text-xs text-obsidian-400">
              +{((correlatedParlayProb() / uncorrelatedParlayProb - 1) * 100).toFixed(1)}% boost
            </div>
          </div>
        </div>
        <p class="mt-4 text-sm text-obsidian-400">
          <strong class="text-amber-350">Key Insight:</strong> Correlated picks have higher joint probability 
          of all hitting together. This means same-game parlays need different pricing than independent parlays.
        </p>
      </div>
    </div>
  </div>

  <!-- Pricing Implications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💰 Pricing Implications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">For Same-Game Parlays</h3>
        <ul class="space-y-2 text-sm text-obsidian-300">
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">⚠️</span>
            <span>Can't multiply individual leg odds naively</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">⚠️</span>
            <span>QB + his WR overs are positively correlated</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">✓</span>
            <span>Apply correlation adjustments to payout</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">✓</span>
            <span>Limit exposure on highly correlated combos</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Exposure Management</h3>
        <ul class="space-y-2 text-sm text-obsidian-300">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Track correlation-adjusted exposure, not just $ amount</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Set limits on single-game concentrations</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Model worst-case scenarios (all correlated bets win)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Diversify across games/sports for risk reduction</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calculate player correlations from historical data
library(dplyr)
library(corrplot)

# Get player game logs
player_stats &lt;- game_logs %&gt;%
  select(game_id, player_id, fantasy_points) %&gt;%
  pivot_wider(names_from = player_id, values_from = fantasy_points)

# Correlation matrix
cor_matrix &lt;- cor(player_stats[,-1], use = "pairwise.complete.obs")

# Visualize
corrplot(cor_matrix, method = "color", type = "upper",
         col = colorRampPalette(c("#dc2626", "#1a1b1e", "#10b981"))(100))

# Calculate correlated parlay probability
correlated_parlay_prob &lt;- function(probs, cor_matrix) {'{'} 
  # Use copula or simulation for accurate calculation
  n_sims &lt;- 10000
  # ... simulation code ...
{'}'}</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• QB-WR correlations are typically 0.5-0.7</li>
        <li>• Same-team correlations require parlay price adjustments</li>
        <li>• Ignoring correlation underprices risk</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Track correlation-weighted exposure</li>
        <li>• Diversification reduces effective correlation</li>
        <li>• Use copulas for accurate joint probability modeling</li>
      </ul>
    </div>
  </div>
</div>

