<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Chart, registerables } from 'chart.js';

  Chart.register(...registerables);

  interface Dataset {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
  }

  let { 
    labels = [] as string[],
    datasets = [] as Dataset[],
    title = '',
    yAxisLabel = '',
    xAxisLabel = ''
  } = $props();

  let canvas: HTMLCanvasElement;
  let chart: Chart | null = null;

  const defaultColors = [
    { border: '#f5c542', bg: 'rgba(245, 197, 66, 0.1)' },
    { border: '#34d399', bg: 'rgba(52, 211, 153, 0.1)' },
    { border: '#f87171', bg: 'rgba(248, 113, 113, 0.1)' },
    { border: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' },
    { border: '#a78bfa', bg: 'rgba(167, 139, 250, 0.1)' }
  ];

  function createChart() {
    if (!canvas) return;
    if (chart) chart.destroy();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.data,
          borderColor: ds.borderColor || defaultColors[i % defaultColors.length].border,
          backgroundColor: ds.backgroundColor || defaultColors[i % defaultColors.length].bg,
          fill: ds.fill ?? true,
          tension: ds.tension ?? 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: datasets.length > 1,
            labels: {
              color: '#a2a4ab',
              font: { family: 'Source Sans Pro' }
            }
          },
          title: {
            display: !!title,
            text: title,
            color: '#e3e3e5',
            font: { family: 'Playfair Display', size: 16, weight: '600' }
          },
          tooltip: {
            backgroundColor: '#38393f',
            titleColor: '#e3e3e5',
            bodyColor: '#a2a4ab',
            borderColor: '#636770',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(99, 103, 112, 0.2)' },
            ticks: { color: '#7e818a' },
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
    // Re-create chart when data changes
    if (labels && datasets) {
      createChart();
    }
  });

  onMount(() => {
    createChart();
  });

  onDestroy(() => {
    if (chart) chart.destroy();
  });
</script>

<div class="chart-container">
  <canvas bind:this={canvas}></canvas>
</div>

