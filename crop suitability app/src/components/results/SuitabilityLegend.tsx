import React from 'react';
import { useTranslation } from 'react-i18next';

const ITEMS = [
  { cls: 'si-very-high', key: 'legend.veryHigh' },
  { cls: 'si-high', key: 'legend.high' },
  { cls: 'si-good', key: 'legend.good' },
  { cls: 'si-medium', key: 'legend.medium' },
  { cls: 'si-moderate', key: 'legend.moderate' },
  { cls: 'si-marginal', key: 'legend.marginal' },
  { cls: 'si-very-marginal', key: 'legend.veryMarginal' },
  { cls: 'si-not-suitable', key: 'legend.notSuitable' },
];

export const SuitabilityLegend: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-column gap-1" style={{ minWidth: '200px', width: '25%' }}>
      {ITEMS.map(({ cls, key }) => (
        <div key={cls} className="flex flex-row" style={{ alignItems: 'center' }}>
          <div className={cls} style={{ width: '30px', height: '30px', marginRight: '5px' }}></div>
          <p style={{ fontWeight: 'bold', padding: 0, margin: 0 }}>{t(key)}</p>
        </div>
      ))}
    </div>
  );
};
