# Content Creation Guide

Guidelines for creating new tutorial pages in this project.

---

## 📐 Page Structure Template

Every model/concept page should follow this structure:

```svelte
<script lang="ts">
  // 1. Imports
  import Slider from '$lib/components/widgets/Slider.svelte';
  import LineChart from '$lib/components/charts/LineChart.svelte';
  
  // 2. State variables
  let param1 = $state(initialValue);
  
  // 3. Derived calculations
  const result = $derived(calculateSomething(param1));
</script>

<svelte:head>
  <title>Topic Name | Pricing Models</title>
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8">
  <!-- Header with badges -->
  <!-- Key Concepts section -->
  <!-- Formula/Definition card -->
  <!-- Interactive Demo (main focus!) -->
  <!-- Use Cases / Applications -->
  <!-- R Code Equivalent -->
  <!-- Key Takeaways -->
</div>
```

---

## 🎯 Required Sections

### 1. Header
- Badge indicating category (Core Model, Pricing, Risk, etc.)
- Badge indicating interactivity level
- Clear title and subtitle explaining the concept

### 2. Key Concepts
- 3-4 bullet points explaining the core idea
- Visual aids where helpful
- Formula in proper notation

### 3. Interactive Demo (MOST IMPORTANT)
- Sliders for adjustable parameters
- Real-time chart updates
- Clear visualization of concept
- Immediate feedback on changes

### 4. Sports Pricing Application
- How this applies to PrizePicks/sports betting
- Concrete examples
- Connection to real-world scenarios

### 5. R Code Equivalent
- Show how to implement in R
- Include comments
- Match the parameters from the demo

### 6. Key Takeaways
- 4-6 bullet points summarizing learnings
- Practical tips

---

## 🎨 Styling Guidelines

### Cards
```svelte
<div class="glass-card p-6">
  <!-- Content -->
</div>
```

### Highlighted Cards
```svelte
<div class="glass-card p-6 border-amber-350/30">
  <!-- Important content -->
</div>
```

### Formulas
```svelte
<div class="formula">
  f* = (bp - q) / b
</div>
```

### Code Blocks
```svelte
<pre class="code-block"><code>
  # R code here
</code></pre>
```

### Badges
```svelte
<span class="badge-amber">Category</span>
<span class="badge-jade">Status</span>
<span class="badge-crimson">Warning</span>
```

---

## 📊 Chart Components

### LineChart
```svelte
<LineChart 
  labels={['Jan', 'Feb', 'Mar']}
  datasets={[
    { label: 'Series 1', data: [1, 2, 3], borderColor: '#f5c542' }
  ]}
  xAxisLabel="Month"
  yAxisLabel="Value"
/>
```

### HistogramChart
```svelte
<HistogramChart 
  data={[{ bin: 10, count: 5 }, { bin: 20, count: 8 }]}
  highlightRange={{ min: 15, max: 25 }}
/>
```

### BarChart
```svelte
<BarChart 
  labels={['A', 'B', 'C']}
  data={[10, 20, 15]}
  color="#f5c542"
/>
```

---

## 🔢 Synthetic Data

Use the utilities in `$lib/utils/synthetic-data.ts`:

```typescript
import { 
  createRNG,
  normalRandom,
  generatePlayerStats,
  runMonteCarloSimulation,
  bayesianUpdate,
  kellyFraction,
  expectedValue
} from '$lib/utils/synthetic-data';

// Seeded random for reproducibility
const rng = createRNG(42);
const value = normalRandom(rng, mean, std);

// Monte Carlo simulation
const result = runMonteCarloSimulation(
  (rng) => normalRandom(rng, 25, 5),
  10000,
  42
);
```

---

## ✅ Quality Checklist

Before considering a page complete:

- [ ] Interactive elements work correctly
- [ ] Charts update in real-time with parameter changes
- [ ] R code example matches the interactive demo
- [ ] Sports pricing application is clear
- [ ] Mobile responsive
- [ ] Accessible (proper labels, ARIA)
- [ ] Page title set correctly
- [ ] Added to navigation in `navigation.ts`
- [ ] No console errors
- [ ] Key takeaways section present

---

## 📁 File Organization

```
src/routes/
├── models/           # Core statistical models
│   ├── bayesian/
│   ├── monte-carlo/
│   └── ...
├── pricing/          # Pricing frameworks
│   ├── expected-value/
│   ├── kelly/
│   └── ...
├── risk/             # Risk management
├── sports/           # Sports-specific models
├── behavioral/       # Behavioral economics
├── dynamic/          # Dynamic pricing
├── optimization/     # Optimization methods
├── econometrics/     # Econometric models
├── ml/               # Machine learning
├── business/         # Business frameworks
├── market/           # Market analysis
├── metrics/          # Evaluation metrics
└── infra/            # Infrastructure
```

