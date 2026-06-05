import React, { useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import L from 'leaflet';
import { useAppContext } from '../../store/AppContext';
import { useGeocoding } from '../../hooks/useGeocoding';
import styled from 'styled-components';
import { theme } from '../../theme/theme';
import { useTranslation } from 'react-i18next';

const CancelButton = styled.button`
  background-color: ${theme.colors.primaryDark}; color: #fff; border: none; padding: 10px; width: 100%;
  cursor: pointer; font-weight: bold; border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm}; font-size: ${theme.typography.fontSizeBase};
`;

export const LocationSearch: React.FC = () => {
  const { t } = useTranslation();
  const { dispatch } = useAppContext();
  const { fetchGeocodeWithElevation } = useGeocoding();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (place: string) => {
    if (!place) return;
    dispatch({ type: 'SET_HWSD', payload: null });
    try {
      const location = await fetchGeocodeWithElevation(place);
      const latLng = new L.LatLng(location.lat, location.lng);
      dispatch({
        type: 'SET_LOCATION',
        payload: { positionnew: latLng, administrativeInfo: location, position: [location.lat, location.lng], zoomLevel: 18 },
      });
      dispatch({ type: 'SET_CROP_LAYER_VISIBLE', payload: false });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An unknown error occurred.');
    }
  };

  const submit = () => handleSearch(inputRef.current?.value || '');

  return (
    <div>
      <p style={{ fontWeight: 'bold', fontSize: '12pt' }}>{t('location.search.title')}</p>
      <p style={{ fontWeight: 'bold', fontSize: '12pt' }}>{t('location.search.placeholder')}</p>
      <div className="p-inputgroup flex-1">
        <InputText
          ref={inputRef}
          placeholder={t('location.search.searchButton')}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        <span className="p-inputgroup-addon">
          <i className="pi pi-search" style={{ cursor: 'pointer' }} onClick={submit} />
        </span>
      </div>
      <p style={{ fontWeight: 'bold', fontSize: '12pt' }}>{t('location.search.clickMap')}</p>
      <p style={{ fontWeight: 'bold', fontSize: '12pt' }}>
        {t('location.search.gps')} <img src={`${process.env.PUBLIC_URL}/images/LocationIconWhite.png`} alt="GPS" style={{ height: '20px' }} />
      </p>
      <CancelButton onClick={() => { dispatch({ type: 'CONFIRM_LOCATION' }); dispatch({ type: 'SET_CROP_LAYER_VISIBLE', payload: false }); }} style={{ fontSize: theme.typography.fontSizeLg }}>
        {t('location.search.cancel')}
      </CancelButton>
    </div>
  );
};
