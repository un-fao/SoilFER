import React from 'react';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import { useAppContext } from '../../store/AppContext';
import { theme } from '../../theme/theme';
import { useTranslation } from 'react-i18next';

export const IrrigationStep: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppContext();
  const { irrigation } = state;

  const set = (value: string, waterCode: string) => {
    dispatch({ type: 'SET_IRRIGATION', payload: { irrigation: value, waterCode } });
  };

  return (
    <div className="card">
      <div className="flex flex-row p-0 m-0" style={{ fontSize: theme.typography.fontSizeXl, fontWeight: 'bold' }}>
        {t('irrigation.question')}
      </div>
      <div className="flex flex-row p-0 m-0 mt-1 ml-4 mb-3">
        <div className="flex align-items-center" style={{ width: '10%', minWidth: '100px' }}>
          <RadioButton inputId="irrigationYes" name="irrigation" value="Yes"
            onChange={(e: RadioButtonChangeEvent) => set(e.value, 'IW')}
            checked={irrigation === 'Yes'} />
          <label htmlFor="irrigationYes" className="ml-2">{t('irrigation.yes')}</label>
        </div>
        <div className="flex align-items-center" style={{ width: '10%', minWidth: '100px' }}>
          <RadioButton inputId="irrigationNo" name="irrigation" value="No"
            onChange={(e: RadioButtonChangeEvent) => set(e.value, 'RW')}
            checked={irrigation === 'No'} />
          <label htmlFor="irrigationNo" className="ml-2">{t('irrigation.no')}</label>
        </div>
        <div className="flex align-items-center" style={{ maxWidth: '80%' }}>&nbsp;</div>
      </div>
    </div>
  );
};
