import React, { useState } from 'react';
import { Divider } from 'primereact/divider';
import { useAppContext } from '../../store/AppContext';
import { ClimateDataLoader } from '../climate/ClimateDataLoader';
import { InfoTooltip } from '../shared/InfoTooltip';
import styled from 'styled-components';
import { theme } from '../../theme/theme';
import { nFormat } from '../../data/formatters';
import { useTranslation } from 'react-i18next';

const CancelButton = styled.button`
  background-color: ${theme.colors.primaryDark}; color: #fff; border: none; padding: 10px; width: 100%;
  cursor: pointer; font-weight: bold; border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm}; font-size: clamp(8pt, 1.2vw, 10pt);
`;

export const LocationCard: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppContext();
  const { administrativeInfo, soil, soilCode, soilName, crop, irrigation, input } = state;
  const [showClimate, setShowClimate] = useState(false);

  if (!administrativeInfo) return null;

  const year = new Date().getFullYear();
  const addr = administrativeInfo.address || {};

  return (
    <>
      <div className="m-0 p-1 flex flex-row justify-content-start" style={{ width: '100%' }}>
        <img src={`${process.env.PUBLIC_URL}/images/LocationIconYellow.png`} alt="Location" style={{ height: '25px' }} />
        <div className="flex flex-column p-1" style={{ width: '90%', fontSize: 'clamp(8pt, 1.2vw, 10pt)' }}>
          <b>
            {addr.suburb && addr.suburb + ', '}
            {addr.village && addr.village + ', '}
            {addr.town && addr.town + ', '}
            {addr.city && addr.city + ', '}
            {addr.region && addr.region + ', '}
            {addr.state && addr.state + ', '}
            {addr.country || ''}
          </b>
          <Divider className="m-0 p-1" />
          {t('location.card.coordinates')} {administrativeInfo.lat.toFixed(6)}, {administrativeInfo.lng.toFixed(6)}<br />
          {t('location.card.altitude')} {Number(administrativeInfo.elevation ?? 0).toLocaleString().replace(/,/g, ' ')} m<br />
          <div className="flex flex-row">
            <span style={{ cursor: 'pointer', textDecoration: 'underline', color: 'orange', marginRight: '2px' }} onClick={() => setShowClimate(!showClimate)}>
              {t('location.card.climateData')}
            </span>
            <InfoTooltip label="" content={t('location.card.climateTooltip')} iconOnly />
          </div>
          {showClimate && (
            <div style={{ backgroundColor: 'white', borderRadius: '4px', marginTop: '4px' }}>
              <ClimateDataLoader latitude={administrativeInfo.lat} longitude={administrativeInfo.lng} startYear={year - 6} endYear={year - 1} />
            </div>
          )}
          <Divider className="m-0 p-0" />
        </div>
      </div>

      {soil !== '' && (
        <div className="m-0 p-1 flex flex-row justify-content-start">
          <img src={`${process.env.PUBLIC_URL}/images/SoilIcon.png`} alt="Soil" style={{ height: '25px' }} />
          <div className="flex flex-column p-1" style={{ width: '90%', fontSize: 'clamp(8pt, 1.2vw, 10pt)' }}>
            {soilName} ({soilCode})<Divider className="m-0 p-0" />
          </div>
          <img src={`${process.env.PUBLIC_URL}/images/pencil.png`} alt="Edit" style={{ height: '16px', cursor: 'pointer' }}
            onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'Soil' })} />
        </div>
      )}

      {crop !== '' && (
        <div className="m-0 p-1 flex flex-row justify-content-start">
          <img src={`${process.env.PUBLIC_URL}/images/CropIcon.png`} alt="Crop" style={{ height: '25px' }} />
          <div className="flex flex-column p-1" style={{ width: '90%', fontSize: 'clamp(8pt, 1.2vw, 10pt)' }}>
            {crop}<Divider className="m-0 p-0" />
          </div>
          <img src={`${process.env.PUBLIC_URL}/images/pencil.png`} alt="Edit" style={{ height: '16px', cursor: 'pointer' }}
            onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'Crop' })} />
        </div>
      )}

      {irrigation !== '' && input !== '' && (
        <div className="m-0 p-1 flex flex-row justify-content-start">
          <img src={`${process.env.PUBLIC_URL}/images/IrrigationIcon.png`} alt="Irrigation" style={{ height: '25px' }} />
          <div className="flex flex-column p-1" style={{ width: '90%', fontSize: 'clamp(8pt, 1.2vw, 10pt)' }}>
            {irrigation === 'Yes' ? t('location.card.irrigated') : t('location.card.rainFed')}<br />
            {input === 'High' ? t('location.card.highInput') : t('location.card.lowInput')}
            <Divider className="m-0 p-0" />
          </div>
          <img src={`${process.env.PUBLIC_URL}/images/pencil.png`} alt="Edit" style={{ height: '16px', cursor: 'pointer' }}
            onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'Irrigation & Farm Management' })} />
        </div>
      )}

      <CancelButton onClick={() => dispatch({ type: 'RESET_LOCATION' })} style={{ fontSize: theme.typography.fontSizeMd }}>
        {t('location.card.changeLocation')}
      </CancelButton>
    </>
  );
};
