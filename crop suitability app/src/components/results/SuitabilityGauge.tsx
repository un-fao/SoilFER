import React from 'react';

const LEVELS = ['Not Suitable', 'Very Marginal', 'Marginal', 'Moderate', 'Medium', 'Good', 'High', 'Very High'];

interface Props {
  cropLevel: string | null;
  avgLevel: string | null;
}

const Arrow = ({ direction }: { direction: 'up' | 'down' }) => (
  <img
    src={`${process.env.PUBLIC_URL}/images/arrow_${direction}.png`}
    alt={`${direction} Arrow`}
    style={{ margin: 0, padding: 0, height: '20px' }}
  />
);

export const SuitabilityGauge: React.FC<Props> = ({ cropLevel, avgLevel }) => (
  <div style={{ width: '75%' }}>
    <div className="flex align-items-center justify-content-center m-0 p-0">
      {LEVELS.map((level) => (
        <div key={level} className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>
          {cropLevel === level ? <Arrow direction="down" /> : null}
        </div>
      ))}
    </div>
    <div className="flex align-items-center justify-content-center m-0 p-0" style={{ height: '20px' }}>
      {LEVELS.map((level) => (
        <div key={level} className={`si-${level.toLowerCase().replace(/ /g, '-')} m-0 p-0`} style={{ width: '12%', height: '15px' }}></div>
      ))}
    </div>
    <div className="flex align-items-center justify-content-center m-0 p-0">
      {LEVELS.map((level) => (
        <div key={level} className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>
          {avgLevel === level ? <Arrow direction="up" /> : null}
        </div>
      ))}
    </div>
  </div>
);
