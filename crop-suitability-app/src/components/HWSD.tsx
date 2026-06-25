import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
  Popup,
  useMap,
  WMSTileLayer
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L, { LatLngTuple, CRS } from "leaflet";

import { FloatingLocationPanel } from './FloatingLocationPanel';
import './map.css';
import './Result.css';

export const HWSD = (props) => {
  const {
    location,
    positionnew, 
    setPositionNew,     
    zoomLevel, 
    setZoomLevel, 
    MapClickHandler,
    rerender, 
    setRerender, 
    historicalClimate, 
    setHistoricalClimate, 
    details, 
    setDetails,
    show,
    setShow, 
    setLocation,
    administrativeInfo,    
    crop,
    soilCode, cropCode, waterCode, inputCode,
    setSoilCode, setWaterCode, setCropCode, setInputCode,
    setSoil, setCrop, setIrrigation, setInput,
    setCropLayerVisible
  } = props;

  const [position, setPosition] = useState<L.LatLng | null>(positionnew);
  const [backgroundLayer, setBackgroundLayer] = useState('Satellite'); // 'Satellite' or 'Crop Suitability' or 'Administrative Suitability' or 'Watershed Suitability'

  useEffect(() => {
    setPosition(positionnew);
    if(location)
      setZoomLevel(13);
    
    setSoil('');
    setSoilCode('');
    setCrop('');
    setCropCode('');
    setInput('');
    setInputCode('');
    setIrrigation('');
    setWaterCode('');
    
    setCropLayerVisible(false);
    setBackgroundLayer('Satellite');
  }, [positionnew]);

  const ResetMarker = (props) => {
    const {
      location,
      position, 
      zoomLevel, 
      rerender,
      setLocation 
    } = props;
    const map = useMap();
    const markerRef = useRef(null);
  
    useEffect(() => {      
      map.flyTo(position, zoomLevel);
    }, [position, rerender]);

    return position === null ? null : (
      <Marker         
        position={position} 
        ref={markerRef}
      />
    );
  }

  const LocationMarker = (props) => {
    const {
      location,
      position, 
      zoomLevel, 
      rerender, 
      setRerender, 
      historicalClimate, 
      setHistoricalClimate, 
      details, 
      setDetails, 
      setShow, 
      setLocation 
    } = props;
    const map = useMap();
  
    useEffect(() => {      
      map.flyTo(position, zoomLevel);
    }, [position, rerender]);
  
    const [popupState, setPopupState] = useState('initial');
    const markerRef = useRef(null);
  
    useEffect(() => {
      setPopupState('initial');
      if (markerRef.current) {
        markerRef.current.openPopup(); 
      }
    }, [position]);
  
    const handleMarkerClick = () => {
      if (markerRef.current) { // Check if markerRef is valid before proceeding
        if (popupState === 'initial') {
          setPopupState('details'); 
          markerRef.current.openPopup(); 
        }
      }
    };
  
    return position === null ? null : (
      <Marker         
        position={position} 
        ref={markerRef} 
        eventHandlers={{
          click: handleMarkerClick, 
          add: (e) => {
            e.target.openPopup(); 
          }
        }}
      >
        {popupState === 'initial' ? (
          <Popup closeButton={false} autoClose={false} closeOnClick={false}>
            <div 
              style={{ 
                display: 'flex',
                borderRadius: '4px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)', 
                fontSize: '14px', 
                fontWeight: 'bold', 
                alignItems: 'center',
                justifyContent: 'center',
                width: '360px',
                textAlign: 'center',
                color: 'white'
              }} 
              onClick={handleMarkerClick} 
            >
              Your selected location, click the marker below for more details.
            </div>
          </Popup>
        ) : (
          <Popup closeButton={true} autoClose={false}>
            <div style={{ margin: 0, padding: 0, width: '370px', height: 'fit-content', overflow: 'auto', backgroundColor: '#7e5134' }}>
            <FloatingLocationPanel 
                position={position}
                setZoomLevel={setZoomLevel}
                setPositionNew={setPositionNew}
                rerender={rerender} 
                setRerender={setRerender} 
                historicalClimate={historicalClimate} 
                setHistoricalClimate={setHistoricalClimate} 
                details={details} 
                setDetails={setDetails} 
                setShow={setShow} 
                setLocation={setLocation} 
                map={map} 
                administrativeInfo={administrativeInfo}
                style={{ margin: 0, padding: 0 }}
              />
            </div>            
          </Popup>
        )}
      </Marker>
    );
  };

  // Construct the WMTS URL template for the Soil Fertility layer
  const SoilFERWMTS =
    'https://data.apps.fao.org/map/wmts/wmts' +
    '?service=WMTS' +
    '&version=1.0.0' +
    '&request=GetTile' +
    '&layer=fao-gismgr/SOILFER/mapsets/SIS' +
    '&style=SI-SOILFER' +
    '&tilematrixset=EPSG:4326' +
    '&tilematrix={z}' +
    '&tilerow={y}' +
    '&tilecol={x}' +
    '&format=image/png' +
    '&dim_CROP='+cropCode +
    '&dim_SOIL='+soilCode+'S' +
    '&dim_WIML='+inputCode+waterCode;

  // Add a new component to sync both maps
  const SyncedMap = ({ mapCenter, mapZoom }) => {
    const map = useMap();
    
    useEffect(() => {
      if (mapCenter) {
        map.setView(mapCenter, mapZoom);
      }
    }, [mapCenter, mapZoom]);
    
    return null;
  };

  const adminBoundariesWMSUrl = 
    'https://data.apps.fao.org/map/gsrv/gsrv1/boundaries/wms' +
    '?SERVICE=WMS' +
    '&VERSION=1.3.0' +
    '&REQUEST=GetMap';

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <MapContainer
        center={position || [1.5, 24.5]}
        zoom={zoomLevel}
        style={{ height: '100vh', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors, <a href='https://open-meteo.com/' target='_blank'>Open Meteo</a>"
        />
        <MapClickHandler />
        {position && <>
            <ResetMarker position={position} zoomLevel={zoomLevel} rerender={rerender} setRerender={setRerender} setLocation={setLocation} />
          </>
        }
        {(position && location) && <>
            <LocationMarker position={position} zoomLevel={zoomLevel} rerender={rerender} setRerender={setRerender} historicalClimate={historicalClimate} setHistoricalClimate={setHistoricalClimate} details={details} setDetails={setDetails} setShow={setShow} setLocation={setLocation} />
            {/*!show && <Circle center={position} radius={bufferRadius} color="blue" />*/}
          </>
        }
      </MapContainer>
      {(setCropLayerVisible && soilCode && cropCode && inputCode && waterCode && show === "Results & Report") &&  (
        <>
          <footer className="flex flex-column" style={{ padding: "10px", background: "#f1f1f1", bottom: "5px", left: "10px", position: "absolute", zIndex: "3", borderRadius: "10px", border: "solid 1px #999", width: "fit-content" }}>
            {/* Layer selection control */}
            <div className="flex" style={{
              marginLeft: 'auto',
              backgroundColor: 'white',
              padding: '5px',
              borderRadius: '5px',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
              width: 'fit-content'
            }}>
              <label><b>BACKDROP</b>:</label>
              <label style={{ marginLeft: '10px' }}>
                <input 
                  type="radio" 
                  name="backgroundLayer" 
                  checked={backgroundLayer === 'Satellite'} 
                  onChange={() => setBackgroundLayer('Satellite')}
                /> Satellite
              </label>
              <label style={{ marginLeft: '10px' }}>
                <input 
                  type="radio" 
                  name="backgroundLayer" 
                  checked={backgroundLayer === 'Crop Suitability'}
                  onChange={() => setBackgroundLayer('Crop Suitability')}
                /> {crop} Suitability
              </label>              
            </div>
            
            {backgroundLayer  === 'Crop Suitability' && <div className="flex flex-column gap-1" style={{ width: 'fit-content' }}>
                <p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder' }}><b><u>{crop.toUpperCase()} SUITABILITY KEY:</u></b></p>
                <div className="flex flex-row gap-1">
                  <div className="flex flex-column gap-1" style={{ width: 'fit-content' }}>
                    <div className="flex flex-row align-items-center"><div className="si-very-high" style={{ width: '20px', height: '20px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 85: Very high</p></div>
                    <div className="flex flex-row align-items-center"><div className="si-high" style={{ width: '20px', height: '20px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 70: High</p></div>
                  </div>
                  <div className="flex flex-column gap-1" style={{ width: 'fit-content' }}>
                    <div className="flex flex-row align-items-center"><div className="si-good" style={{ width: '20px', height: '20px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 55: Good</p></div>
                    <div className="flex flex-row align-items-center"><div className="si-medium" style={{ width: '20px', height: '20px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 40: Medium</p></div>
                  </div>
                  <div className="flex flex-column gap-1" style={{ width: 'fit-content' }}>
                    <div className="flex flex-row align-items-center"><div className="si-moderate" style={{ width: '20px', height: '20px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 25: Moderate</p></div>
                    <div className="flex flex-row align-items-center"><div className="si-marginal" style={{ width: '20px', height: '20px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 10: Marginal</p></div>
                  </div>
                  <div className="flex flex-column gap-1" style={{ width: 'fit-content' }}>
                    <div className="flex flex-row align-items-center"><div className="si-very-marginal" style={{ width: '20px', height: '20px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &lt; 0: Very marginal</p></div>
                    <div className="flex flex-row align-items-center"><div className="si-not-suitable" style={{ width: '20px', height: '20px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder', padding: 0, margin: 0 }}>Not Suitable</p></div>
                  </div>
                  <div className="flex flex-column gap-1" style={{ width: 'fit-content' }}>
                    <div className="flex flex-row align-items-center"><div className="si-not-present" style={{ width: '20px', height: '20px', marginRight: '5px', border: '1px dashed #555' }}></div><p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder', padding: 0, margin: 0 }}>Not Present</p></div>
                    <div className="flex flex-row align-items-center"><div className="si-water" style={{ width: '20px', height: '20px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '0.5vw', fontWeight: 'bolder', padding: 0, margin: 0 }}>Water</p></div>
                  </div>
                </div>
            </div>}
          </footer>

          {/* Agroinformatics map container */}
          {backgroundLayer  !== 'Satellite' && <MapContainer 
              center={position || [1.5, 24.5]} 
              zoom={zoomLevel-1} 
              crs={L.CRS.EPSG4326} 
              style={{ 
                height: '100vh', 
                width: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                zIndex: 2
              }}
            >                
              
              {backgroundLayer  === 'Crop Suitability' && <TileLayer
                url={SoilFERWMTS}
                tms={false}
                attribution="&copy; <a href='https://www.fao.org/global-soil-partnership/soilfer/en/' target='_blank'>FAO SoilFER</a>"
              />}
              
              {/* Add WMS Layer with correct configuration */}
              <WMSTileLayer
                url={adminBoundariesWMSUrl}              
                layers="bndl"
                format="image/png"
                transparent={true}
                attribution=" <a href='https://geoportal.un.org/arcgis/home/item.html?id=541557fd0d4d42efb24449be614e6887' target='_blank'>UN Clear Map</a>"
              />

              {position && (
                <>
                  <LocationMarker position={position} zoomLevel={zoomLevel} rerender={rerender} setRerender={setRerender} historicalClimate={historicalClimate} setHistoricalClimate={setHistoricalClimate} details={details} setDetails={setDetails} setShow={setShow} setLocation={setLocation} />
                  {/*<Circle center={position} radius={bufferRadius} color="purple" />*/}
                </>
              )}
              <SyncedMap mapCenter={position} mapZoom={zoomLevel-1} />
              <MapClickHandler />
            </MapContainer>
          }

          {/* Satellite map container */}
          {backgroundLayer  === 'Satellite' && <MapContainer 
              center={position || [1.5, 24.5]} 
              zoom={zoomLevel-1} 
              style={{ 
                height: '100vh', 
                width: '100%', 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                zIndex: 2
              }}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              />
              
              <WMSTileLayer
                url={adminBoundariesWMSUrl}              
                layers="bndl"
                format="image/png"
                transparent={true}
                attribution=" <a href='https://geoportal.un.org/arcgis/home/item.html?id=541557fd0d4d42efb24449be614e6887' target='_blank'>UN Clear Map</a>"
              />

              {position && (
                <>
                  <LocationMarker position={position} zoomLevel={zoomLevel} rerender={rerender} setRerender={setRerender} historicalClimate={historicalClimate} setHistoricalClimate={setHistoricalClimate} details={details} setDetails={setDetails} setShow={setShow} setLocation={setLocation} />
                </>
              )}
              <SyncedMap mapCenter={position} mapZoom={zoomLevel-1} />
              <MapClickHandler />
            </MapContainer>
          }

        </>   )}
      {/*statistics && (
        <footer style={{ padding: "10px", background: "#f1f1f1", bottom: "0", position: "absolute", right: "0", zIndex: "3"}}>
          <strong>HWSD Statistics:</strong>
          <pre>{statistics}</pre>
        </footer>
      )*/}
    </div>
  );
};