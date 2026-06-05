import React, { useEffect, useRef, useState } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, WMSTileLayer, ImageOverlay,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAppContext } from '../../store/AppContext';
import { useGeocoding } from '../../hooks/useGeocoding';
import { LocationPopup } from '../location/LocationPopup';
import { theme } from '../../theme/theme';
import { useBreakpoint } from '../../hooks/useBreakpoint';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapClickHandler: React.FC = () => {
  const { dispatch } = useAppContext();
  const { fetchGeocodeWithElevation } = useGeocoding();

  useMapEvents({
    dblclick: async (e) => {
      const { lat, lng } = e.latlng;
      const latLng = new L.LatLng(lat, lng);
      try {
        const location = await fetchGeocodeWithElevation('', lat, lng);
        dispatch({
          type: 'SET_LOCATION',
          payload: { positionnew: latLng, administrativeInfo: location, position: [lat, lng], zoomLevel: 13 },
        });
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Location lookup failed.');
      }
    },
  });
  return null;
};

const LEFT_OFFSET = 0.12; // fraction of map width to pan left (desktop only)
const TOP_OFFSET = 0.25;  // fraction of map height to pan up (moves marker lower on screen)
const MOBILE_TOP_OFFSET = 0.1; // smaller downward shift for mobile (no left panel to avoid)

const applyOffset = (map: L.Map, position: [number, number], zoom: number, leftFrac = LEFT_OFFSET, topFrac = TOP_OFFSET): L.LatLng => {
  const point = map.project(L.latLng(position), zoom);
  return map.unproject(point.add([map.getSize().x * leftFrac, -map.getSize().y * topFrac]), zoom);
};

const FlyTo: React.FC<{ position: [number, number]; zoom: number; trigger: any; offset?: boolean; isSmallScreen?: boolean }> = ({ position, zoom, trigger, offset = false, isSmallScreen = false }) => {
  const map = useMap();
  useEffect(() => {
    const target = offset
      ? applyOffset(map, position, zoom, isSmallScreen ? 0 : LEFT_OFFSET, isSmallScreen ? MOBILE_TOP_OFFSET : TOP_OFFSET)
      : L.latLng(position);
    map.flyTo(target, zoom);
  }, [position, zoom, trigger, isSmallScreen, offset]);
  return null;
};

const LocationMarker: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { positionnew, zoomLevel, rerender } = state;
  const [popupState, setPopupState] = useState<'initial' | 'details'>('initial');
  const markerRef = useRef<any>(null);
  const { isMobile, isTablet } = useBreakpoint();
  const isSmallScreen = isMobile || isTablet;

  useEffect(() => {
    setPopupState('initial');
    if (markerRef.current) markerRef.current.openPopup();
  }, [positionnew]);

  if (!positionnew) return null;
  const pos: [number, number] = [positionnew.lat, positionnew.lng];

  const handleFindSoil = () => {
    dispatch({ type: 'CONFIRM_LOCATION' });
    dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'Soil' });
    dispatch({ type: 'MAXIMIZE_WIZARD' });
    markerRef.current?.closePopup();
  };
  const handleChooseAnother = () => {
    dispatch({ type: 'RESET_LOCATION' });
    markerRef.current?.closePopup();
  };

  return (
    <>
      <FlyTo position={pos} zoom={zoomLevel} trigger={rerender} offset isSmallScreen={isSmallScreen} />
      <Marker position={pos} ref={markerRef} eventHandlers={{
        click: () => { if (popupState === 'initial') { setPopupState('details'); markerRef.current?.openPopup(); } },
        add: (e) => e.target.openPopup(),
      }}>
        {popupState === 'initial' ? (
          <Popup closeButton={false} autoClose={false} closeOnClick={false}>
            <div style={{ display: 'flex', fontSize: '14px', fontWeight: 'bold', alignItems: 'center', justifyContent: 'center', width: 'clamp(150px, 20vw, 250px)', textAlign: 'center', color: 'white', backgroundColor: theme.colors.background.panel, padding: '5px', borderRadius: theme.borderRadius.md }}
              onClick={() => { setPopupState('details'); markerRef.current?.openPopup(); }}>
              Your selected location, click the marker below for more details.
            </div>
          </Popup>
        ) : (
          <Popup closeButton={true} autoClose={false}>
            <div style={{ margin: 0, padding: 0, minWidth: 'clamp(150px, 17vw, 360px)', width: 'fit-content', height: 'fit-content', overflow: 'visible', borderRadius: '10px' }}>
              <LocationPopup onFindSoil={handleFindSoil} onChooseAnother={handleChooseAnother} />
            </div>
          </Popup>
        )}
      </Marker>
    </>
  );
};

const SyncedMap: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView(applyOffset(map, center, zoom), zoom); }, [center, zoom]);
  return null;
};

/** Single-image WMS overlay — sends one GetMap request per pan/zoom matching the exact viewport. */
const WmsImageLayer: React.FC<{ url: string; layers: string; viewparams: string }> = ({ url, layers, viewparams }) => {
  const map = useMap();

  const build = () => {
    const b = map.getBounds();
    const s = map.getSize();
    const bbox = `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`;
    return (
      `${url}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap` +
      `&LAYERS=${layers}&STYLES=&FORMAT=image/png&TRANSPARENT=true` +
      `&SRS=EPSG:4326&BBOX=${bbox}&WIDTH=${s.x}&HEIGHT=${s.y}` +      
      `${viewparams}`
    );
  };

  const [imgUrl, setImgUrl] = useState(build);
  const [bounds, setBounds] = useState(() => map.getBounds());

  useMapEvents({
    moveend: () => { setBounds(map.getBounds()); setImgUrl(build()); },
    zoomend: () => { setBounds(map.getBounds()); setImgUrl(build()); },
    resize:  () => { setBounds(map.getBounds()); setImgUrl(build()); },
  });

  return <ImageOverlay url={imgUrl} bounds={bounds} opacity={1} />;
};

export const MapView: React.FC = () => {
  const { state } = useAppContext();
  const { positionnew, position, zoomLevel, activePanel, locationConfirmed, soilCode, cropCode, inputCode, waterCode, crop } = state;
  const [backgroundLayer, setBackgroundLayer] = useState('OpenStreetMap');
  const [bgPanelOpen, setBgPanelOpen] = useState(false);
  const { isTablet, isMobile } = useBreakpoint();
  const isSmallScreen = isTablet || isMobile;

  useEffect(() => { setBackgroundLayer('OpenStreetMap'); }, [positionnew]);

  const showCropLayer = locationConfirmed && soilCode && cropCode && inputCode && waterCode && activePanel === 'Results & Report';

  const SoilFERWMTS =
    'https://data.apps.fao.org/map/wmts/wmts' +
    '?service=WMTS&version=1.0.0&request=GetTile' +
    '&layer=fao-gismgr/SOILFER/mapsets/SIS' +
    '&style=SI-SOILFER&tilematrixset=EPSG:4326' +
    '&tilematrix={z}&tilerow={y}&tilecol={x}&format=image/png' +
    `&dim_CROP=${cropCode}&dim_SOIL=${soilCode}S&dim_WIML=${inputCode}${waterCode}`;

  const adminBoundariesWMS = 'https://data.apps.fao.org/map/gsrv/gsrv1/boundaries/wms';
  const gaulStatsWMS = 'https://data.apps.fao.org/map/gsrv/gsrv1/gaul/wms';
  const gaulStatsViewparams = `&viewparams=crop:${cropCode.toLowerCase()}%3Binput:${(inputCode + waterCode).toLowerCase()}%3Bsoil:${soilCode}`;

  const DEFAULT_CENTER: [number, number] = [20, 0];
  const DEFAULT_ZOOM = 3.5;

  const mapCenter: [number, number] = positionnew ? [positionnew.lat, positionnew.lng] : (position as [number, number]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: theme.zIndex.map }}>
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} doubleClickZoom={false} style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <MapClickHandler />
        {positionnew
          ? <LocationMarker />
          : <FlyTo position={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} trigger={null} />
        }
      </MapContainer>

      {showCropLayer && (
        <>
          <div style={{ position: 'absolute', ...(isSmallScreen ? { top: '80px' } : { bottom: '10px' }), left: '10px', zIndex: 3, borderRadius: '10px', border: 'solid 1px #999', background: '#f1f1f1', width: 'fit-content' }}>
            <button
              onClick={() => setBgPanelOpen(o => !o)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'white',
                border: 'none', cursor: 'pointer', padding: '6px 10px', width: '100%',
                borderRadius: bgPanelOpen ? '8px 8px 0 0' : '8px',
                boxShadow: '0 0 10px rgba(0,0,0,0.2)' }}
            >
              <i className="pi pi-map" />
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>BACKGROUNDS:</span>
              <i className={`pi pi-chevron-${bgPanelOpen ? 'up' : 'down'}`}
                style={{ marginLeft: 'auto', fontSize: '10px' }} />
            </button>
            {bgPanelOpen && (
              <div style={{ padding: '5px' }}>
                <div style={{ backgroundColor: 'white', padding: '5px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.2)', width: 'fit-content' }}>                  
                  <label style={{ marginLeft: '10px' }}>
                    <input type="radio" name="bgLayer" checked={backgroundLayer === 'OpenStreetMap'} onChange={() => setBackgroundLayer('OpenStreetMap')} /> OpenStreetMap
                  </label>
                  <label style={{ marginLeft: '10px' }}>
                    <input type="radio" name="bgLayer" checked={backgroundLayer === 'Satellite'} onChange={() => setBackgroundLayer('Satellite')} /> Satellite
                  </label>
                  <label style={{ marginLeft: '10px' }}>
                    <input type="radio" name="bgLayer" checked={backgroundLayer === 'Crop Suitability'} onChange={() => setBackgroundLayer('Crop Suitability')} /> {crop} Suitability
                  </label>
                  <label style={{ marginLeft: '10px' }}>
                    <input type="radio" name="bgLayer" checked={backgroundLayer === 'Crop Statistics'} onChange={() => setBackgroundLayer('Crop Statistics')} /> {crop} Average Yield
                  </label>
                </div>
                {backgroundLayer === 'Crop Suitability' && (
                  <div className="flex flex-column gap-1" style={{ width: 'fit-content', marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '10px' }}>
                      <p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', margin: 0 }}><b><u>CLASS INDEX</u> (<a href=' https://data.apps.fao.org/catalog//iso/8c2ff562-23bf-48d9-9dac-878518b78323'  target='_blank'>Metadata</a>):</b></p>
                    </div>
                    <div className="flex flex-row gap-1">
                      <div className="flex flex-column gap-1" style={{ width: '200px' }}>
                        <div className="flex flex-row align-items-center"><div className="si-very-high" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 85: Very high</p></div>
                        <div className="flex flex-row align-items-center"><div className="si-high" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 70: High</p></div>
                        <div className="flex flex-row align-items-center"><div className="si-good" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 55: Good</p></div>
                        <div className="flex flex-row align-items-center"><div className="si-medium" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 40: Medium</p></div>
                        <div className="flex flex-row align-items-center"><div className="si-moderate" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 25: Moderate</p></div>
                      </div>
                      <div className="flex flex-column gap-1" style={{ width: '200px' }}>
                        <div className="flex flex-row align-items-center"><div className="si-marginal" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 10: Marginal</p></div>
                        <div className="flex flex-row align-items-center"><div className="si-very-marginal" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &lt; 0: Very marginal</p></div>
                        <div className="flex flex-row align-items-center"><div className="si-not-suitable" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>Not Suitable</p></div>
                        <div className="flex flex-row align-items-center"><div className="si-not-present" style={{ width: '20px', height: '20px', marginRight: '5px', border: '1px dashed #555' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>Not Present</p></div>
                        <div className="flex flex-row align-items-center"><div className="si-water" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>Water</p></div>
                      </div>
                    </div>
                  </div>
                )}
                {backgroundLayer === 'Crop Statistics' && (
                  <div className="flex flex-column gap-1" style={{ width: 'fit-content', marginTop: '5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '10px' }}>
                      <p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', margin: 0 }}><b><u>Average agro-ecological attainable yield (kg (DW)/ha)<br />by sub-national administrative unit</u> (<a href='https://data.apps.fao.org/catalog//iso/caa78180-d998-4ad6-b3fa-cbb3ac251c33' target='_blank' rel='noreferrer'>Metadata</a>):</b></p>
                    </div>
                    <div className="flex flex-row gap-1">
                      <div className="flex flex-column gap-1" style={{ width: '200px' }}>
                        <div className="flex flex-row align-items-center"><div className="st-very-high" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>&gt; 500</p></div>
                        <div className="flex flex-row align-items-center"><div className="st-high" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>200 - 500</p></div>
                        <div className="flex flex-row align-items-center"><div className="st-good" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>50 - 200</p></div>
                        <div className="flex flex-row align-items-center"><div className="st-medium" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>10 - 50</p></div>
                      </div>
                      <div className="flex flex-column gap-1" style={{ width: '200px' }}>
                        <div className="flex flex-row align-items-center"><div className="st-moderate" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>1 - 10</p></div>
                        <div className="flex flex-row align-items-center"><div className="st-marginal" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>0 - 1</p></div>
                        <div className="flex flex-row align-items-center"><div className="st-very-marginal" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>0</p></div>
                        <div className="flex flex-row align-items-center"><div className="st-not-suitable" style={{ width: '20px', height: '20px', marginRight: '5px' }} /><div className="st-no-data" style={{ width: '20px', height: '20px', marginRight: '5px', border: '1px dashed #555' }} /><p style={{ color: '#555', fontSize: '9pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>No Data</p></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {backgroundLayer === 'OpenStreetMap' && (
            <MapContainer center={mapCenter} zoom={zoomLevel - 1}
              style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 2 }} doubleClickZoom={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
              <WMSTileLayer url={adminBoundariesWMS} layers="bndl" format="image/png" transparent={true} attribution="UN Clear Map" />
              <MapClickHandler />
              {positionnew && <Marker position={[positionnew.lat, positionnew.lng]} />}
              <SyncedMap center={mapCenter} zoom={zoomLevel - 1} />
            </MapContainer>
          )}

           {backgroundLayer === 'Crop Statistics' && (
            <MapContainer center={mapCenter} zoom={9} crs={L.CRS.EPSG4326}
              style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 2 }} doubleClickZoom={false}>
              <WmsImageLayer url={gaulStatsWMS} layers="gaul:gaul2_stats" viewparams={gaulStatsViewparams} />
              <MapClickHandler />
              {positionnew && <Marker position={[positionnew.lat, positionnew.lng]} />}
              <SyncedMap center={mapCenter} zoom={9} />
            </MapContainer>
          )}

          {backgroundLayer === 'Crop Suitability' && (
            <MapContainer center={mapCenter} zoom={12} crs={L.CRS.EPSG4326}
              style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 2 }} doubleClickZoom={false}>
              <TileLayer url={SoilFERWMTS} tms={false} attribution="&copy; FAO SoilFER" />
              <WMSTileLayer url={adminBoundariesWMS} layers="bndl" format="image/png" transparent={true} attribution="UN Clear Map" />
              <MapClickHandler />
              {positionnew && <Marker position={[positionnew.lat, positionnew.lng]} />}
              <SyncedMap center={mapCenter} zoom={12} />
            </MapContainer>
          )}         

          {backgroundLayer === 'Satellite' && (
            <MapContainer center={mapCenter} zoom={zoomLevel - 1}
              style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 2 }} doubleClickZoom={false}>
              <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" />
              <WMSTileLayer url={adminBoundariesWMS} layers="bndl" format="image/png" transparent={true} attribution="UN Clear Map" />
              <MapClickHandler />
              {positionnew && <Marker position={[positionnew.lat, positionnew.lng]} />}
              <SyncedMap center={mapCenter} zoom={zoomLevel - 1} />
            </MapContainer>
          )}
        </>
      )}
    </div>
  );
};