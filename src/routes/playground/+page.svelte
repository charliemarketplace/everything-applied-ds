<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import NumberInput from '$lib/components/widgets/NumberInput.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import HistogramChart from '$lib/components/charts/HistogramChart.svelte';
  import { 
    generatePlayerStats, 
    runMonteCarloSimulation, 
    kellyFraction, 
    expectedValue,
    bayesianUpdate,
    createRNG,
    normalRandom
  } from '$lib/utils/synthetic-data';

  // Player selection
  const players = generatePlayerStats(42);
  let selectedPlayerIdx = $state(0);
  const selectedPlayer = $derived(players[selectedPlayerIdx]);

  // Pricing parameters
  let line = $state(25.5);
  let payoutMultiple = $state(1.91);
  let houseEdge = $state(0.05);

  // Simulation settings
  let numSimulations = $state(10000);
  let useBayesianUpdate = $state(false);
  let recentGames = $state(5);

  // Calculate probabilities
  const trueOverProb = $derived(() => {
    const mean = useBayesianUpdate ? bayesianMean : selectedPlayer.avgPoints;
    const std = useBayesianUpdate ? bayesianStd : selectedPlayer.stdDev;
    
    // Monte Carlo to estimate probability
    const rng = createRNG(42);
    let overCount = 0;
    for (let i = 0; i < numSimulations; i++) {
      const score = normalRandom(rng, mean, std);
      if (score > line) overCount++;
    }
    return overCount / numSimulations;
  });

  // Bayesian update using recent games
  const recentGameData = $derived(
    selectedPlayer.games.slice(-recentGames)
  );
  const recentMean = $derived(
    recentGameData.reduce((a, b) => a + b, 0) / recentGameData.length
  );
  const bayesianResult = $derived(
    bayesianUpdate(
      selectedPlayer.avgPoints,
      selectedPlayer.stdDev,
      recentMean,
      selectedPlayer.stdDev,
      recentGames
    )
  );
  const bayesianMean = $derived(bayesianResult.posteriorMean);
  const bayesianStd = $derived(bayesianResult.posteriorStd);

  // Pricing calculations
  const impliedProb = $derived(1 / payoutMultiple);
  const ev = $derived(expectedValue(trueOverProb(), payoutMultiple));
  const kelly = $derived(kellyFraction(trueOverProb(), payoutMultiple));
  const userEdge = $derived(trueOverProb() - impliedProb);
  const actualHouseEdge = $derived(impliedProb - trueOverProb());

  // Boolean flags for conditional styling (avoid > in templates)
  const isPositiveEV = $derived(ev > 0);
  const isPositiveUserEdge = $derived(userEdge > 0);
  const isPositiveHouseEdge = $derived(actualHouseEdge > 0);

  // Simulation distribution
  const simulationResult = $derived(() => {
    const mean = useBayesianUpdate ? bayesianMean : selectedPlayer.avgPoints;
    const std = useBayesianUpdate ? bayesianStd : selectedPlayer.stdDev;
    
    return runMonteCarloSimulation(
      (rng) => normalRandom(rng, mean, std),
      numSimulations,
      42,
      40
    );
  });

  // Game history chart
  const gameLabels = $derived(
    selectedPlayer.games.map((_, i) => `G${i + 1}`)
  );
</script>

<svelte:head>
  <title>Playground | Pricing Models</title>
</svelte:head>

<div class="max-w-7xl mx-auto space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <div class="flex items-center gap-3 mb-2">
        <span class="badge-jade">Interactive</span>
        <span class="badge-amber">Sandbox</span>
      </div>
      <h1 class="section-title">Pricing Playground</h1>
      <p class="section-subtitle">Combine multiple models in a live sandbox environment</p>
    </div>
  </div>

  <div class="grid lg:grid-cols-4 gap-6">
    <!-- Left Column: Controls -->
    <div class="space-y-4">
      <!-- Player Selection -->
      <div class="glass-card p-4">
        <h3 class="font-display text-sm font-semibold text-obsidian-100 mb-3">Player Selection</h3>
        <select 
          bind:value={selectedPlayerIdx}
          class="w-full px-3 py-2 bg-obsidian-800/50 border border-obsidian-600 rounded-lg text-sm text-obsidian-100"
        >
          {#each players as player, i}
            <option value={i}>{player.name} ({player.position})</option>
          {/each}
        </select>
        
        <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div class="p-2 bg-obsidian-800/50 rounded">
            <span class="text-obsidian-400">Season Avg</span>
            <div class="font-mono text-amber-350">{selectedPlayer.avgPoints.toFixed(1)}</div>
          </div>
          <div class="p-2 bg-obsidian-800/50 rounded">
            <span class="text-obsidian-400">Std Dev</span>
            <div class="font-mono text-amber-350">{selectedPlayer.stdDev.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <!-- Bayesian Toggle -->
      <div class="glass-card p-4">
        <Toggle 
          bind:checked={useBayesianUpdate} 
          label="Apply Bayesian Update" 
          description="Use recent games to update projections" 
        />
        {#if useBayesianUpdate}
          <div class="mt-3">
            <Slider 
              bind:value={recentGames} 
              min={1} max={10} step={1} 
              label="Recent Games" 
            />
            <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div class="p-2 bg-jade-500/20 rounded border border-jade-500/30">
                <span class="text-obsidian-400">Updated Mean</span>
                <div class="font-mono text-jade-400">{bayesianMean.toFixed(1)}</div>
              </div>
              <div class="p-2 bg-jade-500/20 rounded border border-jade-500/30">
                <span class="text-obsidian-400">Updated Std</span>
                <div class="font-mono text-jade-400">{bayesianStd.toFixed(1)}</div>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Line Setting -->
      <div class="glass-card p-4">
        <h3 class="font-display text-sm font-semibold text-obsidian-100 mb-3">Line & Pricing</h3>
        <div class="space-y-3">
          <Slider bind:value={line} min={15} max={35} step={0.5} label="Betting Line" unit=" pts" />
          <Slider bind:value={payoutMultiple} min={1.5} max={2.5} step={0.01} label="Payout" unit="x" />
        </div>
      </div>

      <!-- Simulation Settings -->
      <div class="glass-card p-4">
        <h3 class="font-display text-sm font-semibold text-obsidian-100 mb-3">Simulation</h3>
        <Slider bind:value={numSimulations} min={1000} max={50000} step={1000} label="Iterations" />
      </div>
    </div>

    <!-- Middle Column: Charts -->
    <div class="lg:col-span-2 space-y-4">
      <!-- Points Distribution -->
      <div class="glass-card p-4">
        <h3 class="font-display text-sm font-semibold text-obsidian-100 mb-3">
          Projected Points Distribution
        </h3>
        <div class="h-48">
          <HistogramChart 
            data={simulationResult().histogram}
            xAxisLabel="Points"
            highlightRange={{ min: line, max: 100 }}
          />
        </div>
        <div class="mt-2 flex items-center justify-center gap-4 text-xs">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-jade-500/60"></div>
            <span class="text-obsidian-400">Over {line} ({(trueOverProb() * 100).toFixed(1)}%)</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-amber-350/60"></div>
            <span class="text-obsidian-400">Under {line} ({((1 - trueOverProb()) * 100).toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      <!-- Game History -->
      <div class="glass-card p-4">
        <h3 class="font-display text-sm font-semibold text-obsidian-100 mb-3">
          Recent Game Log
        </h3>
        <div class="h-40">
          <LineChart 
            labels={gameLabels}
            datasets={[
              { 
                label: 'Points', 
                data: selectedPlayer.games, 
                borderColor: '#60a5fa', 
                fill: false 
              },
              {
                label: 'Line',
                data: Array(selectedPlayer.games.length).fill(line),
                borderColor: '#f5c542',
                fill: false,
                tension: 0
              }
            ]}
            xAxisLabel="Game"
            yAxisLabel="Points"
          />
        </div>
        <div class="mt-2 text-xs text-obsidian-400 text-center">
          Hit rate vs line: <span class="text-amber-350 font-mono">
            {((selectedPlayer.games.filter(g => g > line).length / selectedPlayer.games.length) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>

    <!-- Right Column: Results -->
    <div class="space-y-4">
      <!-- Key Metrics -->
      <div class="glass-card p-4 border-amber-350/30">
        <h3 class="font-display text-sm font-semibold text-amber-350 mb-3">📊 Pricing Analysis</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-xs text-obsidian-400">True Over Prob</span>
            <span class="font-mono text-sm text-obsidian-100">{(trueOverProb() * 100).toFixed(1)}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-obsidian-400">Implied Prob</span>
            <span class="font-mono text-sm text-obsidian-100">{(impliedProb * 100).toFixed(1)}%</span>
          </div>
          <hr class="border-obsidian-700">
          <div class="flex justify-between items-center">
            <span class="text-xs text-obsidian-400">User Edge</span>
            <span class="font-mono text-sm" 
                  class:text-jade-400={isPositiveUserEdge} 
                  class:text-crimson-400={!isPositiveUserEdge}>
              {(userEdge * 100).toFixed(2)}%
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-xs text-obsidian-400">House Edge</span>
            <span class="font-mono text-sm" 
                  class:text-jade-400={isPositiveHouseEdge} 
                  class:text-crimson-400={!isPositiveHouseEdge}>
              {(actualHouseEdge * 100).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <!-- EV & Kelly -->
      <div class="glass-card p-4">
        <h3 class="font-display text-sm font-semibold text-obsidian-100 mb-3">💰 Bet Analysis</h3>
        <div class="space-y-3">
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-obsidian-400">Expected Value</span>
              <span class="font-mono text-lg" 
                    class:text-jade-400={isPositiveEV} 
                    class:text-crimson-400={!isPositiveEV}>
                {isPositiveEV ? '+' : ''}{(ev * 100).toFixed(2)}%
              </span>
            </div>
            <div class="h-1.5 bg-obsidian-700 rounded-full overflow-hidden">
              <div 
                class="h-full transition-all duration-300"
                class:bg-jade-500={isPositiveEV}
                class:bg-crimson-500={!isPositiveEV}
                style="width: {Math.min(Math.abs(ev) * 500, 100)}%"
              ></div>
            </div>
          </div>
          
          <div>
            <div class="flex justify-between items-center mb-1">
              <span class="text-xs text-obsidian-400">Kelly Fraction</span>
              <span class="font-mono text-lg text-amber-350">
                {(kelly * 100).toFixed(1)}%
              </span>
            </div>
            <div class="h-1.5 bg-obsidian-700 rounded-full overflow-hidden">
              <div 
                class="h-full bg-amber-350 transition-all duration-300"
                style="width: {Math.min(kelly * 200, 100)}%"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendation -->
      <div class="glass-card p-4 {isPositiveEV ? 'border-jade-500/30' : 'border-crimson-500/30'}">
        <h3 class="font-display text-sm font-semibold mb-2 {isPositiveEV ? 'text-jade-400' : 'text-crimson-400'}">
          {isPositiveEV ? '✅ +EV Opportunity' : '❌ -EV Bet'}
        </h3>
        <p class="text-xs text-obsidian-300">
          {#if isPositiveEV}
            The true probability ({(trueOverProb() * 100).toFixed(1)}%) exceeds implied probability ({(impliedProb * 100).toFixed(1)}%). 
            Kelly suggests betting {(kelly * 100).toFixed(1)}% of bankroll.
          {:else}
            House has edge. True probability ({(trueOverProb() * 100).toFixed(1)}%) is below implied ({(impliedProb * 100).toFixed(1)}%). 
            Avoid or wait for better price.
          {/if}
        </p>
      </div>

      <!-- Quick Stats -->
      <div class="glass-card p-4">
        <h3 class="font-display text-sm font-semibold text-obsidian-100 mb-3">📈 Simulation Stats</h3>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="p-2 bg-obsidian-800/50 rounded text-center">
            <div class="text-obsidian-400">Mean</div>
            <div class="font-mono text-obsidian-100">{simulationResult().mean.toFixed(1)}</div>
          </div>
          <div class="p-2 bg-obsidian-800/50 rounded text-center">
            <div class="text-obsidian-400">Median</div>
            <div class="font-mono text-obsidian-100">{simulationResult().median.toFixed(1)}</div>
          </div>
          <div class="p-2 bg-obsidian-800/50 rounded text-center">
            <div class="text-obsidian-400">5th %ile</div>
            <div class="font-mono text-obsidian-100">{simulationResult().percentile5.toFixed(1)}</div>
          </div>
          <div class="p-2 bg-obsidian-800/50 rounded text-center">
            <div class="text-obsidian-400">95th %ile</div>
            <div class="font-mono text-obsidian-100">{simulationResult().percentile95.toFixed(1)}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

