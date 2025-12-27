<script lang="ts">
  let { progress = 0, size = 60, strokeWidth = 4 } = $props();
  
  const radius = $derived((size - strokeWidth) / 2);
  const circumference = $derived(radius * 2 * Math.PI);
  const offset = $derived(circumference - (progress / 100) * circumference);
</script>

<svg width={size} height={size} class="progress-ring">
  <circle
    class="text-obsidian-700"
    stroke="currentColor"
    stroke-width={strokeWidth}
    fill="transparent"
    r={radius}
    cx={size / 2}
    cy={size / 2}
  />
  <circle
    class="text-amber-350 progress-ring__circle transition-all duration-500"
    stroke="currentColor"
    stroke-width={strokeWidth}
    stroke-dasharray={circumference}
    stroke-dashoffset={offset}
    fill="transparent"
    r={radius}
    cx={size / 2}
    cy={size / 2}
  />
  <text
    x="50%"
    y="50%"
    text-anchor="middle"
    dominant-baseline="central"
    class="text-xs font-mono fill-obsidian-100"
  >
    {Math.round(progress)}%
  </text>
</svg>

