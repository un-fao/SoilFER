import { useState,useEffect,useRef } from 'react';
import { Card } from 'primereact/card';
import MapContext from './components/MapContext';
import { Location } from './components/Location';
import { FloatingNav } from './components/FloatingNav';
import { FloatingPanel } from './components/FloatingPanel';
import { HWSD } from './components/HWSD';
import L from "leaflet";
import { useMapEvents } from "react-leaflet";

import './App.css';

import "primereact/resources/themes/saga-orange/theme.css"; 
import "primeflex/primeflex.css";
import 'primeicons/primeicons.css';
import 'fontawesome/css/all.css';

import styled from 'styled-components';

import * as GeoTIFF from "geotiff";

// Import the HWSD classes data

export const Panel = styled.div`
  background-color: #7e5134;
  color: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 5px 10px #888888;
  font-weight: bold;
`;

export const Info = styled.div`
  margin-top: 10px;
`;

export const SubmitButton = styled.button`
  background-color: #ffba00;
  color: #333;
  border: none;
  padding: 10px;
  width: 100%;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
  margin-top: 10px;
  font-size: 0.65vw;
`;

export const CancelButton = styled.button`
  background-color: #492815;
  color: #fff;
  border: none;
  padding: 10px;
  width: 100%;
  cursor: pointer;
  font-weight: bold;
  border-radius: 5px;
  margin-top: 10px;
  font-size: 0.65vw;
`;

export const nFormat = new Intl.NumberFormat(undefined, {minimumFractionDigits: 0});

const App = () => {
  const [positionnew, setPositionNew] = useState<L.LatLng | null>(null);
  const [administrativeInfo, setAdministrativeInfo] = useState<any>(null);
  const [bufferRadius, setBufferRadius] = useState(10000); // in meters
  const [statistics, setStatistics] = useState<string | null>(null);
  const [HWSDStatistics, setHWSDStatistics] = useState<any>(null);
  const [position, setPosition] = useState([1.5, 24.5]);
  const initLatitude = useRef(1.5);
  const initLongitude = useRef(24.5);
  const [zoomLevel, setZoomLevel] = useState(3);
  const [rerender, setRerender] = useState(null);
  const viewAttributes = useRef(false);

  // Helper function to fetch geolocation based on placename and elevation
  const fetchGeocodeWithElevation = async (
    place: string,
    lat?: number,
    lng?: number
  ) => {
    try {
      let latLng = { lat, lng };
      let address = null;
  
      if (place) {
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            place
          )}&format=json&addressdetails=1`
        );
  
        const nominatimData = await nominatimResponse.json();
  
        if (nominatimData.length === 0) {
          throw new Error("Location not found.");
        }
  
        const { lat, lon, address: addr } = nominatimData[0];
        latLng = { lat: parseFloat(lat), lng: parseFloat(lon) };
        address = addr;
      } else if (lat !== undefined && lng !== undefined) {
        const nominatimReverseResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
  
        const nominatimReverseData = await nominatimReverseResponse.json();
  
        if (!nominatimReverseData.address) {
          throw new Error("Location details not found for given coordinates.");
        }
  
        address = nominatimReverseData.address;
      }
  
      let elevation = null;
  
      try {
        const openMeteoResponse = await fetch(
          `https://api.open-meteo.com/v1/elevation?latitude=${latLng.lat}&longitude=${latLng.lng}`
        );
  
        const openMeteoData = await openMeteoResponse.json();
  
        if (openMeteoData.elevation !== undefined) {
          elevation = openMeteoData.elevation;
        } else {
          throw new Error("Open-Meteo elevation data not found.");
        }
      } catch (e) {
        console.warn("Open-Meteo failed. Trying Open-Elevation as a fallback.");
  
        const elevationResponse = await fetch(
          `https://api.open-elevation.com/api/v1/lookup?locations=${latLng.lat},${latLng.lng}`
        );
  
        const elevationData = await elevationResponse.json();
  
        if (elevationData.results && elevationData.results.length > 0) {
          elevation = elevationData.results[0].elevation;
        } else {
          throw new Error("Elevation data not found.");
        }
      }
  
      return {
        lat: latLng.lat,
        lng: latLng.lng,
        elevation,
        address,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to fetch geocode and elevation: ${error.message}`
        );
      }
  
      throw new Error(
        "Unknown error occurred while fetching geocode and elevation."
      );
    }
  };

  useEffect(()=>{
    if (navigator.geolocation) {
      var setting = false;
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          const userPosition = [latitude, longitude];
          const latLng = new L.LatLng(latitude, longitude);
          const location = await fetchGeocodeWithElevation("", latitude, longitude);
          setAdministrativeInfo(location);
          setPositionNew(latLng);
          setPosition(userPosition);
          setZoomLevel(18);
          viewAttributes.current = true;
          initLatitude.current = latitude;
          initLongitude.current = longitude;
          setting = true;
          setLocation(true);
        },
        (err) => {
          console.error(err);
        }
      );
      if(setting)
        console.log("Location setting");
      else
        console.log("No Location setting");
    } else {
      console.error('Geolocation is not supported by this browser');
    }
    setRerender(position);
  },[]);

  const MapClickHandler = () => {    
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        const latLng = new L.LatLng(lat, lng);

        setPosition([lat, lng]);        
        //fetchHWSDStatistics(lat, lng, bufferRadius);
        if(show !== 'Soil')
          setShow('');

        try {
          const adminlocation = await fetchGeocodeWithElevation("", lat, lng);
          setAdministrativeInfo(adminlocation);
          setLocation(true);
          setPositionNew(latLng);
        } catch (error) {
          if (error instanceof Error) {
            alert(error.message);
          } else {
            alert("An unknown error occurred.");
          }
        }
      },
    });
    return null;
  };

  const crops = {
        "Banana": {scientificName: "Musa spp.", ecocropID: 2483, SoilFERCode: "BAN"},
        "Biomass sorghum": {scientificName: "Sorghum bicolor", ecocropID: 1982, SoilFERCode: "BSG"},        
        "Groundnut": {scientificName: "Arachis hypogaea", ecocropID: 2199, SoilFERCode: "GRD"},
        "Gram": {scientificName: "Cicer arietinum", ecocropID: 2479, SoilFERCode: "GRM"},
        "Pigeon pea": {scientificName: "Cajanus cajan", ecocropID: 576, SoilFERCode: "PIG"},
        "Pearl millet": {scientificName: "Pennisetum glaucum", ecocropID: 8418, SoilFERCode: "PML"},
        "Sweet potato": {scientificName: "Ipomoea batatas", ecocropID: 1265, SoilFERCode: "SPO"},
        "Maize": {scientificName: "Zea mays", ecocropID: 2175, SoilFERCode: "MZE"},
        "Cassava": {scientificName: "Manihot esculenta", ecocropID: 1420, SoilFERCode: "CSV"},
        "Soybean": {scientificName: "Glycine max", ecocropID: 1150, SoilFERCode: "SOY"},
        "Tomato": {scientificName: "Solanum lycopersicum", ecocropID: 1379, SoilFERCode: "TOM"},
        "White yam": {scientificName: "Dioscorea rotundata", ecocropID: 942, SoilFERCode: "WYA"}
    }

  const [historicalClimate, setHistoricalClimate] = useState<boolean>(false);
  const [details, setDetails] = useState<boolean>(false);  
  const [location, setLocation] = useState<boolean>(false);
  const [show,setShow] = useState<string>('');

  const [soil,setSoil] = useState<string>('');
  const [crop,setCrop] = useState<string>('');
  const [irrigation,setIrrigation] = useState<boolean>(null);
  const [input,setInput] = useState<string>('');

  const [soilCode,setSoilCode] = useState<string>('');
  const [soilName,setSoilName] = useState<string>('');
  const [cropCode,setCropCode] = useState<string>('');
  const [waterCode,setWaterCode] = useState<string>('');
  const [inputCode,setInputCode] = useState<string>('');
  const [cropLayerVisible, setCropLayerVisible] = useState<boolean>(false);

  const fetchHWSDStatistics = async (
    lat: number,
    lng: number,
    radius: number
  ) => {
    setHWSDStatistics(null);
    try {
      // Construct the full URL
      const url = `http://34.78.39.234:5000/clip?action=geotiff&latitude=${lat}&longitude=${lng}&buffer_km=${radius/1000}`;
      // Fetch the TIFF file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the ArrayBuffer of the TIFF file
      const arrayBuffer = await response.arrayBuffer();
      
      if (!arrayBuffer) {
        throw new Error("Failed to load GeoTIFF from Clipper");
      }

      const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      const rasters = await image.readRasters();

      const metadata = image.getFileDirectory();
      const [originX, originY] = image.getOrigin();
      const [resolutionX, resolutionY] = image.getResolution();

      const centerX = Math.round((lng - originX) / resolutionX);
      const centerY = Math.round((lat - originY) / resolutionY);

      const bufferPixels = Math.round(radius / resolutionX); // Assuming square pixels
      const uniqueValues = new Map<number, number>();
      const centerPointValue = rasters[0][centerY * image.getWidth() + centerX];

      const startY = Math.max(centerY - bufferPixels, 0);
      const endY = Math.min(centerY + bufferPixels, image.getHeight() - 1);
      const startX = Math.max(centerX - bufferPixels, 0);
      const endX = Math.min(centerX + bufferPixels, image.getWidth() - 1);

      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          const value = rasters[0][y * image.getWidth() + x];
          if (uniqueValues.has(value)) {
            uniqueValues.set(value, uniqueValues.get(value)! + 1);
          } else {
            uniqueValues.set(value, 1);
          }
        }
      }

      const totalBufferPixels = Array.from(uniqueValues.values()).reduce(
        (a, b) => a + b,
        0
      );

      const sortedUniqueValues = Array.from(uniqueValues.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => {
          const percentage = ((count / totalBufferPixels) * 100).toFixed(2);
          return `Value: ${value}, Count: ${count}, Percentage: ${percentage}%`;
        });

      const fullStatistics = [
        "Center Point Statistics:",
        `Value: ${centerPointValue}`,
        "",
        "Buffer Area Statistics:",
        ...sortedUniqueValues,
      ].join("\n");

      setStatistics(fullStatistics);

      const sortedHSWDClasses = Array.from(uniqueValues.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => {
          let percentage = ((count / totalBufferPixels) * 100).toFixed(2);
          return {ID: value, Count: count, Percentage: percentage};
        });

      const fullHWSDStatistics = {
        centre: {ID: centerPointValue},
        classes: sortedHSWDClasses
      }
      
      setHWSDStatistics(fullHWSDStatistics);

    } catch (error) {
      if (error instanceof Error) {
        console.error("Detailed error:", error);
        alert("Failed to extract HWSD data: " + error.message);
      } else {
        alert("An unknown error occurred while extracting HWSD data.");
      }
    }
  };

  return (
    <>
      <div className="App">

        {location && <div className="context" style={{ left: '150px', width: '15vw', minWidth: '320px', height: 'fit content', zIndex: 4, position: 'absolute', top: '20px' }}>
          <Card className="m-10 p-2" style={{ borderStyle: 'solid',  borderColor: '#7e5134', borderRadius: '20px' }} >
            <div className="m-0 p-1 flex flex-row"><i className="pi pi-map-marker" /> SELECTED LOCATION</div>
            <MapContext position={position} zoomLevel={4} setZoomLevel={4} MapClickHandler={MapClickHandler} rerender={rerender} setRerender={setRerender} positionnew={positionnew} setPositionNew={setPositionNew} administrativeInfo={administrativeInfo} setAdministrativeInfo={setAdministrativeInfo} />
            <Location position={position} setPosition={setPosition} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} rerender={rerender} setRerender={setRerender} initLatitude={initLatitude} initLongitude={initLongitude} viewAttributes={viewAttributes} setShow={setShow} 
              soil={soil}
              crop={crop}
              irrigation={irrigation}
              input={input}
              soilCode={soilCode} soilName={soilName}
              cropCode={cropCode}
              inputCode={inputCode}
              setLocation={setLocation}
              positionnew={positionnew} setPositionNew={setPositionNew} administrativeInfo={administrativeInfo} setAdministrativeInfo={setAdministrativeInfo}
              HWSDStatistics={HWSDStatistics} setHWSDStatistics={setHWSDStatistics}
              setSoilCode={setSoilCode} setCropCode={setCropCode} setWaterCode={setWaterCode} setInputCode={setInputCode}
              cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible}
              />
          </Card>
        </div>}
        
        {!location && <div className="p-0 m-0" style={{ left: '150px', width: '15vw', minWidth: '300px', height: 'fit content', zIndex: 4, position: 'absolute', top: '20px' }}>
          <FloatingPanel show={"Location"} rerender={rerender} setRerender={setRerender} historicalClimate={historicalClimate} setHistoricalClimate={setHistoricalClimate} details={details} setDetails={setDetails} location={location} setLocation={setLocation} positionnew={positionnew} setPositionNew={setPositionNew} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} administrativeInfo={administrativeInfo} setAdministrativeInfo={setAdministrativeInfo} bufferRadius={bufferRadius} setBufferRadius={setBufferRadius} HWSDStatistics={HWSDStatistics} setHWSDStatistics={setHWSDStatistics} cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible} />
        </div>}

        {show != '' && <>
          <div id="showFloater" className="m-0 p-0" style={{ display: 'inline-block', position: 'absolute', top: '70px', right: '20px' }}>
            <div className="p-0 m-0 clearfix" style={{ width: 'fit-content', minWidth: '725px', height: 'fit-content', zIndex: 4, position: 'absolute', right: '5vw' }}>
              <FloatingNav show={show} setShow={setShow} soil={soil} crop={crop} irrigation={irrigation} input={input} />
              <FloatingPanel show={show} setShow={setShow} rerender={rerender} setRerender={setRerender} historicalClimate={historicalClimate} setHistoricalClimate={setHistoricalClimate} details={details} setDetails={setDetails} positionnew={positionnew} bufferRadius={bufferRadius} administrativeInfo={administrativeInfo} setZoomLevel={setZoomLevel}
                soil={soil} setSoil={setSoil} 
                crops={crops} crop={crop} setCrop={setCrop}
                irrigation={irrigation}
                setIrrigation={setIrrigation}            
                input={input}
                setInput={setInput}
                soilCode={soilCode} soilName={soilName} cropCode={cropCode} waterCode={waterCode} inputCode={inputCode}
                setSoilCode={setSoilCode} setSoilName={setSoilName} setCropCode={setCropCode} setWaterCode={setWaterCode} setInputCode={setInputCode} setCropLayerVisible={setCropLayerVisible}
                HWSDStatistics={HWSDStatistics} setHWSDStatistics={setHWSDStatistics} fetchHWSDStatistics={fetchHWSDStatistics}
                />
            </div>          
          </div>
          <div id="hideFloater" className="m-0 p-0" style={{ right: '50px', width: 'fit-content', zIndex: 5, position: 'absolute', top: '70px', overflow: 'auto', display: 'none' }}>
            <i className="pi pi-window-maximize p-0 m-0 cursor-pointer" onClick={()=>{document.getElementById('showFloater').style.display='inline-block';document.getElementById('hideFloater').style.display='none'}} style={{ color: '#6e431d', fontSize: '2vw' }} />
          </div>
        </>} 

        <div style={{ right: '50px', width: 'fit-content', zIndex: 4, position: 'absolute', top: '10px' }}>
          <img src="SoilFERlogo.png" alt="SoilFER App" style={{ width: '200px' }} />
        </div> 

        <HWSD positionnew={positionnew} setPositionNew={setPositionNew} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} MapClickHandler={MapClickHandler} rerender={rerender} setRerender={setRerender} historicalClimate={historicalClimate} setHistoricalClimate={setHistoricalClimate} details={details} setDetails={setDetails} show={show} setShow={setShow} location={location} setLocation={setLocation} administrativeInfo={administrativeInfo} setAdministrativeInfo={setAdministrativeInfo} bufferRadius={bufferRadius} setBufferRadius={setBufferRadius} statistics={statistics} setStatistics={setStatistics} HWSDStatistics={HWSDStatistics} setHWSDStatistics={setHWSDStatistics} fetchGeocodeWithElevation={fetchGeocodeWithElevation} fetchHWSDStatistics={fetchHWSDStatistics}
           crop={crop} soilCode={soilCode} cropCode={cropCode} waterCode={waterCode} inputCode={inputCode}           
           setSoilCode={setSoilCode} setCropCode={setCropCode} setWaterCode={setWaterCode} setInputCode={setInputCode}
           cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible}
           setSoil={setSoil} setCrop={setCrop} setIrrigation={setIrrigation} setInput={setInput}
        />

      </div>  
    </>
    
  );
};

export default App;
