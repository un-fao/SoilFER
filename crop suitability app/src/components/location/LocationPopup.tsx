import React, { useState } from 'react';
import { Divider } from 'primereact/divider';
import { useAppContext } from '../../store/AppContext';
import { ClimateDataLoader } from '../climate/ClimateDataLoader';
import { InfoTooltip } from '../shared/InfoTooltip';
import { nFormat } from '../../data/formatters';
import styled from 'styled-components';
import { theme } from '../../theme/theme';
import { useTranslation } from 'react-i18next';

const Panel = styled.div`
  background-color: ${theme.colors.background.panel};
  color: #fff;
  padding: 12px;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.panel};
  font-weight: bold;
  font-size: 9pt;
`;

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
`;

const RowIcon = styled.img`
  height: 30px;
  width: 30px;
  object-fit: contain;
  flex-shrink: 0;
  margin-top: 1px;
`;

const RowLabel = styled.div`
  flex: 1;
  font-size: 12pt;
  font-weight: normal;
  line-height: 30px;
  vertical-align:middle;
`;

const Sep = styled.div`
  border-bottom: 1px solid rgba(255,255,255,0.2);
  margin: 4px 0;
`;

const SubmitButton = styled.button`
  background-color: ${theme.colors.accent}; color: #333; border: none; padding: 8px 10px; width: 100%;
  cursor: pointer; font-weight: bold; border-radius: ${theme.borderRadius.sm};
  margin-top: 6px; font-size: 10pt;
`;
const CancelButton = styled.button`
  background-color: ${theme.colors.primaryDark}; color: #fff; border: none; padding: 8px 10px; width: 100%;
  cursor: pointer; font-weight: bold; border-radius: ${theme.borderRadius.sm};
  margin-top: 6px; font-size: 10pt;
`;

interface Props {
  onFindSoil: () => void;
  onChooseAnother: () => void;
}

export const LocationPopup: React.FC<Props> = ({ onFindSoil, onChooseAnother }) => {
  const { t } = useTranslation();
  const { state } = useAppContext();
  const { administrativeInfo } = state;
  const [showClimate, setShowClimate] = useState(false);
  const year = new Date().getFullYear();

  if (!administrativeInfo) return null;
  const addr = administrativeInfo.address || {};

  const placeParts = [
    addr.suburb, addr.village, addr.town, addr.city,
    addr.region, addr.state, addr.country,
  ].filter(Boolean);

  return (
    <Panel style={{ width: '100%', minWidth: '300px' }}>
      <div style={{ color: theme.colors.accent, fontWeight: 'bold', fontSize: '11pt', marginBottom: '8px', display: 'block', alignItems: 'center', gap: '6px' }}>
        <span
            style={{
              fontSize: 'clamp(10pt, 2vw, 18pt)',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <img src={`${process.env.PUBLIC_URL}/images/LocationIconYellow.png`} alt="Location" style={{ height: '20px', marginRight: '5px' }} />
            {t('location.popup.title')}
          </span>
          <Divider />
      </div>

      {!showClimate ? (
        <>
          <Row>
            <RowIcon src={`${process.env.PUBLIC_URL}/images/LocationIconWhite.png`} alt="" />
            <RowLabel>
              <div style={{ fontWeight: 'bold' }}>{placeParts.join(', ')}</div>
            </RowLabel>
          </Row>
          <Sep />
          <Row>
            <RowIcon src={`${process.env.PUBLIC_URL}/images/CoordinatesIcon.png`} alt="" />
            <RowLabel>{administrativeInfo.lat.toFixed(5)}, {administrativeInfo.lng.toFixed(5)}</RowLabel>
          </Row>
          <Sep />
          <Row>
            <RowIcon src={`${process.env.PUBLIC_URL}/images/AltitudeIcon.png`} alt="" />
            <RowLabel>{t('location.popup.altitude')} {Number(administrativeInfo.elevation ?? 0).toLocaleString().replace(/,/g, ' ')} m</RowLabel>
          </Row>
          <Sep />
          <Row>
            <RowIcon src={`${process.env.PUBLIC_URL}/images/ClimateIcon.png`} alt="" />
            <RowLabel style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CancelButton style={{ width: 'auto', padding: '4px 10px', fontSize: theme.typography.fontSizeBase }}
                onClick={(e) => { e.stopPropagation(); setShowClimate(true); }}>
                {t('location.popup.climateData')}
              </CancelButton>
              <InfoTooltip label="" content={t('location.popup.climateTooltip')} iconOnly align="right" />
            </RowLabel>
          </Row>
        </>
      ) : (
        <>
          <SubmitButton onClick={(e) => { e.stopPropagation(); setShowClimate(false); }} style={{ fontSize: theme.typography.fontSizeMd, marginBottom: '6px' }}>
            {t('location.popup.backToInfo')}
          </SubmitButton>
          <div style={{ backgroundColor: 'white', borderRadius: '4px' }}>
            <ClimateDataLoader latitude={administrativeInfo.lat} longitude={administrativeInfo.lng} startYear={year - 6} endYear={year - 1} />
          </div>
        </>
      )}

      <SubmitButton onClick={(e) => { e.stopPropagation(); onFindSoil(); }}  style={{ fontSize: theme.typography.fontSizeMd }}>
        {t('location.popup.findSoil')}
      </SubmitButton>
      <div className="flex flex-row justify-content-center align-items-center gap-2" style={{ marginTop: '4px' }}>
        <span style={{ fontSize: '15pt' }}>{t('location.popup.or')}</span>
        <CancelButton style={{ width: 'auto', flex: 1, fontSize: theme.typography.fontSizeMd, marginTop: 0 }} onClick={(e) => { e.stopPropagation(); onChooseAnother(); }}>
          {t('location.popup.changeLocation')}
        </CancelButton>
      </div>
    </Panel>
  );
};
