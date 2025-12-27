<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import Toggle from '$lib/components/widgets/Toggle.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Time series parameters
  let trendStrength = $state(0.3);
  let seasonalStrength = $state(5);
  let volatility = $state(3);
  let arCoef = $state(0.7);
  let showComponents = $state(false);
  let forecastHorizon = $state(10);

  // Generate time series with trend, seasonality, AR component, and noise
  const generateTimeSeries = $derived(() => {
    const rng = createRNG(42);
    const n = 60; // 60 periods (e.g., games)
    const data: number[] = [];
    const trend: number[] = [];
    const seasonal: number[] = [];
    const residuals: number[] = [];
    
    let prevValue = 25; // Starting value (e.g., points)
    
    for (let t = 0; t < n; t++) {
      // Trend component
      const trendVal = trendStrength * t / 10;
      trend.push(trendVal);
      
      // Seasonal component (weekly pattern - 7 game cycles)
      const seasonVal = seasonalStrength * Math.sin(2 * Math.PI * t / 7);
      seasonal.push(seasonVal);
      
      // AR(1) component + noise
      const noise = normalRandom(rng, 0, volatility);
      const arComponent = arCoef * (prevValue - 25);
      residuals.push(arComponent + noise);
      
      // Combine components
      const value = 25 + trendVal + seasonVal + arComponent + noise;
      data.push(Math.max(0, value));
      prevValue = value;
    }
    
    return { data, trend, seasonal, residuals };
  });

  // Simple moving average
  const movingAverage = $derived(() => {
    const { data } = generateTimeSeries();
    const window = 5;
    return data.map((_, i) => {
      if (i < window - 1) return null;
      const slice = data.slice(i - window + 1, i + 1);
      return slice.reduce((a, b) => a + b, 0) / window;
    });
  });

  // Exponential smoothing forecast
  const exponentialSmoothing = $derived(() => {
    const { data } = generateTimeSeries();
    const alpha = 0.3; // Smoothing parameter
    const smoothed: number[] = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      smoothed.push(alpha * data[i] + (1 - alpha) * smoothed[i - 1]);
    }
    
    // Forecast
    const lastSmoothed = smoothed[smoothed.length - 1];
    for (let i = 0; i < forecastHorizon; i++) {
      smoothed.push(lastSmoothed);
    }
    
    return smoothed;
  });

  // Chart labels
  const chartLabels = $derived(
    Array.from({ length: 60 + forecastHorizon }, (_, i) => 
      i < 60 ? `G${i + 1}` : `F${i - 59}`
    )
  );

  // ACF calculation (simplified)
  const acfValues = $derived(() => {
    const { data } = generateTimeSeries();
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / data.length;
    
    const acf: number[] = [];
    for (let lag = 0; lag <= 15; lag++) {
      let sum = 0;
      for (let i = lag; i < data.length; i++) {
        sum += (data[i] - mean) * (data[i - lag] - mean);
      }
      acf.push(sum / (data.length * variance));
    }
    return acf;
  });

  const acfLabels = Array.from({ length: 16 }, (_, i) => String(i));
</script>

<svelte:head>
  <title>Time Series Models | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Core Statistical Model</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Time Series Models</h1>
    <p class="section-subtitle max-w-3xl">
      Forecast future values based on temporal patterns. Essential for player 
      performance trends, form analysis, and seasonal adjustments.
    </p>
  </div>

  <!-- Components Overview -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📈 Time Series Components</h2>
    <div class="grid md:grid-cols-4 gap-4">
      <div class="p-4 bg-amber-350/10 border border-amber-350/30 rounded-lg text-center">
        <h3 class="text-amber-350 font-semibold mb-2">Trend</h3>
        <p class="text-xs text-obsidian-300">Long-term direction (improving, declining)</p>
        <div class="mt-2 text-2xl">📈</div>
      </div>
      <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg text-center">
        <h3 class="text-jade-400 font-semibold mb-2">Seasonality</h3>
        <p class="text-xs text-obsidian-300">Regular patterns (home/away, rest days)</p>
        <div class="mt-2 text-2xl">🔄</div>
      </div>
      <div class="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
        <h3 class="text-blue-400 font-semibold mb-2">Autocorrelation</h3>
        <p class="text-xs text-obsidian-300">Dependence on past values (momentum)</p>
        <div class="mt-2 text-2xl">🔗</div>
      </div>
      <div class="p-4 bg-obsidian-700/50 rounded-lg text-center">
        <h3 class="text-obsidian-300 font-semibold mb-2">Noise</h3>
        <p class="text-xs text-obsidian-400">Random variation (game-to-game variance)</p>
        <div class="mt-2 text-2xl">〰️</div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Component Settings</h3>
        <div class="space-y-4">
          <Slider bind:value={trendStrength} min={-1} max={1} step={0.1} label="Trend Strength" />
          <Slider bind:value={seasonalStrength} min={0} max={10} step={0.5} label="Seasonal Amplitude" />
          <Slider bind:value={arCoef} min={0} max={0.95} step={0.05} label="AR(1) Coefficient" />
          <Slider bind:value={volatility} min={1} max={8} step={0.5} label="Noise Level" />
        </div>
      </div>

      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Display Options</h3>
        <div class="space-y-4">
          <Toggle bind:checked={showComponents} label="Show Components" description="Decompose the series" />
          <Slider bind:value={forecastHorizon} min={1} max={20} step={1} label="Forecast Horizon" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Series Statistics</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Mean</span>
            <span class="font-mono text-amber-350">
              {(generateTimeSeries().data.reduce((a, b) => a + b, 0) / 60).toFixed(1)}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Std Dev</span>
            <span class="font-mono text-amber-350">
              {Math.sqrt(generateTimeSeries().data.reduce((sum, x, _, arr) => {
                const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
                return sum + Math.pow(x - mean, 2);
              }, 0) / 60).toFixed(2)}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">AR(1) Effect</span>
            <span class="font-mono text-jade-400">{arCoef > 0.5 ? 'Strong momentum' : 'Weak persistence'}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Main Time Series Chart -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">
          Player Points Over Season
        </h3>
        <div class="h-64">
          <LineChart 
            labels={chartLabels}
            datasets={[
              {
                label: 'Actual',
                data: [...generateTimeSeries().data, ...Array(forecastHorizon).fill(null)],
                borderColor: '#60a5fa',
                fill: false
              },
              {
                label: '5-Game MA',
                data: [...movingAverage(), ...Array(forecastHorizon).fill(null)],
                borderColor: '#f5c542',
                fill: false,
                borderDash: [5, 5]
              },
              {
                label: 'Exp. Smoothing Forecast',
                data: exponentialSmoothing(),
                borderColor: '#34d399',
                fill: false,
                borderDash: [2, 2]
              },
              ...(showComponents ? [
                {
                  label: 'Trend',
                  data: [...generateTimeSeries().trend.map(t => 25 + t), ...Array(forecastHorizon).fill(null)],
                  borderColor: '#a78bfa',
                  fill: false
                }
              ] : [])
            ]}
            xAxisLabel="Game"
            yAxisLabel="Points"
          />
        </div>
        <div class="mt-4 text-xs text-obsidian-400">
          Blue shaded area shows forecast period. Green dashed = exponential smoothing forecast.
        </div>
      </div>

      <!-- ACF Chart -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">
          Autocorrelation Function (ACF)
        </h3>
        <div class="h-48">
          <LineChart 
            labels={acfLabels}
            datasets={[{
              label: 'ACF',
              data: acfValues(),
              borderColor: '#f5c542',
              fill: true,
              backgroundColor: 'rgba(245, 197, 66, 0.2)'
            }]}
            xAxisLabel="Lag"
            yAxisLabel="Correlation"
          />
        </div>
        <p class="mt-3 text-sm text-obsidian-400">
          <strong>Interpretation:</strong> High ACF at lag 1 = momentum (hot/cold streaks). 
          ACF at lag 7 = weekly pattern. AR coefficient of <span class="text-amber-350">{arCoef}</span> 
          shows {arCoef > 0.5 ? 'strong' : 'weak'} game-to-game dependence.
        </p>
      </div>
    </div>
  </div>

  <!-- Model Types -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">📚 Common Time Series Models</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">ARIMA</h3>
        <p class="text-sm text-obsidian-300">
          AutoRegressive Integrated Moving Average. Captures autocorrelation and handles non-stationarity.
        </p>
        <div class="formula text-sm">ARIMA(p, d, q)</div>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>p = AR order (past values)</li>
          <li>d = Differencing order</li>
          <li>q = MA order (past errors)</li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Exponential Smoothing</h3>
        <p class="text-sm text-obsidian-300">
          Weight recent observations more heavily. Simple but effective for short-term forecasts.
        </p>
        <div class="formula text-sm">ŷ_t = αy_t + (1-α)ŷ_(t-1)</div>
        <ul class="text-xs text-obsidian-400 space-y-1">
          <li>α = smoothing parameter</li>
          <li>Higher α = more reactive</li>
          <li>Lower α = smoother trend</li>
        </ul>
      </div>
      <div class="space-y-3">
        <h3 class="text-amber-350 font-semibold">Prophet / State Space</h3>
        <p class="text-sm text-obsidian-300">
          Modern approaches handling trend changes, holidays, and missing data automatically.
        </p>
        <div class="text-xs text-obsidian-400">
          <ul class="space-y-1">
            <li>• Facebook Prophet for quick forecasts</li>
            <li>• State space for flexible modeling</li>
            <li>• Good for irregular schedules</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Sports Applications -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏀 Sports Pricing Applications</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Player Form Analysis</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Recent form weighting (last 5 games vs season avg)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Hot streak detection (high AR coefficient)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Mean reversion after outlier games</span>
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <h3 class="text-amber-350 font-semibold">Seasonal Adjustments</h3>
        <ul class="text-sm text-obsidian-300 space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Back-to-back game fatigue patterns</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>Home/away regular patterns</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-jade-400">→</span>
            <span>All-Star break effects, playoff intensity</span>
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
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Time series analysis for player projections
library(forecast)
library(dplyr)

# Player game log as time series
player_ts &lt;- ts(player_games$points, frequency = 7)  # Weekly pattern

# Decompose into components
decomposed &lt;- decompose(player_ts)
plot(decomposed)

# Fit ARIMA model
arima_fit &lt;- auto.arima(player_ts)
summary(arima_fit)

# Forecast next 10 games
forecast_result &lt;- forecast(arima_fit, h = {forecastHorizon})
plot(forecast_result)

# Exponential smoothing alternative
ets_fit &lt;- ets(player_ts)
ets_forecast &lt;- forecast(ets_fit, h = {forecastHorizon})

# Check ACF for momentum
acf(player_ts, main = "ACF - Player Points")</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Decompose series: trend + seasonal + residual</li>
        <li>• High AR(1) = momentum (recent games matter more)</li>
        <li>• ARIMA for formal modeling, ETS for quick forecasts</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Recent form ≠ true ability (regression to mean)</li>
        <li>• Account for schedule effects (rest, travel)</li>
        <li>• Cross-validate on out-of-sample games</li>
      </ul>
    </div>
  </div>
</div>

