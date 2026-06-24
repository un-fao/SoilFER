import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { ClimateChartData } from '../../hooks/useClimateData';

interface Props {
  data: ClimateChartData;
}

export const ClimateChart: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let chart: Chart | null = null;
    if (chartRef.current && data?.labels?.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chart = new Chart(ctx, {
          type: 'line',
          data: data,
          options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: { legend: { position: 'top' } },
            scales: {
              x: { type: 'category', labels: data?.labels },
              y: {
                position: 'left',
                title: { display: true, text: 'Temperature (°C)' },
              },
              y1: {
                position: 'right',
                title: { display: true, text: 'Precipitation (mm)' },
                grid: { drawOnChartArea: false },
              },
            },
          },
        });
      }
    }
    return () => { if (chart) chart.destroy(); };
  }, [data]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
      <canvas ref={chartRef} />
    </div>
  );
};
