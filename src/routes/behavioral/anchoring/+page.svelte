<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Anchoring demo
  let trueValue = $state(25);
  let anchorValue = $state(30);
  let adjustmentStrength = $state(0.4);

  // Public perception (anchored)
  const publicEstimate = $derived(() => {
    // People anchor on initial value and insufficiently adjust
    return anchorValue - (anchorValue - trueValue) * adjustmentStrength;
  });

  // Edge from anchoring
  const edge = $derived(publicEstimate() - trueValue);

  // Opening line effect
  let openingLine = $state(23.5);
  let trueLineValue = $state(22);
  
  const publicLineEstimate = $derived(() => {
    // Public anchors on opening line
    return openingLine - (openingLine - trueLineValue) * 0.3;
  });

  // Anchoring examples
  const examples = [
    { 
      anchor: 'Opening Line',
      effect: 'Public doesn\'t adjust enough from opener',
      exploit: 'Fade line movement in wrong direction'
    },
    { 
      anchor: 'Season Average',
      effect: 'Ignores recent context/matchup',
      exploit: 'Value in contextual adjustments'
    },
    { 
      anchor: 'Last Game',
      effect: 'Overweight recent performance',
      exploit: 'Fade outliers (regression)'
    },
    { 
      anchor: 'Round Numbers',
      effect: 'Cluster bets at 25, 30, etc.',
      exploit: 'Value at 24.5, 30.5'
    }
  ];
</script>

<svelte:head>
  <title>Anchoring Effects | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Behavioral Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Anchoring Effects</h1>
    <p class="section-subtitle max-w-3xl">
      People rely too heavily on the first piece of information they see.
      Opening lines, season averages, and round numbers all create anchoring biases.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">⚓ The Anchoring Bias</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">How It Works</h3>
        <ol class="text-sm text-obsidian-300 space-y-2">
          <li>1. Person sees initial value (anchor)</li>
          <li>2. They adjust from the anchor toward their estimate</li>
          <li>3. Adjustment is typically <strong>insufficient</strong></li>
          <li>4. Final estimate is biased toward anchor</li>
        </ol>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Famous Study</h3>
        <p class="text-sm text-obsidian-300">
          Tversky & Kahneman (1974): Spun a wheel showing 10 or 65, then asked 
          "What % of African countries are in the UN?"
        </p>
        <ul class="text-xs text-obsidian-400 mt-2 space-y-1">
          <li>• Anchor of 10 → average guess: 25%</li>
          <li>• Anchor of 65 → average guess: 45%</li>
          <li>• Random anchor still affected judgment!</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Player Props Example</h3>
        <div class="space-y-4">
          <Slider bind:value={trueValue} min={15} max={35} step={0.5} label="True Expected Points" />
          <Slider bind:value={anchorValue} min={15} max={35} step={0.5} label="Anchor (Season Avg)" />
          <Slider bind:value={adjustmentStrength} min={0.1} max={0.8} step={0.05} label="Adjustment Strength" />
        </div>
        <p class="text-xs text-obsidian-400 mt-3">
          Lower adjustment = stronger anchoring bias
        </p>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Bias Analysis</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">True Value</span>
            <span class="font-mono text-lg text-jade-400">{trueValue}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Anchor</span>
            <span class="font-mono text-lg text-amber-350">{anchorValue}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Public Estimate</span>
            <span class="font-mono text-lg text-obsidian-200">{publicEstimate().toFixed(1)}</span>
          </div>
          <div class="pt-3 border-t border-obsidian-700">
            <div class="flex justify-between items-center">
              <span class="text-obsidian-300">Mispricing</span>
              <span class="font-mono text-xl {edge > 0 ? 'text-crimson-400' : 'text-jade-400'}">
                {edge > 0 ? '+' : ''}{edge.toFixed(1)} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Visual -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Anchoring Visualization</h3>
        <div class="relative h-32">
          <!-- Scale -->
          <div class="absolute inset-x-0 top-1/2 h-2 bg-obsidian-800 rounded-full"></div>
          
          <!-- True Value marker -->
          <div 
            class="absolute w-4 h-4 bg-jade-500 rounded-full -translate-x-1/2 -translate-y-1/2"
            style="left: {((trueValue - 15) / 20) * 100}%; top: 50%"
          >
            <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-jade-400 whitespace-nowrap">
              True: {trueValue}
            </div>
          </div>
          
          <!-- Anchor marker -->
          <div 
            class="absolute w-4 h-4 bg-amber-350 rounded-full -translate-x-1/2 -translate-y-1/2"
            style="left: {((anchorValue - 15) / 20) * 100}%; top: 50%"
          >
            <div class="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-amber-350 whitespace-nowrap">
              Anchor: {anchorValue}
            </div>
          </div>
          
          <!-- Public estimate marker -->
          <div 
            class="absolute w-6 h-6 border-2 border-obsidian-300 rounded-full -translate-x-1/2 -translate-y-1/2"
            style="left: {((publicEstimate() - 15) / 20) * 100}%; top: 50%"
          >
            <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 text-xs text-obsidian-300 whitespace-nowrap">
              Public: {publicEstimate().toFixed(1)}
            </div>
          </div>
          
          <!-- Scale labels -->
          <div class="absolute left-0 bottom-0 text-xs text-obsidian-400">15</div>
          <div class="absolute right-0 bottom-0 text-xs text-obsidian-400">35</div>
        </div>
        <p class="mt-8 text-xs text-obsidian-400 text-center">
          Public estimate is pulled toward the anchor, creating exploitable bias.
        </p>
      </div>

      <!-- Opening Line Example -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Opening Line Anchoring</h3>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <Slider bind:value={openingLine} min={18} max={28} step={0.5} label="Opening Line" />
          <Slider bind:value={trueLineValue} min={18} max={28} step={0.5} label="True Fair Line" />
        </div>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
            <div class="text-xs text-amber-350 mb-1">Opening</div>
            <div class="font-mono text-2xl text-amber-350">{openingLine}</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Public Expects</div>
            <div class="font-mono text-2xl text-obsidian-200">{publicLineEstimate().toFixed(1)}</div>
          </div>
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-jade-400 mb-1">True Value</div>
            <div class="font-mono text-2xl text-jade-400">{trueLineValue}</div>
          </div>
        </div>
        <p class="mt-4 text-sm text-obsidian-400">
          {#if openingLine > trueLineValue}
            Line opened too high. Public still anchors high → take UNDER.
          {:else if openingLine < trueLineValue}
            Line opened too low. Public still anchors low → take OVER.
          {:else}
            Opening line was accurate. No anchoring edge.
          {/if}
        </p>
      </div>
    </div>
  </div>

  <!-- Common Anchors -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎯 Common Anchoring Points</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each examples as ex}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{ex.anchor}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{ex.effect}</p>
          <p class="text-xs text-jade-400">Edge: {ex.exploit}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Pricing Implications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💰 Pricing Implications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">For Line Setting</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Opening line sets the public's anchor</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Even if you move the line, public adjusts slowly</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Strategic opener can capture value</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">For Finding Edge</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Look for lines that opened wrong</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Fade insufficient adjustments</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Value often at non-round numbers</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Anchoring model
estimate_with_anchor &lt;- function(anchor, true_value, adjustment = 0.4) {'{'} 
  # People start at anchor and adjust toward true value
  # But adjustment is typically insufficient
  public_estimate &lt;- anchor - (anchor - true_value) * adjustment
  mispricing &lt;- public_estimate - true_value
  
  list(
    anchor = anchor,
    true_value = true_value,
    public_estimate = public_estimate,
    mispricing = mispricing
  )
{'}'}

# Example
result &lt;- estimate_with_anchor({anchorValue}, {trueValue}, {adjustmentStrength})
cat(sprintf("Anchor: %.1f, True: %.1f\n", result$anchor, result$true_value))
cat(sprintf("Public estimate: %.1f\n", result$public_estimate))
cat(sprintf("Mispricing: %+.1f pts\n", result$mispricing))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• People anchor on first information seen</li>
        <li>• Adjustment from anchor is insufficient</li>
        <li>• Opening lines, season averages are common anchors</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Creates exploitable mispricing</li>
        <li>• Fade lines that opened wrong</li>
        <li>• Value at non-round numbers (24.5 vs 25)</li>
      </ul>
    </div>
  </div>
</div>

