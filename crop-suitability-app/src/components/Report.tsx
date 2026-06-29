import { Result } from './Result';

export const Report = (props) => {
   const {rerender,setRerender,historicalClimate,setHistoricalClimate,details,setDetails,show,setShow,location,setLocation,positionnew,setPositionNew,zoomLevel,setZoomLevel,administrativeInfo,setAdministrativeInfo,bufferRadius,setBufferRadius,HWSDStatistics,setHWSDStatistics,fetchHWSDStatistics,
       soil,
       setSoil,
       crops, crop,
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
    return(
      <Result positionnew={positionnew} bufferRadius={bufferRadius} soilCode={soilCode} soilName={soilName} cropCode={cropCode} waterCode={waterCode} inputCode={inputCode} cropLayerVisible={cropLayerVisible} setCropLayerVisible={setCropLayerVisible} administrativeInfo={administrativeInfo} soil={soil} crops={crops} crop={crop} irrigation={irrigation} input={input} publishReport={true} />
    );
}