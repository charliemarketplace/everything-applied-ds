<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  let { 
    value = $bindable(''),
    options = [] as Option[],
    label = '',
    placeholder = 'Select...'
  } = $props();
</script>

<div class="space-y-2">
  {#if label}
    <label class="widget-label">
      <span>{label}</span>
    </label>
  {/if}
  
  <div class="relative">
    <select
      bind:value
      class="w-full px-4 py-3 bg-obsidian-800/50 border border-obsidian-600 rounded-lg
             text-obsidian-100 appearance-none cursor-pointer
             focus:outline-none focus:border-amber-350/50 focus:ring-1 focus:ring-amber-350/25
             transition-all"
    >
      <option value="" disabled>{placeholder}</option>
      {#each options as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
    <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>

