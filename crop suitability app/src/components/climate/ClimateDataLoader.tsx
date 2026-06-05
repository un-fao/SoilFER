import React from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useClimateData } from '../../hooks/useClimateData';
import { ClimateChart } from './ClimateChart';
import { useTranslation } from 'react-i18next';

interface Props {
  latitude: number;
  longitude: number;
  startYear: number;
  endYear: number;
}

export const ClimateDataLoader: React.FC<Props> = ({ latitude, longitude, startYear, endYear }) => {
  const { t } = useTranslation();
  const { chartData, loading, error } = useClimateData(latitude, longitude, startYear, endYear);

  return (
    <div>
      {loading && <div className="flex justify-content-center"><ProgressSpinner /></div>}
      {error && <div className="p-4" style={{ color: 'red' }}>{t('climate.error')} {error}</div>}
      {chartData && (
        <div style={{ height: '240px', minWidth: '275px', border: '1px solid #999', borderRadius: '5px', textAlign: 'center', color: '#000', padding: '10px', paddingBottom: '20px' }}>
          {startYear} - {endYear} {t('climate.monthlyAverage')}
          <ClimateChart
            key={`${latitude}-${longitude}-${startYear}-${endYear}`}
            data={chartData}
          />
        </div>
      )}
    </div>
  );
};
