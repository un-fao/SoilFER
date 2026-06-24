import React, { useEffect, useState, useRef } from 'react';
import './Result.css';
import { Divider } from 'primereact/divider';
import { nFormat } from '../App';
import SyncLoader from "react-spinners/SyncLoader";
import { usePDF } from 'react-to-pdf';
import { Report } from './Report';
import { HistoricalClimateData } from './HistoricalClimateData';
import { ResultCarousel } from './ResultCarousel';
import { ResultTable } from './ResultTable';

interface cropSuitability {
  "pixel_values": [any, any],
  "buffer_averages": [any, any]
}

export const Result = (props) => {
  const {
    positionnew,
    rerender,
    setRerender,
    setShow,
    bufferRadius,    
    soilCode, crops, cropCode, waterCode, inputCode, soilName,
    cropLayerVisible, setCropLayerVisible,
    administrativeInfo,soil,crop,irrigation,input,
    publishReport
  } = props;

  const [cropSuitability, setCropSuitability] = useState<any>(null);
  const [averageSuitability, setAverageSuitability] = useState<any>(null);
  const [modeSuitability, setModeSuitability] = useState<any>(null);
  const [attainableYield, setAttainableYield] = useState<any>(null);
  const [relativeYield,setRelativeYield] = useState<any>(null);
  const [dataError, setDataError] = useState<boolean>(true);
  const [allCropDataError, setAllCropDataError] = useState<boolean>(true);
  const [generalSuitability, setGeneralSuitability] = useState<{
    crop: string | null;
    average: string | null;
    mode: string | null;
    yieldAttainable: string | null;
    yieldRelative: string | null;
  }>({ crop: null, average: null, mode: null, yieldAttainable: null, yieldRelative: null });
  const [allCropSuitability, setAllCropSuitability] = useState([]);

  const cropSuitablilityScale = {
    "Very High": [1, 2, 85, 100],
    "High": [2, 3, 70, 85],
    "Good": [3, 4, 55, 70],
    "Medium": [4, 5, 40, 55],
    "Moderate": [5, 6, 25, 40],
    "Marginal": [6, 7, 10, 25],
    "Very Marginal": [7, 8, 0, 10],
    "Not Suitable": [8, 10, 0, 0]
  };

  const attainableYieldScale = {
    "Very High": [8500, 10500],
    "High": [7000, 8500],
    "Good": [5500, 7000],
    "Medium": [4000, 5500],
    "Moderate": [2500, 4000],
    "Marginal": [1000, 2500],
    "Very Marginal": [0, 1000]
  };

  const cropMaxYield = {
    "BAN": 19800,
    "BSG": 28000,
    "CYA": 10000,
    "GRD": 2700,
    "GRM": 1800,
    "PIG": 1800,
    "PLM": 4000,
    "SPO": 15000,
    "MZE": 17000,
    "CSV": 28000,
    "SOY": 2700,
    "TOM": 5000
  }

  const getSuitabilityLevel = (
    value: number | null,
    scale: any
  ): string | null => {
    if (value === null) return null;

    for (const entry of Object.entries(scale)) {
      const [label, range] = entry;
      if (value >= range[0] && value < range[1]) {
        return label;
      }
    }

    const maxCategory = Object.entries(scale).find(entry =>
      entry[1][1] === 10 || entry[1][1] === 10000
    );
    if (maxCategory && value === maxCategory[1][1]) {
      return maxCategory[0];
    }

    return null;
  };

  const fetchCropSuitability = async () => {
    if (!soilCode || !cropCode || !waterCode || !inputCode) return;

    try {
      const cropSuitabilityURL = `https://storage.googleapis.com/fao-gismgr-soilfer-data/DATA/SOILFER/MAPSET/SIS/SOILFER.SIS.${cropCode}.${soilCode}S.${inputCode + waterCode}.tif`;      
      const attainableYieldURL = `https://storage.googleapis.com/fao-gismgr-soilfer-data/DATA/SOILFER/MAPSET/YLS/SOILFER.YLS.${cropCode}.${soilCode}S.${inputCode + waterCode}.tif`;
      const url = `http://34.78.39.234:5000/clip?action=cliptiff&url1=${cropSuitabilityURL}&url2=${attainableYieldURL}&latitude=${positionnew.lat}&longitude=${positionnew.lng}&buffer=${bufferRadius / 1000}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const suitability = await response.json();
      let cropSuitabilityValue = null;
      let averageSuitabilityValue = null;
      let modeSuitabilityValue = null;
      let attainableYieldValue = null;
      let relativeYieldValue = null;
      
      if(suitability['tiff1']['pixel_value'] != "error")
        cropSuitabilityValue = suitability['tiff1']['pixel_value'];
      if(suitability['tiff1']['buffer_avg'] != "error")
        averageSuitabilityValue = Number(suitability['tiff1']['buffer_avg'].toFixed(0));
      if(suitability['tiff1']['buffer_mode'] != "error")
        modeSuitabilityValue = suitability['tiff1']['buffer_mode'];
      if(suitability['tiff2']['pixel_value'] != "error"){
        attainableYieldValue = suitability['tiff2']['pixel_value'];
        relativeYieldValue = (attainableYieldValue / cropMaxYield[cropCode]) * 10000;
      }
      
      setCropSuitability(cropSuitabilityValue);
      setAverageSuitability(averageSuitabilityValue);
      setModeSuitability(modeSuitabilityValue);
      setAttainableYield(attainableYieldValue);
      setRelativeYield(relativeYieldValue);
      setDataError(false);

      setGeneralSuitability({
        crop: getSuitabilityLevel(cropSuitabilityValue, cropSuitablilityScale),
        average: getSuitabilityLevel(averageSuitabilityValue, cropSuitablilityScale),
        mode: getSuitabilityLevel(modeSuitabilityValue, cropSuitablilityScale),
        yieldAttainable: getSuitabilityLevel(attainableYieldValue, attainableYieldScale),
        yieldRelative: getSuitabilityLevel(attainableYieldValue, attainableYieldScale)
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      setDataError(true);
      setCropSuitability(null);
      setAverageSuitability(null);
      setModeSuitability(null);
      setAttainableYield(null);
      setRelativeYield(null)
      setGeneralSuitability({ crop: null, average: null, mode: null, yieldAttainable: null, yieldRelative: null });
    }
  };
  const fetchAllCropSuitability = async (CropName,SoilFERCode) => {
    if (!soilCode || !waterCode || !inputCode) return;

    let cropData = {};
    try {
      const cropSuitabilityURL = `https://storage.googleapis.com/fao-gismgr-soilfer-data/DATA/SOILFER/MAPSET/SIS/SOILFER.SIS.${SoilFERCode}.${soilCode}S.${inputCode + waterCode}.tif`;
      const attainableYieldURL = `https://storage.googleapis.com/fao-gismgr-soilfer-data/DATA/SOILFER/MAPSET/YLS/SOILFER.YLS.${SoilFERCode}.${soilCode}S.${inputCode + waterCode}.tif`;
      const url = `http://34.78.39.234:5000/clip?action=cliptiff&url1=${cropSuitabilityURL}&url2=${attainableYieldURL}&latitude=${positionnew.lat}&longitude=${positionnew.lng}&buffer=${bufferRadius / 1000}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const suitability = await response.json();
      
      let cropSuitabilityValue = null;
      let averageSuitabilityValue = null;
      let modeSuitabilityValue = null;
      let attainableYieldValue = null;
      let relativeYieldValue = null;
      
      if(suitability['tiff1']['pixel_value'] != "error")
        cropSuitabilityValue = suitability['tiff1']['pixel_value'];
      if(suitability['tiff1']['buffer_avg'] != "error")
        averageSuitabilityValue = Number(suitability['tiff1']['buffer_avg'].toFixed(0));
      if(suitability['tiff1']['buffer_mode'] != "error")
        modeSuitabilityValue = suitability['tiff1']['buffer_mode'];
      if(suitability['tiff2']['pixel_value'] != "error"){
        attainableYieldValue = suitability['tiff2']['pixel_value'];
        relativeYieldValue = (attainableYieldValue / cropMaxYield[cropCode]) * 10000;
      }
      
      cropData = {
        cropCode: SoilFERCode,
        cropName: CropName,
        cropSuitability: cropSuitabilityValue,
        averageSuitability: averageSuitabilityValue,
        modeSuitability: modeSuitabilityValue,
        attainableYield: attainableYieldValue,
        relativeYield: relativeYieldValue,
        suitability: getSuitabilityLevel(cropSuitabilityValue, cropSuitablilityScale),
        average: getSuitabilityLevel(averageSuitabilityValue, cropSuitablilityScale),
        mode: getSuitabilityLevel(modeSuitabilityValue, cropSuitablilityScale),
        yieldAttainable: getSuitabilityLevel(attainableYieldValue, attainableYieldScale),
        yieldRelative: getSuitabilityLevel(attainableYieldValue, attainableYieldScale)
      }
      //console.log(cropData);
      //console.log(SoilFERCode+" Pass End");
      return cropData;

    } catch (error) {
      console.error("Error fetching data:", error);
      cropData = {
        cropCode: SoilFERCode,
        cropName: CropName,
        cropSuitability: 0,
        averageSuitability: 0,
        modeSuitability: 0,
        attainableYield: 0,
        relativeYield: 0,
        suitability: getSuitabilityLevel(0, cropSuitablilityScale),
        average: getSuitabilityLevel(0, cropSuitablilityScale),
        mode: getSuitabilityLevel(0, cropSuitablilityScale),
        yieldAttainable: getSuitabilityLevel(0, attainableYieldScale),
        yieldRelative: getSuitabilityLevel(0, attainableYieldScale)
      };
      //console.log(cropData);
      //console.log(SoilFERCode+" Fail End");
      return cropData;
    }
  };

  async function runCropSuitabilityConcurrently() {
    const promises = Object.keys(crops).map(crop =>
      fetchAllCropSuitability(crop, crops[crop]['SoilFERCode'])
    );
    const results = await Promise.all(promises);
    setAllCropSuitability(results);
    setAllCropDataError(false);
  }

  useEffect(() => {
    fetchCropSuitability();
    runCropSuitabilityConcurrently();    
  }, [positionnew, bufferRadius, soilCode, cropCode, waterCode, inputCode]);

  const [showReport,setShowReport] = useState<boolean>(false);
  const [publishResults,setPublishResults] = useState<boolean>(publishReport);
  const { toPDF, targetRef } = usePDF({filename: 'SoilFER-CropSuitability.pdf'});
  const year = new Date().getFullYear();

  useEffect(() => {
    if(publishReport)
      toPDF();
  },[publishReport]);

  return (
    <div style={{ background: '#fff', width: '100%', padding: 0, margin: 0 }}>
      {(dataError && (!cropSuitability && !averageSuitability && !attainableYield)) && (
          <div className="flex w-full flex-column align-items-center justify-content-center p-2 m-2">
              {(soilCode && cropCode && inputCode && waterCode)?<p style={{ color: '#555', fontSize: '11pt' }}>Please wait while we retrieve the crop suitability and attainable yield...</p>:<p style={{ color: '#555', fontSize: '0.11pt' }}>Please select the Soil, Crop, Irrigation and Farm Management Parameters.</p>}
              <SyncLoader
                  size={5}
                  color="#555"
                  aria-label="Loading Spinner"
                  data-testid="loader"
              />
          </div>
        )}
        {!dataError && (<>
            <div style={{ margin: '0 auto', border: '1px solid #ddd', padding: '20px'}}>
              {publishResults && <>
                <div style={{ position: 'absolute',  right: '100px' }}>
                  <img src="SoilFERlogo.png" alt="SoilFER App" style={{ width: '150px' }} />
                </div>
                <div className="m-0 p-1 flex flex-row justify-content-start" style={{ color: '#7e5134', fontSize: '16pt', fontWeight: 'bold' }}><img src="images/ResultsIcon.png" alt="Results Icon" style={{ height: '35px', marginRight: '10px' }} />{crop.toUpperCase()} SUITABILITY SUMMARY</div>
                <Divider className='m-0 p-0' />
                <div className="m-0 p-1 flex flex-row justify-content-start" style={{ width: '100%' }}>                    
                    <img src="images/LocationIconYellow.png" alt="Location Icon" style={{ height: '35px'}} />
                    <div className="flex flex-column p-1" style={{ width: '90%', color: '#6e431d' }}>
                        <b>
                            {administrativeInfo.address.suburb != undefined?administrativeInfo.address.suburb+", ":null}
                            {administrativeInfo.address.village != undefined?administrativeInfo.address.village+", ":null}
                            {administrativeInfo.address.town != undefined?administrativeInfo.address.town+", ":null}
                            {administrativeInfo.address.city != undefined?administrativeInfo.address.city+", ":null}                        
                                                    
                            {administrativeInfo.address.region != undefined?administrativeInfo.address.region+", ":null}
                            {administrativeInfo.address.state != undefined?administrativeInfo.address.state+", ":null}
    
                            {administrativeInfo.address.country != undefined?administrativeInfo.address.country:null}
                        </b>Coordinates: {administrativeInfo.lat.toFixed(6)}, {administrativeInfo.lng.toFixed(6)}<br/>Altitude: {nFormat.format(administrativeInfo.elevation[0]).replace(/,/g, " ")}m
                        <br/>                        
                        <HistoricalClimateData
                            latitude={administrativeInfo.lat}
                            longitude={administrativeInfo.lng}
                            startYear={year-6}  // optional
                            endYear={year-1}    // optional
                        />
                        <Divider className='m-0 p-0' />                    
                    </div>
                </div>
                {soil != '' && <div className="m-0 p-1 flex flex-row justify-content-start">
                    <img src="images/SoilIcon.png" alt="Soil Icon" style={{ height: '30px'}} />
                    <div className="flex flex-column p-1" style={{ width: '90%', color: '#6e431d' }}>
                        <div className="flex flex-row"><b>Soil Type:</b> {soilName}({soilCode})</div>                        
                    </div>
                </div>}
                {crop != '' && <div className="m-0 p-1 flex flex-row justify-content-start">
                    <img src="images/CropIcon.png" alt="Crop Icon" style={{ height: '30px'}} />
                    <div className="flex flex-column p-1" style={{ width: '90%', color: '#6e431d' }}>
                        <div className="flex flex-row"><b>Crop:</b> {crop}</div>                        
                    </div>
                </div>}
                {(irrigation != undefined && input != '') && <div className="m-0 p-1 flex flex-row justify-content-start">
                    <img src="images/IrrigationIcon.png" alt="Irrigation Icon" style={{ height: '30px'}} />
                    <div className="flex flex-column p-1" style={{ width: '90%', color: '#6e431d' }}>
                        <div className="flex flex-row"><b>Water:</b> {irrigation == "Yes"?"Irrigated":"Rain Fed"}</div><br/>
                        <div className="flex flex-row"><b>Management Practice:</b> {input == 'High'?"High":"Low"} input farm management</div>
                        <Divider className='m-0 p-0' />
                    </div>
                </div>}
              </>}
              {(!showReport) && <div className="flex flex-column gap-3">
                <div className="flex flex-row gap-3">
                  <div style={{ width: '75%' }}>
                    {(cropSuitability !== null && averageSuitability !== null) && <>
                    <div className="flex align-items-center mb-1">
                        <div><img src={'images/'+((cropSuitability<=3?"Smile.png": false)?"Smile.png":((cropSuitability>=6?"Frown":"Meh"))+'.png')} alt='Mood' style={{ height: '60px', margin: '5px' }} /></div>
                        <div className="flex align-items-center mb-1">
                            <p style={{ color: '#555', fontSize: '12pt', fontWeight: 'bold' }}>Your crop suitability index is <span style={{ color: 'red' }}>{cropSuitablilityScale[generalSuitability?.crop][2]} &lt; SI &lt; {cropSuitablilityScale[generalSuitability?.crop][3]}</span>.<br/>
                            This means your crop {generalSuitability?.crop=="Not Suitable"?"is":"has a"} <span style={{ color: 'red' }}>{generalSuitability?.crop} {generalSuitability?.crop=="Not Suitable"?null:"suitability"}</span> under selected conditions.</p>
                        </div>
                    </div>
                    <div className="flex align-items-center justify-content-center m-0 p-0">
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.crop==="Not Suitable"?<img src='images/arrow_down.png' alt='Down Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.crop==="Very Marginal"?<img src='images/arrow_down.png' alt='Down Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.crop==="Marginal"?<img src='images/arrow_down.png' alt='Down Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>                    
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.crop==="Moderate"?<img src='images/arrow_down.png' alt='Down Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.crop==="Medium"?<img src='images/arrow_down.png' alt='Down Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.crop==="Good"?<img src='images/arrow_down.png' alt='Down Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.crop==="High"?<img src='images/arrow_down.png' alt='Down Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.crop==="Very High"?<img src='images/arrow_down.png' alt='down Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                    </div>
                    <div className="flex align-items-center justify-content-center m-0 p-0" style={{ height: '20px' }}>
                      <div className="si-not-suitable m-0 p-0" style={{ width: '12%', height: '15px' }}></div>
                      <div className="si-very-marginal m-0 p-0" style={{ width: '12%', height: '15px' }}></div>
                      <div className="si-marginal m-0 p-0" style={{ width: '12%', height: '15px' }}></div>
                      <div className="si-moderate m-0 p-0" style={{ width: '12%', height: '15px' }}></div>
                      <div className="si-medium m-0 p-0" style={{ width: '12%', height: '15px' }}></div>
                      <div className="si-good m-0 p-0" style={{ width: '12%', height: '15px' }}></div>
                      <div className="si-high m-0 p-0" style={{ width: '12%', height: '15px' }}></div>
                      <div className="si-very-high m-0 p-0" style={{ width: '12%', height: '15px' }}></div>
                    </div>
                    <div className="flex align-items-center justify-content-center m-0 p-0">
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.average==="Not Suitable"?<img src='images/arrow_up.png' alt='Up Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.average==="Very Marginal"?<img src='images/arrow_up.png' alt='Up Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.average==="Marginal"?<img src='images/arrow_up.png' alt='Up Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>                    
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.average==="Moderate"?<img src='images/arrow_up.png' alt='Up Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.average==="Medium"?<img src='images/arrow_up.png' alt='Up Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.average==="Good"?<img src='images/arrow_up.png' alt='Up Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.average==="High"?<img src='images/arrow_up.png' alt='Up Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                      <div className="align-items-center justify-content-center m-0 p-0" style={{ textAlign: 'center', width: '12%' }}>{generalSuitability?.average==="Very High"?<img src='images/arrow_up.png' alt='Up Arrow' style={{ margin: 0, padding: 0, height: '20px' }} />:null}</div>
                    </div>
                    <div className="flex align-items-center mb-1">
                        <div>
                          <p style={{ color: '#555', fontSize: '12pt', fontWeight: 'bold' }}>The average suitability index in a buffered area of 10 km is <span style={{ color: 'red' }}>{generalSuitability?.average}</span>. This means your crop suitability is <span style={{ color: 'red' }}>{cropSuitability<averageSuitability?"above":null}{cropSuitability>averageSuitability?"below":null}{cropSuitability==averageSuitability?"the same as":null}</span> the average suitability.</p>
                        </div>
                    </div>                
                    </>}
                    {(cropSuitability === null || averageSuitability === null) && <p style={{ color: '#555', fontSize: '12pt', fontWeight: 'bold' }}>The soil suitability at your location cannot be determined at this time, please contact the SoilFER team.</p>}
                    <Divider />
                    {attainableYield != null && <div className="flex align-items-center mb-1">                      
                        <div>
                            <p style={{ color: '#555', fontSize: '12pt', fontWeight: 'bold' }}>The attainable yield at your location is <span style={{ color: 'red' }}>{nFormat.format(attainableYield.toFixed(0)).replace(/,/g, " ")} kg/ha</span> (Dry Weight).</p>
                        </div>
                    </div>}
                    {attainableYield === null && <p style={{ color: '#555', fontSize: '12pt', fontWeight: 'bold' }}>The attainable yield at your location cannot be determined at this time, please contact the SoilFER team.</p>}
                  </div>
                  <div className="flex flex-column gap-1" style={{ minWidth: '200px', width: '25%' }}>
                      <div>
                        <div className="flex flex-row"><div className="si-very-high" style={{ width: '30px', height: '30px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '10pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 85: Very high</p></div>
                        <div className="flex flex-row"><div className="si-high" style={{ width: '30px', height: '30px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '10pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 70: High</p></div>
                        <div className="flex flex-row"><div className="si-good" style={{ width: '30px', height: '30px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '10pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 55: Good</p></div>
                        <div className="flex flex-row"><div className="si-medium" style={{ width: '30px', height: '30px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '10pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 40: Medium</p></div>
                        <div className="flex flex-row"><div className="si-moderate" style={{ width: '30px', height: '30px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '10pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 25: Moderate</p></div>
                        <div className="flex flex-row"><div className="si-marginal" style={{ width: '30px', height: '30px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '10pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI &gt; 10: Marginal</p></div>
                        <div className="flex flex-row"><div className="si-very-marginal" style={{ width: '30px', height: '30px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '10pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>SI ~ 0: Very marginal</p></div>                      
                        <div className="flex flex-row"><div className="si-not-suitable" style={{ width: '30px', height: '30px', marginRight: '5px' }}></div><p style={{ color: '#555', fontSize: '10pt', fontWeight: 'bolder', padding: 0, margin: 0 }}>Not Suitable</p></div>                      
                      </div>
                  </div>
                </div>                
              </div>}
              {publishResults && <><div style={{ pageBreakAfter: 'always' }} />
                <div className="flex flex-column m-0 p-0">
                    <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#7e5134', fontSize: '16pt', fontWeight: 'bold' }}><img src="images/ResultsIcon.png" alt="Results Icon" style={{ height: '30px', marginRight: '10px' }} />ALTERNATIVE SUITABLE CROPS</div>
                    <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#555', fontSize: '11pt' }}>Considering your input parameters, this is the suitability of other crops at your location:</div>
                    <div className="m-1 p-0 flex justify-content-center">
                    <ResultTable crops={crops} cropSuitablilityScale={cropSuitablilityScale} allCropSuitability={allCropSuitability} allCropDataError={allCropDataError} cropCode={cropCode} />
                    </div>
                </div>
              </>}
              {(!publishResults && !showReport) && <>
                <div className="flex flex-column m-0 p-0">
                  <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#7e5134', fontSize: '16pt', fontWeight: 'bold' }}><img src="images/ResultsIcon.png" alt="Results Icon" style={{ height: '30px', marginRight: '10px' }} />ALTERNATIVE SUITABLE CROPS</div>
                  <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#555', fontSize: '11pt' }}>Considering your input parameters, this is the suitability of other crops at your location:</div>
                  <div className="m-1 p-0 flex justify-content-center">
                    <ResultCarousel crops={crops} cropSuitablilityScale={cropSuitablilityScale} allCropSuitability={allCropSuitability} allCropDataError={allCropDataError} cropCode={cropCode} />
                  </div>                  
                </div>
                <div className="m-0" style={{ textAlign: 'center' }}>
                  <a href="#" onClick={()=>{setShowReport(true);toPDF()}} className="button" style={{ fontSize: '11pt' }}>DOWNLOAD YOUR DETAILED CROP SUITABILITY REPORT</a>                  
                </div>
              </>}              
              {(!publishResults && showReport) && <>
                <div>
                  <i className="pi pi-times-circle p-0 m-0 cursor-pointer" onClick={()=>{setPublishResults(false);setShowReport(false);}} style={{ color: '#6e431d', position: 'relative', float: 'left' }}></i>
                </div>
                <div className="flex align-items-center justify-content-center">
                  <a href="#" className="button" onClick={()=>toPDF()} style={{ fontSize: '11pt' }}>DOWNLOAD</a>                    
                </div>
                <div ref={targetRef} style={{
                        width: '1000px',
                        maxWidth: '1000px', // A4 width in px
                        margin: '0 auto',
                        padding: '20px',
                        boxSizing: 'border-box',
                        backgroundColor: 'white',
                    }}>
                  <Report positionnew={positionnew} bufferRadius={bufferRadius} soilCode={soilCode} soilName={soilName} cropCode={cropCode} waterCode={waterCode} inputCode={inputCode} cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible} administrativeInfo={administrativeInfo} soil={soil} crops={crops} crop={crop} irrigation={irrigation} input={input} />
                </div>
              </>}
              {(!showReport) && <p style={{ color: '#555', fontSize: '8pt', paddingTop: '5px', textAlign: 'center' }}>Results on crop suitability and attainable yields are produced using the Agro-Ecological Zones (AEZ) modeling framework, developed by the Food and Agriculture Organization of the United Nations (FAO) and the International Institute for Applied Systems Analysis (IIASA), within the framework of the SoilFER project. Please visit the SoilFER Geospatial Platform at <a href='https://data.apps.fao.org/soilfer/' target='_blank'>https://data.apps.fao.org/soilfer/</a> for more information.</p>}
            </div>
          </>
        )}      
    </div>
  )
}
