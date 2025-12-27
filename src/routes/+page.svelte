<script lang="ts">
  import { navigation } from '$lib/data/navigation';
  import ProgressRing from '$lib/components/ProgressRing.svelte';

  const stats = [
    { label: 'Models Covered', value: '70+', icon: '📊' },
    { label: 'Interactive Demos', value: '50+', icon: '🎮' },
    { label: 'Practice Problems', value: '100+', icon: '✏️' },
    { label: 'Categories', value: '13', icon: '📁' }
  ];

  const featuredTopics = [
    {
      title: 'Bayesian Updating',
      description: 'Real-time line adjustments as information arrives',
      path: '/models/bayesian',
      color: 'from-blue-500 to-purple-600',
      icon: '📊'
    },
    {
      title: 'Kelly Criterion',
      description: 'Optimal bet sizing and bankroll management',
      path: '/pricing/kelly',
      color: 'from-emerald-500 to-teal-600',
      icon: '📐'
    },
    {
      title: 'Monte Carlo Simulation',
      description: 'Model uncertainty and estimate distributions',
      path: '/models/monte-carlo',
      color: 'from-orange-500 to-red-600',
      icon: '🎲'
    },
    {
      title: 'Expected Value',
      description: 'Fundamental to all betting pricing',
      path: '/pricing/expected-value',
      color: 'from-amber-400 to-orange-500',
      icon: '💰'
    }
  ];
</script>

<svelte:head>
  <title>Pricing Models & Frameworks | Interactive Tutorial</title>
</svelte:head>

<div class="max-w-7xl mx-auto space-y-12">
  <!-- Hero Section -->
  <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-900 via-obsidian-900 to-obsidian-800 border border-obsidian-700/50 p-8 md:p-12">
    <div class="absolute inset-0 bg-grid-pattern opacity-30"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-amber-350/10 to-transparent"></div>
    
    <div class="relative z-10">
      <div class="flex items-center gap-3 mb-6">
        <span class="badge-amber">Interactive Learning</span>
        <span class="badge-jade">70+ Models</span>
      </div>

      <h1 class="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-obsidian-50 mb-4">
        Pricing Models &
        <span class="text-gradient">Frameworks</span>
      </h1>
      
      <p class="text-lg md:text-xl text-obsidian-300 max-w-2xl mb-8">
        Master sports betting pricing with interactive tutorials, synthetic data simulations, 
        and hands-on calculators. From Bayesian inference to Kelly criterion.
      </p>

      <div class="flex flex-wrap gap-4">
        <a href="/quickstart" class="btn-primary">
          Get Started
          <span class="ml-2">→</span>
        </a>
        <a href="/playground" class="btn-secondary">
          Open Playground
        </a>
      </div>
    </div>
  </section>

  <!-- Stats -->
  <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
    {#each stats as stat, i}
      <div class="glass-card p-6 text-center animate-fade-in" style="animation-delay: {i * 100}ms">
        <div class="text-3xl mb-2">{stat.icon}</div>
        <div class="font-display text-2xl font-bold text-amber-350">{stat.value}</div>
        <div class="text-sm text-obsidian-400">{stat.label}</div>
      </div>
    {/each}
  </section>

  <!-- Featured Topics -->
  <section>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="section-title">Featured Topics</h2>
        <p class="section-subtitle">Start with these foundational concepts</p>
      </div>
    </div>

    <div class="grid md:grid-cols-2 gap-6">
      {#each featuredTopics as topic, i}
        <a 
          href={topic.path}
          class="glass-card-hover p-6 group animate-slide-up"
          style="animation-delay: {i * 100}ms"
        >
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 rounded-xl bg-gradient-to-br {topic.color} flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
              {topic.icon}
            </div>
            <div class="flex-1">
              <h3 class="font-display text-xl font-semibold text-obsidian-50 mb-1 group-hover:text-amber-350 transition-colors">
                {topic.title}
              </h3>
              <p class="text-obsidian-400 text-sm">{topic.description}</p>
            </div>
            <svg class="w-5 h-5 text-obsidian-500 group-hover:text-amber-350 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>
      {/each}
    </div>
  </section>

  <!-- All Categories -->
  <section>
    <div class="mb-6">
      <h2 class="section-title">All Categories</h2>
      <p class="section-subtitle">Explore the complete curriculum</p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each navigation.slice(1) as section, i}
        <div class="glass-card p-6 animate-fade-in" style="animation-delay: {i * 50}ms">
          <h3 class="font-display text-lg font-semibold text-obsidian-100 mb-4 flex items-center gap-2">
            {section.title}
            <span class="badge-amber text-[10px]">{section.items.length}</span>
          </h3>
          <ul class="space-y-2">
            {#each section.items.slice(0, 4) as item}
              <li>
                <a 
                  href={item.path}
                  class="flex items-center gap-2 text-sm text-obsidian-400 hover:text-amber-350 transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            {/each}
            {#if section.items.length > 4}
              <li class="text-xs text-obsidian-500 pt-1">
                +{section.items.length - 4} more...
              </li>
            {/if}
          </ul>
        </div>
      {/each}
    </div>
  </section>

  <!-- Learning Path -->
  <section class="glass-card p-8">
    <h2 class="section-title mb-6">Recommended Learning Path</h2>
    
    <div class="relative">
      <!-- Timeline line -->
      <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-350 via-jade-500 to-obsidian-600"></div>
      
      <div class="space-y-8">
        {#each [
          { phase: 'Foundation', items: ['Expected Value', 'Implied Probability', 'Regression Models'], status: 'ready' },
          { phase: 'Intermediate', items: ['Bayesian Updating', 'Monte Carlo', 'Kelly Criterion'], status: 'ready' },
          { phase: 'Advanced', items: ['Correlation Analysis', 'VaR', 'Market Making'], status: 'ready' },
          { phase: 'Expert', items: ['Reinforcement Learning', 'Game Theory', 'MLOps'], status: 'ready' }
        ] as step, i}
          <div class="relative pl-16">
            <div class="absolute left-4 top-0 w-5 h-5 rounded-full border-2 border-amber-350 bg-obsidian-900 flex items-center justify-center">
              <div class="w-2 h-2 rounded-full bg-amber-350"></div>
            </div>
            <div>
              <h4 class="font-display text-lg font-semibold text-obsidian-100 mb-2">
                Phase {i + 1}: {step.phase}
              </h4>
              <div class="flex flex-wrap gap-2">
                {#each step.items as item}
                  <span class="px-3 py-1 bg-obsidian-800 border border-obsidian-700 rounded-full text-sm text-obsidian-300">
                    {item}
                  </span>
                {/each}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </section>
</div>

