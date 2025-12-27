<script lang="ts">
  import { navigation } from '$lib/data/navigation';

  let { isOpen = $bindable(true), currentPath = '/' } = $props();

  function isActive(path: string): boolean {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  }
</script>

<aside 
  class="fixed left-0 top-0 h-full w-64 bg-obsidian-950 border-r border-obsidian-800 z-50 
         transition-transform duration-300 overflow-y-auto"
  class:translate-x-0={isOpen}
  class:-translate-x-full={!isOpen}
>
  <!-- Logo / Brand -->
  <div class="h-16 flex items-center px-6 border-b border-obsidian-800">
    <a href="/" class="flex items-center gap-3">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-350 to-amber-450 flex items-center justify-center">
        <span class="text-obsidian-950 font-bold text-sm">PM</span>
      </div>
      <div>
        <h1 class="font-display text-lg font-semibold text-obsidian-50">Pricing Models</h1>
        <p class="text-xs text-obsidian-500">Interactive Guide</p>
      </div>
    </a>
  </div>

  <!-- Navigation -->
  <nav class="p-4 space-y-2">
    {#each navigation as section}
      <div class="sidebar-section">
        <h3 class="sidebar-heading">{section.title}</h3>
        <ul class="space-y-1">
          {#each section.items as item}
            <li>
              <a 
                href={item.path}
                class="sidebar-link flex items-center gap-3"
                class:active={isActive(item.path)}
              >
                <span class="text-lg">{item.icon}</span>
                <span>{item.label}</span>
                {#if item.badge}
                  <span class="ml-auto badge-amber text-[10px]">{item.badge}</span>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </nav>

  <!-- Bottom section -->
  <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-obsidian-800 bg-obsidian-950">
    <a href="/progress" class="flex items-center gap-3 px-3 py-2 text-sm text-obsidian-300 hover:text-amber-350 rounded-lg hover:bg-obsidian-800/50 transition-all">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span>Progress Tracker</span>
    </a>
    <a href="/notes" class="flex items-center gap-3 px-3 py-2 text-sm text-obsidian-300 hover:text-amber-350 rounded-lg hover:bg-obsidian-800/50 transition-all">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span>My Notes</span>
    </a>
  </div>
</aside>

