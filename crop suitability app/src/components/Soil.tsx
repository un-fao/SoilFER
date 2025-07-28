import React, { useState, useEffect } from "react";
import { SubmitButton, CancelButton } from '../App';
import { SoilTest } from "./SoilTest";

import './table.css';
import { SoilTable } from "./SoilTable";

import SyncLoader from "react-spinners/SyncLoader";

export const Soil = (props) => {
    const {setShow,soil,setSoil,HWSDStatistics,setHWSDStatistics,fetchHWSDStatistics,positionnew,bufferRadius,soilCode,setSoilCode,soilName,setSoilName,cropLayerVisible,setCropLayerVisible} = props;
    const options: string[] = ['Yes', 'No'];
    const [knownSoil, setKnownSoil] = useState<string>(options[0]);
    const [calcultatedSoil,setCalcultatedSoil] = useState<boolean>(false);
    const [calcultatedSoilMessage,setCalcultatedSoilMessage] = useState('');
    const [soilSummary,setSoilSummary] = useState<any>(null);

    // Define lookup tables for Soil Texture, Drainage class, WRB, and colors
    const texture_lookup = {
        "1.0": "Clay (heavy)", "2.0": "Silty clay", "3.0": "Clay (light)", "4.0": "Silty clay loam",
        "5.0": "Clay loam", "6.0": "Silt", "7.0": "Silt loam", "8.0": "Sandy clay", "9.0": "Loam",
        "10.0": "Sandy clay loam", "11.0": "Sandy loam", "12.0": "Loamy sand", "13.0": "Sand"
    }
    const drainage_lookup = {
        "E": "Excessively drained", "I": "Imperfectly drained", "MW": "Moderately well drained",
        "P": "Poorly drained", "SE": "Somewhat excessively drained", "VP": "Very poorly drained",
        "W": "Well drained"
    }
    const WRB_lookup = {
        "HS": {"name": "Histosols", "color": "Blackish"},
        "AT": {"name": "Anthrosols", "color": "Yellowish"},
        "TC": {"name": "Technosols", "color": "Yellowish"},
        "CR": {"name": "Cryosols", "color": "Blueish / Greenish or Grayish"},
        "LP": {"name": "Leptosols", "color": "Whitish"},
        "SN": {"name": "Solonetz", "color": "Whitish"},
        "VR": {"name": "Vertisols", "color": "Blackish"},
        "SC": {"name": "Solonchaks", "color": "Blueish / Greenish or Grayish"},
        "GL": {"name": "Gleysols", "color": "Blueish / Greenish or Grayish"},
        "AN": {"name": "Andosols", "color": "Whitish"},
        "PZ": {"name": "Podzols", "color": "Reddish"},
        "PT": {"name": "Plinthosols", "color": "Whitish"},
        "PL": {"name": "Planosols", "color": "Yellowish"},
        "ST": {"name": "Stagnosols", "color": "Yellowish"},
        "NT": {"name": "Nitisols", "color": "Brownish"},
        "FR": {"name": "Ferralsols", "color": "Reddish"},
        "CH": {"name": "Chernozems", "color": "Blackish"},
        "KS": {"name": "Kastanozems", "color": "Brownish"},
        "PH": {"name": "Phaeozems", "color": "Yellowish"},
        "UM": {"name": "Umbrisols", "color": "Yellowish"},
        "DU": {"name": "Durisols", "color": "Yellowish"},
        "CL": {"name": "Calcisols", "color": "Brownish"},
        "RT": {"name": "Retisols", "color": "Reddish"},
        "LX": {"name": "Lixisols", "color": "Yellowish"},
        "LV": {"name": "Luvisols", "color": "Brownish"},
        "CM": {"name": "Cambisols", "color": "Reddish"},
        "FL": {"name": "Fluvisols", "color": "Brownish"},
        "AR": {"name": "Arenosols", "color": "Yellowish"},
        "RG": {"name": "Regosols", "color": "Yellowish"},
        "GY": {"name": "Gypsisols", "color": "Whitish"},
        "AC": {"name": "Acrisols", "color": "Yellowish"},
        "AL": {"name": "Alisols", "color": "Yellowish"}
    }

    useEffect(() => {
      if(positionnew != null)
        fetchHWSDStatistics(positionnew.lat, positionnew.lng, bufferRadius);
    }, [positionnew]);
  return (
    <>
      {HWSDStatistics === null && <div className="flex w-full flex-column align-items-center justify-content-center">
        <p>Please wait while we calculate your soils...</p>
        <SyncLoader
        size={5}
        color="white"
        aria-label="Loading Spinner"
        data-testid="loader"
        />
      </div>
      }
      {HWSDStatistics !== null && <>
        <div className="flex flex-column p-0 m-0 ">
          {(calcultatedSoil === false && knownSoil === 'Yes') && <div className="flex flex-row">
              <div>Based on your selected location, the following soil types have been identified.  If the parameters below match your soil, please select your soil type from the table and proceed to the next step to <a href="javascript:void(0)" style={{ color: 'orange', textDecoration: 'none' }} onClick={()=>setShow('Crop')}>choose your crop type.</a>
              <br/><br/>
              If not, please <a href="javascript:void(0)" style={{ color: 'orange', textDecoration: 'none' }} onClick={()=>{setKnownSoil('No');setCalcultatedSoil(false);}}>use the soil tools</a> to determine your soil type.
              </div>
          </div>}
          {calcultatedSoil && <div className="flex flex-row">
              {soilCode != '' && <div className="m-1">{calcultatedSoilMessage} <b><u>{soilName} ({soilCode})</u></b></div>}
              {soilCode === '' && <div className="m-1">We are unable to identify your soil, please select one from the list or <a href="javascript:void(0)" style={{ color: 'orange', textDecoration: 'none' }} onClick={()=>{setKnownSoil('No');setCalcultatedSoil(false);}}>use the soil tools</a> to determine your soil type.</div>}
          </div>}
          {knownSoil === "Yes" && <div id="SoilTable" className="m-0 p-0">
            <SoilTable soil={soil} setSoil={setSoil} HWSDStatistics={HWSDStatistics} setHWSDStatistics={setHWSDStatistics} soilCode={soilCode} setSoilCode={setSoilCode} soilName={soilName} setSoilName={setSoilName} soilSummary={soilSummary} setSoilSummary={setSoilSummary} texture_lookup={texture_lookup} drainage_lookup={drainage_lookup} WRB_lookup={WRB_lookup} cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible} />
            <div className="flex flex-row align-content-center justify-content-center align-items-center"><SubmitButton style={{ width: '80%', fontSize: '13pt' }} onClick={()=>setShow('Crop')} disabled={soil === ''} >Continue to select your crop type</SubmitButton></div>
            <div className="flex flex-row align-content-center justify-content-center align-items-center" style={{verticalAlign: 'middle'}}><b>or </b><CancelButton style={{ width: '30%', fontSize: '13pt', marginLeft: '15px' }} onClick={()=>{setKnownSoil('No');setCalcultatedSoil(false);}} >Identify your soil</CancelButton></div>
          </div>}
          {knownSoil === "No" && <div id="SoilTest" className="flex m-0 p-0">            
            <div className="flex flex-column">
              <SoilTest setShow={setShow} soil={soil} setSoil={setSoil} setKnownSoil={setKnownSoil} calcultatedSoil={calcultatedSoil} setCalcultatedSoil={setCalcultatedSoil} calcultatedSoilMessage={calcultatedSoilMessage} setCalcultatedSoilMessage={setCalcultatedSoilMessage} soilCode={soilCode} setSoilCode={setSoilCode} soilName={soilName} setSoilName={setSoilName} soilSummary={soilSummary} setSoilSummary={setSoilSummary} texture_lookup={texture_lookup} drainage_lookup={drainage_lookup} WRB_lookup={WRB_lookup} cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible} />        
            </div>
          </div>}
        </div>
        
      </>}
    </>
  )
}