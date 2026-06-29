import React, { useState, useEffect } from 'react';
import SyncLoader from 'react-spinners/SyncLoader';
import { useAppContext } from '../../store/AppContext';
import { useHWSD } from '../../hooks/useHWSD';
import { texture_lookup, drainage_lookup, WRB_lookup } from '../../data/soilLookups';
import styled from 'styled-components';
import { theme } from '../../theme/theme';
import { useTranslation } from 'react-i18next';

const SubmitButton = styled.button`
  background-color: ${theme.colors.accent}; color: #333; border: none; padding: 10px; width: 100%;
  cursor: pointer; font-weight: bold; border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm}; font-size: ${theme.typography.fontSizeBase};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const CancelButton = styled.button`
  background-color: ${theme.colors.primaryDark}; color: #fff; border: none; padding: 10px; width: 100%;
  cursor: pointer; font-weight: bold; border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm}; font-size: ${theme.typography.fontSizeBase};
`;

export const SoilStep: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppContext();
  const { positionnew, bufferRadius, soil, soilCode, soilName, HWSDStatistics } = state;
  const { fetchHWSDStatistics } = useHWSD();

  const [knownSoil, setKnownSoil] = useState('Yes');
  const [calculatedSoil, setCalculatedSoil] = useState(false);
  const [calculatedSoilMessage, setCalculatedSoilMessage] = useState('');
  const [soilSummary, setSoilSummary] = useState<any>(null);

  /** Single dispatch avoids stale-closure overwrites when selecting a soil row */
  const onSoilSelect = (id: any, code: string, name: string) =>
    dispatch({ type: 'SET_SOIL', payload: { soil: id, soilCode: code, soilName: name } });
  const setPanel = (panel: any) => dispatch({ type: 'SET_ACTIVE_PANEL', payload: panel });
  const setCropLayerVisible = (v: boolean) => dispatch({ type: 'SET_CROP_LAYER_VISIBLE', payload: v });

  useEffect(() => {
    if (positionnew != null) {
      fetchHWSDStatistics(positionnew.lat, positionnew.lng, bufferRadius);
    }
  }, [positionnew]);

  // Clear soilSummary when a new HWSD fetch begins (HWSDStatistics set to null on location change)
  useEffect(() => {
    if (HWSDStatistics === null) setSoilSummary(null);
  }, [HWSDStatistics]);

  // After new soil table loads, reset soil if the WRB code is gone, or re-sync the row ID if it's still there
  useEffect(() => {
    if (soilSummary !== null && soilSummary.length > 0 && soilCode !== '') {
      const matchingRow = soilSummary.find((s: any) => s.WRB2?.toUpperCase() === soilCode.toUpperCase());
      if (!matchingRow) {
        dispatch({ type: 'SET_SOIL', payload: { soil: '', soilCode: '', soilName: '' } });
      } else {
        // The row ID is regenerated each load; re-sync it so the radio button highlights correctly
        dispatch({ type: 'SET_SOIL', payload: { soil: matchingRow.ID, soilCode: soilCode, soilName: soilName } });
      }
    }
  }, [soilSummary]);

  const [SoilTable, setSoilTableComp] = useState<any>(null);
  const [SoilTestQuestionnaire, setSoilTestComp] = useState<any>(null);

  useEffect(() => {
    import('../soil/SoilTable').then((m) => setSoilTableComp(() => m.SoilTable));
    import('../soil/SoilTestQuestionnaire').then((m) => setSoilTestComp(() => m.SoilTestQuestionnaire));
  }, []);

  return (
    <>
      {HWSDStatistics === null && (
        <div className="flex w-full flex-column align-items-center justify-content-center">
          <p>{t('soil.loading')}</p>
          <SyncLoader size={5} color="white" aria-label="Loading Spinner" data-testid="loader" />
        </div>
      )}
      {HWSDStatistics !== null && (
        <div className="flex flex-column p-0 m-0">
          {!calculatedSoil && knownSoil === 'Yes' && (
            <div className="flex flex-row m-1" style={{ fontWeight: 'bold' }}>
              <div >
                {t('soil.identified')}{' '}
                <a href="javascript:void(0)" style={{ color: 'orange', textDecoration: 'none' }} onClick={() => setPanel('Crop')}>{t('soil.chooseCropType')}</a>
                <br /><br />
                {t('soil.ifNot')}{' '}
                <a href="javascript:void(0)" style={{ color: 'orange', textDecoration: 'none' }} onClick={() => { setKnownSoil('No'); setCalculatedSoil(false); }}>{t('soil.useSoilTools')}</a> {t('soil.determine')}
              </div>
            </div>
          )}
          {calculatedSoil && (
            <div className="flex flex-row" style={{ fontWeight: 'bold' }}>
              {soilCode !== '' && <div className="m-1">{calculatedSoilMessage} <span style={{ fontWeight: 'bolder' }}><u>{soilName} ({soilCode})</u></span></div>}
              {soilCode === '' && (
                <div className="m-1" style={{ fontWeight: 'bold' }}>
                  {t('soil.unableToIdentify')}{' '}
                  <a href="javascript:void(0)" style={{ color: 'orange', textDecoration: 'none' }} onClick={() => { setKnownSoil('No'); setCalculatedSoil(false); }}>{t('soil.useSoilTools')}</a>.
                </div>
              )}
            </div>
          )}
          {knownSoil === 'Yes' && SoilTable && (
            <div id="SoilTable" className="m-0 p-0 mt-2">
              <SoilTable
                soil={soil}
                onSoilSelect={onSoilSelect}
                HWSDStatistics={HWSDStatistics}
                soilSummary={soilSummary} setSoilSummary={setSoilSummary}
                texture_lookup={texture_lookup}
                drainage_lookup={drainage_lookup}
                WRB_lookup={WRB_lookup}
                setCropLayerVisible={setCropLayerVisible}
              />
              <div className="flex flex-row align-content-center justify-content-center align-items-center">
                <SubmitButton style={{ width: '80%', fontSize: theme.typography.fontSizeLg }} onClick={() => setPanel('Crop')} disabled={soil === ''}>
                  {t('soil.continueCrop')}
                </SubmitButton>
              </div>
              <div className="flex flex-row align-content-center justify-content-center align-items-center" style={{ verticalAlign: 'middle' }}>
                <b>{t('soil.or')} </b>
                <CancelButton style={{ width: '30%', fontSize: theme.typography.fontSizeLg, marginLeft: '15px' }} onClick={() => { setKnownSoil('No'); setCalculatedSoil(false); }}>
                  {t('soil.identifySoil')}
                </CancelButton>
              </div>
            </div>
          )}
          {knownSoil === 'No' && SoilTestQuestionnaire && (
            <div id="SoilTest" className="flex m-0 p-0">              
              <SoilTestQuestionnaire
                setPanel={setPanel}
                onSoilSelect={onSoilSelect}
                setKnownSoil={setKnownSoil}
                calculatedSoil={calculatedSoil} setCalculatedSoil={setCalculatedSoil}
                calculatedSoilMessage={calculatedSoilMessage} setCalculatedSoilMessage={setCalculatedSoilMessage}
                soilCode={soilCode} soilName={soilName}
                soilSummary={soilSummary} setSoilSummary={setSoilSummary}
                texture_lookup={texture_lookup}
                drainage_lookup={drainage_lookup}
                WRB_lookup={WRB_lookup}
                setCropLayerVisible={setCropLayerVisible}
              />              
            </div>
          )}
        </div>
      )}
    </>
  );
};
