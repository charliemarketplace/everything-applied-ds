<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  interface HistogramBin {
    bin: number;
    count: number;
  }

  let { 
    data = [] as HistogramBin[],
    title = '',
    color = '#f5c542',
    xAxisLabel = '',
    yAxisLabel = 'Frequency',
    highlightRange = null as { min: number; max: number } | null
  } = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  function createChart() {
    if (!canvas || data.length === 0) return;
    if (chart) chart.destroy();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = data.map(d => d.bin.toFixed(1));
    const values = data.map(d => d.count);
    
    const backgroundColors = data.map(d => {
      if (highlightRange && d.bin >= highlightRange.min && d.bin <= highlightRange.max) {
        return 'rgba(52, 211, 153, 0.6)';
      }
      return color + '60';
    });

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: backgroundColors,
          borderColor: color,
          borderWidth: 0,
          barPercentage: 1,
          categoryPercentage: 1
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
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { 
              color: '#7e818a',
              maxTicksLimit: 10
            },
            title: { display: !!xAxisLabel, text: xAxisLabel, color: '#a2a4ab' }
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
    if (data) createChart();
  });

  onMount(() => createChart());
  onDestroy(() => { if (chart) chart.destroy(); });
</script>

<div class="chart-container">
  <canvas bind:this={canvas}></canvas>
</div>

