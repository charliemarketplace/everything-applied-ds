<script lang="ts">
  import '../app.css';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Header from '$lib/components/Header.svelte';
  import { page } from '$app/stores';

  let { children } = $props();
  let sidebarOpen = $state(true);
</script>

<div class="min-h-screen flex">
  <!-- Sidebar -->
  <Sidebar bind:isOpen={sidebarOpen} currentPath={$page.url.pathname} />

  <!-- Main content area -->
  <div class="flex-1 flex flex-col min-h-screen transition-all duration-300" 
       class:ml-64={sidebarOpen} class:ml-0={!sidebarOpen}>
    
    <Header bind:sidebarOpen />

    <main class="flex-1 p-6 lg:p-8">
      {@render children()}
    </main>

    <!-- Footer -->
    <footer class="border-t border-obsidian-800 py-6 px-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-obsidian-400">
        <p>Pricing Models & Frameworks Tutorial</p>
        <p>Built for mastery · Interactive learning</p>
      </div>
    </footer>
  </div>
</div>

