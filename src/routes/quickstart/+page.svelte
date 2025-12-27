<script lang="ts">
  import { navigation } from '$lib/data/navigation';
  
  const phases = [
    {
      title: 'Phase 1: Foundations',
      duration: '~2 hours',
      icon: '🏗️',
      topics: [
        { path: '/pricing/expected-value', name: 'Expected Value', key: 'The fundamental building block' },
        { path: '/pricing/implied-prob', name: 'Implied Probability', key: 'Converting odds to probabilities' },
        { path: '/models/regression', name: 'Regression Models', key: 'Predicting player outcomes' }
      ]
    },
    {
      title: 'Phase 2: Core Statistical Models',
      duration: '~4 hours',
      icon: '📊',
      topics: [
        { path: '/models/bayesian', name: 'Bayesian Updating', key: 'Real-time line adjustments' },
        { path: '/models/monte-carlo', name: 'Monte Carlo Simulation', key: 'Modeling uncertainty' },
        { path: '/pricing/kelly', name: 'Kelly Criterion', key: 'Optimal bet sizing' }
      ]
    },
    {
      title: 'Phase 3: Risk & Pricing',
      duration: '~4 hours',
      icon: '⚖️',
      topics: [
        { path: '/risk/correlation', name: 'Correlation Analysis', key: 'Managing correlated picks' },
        { path: '/risk/var', name: 'Value at Risk', key: 'Worst-case scenarios' },
        { path: '/pricing/market-making', name: 'Market Making', key: 'Balancing the book' }
      ]
    },
    {
      title: 'Phase 4: Advanced Topics',
      duration: '~6 hours',
      icon: '🚀',
      topics: [
        { path: '/models/ensemble', name: 'Ensemble Methods', key: 'Combining multiple models' },
        { path: '/optimization/rl', name: 'Reinforcement Learning', key: 'Adaptive pricing' },
        { path: '/market/game-theory', name: 'Game Theory', key: 'Strategic interactions' }
      ]
    }
  ];

  const prerequisites = [
    { topic: 'Basic Probability', level: 'Essential', desc: 'Probability distributions, expected value, variance' },
    { topic: 'Statistics', level: 'Essential', desc: 'Hypothesis testing, confidence intervals, regression' },
    { topic: 'Calculus', level: 'Helpful', desc: 'Optimization, derivatives (for understanding derivations)' },
    { topic: 'Python/R/JS', level: 'Essential', desc: 'Any one language for running simulations' },
    { topic: 'Sports Knowledge', level: 'Helpful', desc: 'Understanding of sports betting markets' }
  ];

  function getPrereqClasses(level: string): string {
    return level === 'Essential' 
      ? 'bg-amber-350/20 text-amber-350' 
      : 'bg-obsidian-700 text-obsidian-400';
  }
</script>

<svelte:head>
  <title>Quick Start | Pricing Models</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="badge-amber">Getting Started</span>
    </div>
    <h1 class="section-title">Quick Start Guide</h1>
    <p class="section-subtitle max-w-3xl">
      A structured path to mastering sports pricing models. 
      Follow this roadmap from foundations to advanced topics.
    </p>
  </div>

  <!-- Prerequisites -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">📋 Prerequisites</h2>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each prerequisites as prereq}
        <div class="p-4 bg-obsidian-800/30 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-semibold text-obsidian-100">{prereq.topic}</h3>
            <span class="text-xs px-2 py-0.5 rounded-full {getPrereqClasses(prereq.level)}">
              {prereq.level}
            </span>
          </div>
          <p class="text-xs text-obsidian-400">{prereq.desc}</p>
        </div>
      {/each}
    </div>
  </div>

  <!-- Learning Path -->
  <div class="space-y-6">
    <h2 class="section-title">Learning Path</h2>
    
    {#each phases as phase, i}
      <div class="glass-card p-6 relative overflow-hidden">
        <!-- Phase indicator -->
        <div class="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-amber-350 to-amber-450"></div>
        
        <div class="flex items-start gap-4 ml-4">
          <div class="text-3xl">{phase.icon}</div>
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-4">
              <h3 class="font-display text-xl font-semibold text-obsidian-100">{phase.title}</h3>
              <span class="text-xs text-obsidian-400">{phase.duration}</span>
            </div>
            
            <div class="grid md:grid-cols-3 gap-4">
              {#each phase.topics as topic}
                <a 
                  href={topic.path}
                  class="p-4 bg-obsidian-800/30 rounded-lg hover:bg-obsidian-800/50 hover:border-amber-350/30 border border-transparent transition-all group"
                >
                  <h4 class="font-semibold text-obsidian-100 group-hover:text-amber-350 transition-colors mb-1">
                    {topic.name}
                  </h4>
                  <p class="text-xs text-obsidian-400">{topic.key}</p>
                </a>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Quick Tips -->
  <div class="grid md:grid-cols-2 gap-6">
    <div class="glass-card p-6">
      <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">💡 Learning Tips</h2>
      <ul class="space-y-3 text-sm text-obsidian-300">
        <li class="flex items-start gap-2">
          <span class="text-jade-400">✓</span>
          <span>Use the interactive widgets - don't just read, experiment!</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-jade-400">✓</span>
          <span>Run the R/Python code examples in your own environment</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-jade-400">✓</span>
          <span>Try the Playground to combine multiple concepts</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-jade-400">✓</span>
          <span>Take notes using the built-in note system</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-jade-400">✓</span>
          <span>Focus on intuition first, then formulas</span>
        </li>
      </ul>
    </div>

    <div class="glass-card p-6">
      <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">🎯 Key Connections</h2>
      <ul class="space-y-3 text-sm text-obsidian-300">
        <li class="flex items-start gap-2">
          <span class="text-amber-350">→</span>
          <span><strong>EV + Kelly:</strong> EV tells you IF to bet, Kelly tells you HOW MUCH</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-amber-350">→</span>
          <span><strong>Bayesian + Monte Carlo:</strong> Update beliefs then simulate outcomes</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-amber-350">→</span>
          <span><strong>Correlation + VaR:</strong> Correlated bets amplify risk</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-amber-350">→</span>
          <span><strong>Regression + Ensemble:</strong> Combine models for better predictions</span>
        </li>
      </ul>
    </div>
  </div>

  <!-- Start Button -->
  <div class="text-center py-8">
    <a href="/pricing/expected-value" class="btn-primary text-lg px-8 py-4">
      Start with Expected Value →
    </a>
  </div>
</div>
