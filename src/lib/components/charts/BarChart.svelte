<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  let { 
    labels = [] as string[],
    data = [] as number[],
    title = '',
    color = '#f5c542',
    yAxisLabel = ''
  } = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  function createChart() {
    if (!canvas) return;
    if (chart) chart.destroy();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: color + '60',
          borderColor: color,
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: {
            display: !!title,
            text: title,
            color: '#e3e3e5',
            font: { family: 'Playfair Display', size: 16, weight: '600' }
          },
          tooltip: {
            backgroundColor: '#38393f',
            titleColor: '#e3e3e5',
            bodyColor: '#a2a4ab'
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#7e818a' }
          },
          y: {
            grid: { color: 'rgba(99, 103, 112, 0.2)' },
            ticks: { color: '#7e818a' },
            title: { display: !!yAxisLabel, text: yAxisLabel, color: '#a2a4ab' }
          }
        }
      }
    });
  }

  $effect(() => {
    if (labels && data) createChart();
  });

  onMount(() => createChart());
  onDestroy(() => { if (chart) chart.destroy(); });
</script>

<div class="chart-container">
  <canvas bind:this={canvas}></canvas>
</div>

