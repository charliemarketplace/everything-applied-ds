<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Bettor profile parameters
  let betSize = $state(500);
  let winRate = $state(54);
  let clvAverage = $state(2);
  let betFrequency = $state(20);
  let steamMoveFollow = $state(40);

  // Sharp detection score
  const sharpScore = $derived(() => {
    let score = 0;
    
    // Win rate contribution (52%+ is suspicious)
    if (winRate > 52) score += (winRate - 52) * 10;
    
    // CLV contribution (positive CLV is sharp indicator)
    score += clvAverage * 15;
    
    // Bet size contribution
    if (betSize > 1000) score += 10;
    if (betSize > 5000) score += 20;
    
    // Steam move following
    if (steamMoveFollow > 30) score += steamMoveFollow * 0.3;
    
    return Math.min(100, Math.max(0, score));
  });

  // Classification
  const classification = $derived(() => {
    const score = sharpScore();
    if (score >= 70) return { label: 'Sharp', color: 'text-crimson-400', bg: 'bg-crimson-500/20 border-crimson-500/30' };
    if (score >= 40) return { label: 'Semi-Sharp', color: 'text-amber-350', bg: 'bg-amber-350/20 border-amber-350/30' };
    return { label: 'Square', color: 'text-jade-400', bg: 'bg-jade-500/20 border-jade-500/30' };
  });

  // Simulate bettor population
  const bettorPopulation = $derived(() => {
    const rng = createRNG(42);
    const bettors: Array<{ type: string, winRate: number, clv: number, size: number }> = [];
    
    // 85% squares
    for (let i = 0; i < 85; i++) {
      bettors.push({
        type: 'Square',
        winRate: 45 + normalRandom(rng, 0, 5),
        clv: normalRandom(rng, -2, 1.5),
        size: 50 + rng() * 200
      });
    }
    
    // 12% semi-sharps
    for (let i = 0; i < 12; i++) {
      bettors.push({
        type: 'Semi-Sharp',
        winRate: 50 + normalRandom(rng, 0, 3),
        clv: normalRandom(rng, 0.5, 1),
        size: 200 + rng() * 500
      });
    }
    
    // 3% sharps
    for (let i = 0; i < 3; i++) {
      bettors.push({
        type: 'Sharp',
        winRate: 54 + normalRandom(rng, 0, 2),
        clv: normalRandom(rng, 2, 1),
        size: 1000 + rng() * 5000
      });
    }
    
    return bettors;
  });

  // Distribution for chart
  const winRateDistribution = $derived(() => {
    const bins = Array(12).fill(0);
    bettorPopulation().forEach(b => {
      const binIdx = Math.min(11, Math.max(0, Math.floor((b.winRate - 40) / 2)));
      bins[binIdx]++;
    });
    return bins;
  });

  const winRateLabels = ['40-42', '42-44', '44-46', '46-48', '48-50', '50-52', '52-54', '54-56', '56-58', '58-60', '60-62', '62+'];

  // Sharp indicators
  const indicators = [
    { name: 'Win Rate > 52%', weight: 'High', desc: 'Sustained winning over large sample' },
    { name: 'Positive CLV', weight: 'Very High', desc: 'Consistently beats closing line' },
    { name: 'Large Bet Sizes', weight: 'Medium', desc: 'Confidence in edge justifies size' },
    { name: 'Steam Move Timing', weight: 'High', desc: 'Bets before major line moves' },
    { name: 'Contrarian Picks', weight: 'Medium', desc: 'Fades public money regularly' },
    { name: 'Off-Peak Betting', weight: 'Low', desc: 'Bets when lines are soft' }
  ];
</script>

<svelte:head>
  <title>Sharp vs Square Detection | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Pricing Framework</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Sharp vs Square Detection</h1>
    <p class="section-subtitle max-w-3xl">
      Identify sophisticated bettors vs casual users. Sharp money moves lines; 
      square money is the profit center.
    </p>
  </div>

  <!-- Definitions -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🎩 Who's Who?</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg">
        <h3 class="text-jade-400 font-semibold mb-2">Square (Recreational)</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Casual bettors who bet for entertainment. Follow public narratives.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Win rate: 45-50%</li>
          <li>• Negative CLV</li>
          <li>• Bet favorites, overs</li>
          <li>• ~85% of bettors</li>
        </ul>
      </div>
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Semi-Sharp</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Educated bettors with some edge. Break even or small profit.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Win rate: 50-53%</li>
          <li>• Neutral to slight + CLV</li>
          <li>• More selective</li>
          <li>• ~12% of bettors</li>
        </ul>
      </div>
      <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg">
        <h3 class="text-crimson-400 font-semibold mb-2">Sharp (Professional)</h3>
        <p class="text-sm text-obsidian-300 mb-2">
          Professional bettors or syndicates with consistent edge.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Win rate: 53%+</li>
          <li>• Strong positive CLV</li>
          <li>• Large, quick bets</li>
          <li>• ~3% of bettors</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Classifier -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Bettor Profile</h3>
        <div class="space-y-4">
          <Slider bind:value={winRate} min={40} max={60} step={0.5} label="Win Rate (%)" />
          <Slider bind:value={clvAverage} min={-5} max={5} step={0.5} label="Avg CLV (%)" />
          <Slider bind:value={betSize} min={50} max={10000} step={50} label="Avg Bet Size ($)" />
          <Slider bind:value={steamMoveFollow} min={0} max={100} step={5} label="Steam Move Timing (%)" />
        </div>
      </div>

      <div class="glass-card p-6 border {classification().bg}">
        <h3 class="font-display text-lg font-semibold {classification().color} mb-4">
          📊 Classification
        </h3>
        <div class="text-center">
          <div class="font-mono text-4xl {classification().color} mb-2">
            {classification().label}
          </div>
          <div class="text-sm text-obsidian-400">
            Sharp Score: {sharpScore().toFixed(0)}/100
          </div>
          <div class="mt-4 h-3 bg-obsidian-800 rounded-full overflow-hidden">
            <div 
              class="h-full transition-all duration-300 {sharpScore() >= 70 ? 'bg-crimson-500' : sharpScore() >= 40 ? 'bg-amber-350' : 'bg-jade-500'}"
              style="width: {sharpScore()}%"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- CLV Explanation -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">📈 Closing Line Value (CLV)</h3>
        <p class="text-sm text-obsidian-300 mb-4">
          CLV measures whether a bettor beats the closing line. It's the #1 indicator of sharp betting.
        </p>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-crimson-500/10 border border-crimson-500/30 rounded-lg text-center">
            <div class="font-mono text-xl text-crimson-400">-3%</div>
            <div class="text-xs text-obsidian-400">Square</div>
            <div class="text-xs text-obsidian-500">Opened -110, closed -105</div>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="font-mono text-xl text-obsidian-300">0%</div>
            <div class="text-xs text-obsidian-400">Neutral</div>
            <div class="text-xs text-obsidian-500">No edge either way</div>
          </div>
          <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
            <div class="font-mono text-xl text-jade-400">+3%</div>
            <div class="text-xs text-obsidian-400">Sharp</div>
            <div class="text-xs text-obsidian-500">Opened -110, closed -120</div>
          </div>
        </div>
      </div>

      <!-- Population Distribution -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Bettor Win Rate Distribution</h3>
        <div class="h-48">
          <BarChart 
            labels={winRateLabels}
            data={winRateDistribution()}
            color="#f5c542"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          Most bettors cluster around 47%. Only ~3% consistently exceed 54%.
        </p>
      </div>
    </div>
  </div>

  <!-- Sharp Indicators -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🔍 Detection Signals</h2>
    <div class="grid md:grid-cols-3 gap-4">
      {#each indicators as indicator}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-amber-350 font-semibold text-sm">{indicator.name}</h3>
            <span class="text-xs px-2 py-0.5 rounded-full {indicator.weight === 'Very High' ? 'bg-crimson-500/20 text-crimson-400' : indicator.weight === 'High' ? 'bg-amber-350/20 text-amber-350' : 'bg-obsidian-700 text-obsidian-400'}">
              {indicator.weight}
            </span>
          </div>
          <p class="text-xs text-obsidian-400">{indicator.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Response Strategies -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">⚡ Response Strategies</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">When Sharp Money Arrives</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Move line to balance book</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Use for price discovery (they know something)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Lower limits on subsequent bets</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Consider copying the bet elsewhere (hedge)</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Managing Sharp Bettors</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">⚠️</span>
            <span>Limit max bet size (but don't ban—they're useful)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-crimson-400">⚠️</span>
            <span>Delay accepting bets during steam moves</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">✓</span>
            <span>Let them bet early for line setting</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">✓</span>
            <span>Track their picks for internal modeling</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Sharp detection model
calculate_sharp_score &lt;- function(win_rate, clv, bet_size, steam_timing) {'{'} 
  score &lt;- 0
  
  # Win rate component
  if (win_rate &gt; 52) score &lt;- score + (win_rate - 52) * 10
  
  # CLV component (most important)
  score &lt;- score + clv * 15
  
  # Bet size component
  if (bet_size &gt; 1000) score &lt;- score + 10
  if (bet_size &gt; 5000) score &lt;- score + 20
  
  # Steam timing
  if (steam_timing &gt; 30) score &lt;- score + steam_timing * 0.3
  
  return(pmin(100, pmax(0, score)))
{'}'}

# Classify bettor
classify_bettor &lt;- function(score) {'{'} 
  if (score &gt;= 70) return("Sharp")
  if (score &gt;= 40) return("Semi-Sharp")
  return("Square")
{'}'}

# Example
score &lt;- calculate_sharp_score({winRate}, {clvAverage}, {betSize}, {steamMoveFollow})
cat(sprintf("Score: %.0f - %s\n", score, classify_bettor(score)))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• CLV is the #1 sharp indicator (better than win rate)</li>
        <li>• ~3% of bettors are truly sharp</li>
        <li>• Sharps provide price discovery—useful, not just a cost</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Move lines when sharp money arrives</li>
        <li>• Limit but don't ban—track and learn from them</li>
        <li>• Square money is the profit center</li>
      </ul>
    </div>
  </div>
</div>

