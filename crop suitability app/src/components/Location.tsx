import { SubmitButton, CancelButton } from '../App';
import { useState, useEffect, useRef } from 'react';
import { useForm } from "react-hook-form";
import { Divider } from 'primereact/divider';
import { nFormat } from '../App';
import { HistoricalClimateData } from './HistoricalClimateData';

import "flag-icons/css/flag-icons.min.css";

interface City {
    code: string;
    label: string;
    value: [number,number]
} 

interface Country {
    label: string;
    code: string;
    items: City[];
}

export const Location = (props)=> {
    const {position,setPosition,zoomLevel,setZoomLevel,rerender,setRerender,initLatitude,initLongitude,viewAttributes,setShow,soil,crop,irrigation,input,soilCode,soilName,
        positionnew,setPositionNew,administrativeInfo,setAdministrativeInfo,setLocation,
        HWSDStatistics,setHWSDStatistics,
        setSoilCode,setSoilName,setCropCode,setWaterCode,setInputCode,
        cropLayerVisible,setCropLayerVisible
    } = props;    
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    useEffect(() => {
        if(selectedCity){
            viewAttributes.current = true;
            initLatitude.current = selectedCity[0];
            initLongitude.current = selectedCity[1];
            setLatitude(selectedCity[0]);
            setLongitude(selectedCity[1]);
            setPosition([selectedCity[0],selectedCity[1]]);
            setZoomLevel(10);
            setRerender([selectedCity[0],selectedCity[1]]);
        }
    }, [selectedCity]);
    useEffect(() => {
        setLatitude(position[0]);
        setLongitude(position[1]);
    }, [position]);
    const groupedCities: Country[] = [
        {
            label: 'Ghana',
            code: 'GH',
            items: [
                { code: 'GH', label: 'Ahafo', value: [7.9465, -1.0232] },
                { code: 'GH', label: 'Ashanti', value: [6.6666, -1.6163] },
                { code: 'GH', label: 'Bono', value: [7.6254, -2.5378] },
                { code: 'GH', label: 'Bono East', value: [7.95, -1.7833] },
                { code: 'GH', label: 'Central', value: [5.7667, -1.0167] },
                { code: 'GH', label: 'Eastern', value: [6.25, -0.7833] },
                { code: 'GH', label: 'Greater Accra', value: [5.6037, -0.187] },
                { code: 'GH', label: 'North East', value: [10.5, -0.5] },
                { code: 'GH', label: 'Northern', value: [9.5, -0.85] },
                { code: 'GH', label: 'Oti', value: [8.1333, 0.55] },
                { code: 'GH', label: 'Savannah', value: [9, -1.5] },
                { code: 'GH', label: 'Upper East', value: [10.8, -0.85] },
                { code: 'GH', label: 'Upper West', value: [10.8, -2.5] },
                { code: 'GH', label: 'Volta', value: [6.6, 0.4667] },
                { code: 'GH', label: 'Western', value: [5, -2.5] },
                { code: 'GH', label: 'Western North', value: [6.4, -2.8333] }
            ]
        },
        {
            label: 'Guatemala',
            code: 'GT',
            items: [
                { code: 'GT', label: 'Alta Verapaz', value: [15.4681, -90.3725] },
                { code: 'GT', label: 'Baja Verapaz', value: [15.0873, -90.4455] },
                { code: 'GT', label: 'Chimaltenango', value: [14.6686, -90.8164] },
                { code: 'GT', label: 'Chiquimula', value: [14.7972, -89.544] },
                { code: 'GT', label: 'El Progreso', value: [14.85, -90.0167] },
                { code: 'GT', label: 'Escuintla', value: [14.305, -90.785] },
                { code: 'GT', label: 'Guatemala', value: [14.6349, -90.5069] },
                { code: 'GT', label: 'Huehuetenango', value: [15.3197, -91.4702] },
                { code: 'GT', label: 'Izabal', value: [15.4022, -88.7553] },
                { code: 'GT', label: 'Jalapa', value: [14.6333, -89.9833] },
                { code: 'GT', label: 'Jutiapa', value: [14.2917, -89.8958] },
                { code: 'GT', label: 'Petén', value: [16.9911, -89.8899] },
                { code: 'GT', label: 'Quetzaltenango', value: [14.8333, -91.5167] },
                { code: 'GT', label: 'Quiché', value: [15.0309, -91.1487] },
                { code: 'GT', label: 'Retalhuleu', value: [14.5379, -91.677] },
                { code: 'GT', label: 'Sacatepéquez', value: [14.5611, -90.7344] },
                { code: 'GT', label: 'San Marcos', value: [14.9667, -91.8] },
                { code: 'GT', label: 'Santa Rosa', value: [14.3833, -90.3] },
                { code: 'GT', label: 'Sololá', value: [14.7739, -91.1833] },
                { code: 'GT', label: 'Suchitepéquez', value: [14.4, -91.2333] },
                { code: 'GT', label: 'Totonicapán', value: [14.9144, -91.3583] },
                { code: 'GT', label: 'Zacapa', value: [14.9722, -89.5293] }

            ]
        },
        {
            label: 'Honduras',
            code: 'HN',
            items: [
                { code: 'HN', label: 'Atlántida', value: [15.6696283, -87.1422895] },
                { code: 'HN', label: 'Choluteca', value: [13.2504325, -87.1422895] },
                { code: 'HN', label: 'Colón', value: [15.6425965, -85.520024] },
                { code: 'HN', label: 'Comayagua', value: [14.5534828, -87.6186379] },
                { code: 'HN', label: 'Copán', value: [14.9362052, -88.864698] },
                { code: 'HN', label: 'Cortés', value: [15.5, -88.033333] },
                { code: 'HN', label: 'El Paraíso', value: [13.833333, -86.55] },
                { code: 'HN', label: 'Francisco Morazán', value: [14.1, -87.216667] },
                { code: 'HN', label: 'Gracias a Dios', value: [15, -84.5] },
                { code: 'HN', label: 'Intibucá', value: [14.32, -88.16] },
                { code: 'HN', label: 'Islas de la Bahía', value: [16.33, -86.519722] },
                { code: 'HN', label: 'La Paz', value: [14.316667, -87.683333] },
                { code: 'HN', label: 'Lempira', value: [14.19, -88.56] },
                { code: 'HN', label: 'Ocotepeque', value: [14.433333, -89.183333] },
                { code: 'HN', label: 'Olancho', value: [14.8, -86] },
                { code: 'HN', label: 'Santa Bárbara', value: [14.92, -88.236111] },
                { code: 'HN', label: 'Valle', value: [13.58, -87.489722] },
                { code: 'HN', label: 'Yoro', value: [15.1375, -87.130833] }

            ]
        },
        {
            label: 'Kenya',
            code: 'KE',
            items: [
                { code: 'KE', label: 'Nairobi', value: [-1.286389, 36.817223] },
                { code: 'KE', label: 'Mombasa', value: [-4.043477, 39.668207] },
                { code: 'KE', label: 'Kwale', value: [-4.173699, 39.452055] },
                { code: 'KE', label: 'Kilifi', value: [-3.51065, 39.909327] },
                { code: 'KE', label: 'Tana River', value: [-1.8506, 40.1729] },
                { code: 'KE', label: 'Lamu', value: [-2.269557, 40.90064] },
                { code: 'KE', label: 'Taita-Taveta', value: [-3.363435, 38.555328] },
                { code: 'KE', label: 'Garissa', value: [-0.45635, 39.6583] },
                { code: 'KE', label: 'Wajir', value: [1.7471, 40.0573] },
                { code: 'KE', label: 'Mandera', value: [3.9261, 41.8465] },
                { code: 'KE', label: 'Marsabit', value: [2.3284, 37.9899] },
                { code: 'KE', label: 'Isiolo', value: [0.3546, 37.5822] },
                { code: 'KE', label: 'Meru', value: [0.0487, 37.655] },
                { code: 'KE', label: 'Tharaka-Nithi', value: [-0.0856, 37.7757] },
                { code: 'KE', label: 'Embu', value: [-0.5386, 37.4507] },
                { code: 'KE', label: 'Kitui', value: [-1.367, 38.0106] },
                { code: 'KE', label: 'Machakos', value: [-1.5095, 37.2635] },
                { code: 'KE', label: 'Makueni', value: [-1.8041, 37.6203] },
                { code: 'KE', label: 'Nyandarua', value: [-0.3012, 36.4748] },
                { code: 'KE', label: 'Nyeri', value: [-0.4201, 36.9476] },
                { code: 'KE', label: 'Kirinyaga', value: [-0.4985, 37.2785] },
                { code: 'KE', label: 'Muranga', value: [-0.721, 37.1526] },
                { code: 'KE', label: 'Kiambu', value: [-1.1714, 36.8356] },
                { code: 'KE', label: 'Turkana', value: [3.3161, 35.5964] },
                { code: 'KE', label: 'West Pokot', value: [1.2355, 35.1993] },
                { code: 'KE', label: 'Samburu', value: [1.337, 37.1763] },
                { code: 'KE', label: 'Trans Nzoia', value: [1.0535, 35.008] },
                { code: 'KE', label: 'Uasin Gishu', value: [0.5143, 35.2698] },
                { code: 'KE', label: 'Elgeyo-Marakwet', value: [0.8069, 35.5641] },
                { code: 'KE', label: 'Nandi', value: [0.1105, 35.1753] },
                { code: 'KE', label: 'Baringo', value: [0.6663, 35.9457] },
                { code: 'KE', label: 'Laikipia', value: [0.3869, 36.8065] },
                { code: 'KE', label: 'Nakuru', value: [-0.3031, 36.08] },
                { code: 'KE', label: 'Narok', value: [-1.0851, 35.8779] },
                { code: 'KE', label: 'Kajiado', value: [-2.0981, 36.7819] },
                { code: 'KE', label: 'Kericho', value: [-0.3687, 35.2831] },
                { code: 'KE', label: 'Bomet', value: [-0.7813, 35.3416] },
                { code: 'KE', label: 'Kakamega', value: [0.2842, 34.7523] },
                { code: 'KE', label: 'Vihiga', value: [0.0917, 34.7258] },
                { code: 'KE', label: 'Bungoma', value: [0.5635, 34.5606] },
                { code: 'KE', label: 'Busia', value: [0.4608, 34.1115] },
                { code: 'KE', label: 'Siaya', value: [0.0607, 34.2881] },
                { code: 'KE', label: 'Kisumu', value: [-0.1022, 34.7617] },
                { code: 'KE', label: 'Homa Bay', value: [-0.5273, 34.4571] },
                { code: 'KE', label: 'Migori', value: [-1.0634, 34.4731] },
                { code: 'KE', label: 'Kisii', value: [-0.68, 34.7796] },
                { code: 'KE', label: 'Nyamira', value: [-0.5633, 34.9359] }
            ]
        },
        {
            label: 'Zambia',
            code: 'ZM',
            items: [
                { code: 'ZM', label: 'Central Province', value: [-14.4469, 28.44644] },
                { code: 'ZM', label: 'Copperbelt Province', value: [-12.95867, 28.63659] },
                { code: 'ZM', label: 'Eastern Province', value: [-13.63333, 32.65] },
                { code: 'ZM', label: 'Luapula Province', value: [-11.19976, 28.89431] },
                { code: 'ZM', label: 'Lusaka Province', value: [-15.40669, 28.28713] },
                { code: 'ZM', label: 'Muchinga Province', value: [-10.21289, 31.18084] },
                { code: 'ZM', label: 'North-Western Province', value: [-12.09514, 26.42727] },
                { code: 'ZM', label: 'Northern Province', value: [-10.21289, 31.18084] },
                { code: 'ZM', label: 'Southern Province', value: [-16.80889, 26.9875] },
                { code: 'ZM', label: 'Western Province', value: [-15.24835, 23.12741] }
            ]
        }
    ];

    const groupTemplate = (option: City) => {
        return (
            <div className="flex align-items-center gap-2">
                <img alt={option.label} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`fi fi-${option.code.toLowerCase()}`} style={{ width: '18px' }}/>
                <div>{option.label}</div>
            </div>
        );
    };

    const [latitude, setLatitude] = useState<number>(position[0]);
    const [longitude, setLongitude] = useState<number>(position[1]);
    
    const defaultValues = {
        latitude: initLatitude.current,
        longitude: initLongitude.current
    };
    const {
        control,
        formState: { errors },
        handleSubmit,
        getValues,
        setValue,
        reset
    } = useForm({ defaultValues });
    const onSubmit = (data: any) => {
        viewAttributes.current = true;
        initLatitude.current = data.latitude;
        initLongitude.current = data.longitude;
        setPosition([data.latitude,data.longitude]);
        setZoomLevel(18);
        setRerender([data.latitude,data.longitude]);
    };
    const getFormErrorMessage = (name:any) => {
        return errors[name] ? <small className="p-error">{errors[name].message}</small> : <small className="p-error">&nbsp;</small>;
    };

    setValue("latitude",initLatitude.current);
    setValue("longitude",initLongitude.current);

    const year = new Date().getFullYear();
    const [displayHistoricalClimate,setDisplayHistoricalClimate] = useState<boolean>(false);

    return (
        <>
            <div className="m-0 p-1 flex flex-row justify-content-start" style={{ width: '100%' }}>
                <img src="images/LocationIconYellow.png" alt="Location Icon" style={{ height: '35px'}} />
                <div className="flex flex-column p-1" style={{ width: '90%' }}>
                    <b>
                        {administrativeInfo.address.suburb != undefined?administrativeInfo.address.suburb+", ":null}
                        {administrativeInfo.address.village != undefined?administrativeInfo.address.village+", ":null}
                        {administrativeInfo.address.town != undefined?administrativeInfo.address.town+", ":null}
                        {administrativeInfo.address.city != undefined?administrativeInfo.address.city+", ":null}                        
                                                
                        {administrativeInfo.address.region != undefined?administrativeInfo.address.region+", ":null}
                        {administrativeInfo.address.state != undefined?administrativeInfo.address.state+", ":null}

                        {administrativeInfo.address.country != undefined?administrativeInfo.address.country:null}
                    </b><Divider className='m-0 p-1' />Coordinates: {administrativeInfo.lat.toFixed(6)}, {administrativeInfo.lng.toFixed(6)}<br/>Altitude: {nFormat.format(administrativeInfo.elevation[0]).replace(/,/g, " ")}m
                    <br/>
                    <div className='flex flex-row'><span style={{ cursor: 'pointer', textDecoration: 'underline', color: 'orange' }} onClick={()=>{setDisplayHistoricalClimate(!displayHistoricalClimate)}} >Climate data </span>
                        <i className="pi pi-info-circle mr-1" style={{ height: '10px', cursor: 'pointer' }} onClick={()=>{document.getElementById('HistoricalClimateInfo1').style.display='block'}} />
                        <div id="HistoricalClimateInfo1" style={{ display: 'none', position: 'relative', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '2px', zIndex: 3, width: '97%', left: '5px' }} onClick={()=>{document.getElementById('HistoricalClimateInfo1').style.display='none'}}>
                            <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('HistoricalClimateInfo1').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                            <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                <p>Daily surface meteorological data averaged each month for the last 5 years (<a href="https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels?tab=overview" target="_blank">Copernicus Climate Change Service - ERA5</a>).</p>
                            </div>
                        </div>
                    </div>
                    {displayHistoricalClimate &&<HistoricalClimateData
                            latitude={administrativeInfo.lat}
                            longitude={administrativeInfo.lng}
                            startYear={year-6}  // optional
                            endYear={year-1}    // optional
                        />}
                    <Divider className='m-0 p-0' />                    
                </div>
            </div>
            {soil != '' && <div className="m-0 p-1 flex flex-row justify-content-start">
                <img src="images/SoilIcon.png" alt="Soil Icon" style={{ height: '30px'}} />
                <div className="flex flex-column p-1" style={{ width: '90%' }}>
                    {soilName}({soilCode})<Divider className='m-0 p-0'/>
                </div>
                <img src="images/pencil.png" alt="Pencil Icon" style={{ height: '20px', cursor: 'pointer' }} onClick={()=>{setShow('Soil')}} />
            </div>}
            {crop != '' && <div className="m-0 p-1 flex flex-row justify-content-start">
                <img src="images/CropIcon.png" alt="Crop Icon" style={{ height: '30px'}} />
                <div className="flex flex-column p-1" style={{ width: '90%' }}>
                    {crop}<Divider className='m-0 p-0' />
                </div>
                <img src="images/pencil.png" alt="Pencil Icon" style={{ height: '20px', cursor: 'pointer' }} onClick={()=>{setShow('Crop')}} />
            </div>}
            {(irrigation != undefined && input != '') && <div className="m-0 p-1 flex flex-row justify-content-start">
                <img src="images/IrrigationIcon.png" alt="Irrigation Icon" style={{ height: '30px'}} />
                <div className="flex flex-column p-1" style={{ width: '90%' }}>
                    {irrigation == "Yes"?"Irrigated":"Rain Fed"}<br/>
                    {input == 'High'?"High":"Low"} input farm management<Divider className='m-0 p-0' />
                </div>
                <img src="images/pencil.png" alt="Pencil Icon" style={{ height: '20px', cursor: 'pointer' }} onClick={()=>{setShow('Irrigation & Farm Management')}} />
            </div>}
            <CancelButton style={{ fontSize: '11pt' }} onClick={()=>{setLocation(false);setShow(false);setHWSDStatistics(null);setSoilCode('');setCropCode('');setWaterCode('');setInputCode('');setZoomLevel(3);setPositionNew([1.5, 24.5]);}}>CHOOSE ANOTHER LOCATION</CancelButton>            
        </>
    )
}