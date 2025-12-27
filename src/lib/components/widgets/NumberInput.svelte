<script lang="ts">
  let { 
    value = $bindable(0),
    min = -Infinity, 
    max = Infinity, 
    step = 1,
    label = '',
    unit = '',
    precision = 2
  } = $props();

  let inputId = `number-input-${crypto.randomUUID()}`;

  function increment() {
    value = Math.min(max, Math.round((value + step) * 1000) / 1000);
  }

  function decrement() {
    value = Math.max(min, Math.round((value - step) * 1000) / 1000);
  }
</script>

<div class="space-y-2">
  {#if label}
    <label for={inputId} class="widget-label">
      <span>{label}</span>
    </label>
  {/if}
  
  <div class="flex items-center">
    <button
      onclick={decrement}
      class="px-3 py-2 bg-obsidian-800 border border-obsidian-600 rounded-l-lg text-obsidian-300 
             hover:bg-obsidian-700 hover:text-amber-350 transition-colors"
      aria-label="Decrease value"
    >
      −
    </button>
    <div class="flex-1 relative">
      <input
        id={inputId}
        type="number"
        bind:value
        {min}
        {max}
        {step}
        class="w-full px-4 py-2 bg-obsidian-800/50 border-y border-obsidian-600 text-center
               text-obsidian-100 font-mono focus:outline-none focus:border-amber-350/50
               [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      {#if unit}
        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-obsidian-500 text-sm">{unit}</span>
      {/if}
    </div>
    <button
      onclick={increment}
      class="px-3 py-2 bg-obsidian-800 border border-obsidian-600 rounded-r-lg text-obsidian-300 
             hover:bg-obsidian-700 hover:text-amber-350 transition-colors"
      aria-label="Increase value"
    >
      +
    </button>
  </div>
</div>

