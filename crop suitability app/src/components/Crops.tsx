import React, { useState } from "react";
import { Panel, Info, SubmitButton, CancelButton } from '../App';
import { Card } from 'primereact/card';
import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";
import { Divider } from "primereact/divider";

export const Crops = (props) => {
    const {setShow,crops,crop,setCrop,cropCode,setCropCode,setCropLayerVisible} = props;    
    
    const open = (id)=>{
        window.open('https://ecocrop.apps.fao.org/ecocrop/srv/en/cropView?id='+id);
    }
    setCropCode(crops[crop]?.SoilFERCode);
  return (
    <div className="card">
        <span style={{ fontSize: '10pt' }}>Select your crop from this list below:</span>
        <div className='p-1 m-0 flex flex-row'>
            <div className="flex flex-column">                
                <div className="table" style={{ width: '400px', backgroundColor: '#7e5134'}}>
                    <div className="table-header">
                        <div className="table-cell">Select</div>
                        <div className="table-cell">Common Name</div>
                        <div className="table-cell">Scientific Name</div>
                    </div>
                    <div className="table-row">
                        <div  className="table-cell" style={{ backgroundColor: '#f8d394' }}></div>
                        <div style={{ width: '100%', backgroundColor: '#f8d394', color: 'black' }}>OPPORTUNITY CROPS</div>
                        <div className="table-cell" style={{ backgroundColor: '#f8d394' }}></div>
                    </div>                    
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Banana" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Banana'} />
                        </div>
                        <div className="table-cell">Banana</div>
                        <div className="table-cell"><i>Musa spp.</i></div>
                    </div>
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Biomass sorghum" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Biomass sorghum'} />
                        </div>
                        <div className="table-cell">Biomass sorghum</div>
                        <div className="table-cell"><i>Sorghum bicolor</i></div>
                    </div>                    
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Groundnut" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Groundnut'} />
                        </div>
                        <div className="table-cell">Groundnut</div>
                        <div className="table-cell"><i>Arachis hypogaea</i></div>
                    </div>
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Gram" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Gram'} />
                        </div>
                        <div className="table-cell">Gram</div>
                        <div className="table-cell"><i>Cicer arietinum</i></div>
                    </div>
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Pigeon pea" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Pigeon pea'} />
                        </div>
                        <div className="table-cell">Pigeon pea</div>
                        <div className="table-cell"><i>Cajanus cajan</i></div>
                    </div>
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Pearl millet" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Pearl millet'} />
                        </div>
                        <div className="table-cell">Pearl millet</div>
                        <div className="table-cell"><i>Pennisetum glaucum</i></div>
                    </div>
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Sweet potato" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Sweet potato'} />
                        </div>
                        <div className="table-cell">Sweet potato</div>
                        <div className="table-cell"><i>Ipomoea batatas</i></div>
                    </div>
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="White yam" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'White yam'} />
                        </div>
                        <div className="table-cell">White yam</div>
                        <div className="table-cell"><i>Dioscorea rotundata</i></div>
                    </div>
                    <div className="table-row">
                        <div  className="table-cell" style={{ backgroundColor: '#f8d394' }}></div>
                        <div style={{ width: '100%', backgroundColor: '#f8d394', color: 'black' }}>BENCHMARK CROPS</div>
                        <div className="table-cell" style={{ backgroundColor: '#f8d394' }}></div>
                    </div> 
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Maize" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Maize'} />
                        </div>
                        <div className="table-cell">Maize</div>
                        <div className="table-cell"><i>Zea mays</i></div>
                    </div>
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Cassava" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Cassava'} />
                        </div>
                        <div className="table-cell">Cassava</div>
                        <div className="table-cell"><i>Manihot esculenta</i></div>
                    </div>                    
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Soybean" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Soybean'} />
                        </div>
                        <div className="table-cell">Soybean</div>
                        <div className="table-cell"><i>Glycine max</i></div>
                    </div>                    
                    <div className="table-row">
                        <div className="table-cell">
                            <RadioButton inputId="crop1" name="crop" value="Tomato" onChange={(e: RadioButtonChangeEvent) => {setCrop(e.value);setCropLayerVisible(true);}} checked={crop === 'Tomato'} />
                        </div>
                        <div className="table-cell">Tomato</div>
                        <div className="table-cell"><i>Solanum lycopersicum</i></div>
                    </div>
                </div>
            </div>

            <div className="flex flex-column justify-content-left align-items-start w-full">
                {crop != '' && <div className="flex flex-column ml-3 align-items-center justify-content-center">
                    <h2 className="m-0 p-0">
                        {crop} <span style={{ color: '#ffba00' }}>&nbsp;|&nbsp;</span> <i>{crops[crop]?.scientificName}</i>
                    </h2>

                    <img src={"images/crops/"+crops[crop]?.ecocropID+".jpg"} alt={crop} style={{ objectFit: 'contain', height: '200px' }} />
                    <CancelButton onClick={()=>open(crops[crop]?.ecocropID)} style={{ width: '70%', textAlign: 'center', fontSize: '11pt' }}>ECOCROP crop info</CancelButton>
                    <SubmitButton onClick={()=>setShow('Irrigation & Farm Management')} disabled={crop === ''} style={{ fontSize: '11pt' }} >Continue to select your water and input management</SubmitButton>
                </div>}                
            </div>
        </div>
        {/*<div className="flex flex-row align-content-center justify-content-center" style={{verticalAlign: 'middle'}}><CancelButton onClick={()=>setShow('Soil')} style={{ fontSize: '11pt' }} >Back to identify your soil</CancelButton></div>*/}
    </div>
  )
}
