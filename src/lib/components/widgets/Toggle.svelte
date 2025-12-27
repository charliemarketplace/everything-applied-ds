<script lang="ts">
  let { 
    checked = $bindable(false),
    label = '',
    description = ''
  } = $props();
</script>

<label class="flex items-center justify-between cursor-pointer group">
  <div>
    <span class="text-sm font-medium text-obsidian-200 group-hover:text-obsidian-50 transition-colors">
      {label}
    </span>
    {#if description}
      <p class="text-xs text-obsidian-500">{description}</p>
    {/if}
  </div>
  
  <div class="relative">
    <input type="checkbox" bind:checked class="sr-only peer" />
    <div class="w-11 h-6 bg-obsidian-700 rounded-full peer 
                peer-checked:bg-amber-350/30 
                peer-focus:ring-2 peer-focus:ring-amber-350/25
                transition-colors">
    </div>
    <div class="absolute left-1 top-1 w-4 h-4 bg-obsidian-400 rounded-full 
                peer-checked:translate-x-5 peer-checked:bg-amber-350
                transition-all shadow-md">
    </div>
  </div>
</label>

