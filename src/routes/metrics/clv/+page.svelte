<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // CLV calculation
  let openingLine = $state(-110);
  let closingLine = $state(-115);
  let betSize = $state(110);

  // Convert American odds to implied prob
  function americanToProb(odds: number): number {
    if (odds < 0) return -odds / (-odds + 100);
    return 100 / (odds + 100);
  }

  // CLV calculation
  const openingProb = $derived(americanToProb(openingLine));
  const closingProb = $derived(americanToProb(closingLine));
  const clv = $derived((closingProb - openingProb) * 100);
  const clvDollars = $derived(clv / 100 * betSize);

  // Simulate bettor history
  const bettorHistory = $derived(() => {
    const rng = createRNG(42);
    const bets = 50;
    const results: Array<{ bet: number, clv: number, cumClv: number }> = [];
    let cumClv = 0;
    
    for (let b = 0; b < bets; b++) {
      const clvBet = normalRandom(rng, clv, 2);
      cumClv += clvBet;
      results.push({ bet: b + 1, clv: clvBet, cumClv });
    }
    
    return results;
  });

  const betLabels = $derived(bettorHistory().map(b => String(b.bet)));

  // CLV interpretation
  function interpretClv(clv: number): { label: string, color: string, desc: string } {
    if (clv >= 2) return { label: 'Sharp', color: 'text-jade-400', desc: 'Consistently beating closing line' };
    if (clv >= 0.5) return { label: 'Winning', color: 'text-jade-400/70', desc: 'Positive edge detected' };
    if (clv >= -0.5) return { label: 'Neutral', color: 'text-amber-350', desc: 'Breaking even vs close' };
    if (clv >= -2) return { label: 'Losing', color: 'text-crimson-400/70', desc: 'Negative CLV' };
    return { label: 'Square', color: 'text-crimson-400', desc: 'Consistently worse than close' };
  }

  const clvClass = $derived(interpretClv(clv));
</script>

<svelte:head>
  <title>Closing Line Value | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Metrics & Evaluation</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Closing Line Value (CLV)</h1>
    <p class="section-subtitle max-w-3xl">
      Measure betting skill by comparing your bet price to the closing line.
      Positive CLV = you're beating the market. The #1 predictor of long-term success.
    </p>
  </div>

  <!-- Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 What is CLV?</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <div class="formula text-lg mb-4">
          CLV = Closing Prob - Opening Prob
        </div>
        <p class="text-sm text-obsidian-300 mb-3">
          If you bet at -110 and the line closes at -115, you got a better price.
          The market moved to confirm your bet was sharp.
        </p>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>• Positive CLV = you bet before the line moved your way</li>
          <li>• Negative CLV = line moved against you</li>
          <li>• Consistent +CLV = sharp bettor</li>
        </ul>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg">
        <h3 class="text-amber-350 font-semibold mb-2">Why CLV Matters</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li>• <strong>Predictive:</strong> +CLV bettors profit long-term</li>
          <li>• <strong>Immediate:</strong> Don't need outcome to measure</li>
          <li>• <strong>Skill signal:</strong> Better than win rate</li>
          <li>• <strong>Detection:</strong> Books use CLV to identify sharps</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Interactive Calculator -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Your Bet</h3>
        <div class="space-y-4">
          <Slider bind:value={openingLine} min={-200} max={200} step={5} label="Opening Line (when you bet)" />
          <Slider bind:value={closingLine} min={-200} max={200} step={5} label="Closing Line" />
          <Slider bind:value={betSize} min={50} max={1000} step={50} label="Bet Size ($)" />
        </div>
      </div>

      <div class="glass-card p-6 border-{clvClass.color.replace('text-', '')}/30">
        <h3 class="font-display text-lg font-semibold {clvClass.color} mb-4">📊 CLV Analysis</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Opening Implied</span>
            <span class="font-mono text-obsidian-200">{(openingProb * 100).toFixed(1)}%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Closing Implied</span>
            <span class="font-mono text-obsidian-200">{(closingProb * 100).toFixed(1)}%</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-obsidian-700">
            <span class="text-obsidian-300">CLV</span>
            <span class="font-mono text-xl {clvClass.color}">
              {clv > 0 ? '+' : ''}{clv.toFixed(2)}%
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Dollar Value</span>
            <span class="font-mono {clvClass.color}">
              {clvDollars >= 0 ? '+' : ''}${clvDollars.toFixed(2)}
            </span>
          </div>
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg">
          <span class="{clvClass.color} font-semibold">{clvClass.label}:</span>
          <span class="text-xs text-obsidian-400 ml-1">{clvClass.desc}</span>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- CLV Over Time -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Cumulative CLV (50 Bets)</h3>
        <div class="h-48">
          <LineChart 
            labels={betLabels}
            datasets={[{
              label: 'Cumulative CLV %',
              data: bettorHistory().map(b => b.cumClv),
              borderColor: clv >= 0 ? '#34d399' : '#dc2626',
              fill: true,
              backgroundColor: clv >= 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(220, 38, 38, 0.1)'
            }]}
            xAxisLabel="Bet #"
            yAxisLabel="Cumulative CLV %"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          {clv >= 0 ? 'Upward trend = you\'re consistently getting better prices than the market.' : 'Downward trend = you\'re consistently getting worse prices.'}
        </p>
      </div>

      <!-- Interpretation -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">CLV Benchmarks</h3>
        <div class="grid grid-cols-5 gap-2">
          <div class="p-3 bg-crimson-500/20 border border-crimson-500/30 rounded-lg text-center">
            <div class="font-mono text-lg text-crimson-400">&lt;-2%</div>
            <div class="text-xs text-obsidian-400">Square</div>
          </div>
          <div class="p-3 bg-crimson-500/10 rounded-lg text-center">
            <div class="font-mono text-lg text-crimson-400/70">-2 to 0</div>
            <div class="text-xs text-obsidian-400">Losing</div>
          </div>
          <div class="p-3 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
            <div class="font-mono text-lg text-amber-350">~0%</div>
            <div class="text-xs text-obsidian-400">Neutral</div>
          </div>
          <div class="p-3 bg-jade-500/10 rounded-lg text-center">
            <div class="font-mono text-lg text-jade-400/70">0 to 2</div>
            <div class="text-xs text-obsidian-400">Winning</div>
          </div>
          <div class="p-3 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="font-mono text-lg text-jade-400">&gt;2%</div>
            <div class="text-xs text-obsidian-400">Sharp</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Practical Tips -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">💡 Practical Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">For Bettors</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Track CLV for every bet, not just outcomes</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Bet early when you have information edge</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Consistent +CLV matters more than win rate</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">For Books</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>CLV is the #1 sharp detection metric</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>+2% CLV over 100+ bets = definitely sharp</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Use CLV to set limits and move lines</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Calculate CLV
american_to_prob &lt;- function(odds) {'{'} 
  if (odds &lt; 0) return(-odds / (-odds + 100))
  return(100 / (odds + 100))
{'}'}

calculate_clv &lt;- function(opening, closing) {'{'} 
  open_prob &lt;- american_to_prob(opening)
  close_prob &lt;- american_to_prob(closing)
  clv &lt;- (close_prob - open_prob) * 100
  return(clv)
{'}'}

# Track bettor CLV
bettor_clv_analysis &lt;- function(bets) {'{'} 
  bets$clv &lt;- mapply(calculate_clv, bets$opening, bets$closing)
  
  list(
    avg_clv = mean(bets$clv),
    total_clv = sum(bets$clv),
    positive_rate = mean(bets$clv &gt; 0),
    classification = ifelse(mean(bets$clv) &gt; 2, "Sharp", 
                           ifelse(mean(bets$clv) &gt; 0, "Winning", "Square"))
  )
{'}'}

# Example
clv &lt;- calculate_clv({openingLine}, {closingLine})
cat(sprintf("CLV: %+.2f%%\n", clv))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• CLV = Closing prob - Opening prob</li>
        <li>• Positive CLV = you beat the closing line</li>
        <li>• Best predictor of long-term betting success</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• +2% avg CLV = sharp bettor</li>
        <li>• Track CLV, not just win/loss</li>
        <li>• Books use CLV to identify sharps</li>
      </ul>
    </div>
  </div>
</div>

