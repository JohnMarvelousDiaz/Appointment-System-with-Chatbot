import { Chart } from 'chart.js';

export function renderChart(chartRef, data, options) {
  const myChart = new Chart(chartRef, {
    type: 'bar',
    data: data,
    options: options,
  });

  return myChart;
}
