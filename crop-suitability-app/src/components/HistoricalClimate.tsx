import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const ClimateChart = ({ data }: { data: any }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

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
            aspectRatio: 0.6,
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
            },
            scales: {
              x: {
                type: 'category',
                labels: data?.labels,
              },
              y: {
                position: 'left',
                title: {
                  display: true,
                  text: 'Temperature (°C)',
                },
              },
              y1: {
                position: 'right',
                title: {
                  display: true,
                  text: 'Precipitation (mm)',
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
          },
        });
        setChartInstance(chart);
      }
    }

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} />;
};

export const HistoricalClimate = (props) => {
  const {chartData,startYear,endYear} = props;
  return (
    <div className="flex flex-column" style={{ height: '240px', border: '1px solid #999', borderRadius: '5px', textAlign: 'center', color: '#000', padding: '10px', paddingBottom: '20px' }}>
      {startYear} - {endYear} Monthly Average
      <ClimateChart data={chartData} />
    </div>
  );
};

export default HistoricalClimate;