import React from 'react';
import { ResultsPanel } from './ResultsPanel';
import { useAppContext } from '../../store/AppContext';

interface Props {
  onReady?: () => void;
}

export const CropSuitabilityReport: React.FC<Props> = ({ onReady }) => {
  const { state } = useAppContext();
  return (
    <ResultsPanel publishReport={true} onReady={onReady} />
  );
};
