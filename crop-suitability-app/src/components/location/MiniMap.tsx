import React, { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MINIMAP_ZOOM = 4; // fixed country-level zoom

/** Forces Leaflet to recalculate map size after the container finishes rendering. */
const MapResizer: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const LocationMarker = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => { map.flyTo(position, MINIMAP_ZOOM); }, [position]); // eslint-disable-line react-hooks/exhaustive-deps
  return <Marker position={position} />;
};

interface Props {
  position: [number, number];
  zoomLevel?: number;
  MapClickHandler?: React.ComponentType;
}

export const MiniMap: React.FC<Props> = ({ position, MapClickHandler }) => (
  <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #7e5134', backgroundColor: '#fff' }}>
    <MapContainer
      center={position}
      zoom={MINIMAP_ZOOM}
      maxZoom={MINIMAP_ZOOM}
      zoomControl={false}
      style={{ height: 'clamp(180px, 25vh, 250px)', width: '100%' }}
      attributionControl={false}
    >
      <TileLayer url={`https://api.maptiler.com/maps/019f0317-b046-74ed-9e5c-200a9e03bd7a/{z}/{x}/{y}.png?key=${process.env.REACT_APP_MAP_KEY}`} attribution="" />

      <WMSTileLayer
        url="https://data.apps.fao.org/map/gsrv/gsrv1/boundaries/wms?service=WMS"
        layers="bndl"
        format="image/png"
        transparent={true}
        attribution=''
      />

      <WMSTileLayer
        url="https://data.apps.fao.org/map/gsrv/gsrv1/boundaries/wms/v2"
        layers="cen_uncountries"
        format="image/png"
        transparent={true}
        attribution=''
      />
      <MapResizer />
      <LocationMarker position={position} />
      {MapClickHandler && <MapClickHandler />}
    </MapContainer>
  </div>
);