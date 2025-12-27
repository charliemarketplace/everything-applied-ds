<script lang="ts">
  import { navigation, allTopics } from '$lib/data/navigation';
  import ProgressRing from '$lib/components/ProgressRing.svelte';
  import { browser } from '$app/environment';

  // Load from localStorage on init
  let completedTopics = $state<Set<string>>(new Set());
  
  // Load saved progress on mount
  $effect(() => {
    if (browser) {
      const saved = localStorage.getItem('pricingModels_completedTopics');
      if (saved) {
        try {
          completedTopics = new Set(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load progress:', e);
        }
      }
    }
  });
  
  const totalTopics = $derived(allTopics.length);
  const completedCount = $derived(completedTopics.size);
  const progressPercent = $derived((completedCount / totalTopics) * 100);

  function toggleTopic(path: string) {
    const newSet = new Set(completedTopics);
    if (newSet.has(path)) {
      newSet.delete(path);
    } else {
      newSet.add(path);
    }
    completedTopics = newSet;
    
    // Save to localStorage
    if (browser) {
      localStorage.setItem('pricingModels_completedTopics', JSON.stringify([...newSet]));
    }
  }

  function isCompleted(path: string): boolean {
    return completedTopics.has(path);
  }

  function getSectionProgress(section: typeof navigation[0]) {
    const completed = section.items.filter(i => completedTopics.has(i.path)).length;
    return { completed, total: section.items.length, percent: (completed / section.items.length) * 100 };
  }

  // Milestones
  const milestones = [
    { percent: 10, label: 'Getting Started', reward: '🌱' },
    { percent: 25, label: 'Foundation Builder', reward: '🏗️' },
    { percent: 50, label: 'Halfway There', reward: '⭐' },
    { percent: 75, label: 'Advanced Learner', reward: '🚀' },
    { percent: 100, label: 'Pricing Master', reward: '👑' }
  ];

  // Helper to check if milestone is achieved
  function isMilestoneAchieved(milestonePercent: number): boolean {
    return progressPercent >= milestonePercent;
  }

  // Helper for item classes
  function getItemClasses(path: string): string {
    const completed = completedTopics.has(path);
    return completed 
      ? 'bg-jade-500/20 border border-jade-500/30' 
      : 'bg-obsidian-800/30';
  }

  function getItemTextClass(path: string): string {
    return completedTopics.has(path) ? 'text-jade-400' : 'text-obsidian-300';
  }
</script>

<svelte:head>
  <title>Progress Tracker | Pricing Models</title>
</svelte:head>

<div class="max-w-5xl mx-auto space-y-8">
  <!-- Header -->
  <div class="space-y-4">
    <h1 class="section-title">Progress Tracker</h1>
    <p class="section-subtitle">Track your learning journey through all 70+ topics</p>
  </div>

  <!-- Overall Progress -->
  <div class="glass-card p-8">
    <div class="flex flex-col md:flex-row items-center gap-8">
      <ProgressRing progress={progressPercent} size={120} strokeWidth={8} />
      <div class="flex-1 text-center md:text-left">
        <h2 class="font-display text-3xl font-bold text-obsidian-50 mb-2">
          {completedCount} / {totalTopics} Topics
        </h2>
        <p class="text-obsidian-400 mb-4">
          {#if progressPercent === 0}
            Start your journey! Click on topics below to mark them complete.
          {:else if progressPercent < 25}
            Great start! Keep building those foundations.
          {:else if progressPercent < 50}
            Making solid progress! You're getting into the good stuff.
          {:else if progressPercent < 75}
            Over halfway! The advanced topics await.
          {:else if progressPercent < 100}
            Almost there! Final push to mastery.
          {:else}
            🎉 Congratulations! You've mastered all topics!
          {/if}
        </p>
        
        <!-- Progress bar -->
        <div class="h-3 bg-obsidian-700 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-amber-350 to-amber-450 transition-all duration-500"
            style="width: {progressPercent}%"
          ></div>
        </div>
      </div>
    </div>
  </div>

  <!-- Milestones -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-6">🏆 Milestones</h2>
    <div class="flex justify-between">
      {#each milestones as milestone}
        {@const achieved = isMilestoneAchieved(milestone.percent)}
        <div class="text-center">
          <div 
            class="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-2xl transition-all duration-300 {achieved ? 'bg-amber-350' : 'bg-obsidian-700 grayscale opacity-50'}"
          >
            {milestone.reward}
          </div>
          <div class="text-xs {achieved ? 'text-amber-350' : 'text-obsidian-500'}">
            {milestone.label}
          </div>
          <div class="text-xs text-obsidian-500">{milestone.percent}%</div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Section by Section -->
  <div class="space-y-4">
    <h2 class="section-title">By Category</h2>
    
    {#each navigation.slice(1) as section}
      {@const progress = getSectionProgress(section)}
      <div class="glass-card p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <h3 class="font-display text-lg font-semibold text-obsidian-100">{section.title}</h3>
            <span class="text-sm text-obsidian-400">{progress.completed}/{progress.total}</span>
          </div>
          <div class="w-24 h-2 bg-obsidian-700 rounded-full overflow-hidden">
            <div 
              class="h-full bg-amber-350 transition-all duration-300"
              style="width: {progress.percent}%"
            ></div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {#each section.items as item}
            {@const completed = isCompleted(item.path)}
            <button
              onclick={() => toggleTopic(item.path)}
              class="p-3 rounded-lg text-left text-sm transition-all duration-200 hover:bg-obsidian-700/50 {getItemClasses(item.path)}"
            >
              <div class="flex items-center gap-2">
                <span class="text-base">{item.icon}</span>
                <span class="{getItemTextClass(item.path)}">
                  {item.label}
                </span>
                {#if completed}
                  <span class="ml-auto text-jade-400">✓</span>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Storage Info -->
  <div class="glass-card p-6">
    <h2 class="font-display text-xl font-semibold text-obsidian-100 mb-4">💾 Your Progress</h2>
    <div class="p-4 bg-jade-500/10 border border-jade-500/30 rounded-lg mb-4">
      <p class="text-sm text-jade-400 flex items-center gap-2">
        <span>✓</span>
        <span>Progress is saved automatically to your browser's local storage.</span>
      </p>
      <p class="text-xs text-obsidian-400 mt-2">
        Data stays on your device and persists across sessions. Clearing browser data will reset progress.
      </p>
    </div>
    <div class="flex gap-4">
      <button 
        onclick={() => {
          completedTopics = new Set();
          if (browser) localStorage.removeItem('pricingModels_completedTopics');
        }}
        class="btn-secondary text-sm py-2 text-crimson-400 border-crimson-500/30 hover:border-crimson-500"
      >
        Reset All Progress
      </button>
    </div>
  </div>
</div>
