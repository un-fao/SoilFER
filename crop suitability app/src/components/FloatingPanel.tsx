import React from 'react';
import { Info, SubmitButton, CancelButton } from '../App';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Soil } from './Soil';
import { Crops } from './Crops';
import { Water } from './Water';
import { Input } from './Input';
import { Result } from './Result';
import { TechnicalDocumentation } from './TechnicalDocumentation';
import styled from 'styled-components';
import L from "leaflet";

const Panel = styled.div`
  background-color: #7e5134;
  color: #fff;  
  padding: 20px;
  border-radius: 10px;
  position: absolute;
  top: 48px;
`;

export const FloatingPanel = (props) => {
    const {rerender,setRerender,historicalClimate,setHistoricalClimate,details,setDetails,show,setShow,location,setLocation,positionnew,setPositionNew,zoomLevel,setZoomLevel,administrativeInfo,setAdministrativeInfo,bufferRadius,setBufferRadius,HWSDStatistics,setHWSDStatistics,fetchHWSDStatistics,
            soil,
            setSoil,
            crops,
            crop,
            setCrop,
            irrigation,
            setIrrigation,
            input,
            setInput,
            soilCode, soilName,
            cropCode,
            waterCode,
            inputCode,
            setSoilCode, setSoilName,
            setCropCode, setWaterCode, setInputCode,
            cropLayerVisible, setCropLayerVisible
        } = props;

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
        
    const handleSearch = async (place) => {
      if(place !== ''){
        setHWSDStatistics(null);
        try {
            const location = await fetchGeocodeWithElevation(place);
            const latLng = new L.LatLng(location.lat, location.lng);
        
            setPositionNew(latLng);
            setAdministrativeInfo(location);
            setLocation(true);
            setZoomLevel(18);            
        } catch (error) {
            if (error instanceof Error) {
                alert(error.message);
            } else {
                alert("An unknown error occurred.");
            }
        }
      }
    };
    
    return(
      <>        
        {show == 'Location' && <Panel>
            <h2 className="p-0 m-0">
                <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#ffba00', fontSize: '22pt' }}><img src="images/LocationIconYellow.png" alt="Location Icon" style={{ height: '30px', marginRight: '10px' }} /> LOCATION</div>
            </h2>
            <Divider />
            <Info>
            <p style={{ fontWeight: 'bold', fontSize: '14pt' }}>What is your Location?</p>
            <p style={{ fontWeight: 'bold', fontSize: '12pt' }}>Enter coordinates / point of interest (eg. street name, city, country etc...)</p>
            <div className="p-inputgroup flex-1">
                <InputText id="location" />
                <span className="p-inputgroup-addon"><i className="pi pi-search" style={{ cursor: 'pointer' }} onClick={()=>{handleSearch((document.getElementById("location") as HTMLInputElement).value);setCropLayerVisible(false);}}></i></span>
            </div>            
            <p style={{ fontWeight: 'bold', fontSize: '12pt' }}>or click on the map</p>
            <p style={{ fontWeight: 'bold', fontSize: '12pt' }}>or use your GPS location <img src="images/LocationIconWhite.png" alt="Location Icon" style={{ height: '20px', marginRight: '10px' }} /></p>
            </Info>
            <CancelButton style={{ fontSize: '11pt' }} onClick={()=>{setLocation(true);setCropLayerVisible(false);}}>CANCEL</CancelButton>
        </Panel>}
        {show == 'Soil' && <Panel>
            <h2 className="p-0 m-0">
                <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#ffba00', fontSize: '22pt' }}><img src="images/SoilIcon.png" alt="Soil Icon" style={{ height: '30px', marginRight: '10px' }} /> SOIL TYPE</div>
            </h2>
            <Divider />
            <Soil setShow={setShow} soil={soil} setSoil={setSoil} HWSDStatistics={HWSDStatistics} setHWSDStatistics={setHWSDStatistics} fetchHWSDStatistics={fetchHWSDStatistics} positionnew={positionnew} bufferRadius={bufferRadius} soilCode={soilCode} setSoilCode={setSoilCode} soilName={soilName} setSoilName={setSoilName} cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible} />
        </Panel>}
        {show == 'Crop' && <Panel>
            <h2 className="p-0 m-0">
                <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#ffba00', fontSize: '22pt' }}><img src="images/CropIcon.png" alt="Crop Icon" style={{ height: '30px', marginRight: '10px' }} /> CROP</div>
            </h2>
            <Divider />
            <Crops setShow={setShow} crops={crops} crop={crop} setCrop={setCrop} cropCode={cropCode} setCropCode={setCropCode} cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible} />
        </Panel>}
        {show == 'Irrigation & Farm Management' && <Panel>
            <h2 className="p-0 m-0">
                <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#ffba00', fontSize: '22pt' }}><img src="images/IrrigationIcon.png" alt="Irrigation Icon" style={{ height: '30px', marginRight: '10px' }} /> IRRIGATION & FARM MANAGEMENT</div>
            </h2>            
            <Divider />
            <Water irrigation={irrigation} setIrrigation={setIrrigation} waterCode={waterCode} setWaterCode={setWaterCode} cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible} />
            <Divider />            
            <Input setShow={setShow} input={input} setInput={setInput} inputCode={inputCode} setInputCode={setInputCode} cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible} irrigation={irrigation} />
        </Panel>}
        {show == 'Results & Report' && <Panel>
            <h2 className="p-0 m-0">
                <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#ffba00', fontSize: '22pt' }}><img src="images/ResultsIcon.png" alt="Results Icon" style={{ height: '30px', marginRight: '10px' }} /> {crop.toUpperCase()} SUITABILITY SUMMARY</div>
            </h2>
            <Divider />
            <Result positionnew={positionnew} bufferRadius={bufferRadius} soilCode={soilCode} soilName={soilName} crops={crops} cropCode={cropCode} waterCode={waterCode} inputCode={inputCode} cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible} administrativeInfo={administrativeInfo} soil={soil} crop={crop} irrigation={irrigation} input={input} />
        </Panel>}
        {show == 'Technical Documentation' && <Panel>
            <h2 className="p-0 m-0">
                <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#ffba00', fontSize: '22pt' }}><img src="images/ResultsIcon.png" alt="Technical Documentation Icon" style={{ height: '30px', marginRight: '10px' }} /> TECHNICAL DOCUMENTATION</div>
            </h2>
            <Divider />
            <TechnicalDocumentation />
        </Panel>}       
      </>
    )
};
