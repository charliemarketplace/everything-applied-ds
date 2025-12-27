<script lang="ts">
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  import BarChart from '$lib/components/charts/BarChart.svelte';
  import { createRNG, normalRandom } from '$lib/utils/synthetic-data';

  // Revenue management parameters
  let capacity = $state(1000);
  let timeRemaining = $state(60);
  let currentBookings = $state(400);
  let basePrice = $state(100);

  // Demand forecast
  const expectedDemand = $derived(() => {
    const rate = currentBookings / (100 - timeRemaining);
    return rate * timeRemaining;
  });

  const utilizationForecast = $derived((currentBookings + expectedDemand()) / capacity * 100);

  // Optimal price based on remaining capacity
  const optimalPrice = $derived(() => {
    const remainingCapacity = capacity - currentBookings;
    const urgency = 1 - timeRemaining / 100;
    const scarcity = 1 - remainingCapacity / capacity;
    
    // Higher price when scarce or urgent
    const multiplier = 1 + scarcity * 0.5 + urgency * 0.3;
    return basePrice * multiplier;
  });

  // Revenue scenarios
  const scenarios = $derived(() => {
    const remaining = capacity - currentBookings;
    
    // Fixed price
    const fixedRevenue = currentBookings * basePrice + remaining * 0.7 * basePrice;
    
    // Dynamic pricing
    const dynamicRevenue = currentBookings * basePrice + remaining * 0.85 * optimalPrice();
    
    return { fixed: fixedRevenue, dynamic: dynamicRevenue, gain: dynamicRevenue - fixedRevenue };
  });

  // Booking curve over time
  const bookingCurve = $derived(() => {
    const rng = createRNG(42);
    const points = 10;
    const bookings: number[] = [];
    const prices: number[] = [];
    
    let cumBookings = 0;
    for (let t = 0; t <= points; t++) {
      const pct = t / points * 100;
      const remaining = capacity - cumBookings;
      const urgency = pct / 100;
      
      // Dynamic price
      const price = basePrice * (1 + (1 - remaining / capacity) * 0.5 + urgency * 0.3);
      prices.push(price);
      
      // Bookings depend on price
      const bookingRate = 100 * (2 - price / basePrice);
      cumBookings += Math.max(0, bookingRate * (1 + normalRandom(rng, 0, 0.2)));
      bookings.push(Math.min(capacity, cumBookings));
    }
    
    return { bookings, prices };
  });

  const timeLabels = Array.from({ length: 11 }, (_, i) => `${i * 10}%`);

  // Key levers
  const levers = [
    { name: 'Time-Based', desc: 'Price increases as event approaches', example: 'Deadline urgency' },
    { name: 'Capacity-Based', desc: 'Price increases as inventory depletes', example: 'Scarcity premium' },
    { name: 'Demand-Based', desc: 'Price based on booking velocity', example: 'Hot game premium' },
    { name: 'Segment-Based', desc: 'Different prices for different users', example: 'VIP vs casual' }
  ];
</script>

<svelte:head>
  <title>Revenue Management | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Dynamic Pricing</span>
      <span class="badge-jade">Interactive</span>
    </div>
    <h1 class="section-title">Revenue Management</h1>
    <p class="section-subtitle max-w-3xl">
      Maximize total revenue by dynamically adjusting prices based on demand,
      capacity, and time. The airline/hotel approach applied to betting.
    </p>
  </div>

  <!-- Core Concept -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📊 The Revenue Management Problem</h2>
    <div class="grid md:grid-cols-3 gap-6">
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">📅</div>
        <h3 class="text-obsidian-200 font-semibold mb-2">Fixed Capacity</h3>
        <p class="text-xs text-obsidian-400">Limited inventory (risk limits, seats, offers)</p>
      </div>
      <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
        <div class="text-3xl mb-2">⏰</div>
        <h3 class="text-obsidian-200 font-semibold mb-2">Perishable</h3>
        <p class="text-xs text-obsidian-400">Value lost if not sold by deadline</p>
      </div>
      <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
        <div class="text-3xl mb-2">💰</div>
        <h3 class="text-amber-350 font-semibold mb-2">Variable Demand</h3>
        <p class="text-xs text-obsidian-400">Heterogeneous willingness to pay</p>
      </div>
    </div>
  </div>

  <!-- Interactive Demo -->
  <div class="grid lg:grid-cols-3 gap-6">
    <div class="space-y-6">
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Current State</h3>
        <div class="space-y-4">
          <Slider bind:value={capacity} min={500} max={2000} step={100} label="Total Capacity" />
          <Slider bind:value={currentBookings} min={0} max={capacity - 100} step={50} label="Current Bookings" />
          <Slider bind:value={timeRemaining} min={10} max={100} step={5} label="Time Remaining (%)" />
        </div>
      </div>

      <div class="glass-card p-6 border-amber-350/30">
        <h3 class="font-display text-lg font-semibold text-amber-350 mb-4">📊 Pricing Recommendation</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-obsidian-300">Base Price</span>
            <span class="font-mono text-obsidian-200">${basePrice}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Optimal Price</span>
            <span class="font-mono text-jade-400">${optimalPrice().toFixed(0)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-obsidian-300">Premium</span>
            <span class="font-mono text-amber-350">+{((optimalPrice() / basePrice - 1) * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div class="mt-4 p-3 bg-obsidian-800/50 rounded-lg text-xs text-obsidian-400">
          {#if utilizationForecast > 100}
            ⚠️ Projected to sell out! Raise prices.
          {:else if utilizationForecast < 70}
            📉 Low demand. Consider promotions.
          {:else}
            ✓ On track. Dynamic pricing optimal.
          {/if}
        </div>
      </div>
    </div>

    <div class="lg:col-span-2 space-y-6">
      <!-- Revenue Comparison -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Revenue Comparison</h3>
        <div class="grid grid-cols-3 gap-4">
          <div class="p-4 bg-obsidian-800/50 rounded-lg text-center">
            <div class="text-xs text-obsidian-400 mb-1">Fixed Price</div>
            <div class="font-mono text-2xl text-obsidian-200">${(scenarios().fixed / 1000).toFixed(0)}K</div>
          </div>
          <div class="p-4 bg-jade-500/20 border border-jade-500/30 rounded-lg text-center">
            <div class="text-xs text-jade-400 mb-1">Dynamic Pricing</div>
            <div class="font-mono text-2xl text-jade-400">${(scenarios().dynamic / 1000).toFixed(0)}K</div>
          </div>
          <div class="p-4 bg-amber-350/20 border border-amber-350/30 rounded-lg text-center">
            <div class="text-xs text-amber-350 mb-1">Uplift</div>
            <div class="font-mono text-2xl text-amber-350">+${(scenarios().gain / 1000).toFixed(0)}K</div>
            <div class="text-xs text-jade-400">+{(scenarios().gain / scenarios().fixed * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      <!-- Booking Curve -->
      <div class="glass-card p-6">
        <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4">Dynamic Pricing Over Time</h3>
        <div class="h-48">
          <LineChart 
            labels={timeLabels}
            datasets={[
              {
                label: 'Bookings',
                data: bookingCurve().bookings,
                borderColor: '#34d399',
                fill: false
              },
              {
                label: 'Price ($)',
                data: bookingCurve().prices,
                borderColor: '#f5c542',
                fill: false
              }
            ]}
            xAxisLabel="Time to Event"
            yAxisLabel="Value"
          />
        </div>
        <p class="mt-3 text-xs text-obsidian-400">
          As capacity fills and deadline approaches, prices rise. Late bookers pay premium.
        </p>
      </div>
    </div>
  </div>

  <!-- Key Levers -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🎛️ Pricing Levers</h2>
    <div class="grid md:grid-cols-4 gap-4">
      {#each levers as lever}
        <div class="p-4 bg-obsidian-800/50 rounded-lg">
          <h3 class="text-amber-350 font-semibold mb-2">{lever.name}</h3>
          <p class="text-xs text-obsidian-300 mb-2">{lever.desc}</p>
          <p class="text-xs text-jade-400">Ex: {lever.example}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- R Code -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">
      <span class="text-blue-400">R</span> Code Equivalent
    </h2>
    <pre class="code-block text-sm overflow-x-auto"><code class="text-obsidian-300"># Revenue management pricing
calculate_optimal_price &lt;- function(capacity, booked, time_remaining, base_price) {'{'} 
  remaining &lt;- capacity - booked
  urgency &lt;- 1 - time_remaining / 100
  scarcity &lt;- 1 - remaining / capacity
  
  # Price multiplier based on urgency and scarcity
  multiplier &lt;- 1 + scarcity * 0.5 + urgency * 0.3
  optimal_price &lt;- base_price * multiplier
  
  return(optimal_price)
{'}'}

# Simulate revenue
compare_strategies &lt;- function(capacity, base_price) {'{'} 
  # Fixed pricing
  fixed_rev &lt;- capacity * base_price * 0.85  # 85% utilization
  
  # Dynamic pricing (sells out at premium)
  dynamic_rev &lt;- capacity * base_price * 1.15  # Higher avg price
  
  list(fixed = fixed_rev, dynamic = dynamic_rev,
       uplift = (dynamic_rev - fixed_rev) / fixed_rev)
{'}'}

result &lt;- compare_strategies({capacity}, {basePrice})
cat(sprintf("Uplift: +%.0f%%\n", result$uplift * 100))</code></pre>
  </div>

  <!-- Key Takeaways -->
  <div class="glass-card p-6 border-jade-500/30">
    <h2 class="font-display text-xl font-semibold text-jade-400 mb-4">✅ Key Takeaways</h2>
    <div class="grid md:grid-cols-2 gap-4 text-sm">
      <ul class="space-y-2 text-obsidian-300">
        <li>• Revenue mgmt: price based on capacity + time</li>
        <li>• Perishable inventory = must sell before deadline</li>
        <li>• Dynamic &gt; fixed when demand varies</li>
      </ul>
      <ul class="space-y-2 text-obsidian-300">
        <li>• Raise prices as capacity fills</li>
        <li>• Raise prices as deadline approaches</li>
        <li>• Segment customers by willingness to pay</li>
      </ul>
    </div>
  </div>
</div>

