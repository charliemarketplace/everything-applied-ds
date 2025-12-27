<script lang="ts">
  let { 
    value = $bindable(50),
    min = 0, 
    max = 100, 
    step = 1,
    label = '',
    unit = '',
    showValue = true
  } = $props();

  const percentage = $derived(((value - min) / (max - min)) * 100);
</script>

<div class="space-y-2">
  {#if label || showValue}
    <div class="widget-label">
      <span>{label}</span>
      {#if showValue}
        <span class="widget-value">{value}{unit}</span>
      {/if}
    </div>
  {/if}
  
  <div class="relative">
    <input
      type="range"
      bind:value
      {min}
      {max}
      {step}
      class="w-full h-2 bg-obsidian-700 rounded-full appearance-none cursor-pointer
             [&::-webkit-slider-thumb]:appearance-none
             [&::-webkit-slider-thumb]:w-5
             [&::-webkit-slider-thumb]:h-5
             [&::-webkit-slider-thumb]:bg-amber-350
             [&::-webkit-slider-thumb]:rounded-full
             [&::-webkit-slider-thumb]:shadow-lg
             [&::-webkit-slider-thumb]:cursor-pointer
             [&::-webkit-slider-thumb]:transition-transform
             [&::-webkit-slider-thumb]:hover:scale-110
             [&::-moz-range-thumb]:w-5
             [&::-moz-range-thumb]:h-5
             [&::-moz-range-thumb]:bg-amber-350
             [&::-moz-range-thumb]:rounded-full
             [&::-moz-range-thumb]:border-0
             [&::-moz-range-thumb]:shadow-lg
             [&::-moz-range-thumb]:cursor-pointer"
      style="background: linear-gradient(to right, rgb(245, 197, 66) {percentage}%, rgb(65, 67, 74) {percentage}%)"
    />
  </div>

  <div class="flex justify-between text-xs text-obsidian-500">
    <span>{min}{unit}</span>
    <span>{max}{unit}</span>
  </div>
</div>

