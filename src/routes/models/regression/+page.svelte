<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Generate synthetic data for regression
  let sampleSize = $state(50);
  let trueSlope = $state(0.8);
  let trueIntercept = $state(5);
  let noiseLevel = $state(3);
  let showResiduals = $state(false);

  // Generate data
  const generateData = $derived(() => {
    const rng = createRNG(42);
    const x: number[] = [];
    const y: number[] = [];
    
    for (let i = 0; i < sampleSize; i++) {
      const xi = rng() * 30 + 10; // X from 10 to 40
      const noise = normalRandom(rng, 0, noiseLevel);
      const yi = trueIntercept + trueSlope * xi + noise;
      x.push(xi);
      y.push(yi);
    }
    
    return { x, y };
  });

  // OLS regression
  const regression = $derived(() => {
    const { x, y } = generateData();
    const n = x.length;
    
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += (x[i] - meanX) ** 2;
    }
    
    const slope = numerator / denominator;
    const intercept = meanY - slope * meanX;
    
    // Calculate R-squared
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < n; i++) {
      const predicted = intercept + slope * x[i];
      ssRes += (y[i] - predicted) ** 2;
      ssTot += (y[i] - meanY) ** 2;
    }
    const rSquared = 1 - ssRes / ssTot;
    
    // Standard error of slope
    const mse = ssRes / (n - 2);
    const seSlope = Math.sqrt(mse / denominator);
    
    return { slope, intercept, rSquared, seSlope, mse };
  });

  // Chart data
  const chartLabels = $derived(
    Array.from({ length: 31 }, (_, i) => String(i + 10))
  );

  const scatterData = $derived(() => {
    const { x, y } = generateData();
    // For line chart, we'll show the regression line + scatter approximation
    return x.map((xi, i) => ({ x: xi, y: y[i] }));
  });

  const regressionLine = $derived(
    chartLabels.map(label => {
      const x = parseFloat(label);
      return regression().intercept + regression().slope * x;
    })
  );

  const trueLine = $derived(
    chartLabels.map(label => {
      const x = parseFloat(label);
      return trueIntercept + trueSlope * x;
    })
  );

  // For scatter plot approximation (binned)
  const binnedData = $derived(() => {
    const { x, y } = generateData();
    const bins = new Map<number, number[]>();
    
    x.forEach((xi, i) => {
      const bin = Math.round(xi);
      if (!bins.has(bin)) bins.set(bin, []);
      bins.get(bin)!.push(y[i]);
    });
    
    return chartLabels.map(label => {
      const bin = parseFloat(label);
      const values = bins.get(bin) || [];
      return values.length > 0 ? values.reduce((a, b) => a + b) / values.length : null;
    });
  });
</script>

<svelte:head>
  <title>Regression Models | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Core Statistical Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Regression Models</h1>
    <p class="section-subtitle max-w-3xl">
      Predict continuous outcomes like total points scored. 
      Foundation for player projections and statistical modeling.
    </p>
  </div>

  <!-- Types of Regression -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📈 Regression Types</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="space-y-2">
        <h3 class="text-amber-350 font-semibold">Linear Regression</h3>
        <p class="text-sm text-obsidian-300">
          Continuous outcomes (total points scored). Models linear relationship between predictors and response.
        </p>
        <div class="formula text-sm">y = β₀ + β₁x + ε</div>
      </div>
      <div class="space-y-2">
        <h3 class="text-amber-350 font-semibold">Logistic Regression</h3>
        <p class="text-sm text-obsidian-300">
          Binary outcomes (over/under hit rate). Models probability of success.
        </p>
        <div class="formula text-sm">P(y=1) = 1/(1+e^(-βx))</div>
      </div>
      <div class="space-y-2">
        <h3 class="text-amber-350 font-semibold">Poisson Regression</h3>
        <p class="text-sm text-obsidian-300">
          Count data (goals, touchdowns, strikeouts). Models rate/count outcomes.
        </p>
        <div class="formula text-sm">log(λ) = β₀ + β₁x</div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">True Model</h3>
        <p class="text-xs text-obsidian-400 mb-4">Underlying relationship (usually unknown)</p>
        <div class="space-y-4">
          <Slider bind:value={trueSlope} min={0} max={2} step={0.1} label="True Slope (β₁)" />
          <Slider bind:value={trueIntercept} min={-10} max={20} step={1} label="True Intercept (β₀)" />
          <Slider bind:value={noiseLevel} min={0.5} max={10} step={0.5} label="Noise Level (σ)" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Data Settings</h3>
        <div class="space-y-4">
          <Slider bind:value={sampleSize} min={10} max={200} step={10} label="Sample Size (n)" />
          <Toggle bind:checked={showResiduals} label="Show True Line" description="Compare estimated vs true" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Estimated Coefficients</h3>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Slope (β̂₁)</span>
            <span class="font-mono text-lg text-amber-350">{regression().slope.toFixed(3)}</span>
          </div>
          <div class="flex justify-between items-center text-sm text-obsidian-400">
            <span>True: {trueSlope}</span>
            <span>Error: {Math.abs(regression().slope - trueSlope).toFixed(3)}</span>
          </div>
          
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">Intercept (β̂₀)</span>
            <span class="font-mono text-lg text-amber-350">{regression().intercept.toFixed(2)}</span>
          </div>
          
          <hr class="border-obsidian-700">
          
          <div class="flex justify-between items-center">
            <span class="text-obsidian-300">R²</span>
            <span class="font-mono text-lg text-jade-400">{(regression().rSquared * 100).toFixed(1)}%</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-obsidian-400">SE of Slope</span>
            <span class="font-mono text-obsidian-200">±{regression().seSlope.toFixed(3)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">
          Linear Regression Fit
        </h3>
        <div class="h-72">
          <LineChart 
            labels={chartLabels}
            datasets={[
              { 
                label: 'Data Points (binned avg)', 
                data: binnedData(), 
                borderColor: '#60a5fa',
                fill: false,
                tension: 0
              },
              { 
                label: 'Fitted Line', 
                data: regressionLine, 
                borderColor: '#f5c542',
                fill: false,
                tension: 0
              },
              ...(showResiduals ? [{
                label: 'True Line',
                data: trueLine,
                borderColor: '#34d399',
                fill: false,
                tension: 0
              }] : [])
            ]}
            xAxisLabel="Minutes Played"
            yAxisLabel="Points Scored"
          />
        </div>
        <div class="mt-4 text-sm text-obsidian-400">
          <strong>Equation:</strong> 
          <span class="font-mono text-amber-350">
            Points = {regression().intercept.toFixed(2)} + {regression().slope.toFixed(3)} × Minutes
          </span>
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Interpretation</h3>
        <div class="grid md:grid-cols-2 gap-4 text-sm">
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <span class="text-amber-350 font-semibold">Slope Interpretation:</span>
            <p class="text-obsidian-300 mt-1">
              For each additional minute played, the player scores 
              <span class="text-jade-400">{regression().slope.toFixed(2)}</span> more points on average.
            </p>
          </div>
          <div class="p-4 bg-obsidian-800/50 rounded-lg">
            <span class="text-amber-350 font-semibold">R² Interpretation:</span>
            <p class="text-obsidian-300 mt-1">
              Minutes played explains <span class="text-jade-400">{(regression().rSquared * 100).toFixed(0)}%</span> 
              of the variance in points scored.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Sports Application -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Player Projection Features</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Usage-Based Features</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• Minutes per game</li>
          <li>• Field goal attempts</li>
          <li>• Shot attempts in paint</li>
          <li>• Usage rate</li>
          <li>• Touches per game</li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Matchup Features</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• Opponent defensive rating</li>
          <li>• Position-specific defense</li>
          <li>• Pace of opponent</li>
          <li>• Home/away adjustments</li>
          <li>• Rest days</li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Context Features</h3>
        <ul class="text-sm text-obsidian-300 space-y-1">
          <li>• Vegas total (implied pace)</li>
          <li>• Spread (game script)</li>
          <li>• Teammate injuries</li>
          <li>• Back-to-back indicator</li>
          <li>• Season phase</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Linear Regression for Player Projections
library(dplyr)

# Fit model
model &lt;- lm(points ~ minutes + opponent_def_rating + rest_days + home, 
            data = player_games)

# Summary
summary(model)

# Predict for tonight's game
new_data &lt;- data.frame(
  minutes = 34,
  opponent_def_rating = 110,
  rest_days = 2,
  home = 1
)
predict(model, new_data, interval = "prediction")

# Feature importance (standardized coefficients)
library(lm.beta)
lm.beta(model)</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Linear regression predicts continuous outcomes</li>
        <li>• More data → lower standard errors → more precise estimates</li>
        <li>• R² measures explanatory power (not necessarily predictive)</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Feature engineering is key for sports projections</li>
        <li>• Use cross-validation to avoid overfitting</li>
        <li>• Consider Poisson for count data (TDs, HRs)</li>
      </ul>
    </div>
  </div>
</div>

