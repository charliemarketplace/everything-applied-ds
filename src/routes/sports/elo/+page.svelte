<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { generateEloHistory, calculateEloChange, createRNG } from '$lib/utils/synthetic-data';

  // Elo parameters
  let kFactor = $state(32);
  let teamARating = $state(1500);
  let teamBRating = $state(1400);

  // Calculate expected win probability
  const expectedA = $derived(
    1 / (1 + Math.pow(10, (teamBRating - teamARating) / 400))
  );
  const expectedB = $derived(1 - expectedA);

  // Calculate rating changes for win/loss
  const changeIfAWins = $derived(calculateEloChange(teamARating, teamBRating, 1, kFactor));
  const changeIfALoses = $derived(calculateEloChange(teamARating, teamBRating, 0, kFactor));

  // Team history simulation
  const teams = ['Lakers', 'Celtics', 'Bulls', 'Heat', 'Warriors'];
  const eloHistory = $derived(generateEloHistory(teams, 40, 42));

  const historyLabels = $derived(
    Array.from({ length: 41 }, (_, i) => String(i))
  );

  const historyDatasets = $derived(
    teams.map((team, i) => {
      const colors = ['#f5c542', '#60a5fa', '#f87171', '#34d399', '#a78bfa'];
      return {
        label: team,
        data: eloHistory.get(team) || [],
        borderColor: colors[i],
        fill: false
      };
    })
  );

  // Rating tier descriptions
  const tiers = [
    { min: 1600, label: 'Elite', color: 'text-amber-350' },
    { min: 1500, label: 'Above Average', color: 'text-jade-400' },
    { min: 1400, label: 'Average', color: 'text-obsidian-300' },
    { min: 1300, label: 'Below Average', color: 'text-crimson-400' },
    { min: 0, label: 'Weak', color: 'text-crimson-500' }
  ];

  function getTier(rating: number) {
    return tiers.find(t => rating >= t.min)!;
  }
</script>

<svelte:head>
  <title>Elo Rating System | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Sports Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Elo Rating System</h1>
    <p class="section-subtitle max-w-3xl">
      Dynamic skill ratings that update based on game outcomes. 
      Used for team/player strength estimation and win probability calculations.
    </p>
  </div>

  <!-- Formula -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Elo Formula</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Expected Score</h3>
        <div class="formula text-lg">
          E_A = 1 / (1 + 10^((R_B - R_A) / 400))
        </div>
        <p class="text-sm text-obsidian-300">
          The expected probability of Team A winning based on rating difference.
        </p>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Rating Update</h3>
        <div class="formula text-lg">
          R'_A = R_A + K × (S_A - E_A)
        </div>
        <p class="text-sm text-obsidian-300">
          New rating = Old rating + K × (Actual result - Expected result).
          K controls volatility.
        </p>
      </div>
    </div>
  </div>

  <!-- Interactive Calculator -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Team Ratings</h3>
        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-obsidian-300">Team A</span>
              <span class="{getTier(teamARating).color} text-sm">{getTier(teamARating).label}</span>
            </div>
            <Slider bind:value={teamARating} min={1200} max={1800} step={10} label="" />
            <div class="text-center font-mono text-2xl text-amber-350">{teamARating}</div>
          </div>
          
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-obsidian-300">Team B</span>
              <span class="{getTier(teamBRating).color} text-sm">{getTier(teamBRating).label}</span>
            </div>
            <Slider bind:value={teamBRating} min={1200} max={1800} step={10} label="" />
            <div class="text-center font-mono text-2xl text-blue-400">{teamBRating}</div>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">K-Factor</h3>
        <Slider bind:value={kFactor} min={8} max={64} step={4} label="K-Factor" />
        <p class="text-xs text-obsidian-400 mt-2">
          Higher K = more volatility. NBA uses ~20, Chess uses 16-32.
        </p>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Win Probabilities</h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="p-6 bg-amber-350/10 border border-amber-350/30 rounded-xl text-center">
            <div class="text-4xl font-mono text-amber-350">{(expectedA * 100).toFixed(1)}%</div>
            <div class="text-sm text-obsidian-300 mt-2">Team A Win Probability</div>
          </div>
          <div class="p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
            <div class="text-4xl font-mono text-blue-400">{(expectedB * 100).toFixed(1)}%</div>
            <div class="text-sm text-obsidian-300 mt-2">Team B Win Probability</div>
          </div>
        </div>
        
        <h4 class="text-sm font-semibold text-obsidian-100 mb-3">Rating Changes After Game</h4>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <div class="text-xs text-obsidian-400">If Team A Wins:</div>
            <div class="flex justify-between p-3 bg-obsidian-800/50 rounded-lg">
              <span class="text-obsidian-300">Team A:</span>
              <span class="font-mono text-jade-400">+{changeIfAWins.toFixed(1)}</span>
            </div>
            <div class="flex justify-between p-3 bg-obsidian-800/50 rounded-lg">
              <span class="text-obsidian-300">Team B:</span>
              <span class="font-mono text-crimson-400">{changeIfAWins.toFixed(1)}</span>
            </div>
          </div>
          <div class="space-y-2">
            <div class="text-xs text-obsidian-400">If Team B Wins:</div>
            <div class="flex justify-between p-3 bg-obsidian-800/50 rounded-lg">
              <span class="text-obsidian-300">Team A:</span>
              <span class="font-mono text-crimson-400">{changeIfALoses.toFixed(1)}</span>
            </div>
            <div class="flex justify-between p-3 bg-obsidian-800/50 rounded-lg">
              <span class="text-obsidian-300">Team B:</span>
              <span class="font-mono text-jade-400">+{Math.abs(changeIfALoses).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Season Simulation</h3>
        <div class="h-64">
          <LineChart 
            labels={historyLabels}
            datasets={historyDatasets}
            xAxisLabel="Games"
            yAxisLabel="Elo Rating"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Pricing Applications</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Win Probability</h3>
        <p class="text-sm text-obsidian-300">
          Convert rating difference directly to moneyline odds. No additional modeling needed.
        </p>
        <div class="p-3 bg-obsidian-800/50 rounded-lg text-sm font-mono">
          100 pts diff ≈ 64% vs 36%
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Spread Estimation</h3>
        <p class="text-sm text-obsidian-300">
          Each 25 Elo points ≈ 1 point spread in basketball. Calibrate per sport.
        </p>
        <div class="p-3 bg-obsidian-800/50 rounded-lg text-sm font-mono">
          {teamARating - teamBRating} Elo ≈ {((teamARating - teamBRating) / 25).toFixed(1)} pts
        </div>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Player Projections</h3>
        <p class="text-sm text-obsidian-300">
          Adjust player projections based on opponent team Elo. Stronger opponents = lower stats.
        </p>
      </div>
    </div>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• 400-point difference = 90% vs 10% win probability</li>
        <li>• K-factor controls rating volatility</li>
        <li>• Zero-sum: winner gains what loser loses</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Great for relative strength estimation</li>
        <li>• Can extend with margin of victory</li>
        <li>• FiveThirtyEight uses Elo for all major sports</li>
      </ul>
    </div>
  </div>
</div>

