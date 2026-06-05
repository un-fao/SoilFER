import { useEffect } from 'react';
import L from 'leaflet';
import { useAppContext } from '../store/AppContext';
import { useGeocoding } from './useGeocoding';

export function useGeolocation() {
  const { dispatch } = useAppContext();
  const { fetchGeocodeWithElevation } = useGeocoding();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const location = await fetchGeocodeWithElevation('', latitude, longitude);
          const latLng = new L.LatLng(latitude, longitude);
          dispatch({
            type: 'SET_LOCATION',
            payload: {
              positionnew: latLng,
              administrativeInfo: location,
              position: [latitude, longitude],
              zoomLevel: 18,
            },
          });
        } catch (err) {
          console.error('Geolocation geocoding failed:', err);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
      }
    );
  }, []);
}
