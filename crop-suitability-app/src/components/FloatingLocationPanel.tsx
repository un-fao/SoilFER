import { Panel, Info, SubmitButton, CancelButton } from '../App';
import { Divider } from 'primereact/divider';
import { nFormat } from '../App';
import { HistoricalClimateData } from './HistoricalClimateData';

export const FloatingLocationPanel = (props) => {
    const {position,rerender,setRerender,historicalClimate,setHistoricalClimate,setShow,setLocation,map,administrativeInfo,setAdministrativeInfo,setZoomLevel,setPositionNew} = props;
    const year = new Date().getFullYear();
    
    // Add event handlers that prevent propagation to the map
    const handleFindSoil = (e) => {
        e.stopPropagation();
        setLocation(true);
        map.closePopup();
        setShow('Soil');
    };
    
    const handleChooseLocation = (e) => {
        e.stopPropagation();
        setLocation(false);
        setShow(false);
        setZoomLevel(3);
        setPositionNew([1.5, 24.5]);
        map.closePopup();
    };
    
    const handleOpenClimateData = (e) => {
        e.stopPropagation();
        document.getElementById('ClimateContainer').style.display='block';
        document.getElementById('InfoContainer').style.display='none';
    };
    
    const handleBackToLocationInfo = (e) => {
        e.stopPropagation();
        document.getElementById('InfoContainer').style.display='block';
        document.getElementById('ClimateContainer').style.display='none';
    };
    
    return(
    <Panel style={{ width: '100%'}}>
        <div id="InfoContainer" style={{ display: 'block' }}>
            <h2 className="p-0 m-0">
                <div className="m-0 p-0 flex flex-row justify-content-start" style={{ color: '#ffba00', fontSize: '18pt' }}><img src="images/LocationIconYellow.png" alt="Location Icon" style={{ height: '30px'}} /> LOCATION</div>
            </h2>
            <Divider />
            <Info>
                <div className="m-0 p-0 flex flex-row justify-content-start">
                    <img src="images/LocationIconWhite.png" alt="Location Icon" style={{ height: '40px', width: '30px', marginRight: '20px', marginLeft: '20px' }} />
                    <div className="flex flex-column" style={{ width: '310px' }}>Location:<br/> 
                        {administrativeInfo.address.suburb != undefined?administrativeInfo.address.suburb+", ":null}
                        {administrativeInfo.address.village != undefined?administrativeInfo.address.village+", ":null}
                        {administrativeInfo.address.town != undefined?administrativeInfo.address.town+", ":null}
                        {administrativeInfo.address.city != undefined?administrativeInfo.address.city+", ":null}                        
                                                
                        {administrativeInfo.address.region != undefined?administrativeInfo.address.region+", ":null}
                        {administrativeInfo.address.state != undefined?administrativeInfo.address.state+", ":null}

                        {administrativeInfo.address.country != undefined?administrativeInfo.address.country:null}
                        <Divider />
                    </div>
                </div>
                <div className="m-0 p-0 flex flex-row justify-content-start"><img src="images/CoordinatesIcon.png" alt="Coordinates Icon" style={{ height: '35px', width: '35px', marginRight: '15px', marginLeft: '15px' }} /><div className="flex flex-column" style={{ width: '310px' }}>Coordinates: {administrativeInfo.lat.toFixed(6)}, {administrativeInfo.lng.toFixed(6)}<Divider /></div></div>
                <div className="m-0 p-0 flex flex-row justify-content-start"><img src="images/AltitudeIcon.png" alt="Altitude Icon" style={{ height: '40px', width: '60px', marginRight: '5px' }} /><div className="flex flex-column" style={{ width: '310px' }}>Altitude: {nFormat.format(administrativeInfo.elevation[0]).replace(/,/g, " ")}m<Divider /></div></div>
                <div className="m-0 p-0 flex flex-row justify-content-start">
                    <img src="images/ClimateIcon.png" alt="Climate Icon" style={{ height: '40px', width: '60px', marginRight: '10px' }} />
                    <div className="flex flex-column" style={{ width: '310px' }}>
                        <div className="flex flex-row">
                            <CancelButton 
                                id="HistoricalClimate" 
                                style={{ width: '90%', fontSize: '11pt' }} 
                                onClick={handleOpenClimateData}
                            >
                                Climate Data
                            </CancelButton>
                            <i className="pi pi-info-circle mr-1" style={{ height: '10px', cursor: 'pointer' }} onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('HistoricalClimateInfo2').style.display='block';
                            }} />
                            <div id="HistoricalClimateInfo2" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', width: '97%', left: '0' }} onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('HistoricalClimateInfo2').style.display='none';
                            }}>
                                <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={(e) => {
                                    e.stopPropagation();
                                    document.getElementById('HistoricalClimateInfo2').style.display='none';
                                }} style={{ color: '#999', float: 'right' }}></i></div>
                                <div style={{ textAlign: 'left', fontSize: '0.6vw' }}>
                                    <p>Daily surface meteorological data averaged each month for the last 5 years (<a href="https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview" target="_blank">Copernicus Climate Change Service - ERA5</a>).</p>
                                </div>
                            </div>
                        </div>
                        <Divider />
                    </div>

                </div>
                <SubmitButton 
                    id="FindSoil1"
                    style={{ width: '100%', fontSize: '13pt', fontWeight: 'bold' }} 
                    onClick={handleFindSoil}
                >
                    Find out your soil type
                </SubmitButton>
                <div className="flex flex-row justify-content-center align-items-center align-items-center">
                    <b>or </b>
                    <CancelButton 
                        id="ChoseLocation1" 
                        style={{ width: '70%', fontSize: '13pt', marginLeft: '15px', fontWeight: 'bold' }} 
                        onClick={handleChooseLocation}
                    >
                        Choose another location
                    </CancelButton>
                </div>
            </Info>
        </div>
        <div id="ClimateContainer" style={{ display: 'none' }}>
            <SubmitButton onClick={handleBackToLocationInfo} style={{ fontSize: '11pt' }}>
                Back to location info.
            </SubmitButton>
            <Divider />
            <i className="pi pi-info-circle mr-1" style={{ height: '10px', cursor: 'pointer' }} onClick={(e) => {
                e.stopPropagation();
                document.getElementById('HistoricalClimateInfo3').style.display='block';
            }} />
            <div id="HistoricalClimateInfo3" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', zIndex: 101, width: '97%', left: '0' }} onClick={(e) => {
                e.stopPropagation();
                document.getElementById('HistoricalClimateInfo3').style.display='none';
            }}>
                <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('HistoricalClimateInfo3').style.display='none';
                }} style={{ color: '#999', float: 'right' }}></i></div>
                <div style={{ textAlign: 'left', fontSize: '0.6vw' }}>                    
                    <p>Daily surface meteorological data averaged each month for the last 5 years (<a href="https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview" target="_blank">Copernicus Climate Change Service - ERA5</a>).</p>
                </div>
            </div>
            <div style={{ backgroundColor: 'white', borderRadius: '5px' }}>                
                <HistoricalClimateData
                    latitude={position.lat}
                    longitude={position.lng}
                    startYear={year-6}  // optional
                    endYear={year-1}    // optional
                />
            </div>
            <Divider />
            <SubmitButton 
                id="FindSoil2" 
                style={{ fontSize: '13pt', fontWeight: 'bold' }}
                onClick={handleFindSoil}
            >
                Find out your soil type
            </SubmitButton>
            <div className="flex flex-row justify-content-center align-items-center">
                <b>or </b>
                <CancelButton 
                    id="ChoseLocation2" 
                    style={{ width: '70%', fontSize: '13pt', marginLeft: '15px', fontWeight: 'bold' }} 
                    onClick={handleChooseLocation}
                >
                    Choose another location
                </CancelButton>
            </div>
        </div>
    </Panel>
    )
};