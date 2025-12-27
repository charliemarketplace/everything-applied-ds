<script lang="ts">
  let { sidebarOpen = $bindable(true) } = $props();
</script>

<header class="sticky top-0 z-40 border-b border-obsidian-800 bg-obsidian-950/80 backdrop-blur-lg">
  <div class="flex items-center justify-between h-16 px-6">
    <div class="flex items-center gap-4">
      <!-- Toggle sidebar button -->
      <button 
        onclick={() => sidebarOpen = !sidebarOpen}
        class="p-2 text-obsidian-400 hover:text-amber-350 hover:bg-obsidian-800/50 rounded-lg transition-all"
        aria-label="Toggle sidebar"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {#if sidebarOpen}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          {:else}
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          {/if}
        </svg>
      </button>

      <!-- Breadcrumb or title could go here -->
    </div>

    <div class="flex items-center gap-4">
      <!-- Search -->
      <div class="hidden md:flex items-center">
        <div class="relative">
          <input 
            type="text" 
            placeholder="Search models..." 
            class="w-64 px-4 py-2 pl-10 bg-obsidian-800/50 border border-obsidian-700 rounded-lg text-sm
                   text-obsidian-100 placeholder-obsidian-400 focus:outline-none focus:border-amber-350/50"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-obsidian-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Progress indicator -->
      <div class="flex items-center gap-2 px-3 py-1.5 bg-obsidian-800/50 rounded-lg border border-obsidian-700">
        <div class="w-2 h-2 rounded-full bg-jade-400 animate-pulse"></div>
        <span class="text-sm text-obsidian-300">0/70</span>
        <span class="text-xs text-obsidian-500">completed</span>
      </div>
    </div>
  </div>
</header>

