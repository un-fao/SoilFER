import { useState, useEffect } from 'react';

export interface ClimateChartData {
  labels: string[];
  datasets: any[];
}

export function useClimateData(latitude: number, longitude: number, startYear: number, endYear: number) {
  const [chartData, setChartData] = useState<ClimateChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setChartData(null);
    setError(null);
  }, [latitude, longitude, startYear, endYear]);

  useEffect(() => {
    let isMounted = true;

    const fetchHistoricalData = async () => {
      try {
        const url =
          `https://archive-api.open-meteo.com/v1/archive?` +
          `latitude=${latitude}&longitude=${longitude}&` +
          `start_date=${startYear}-01-01&end_date=${endYear}-12-31&` +
          `daily=temperature_2m_max,temperature_2m_min,precipitation_sum&` +
          `timezone=GMT`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch climate data: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        if (isMounted) {
          const monthlyData = processMonthlyAverages(data.daily, startYear, endYear);
          const documentStyle = getComputedStyle(document.documentElement);

          const newChartData: ClimateChartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
              {
                type: 'line',
                label: 'Max Temperature (°C)',
                borderColor: documentStyle.getPropertyValue('--red-500') || '#f44336',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                data: [...monthlyData.maxTemp],
                yAxisID: 'y',
              },
              {
                type: 'line',
                label: 'Min Temperature (°C)',
                borderColor: documentStyle.getPropertyValue('--blue-500') || '#2196f3',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                data: [...monthlyData.minTemp],
                yAxisID: 'y',
              },
              {
                type: 'bar',
                label: 'Precipitation (mm)',
                backgroundColor: documentStyle.getPropertyValue('--blue-200') || '#90caf9',
                data: [...monthlyData.precip],
                borderColor: 'white',
                borderWidth: 2,
                yAxisID: 'y1',
              },
            ],
          };
          setChartData(newChartData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Fetch Error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
          setLoading(false);
        }
      }
    };

    fetchHistoricalData();
    return () => { isMounted = false; };
  }, [latitude, longitude, startYear, endYear]);

  return { chartData, loading, error };
}

function processMonthlyAverages(daily: any, startYear: number, endYear: number) {
  const monthlyData = {
    maxTemp: new Array(12).fill(0),
    minTemp: new Array(12).fill(0),
    precip: new Array(12).fill(0),
    counts: new Array(12).fill(0),
  };

  if (!daily || !daily.time || !daily.temperature_2m_max || !daily.temperature_2m_min || !daily.precipitation_sum) {
    return monthlyData;
  }

  daily.time.forEach((date: string, index: number) => {
    const month = new Date(date).getMonth();
    monthlyData.maxTemp[month] += daily.temperature_2m_max[index];
    monthlyData.minTemp[month] += daily.temperature_2m_min[index];
    monthlyData.precip[month] += daily.precipitation_sum[index] || 0;
    monthlyData.counts[month]++;
  });

  const years = endYear - startYear;
  for (let i = 0; i < 12; i++) {
    if (monthlyData.counts[i] > 0) {
      monthlyData.maxTemp[i] = +(monthlyData.maxTemp[i] / monthlyData.counts[i]).toFixed(1);
      monthlyData.minTemp[i] = +(monthlyData.minTemp[i] / monthlyData.counts[i]).toFixed(1);
      monthlyData.precip[i] = +(monthlyData.precip[i]).toFixed(1) / years;
    }
  }

  return monthlyData;
}
