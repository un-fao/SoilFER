import { useState,useRef } from 'react';
import { Panel, Info, SubmitButton, CancelButton } from '../App';
import { Divider } from 'primereact/divider';
import { InputSwitch, InputSwitchChangeEvent } from "primereact/inputswitch";
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";

export const SoilTest = (props) => {
    const {position,rerender,setRerender,setShow,soil,setSoil,setSoilCode,setCropLayerVisible, setSoilName,setKnownSoil,calcultatedSoil,setCalcultatedSoil,calcultatedSoilMessage,setCalcultatedSoilMessage,soilSummary,setSoilSummary, texture_lookup, drainage_lookup, WRB_lookup} = props;
    interface Item {
        name: string;
        value: number;
    }
    
    const [textureEntry,setTextureEntry] = useState<boolean>(false);
    const [drainageEntry,setDrainageEntry] = useState<boolean>(false);
    const [colourEntry,setColourEntry] = useState<boolean>(false);
    const [coarseFragmentsEntry,setCoarseFragmentsEntry] = useState<boolean>(false);
    const [mottleAbundanceEntry,setMottleAbundanceEntry] = useState<boolean>(false);

    const [balling, setBalling] = useState<string>('');
    const [ribbon, setRibbon] = useState<string>('');
    const [ribbonLength, setRibbonLength] = useState<Item>(null);
    const ribbonLengths: Item[] = [
        {name: 'Less than 2.5 cm', value: 1},
        {name: 'Between 2.5 & 5 cm', value: 2},
        {name: 'Greater than 5 cm', value: 3}
    ];
    const [grittiness, setGrittiness] = useState<Item>(null);
    const grittinesses: Item[] = [
        {name: 'Very gritty', value: 1},
        {name: 'Somewhat gritty', value: 2},
        {name: 'Not gritty at all', value: 3}
    ];
    const [smoothness, setSmoothness] = useState<Item>(null);
    const smoothnesses: Item[] = [
        {name: 'Very smooth', value: 1},
        {name: 'Somewhat smooth', value: 2},
        {name: 'Not smooth at all', value: 3}
    ];
    const [stickiness, setStickiness] = useState<Item>(null);
    const stickinesses: Item[] = [
        {name: 'Very sticky', value: 1},
        {name: 'Somewhat sticky', value: 2},
        {name: 'Not sticky at all', value: 3}
    ];
    const [drainage, setDrainage] = useState<string>('');
    const [colour, setColour] = useState<string>('');
    const [rocksPebblesGravel, setRocksPebblesGravel] = useState<string>('');
    const [whichRocksPebblesGravels, setWhichRocksPebblesGravels] = useState<Item>(null);
    const rocksPebblesGravels: Item[] = [
        {name: 'Rocks', value: 1},
        {name: 'Pebbles', value: 2},
        {name: 'Gravel', value: 3}
    ];
    const [coarseFragmentSize, setCoarseFragmentSize] = useState<Item>(null);
    const coarseFragmentSizes: Item[] = [
        {name: 'Small (< 2 cm)', value: 1},
        {name: 'Medium (2 to 7.5 cm)', value: 2},
        {name: 'Large (> 7.5 cm)', value: 3}
    ];
    const [coarseFragmentPercent, setCoarseFragmentPercent] = useState<Item>(null);
    const coarseFragmentPercents: Item[] = [
        {name: 'Less than 15%', value: 1},
        {name: '15% to 35%', value: 2},
        {name: 'More than 35%', value: 3}
    ];
    const [digDifficult, setDigDifficult] = useState<string>('');
    const [mottleAbundance, setMottleAbundance] = useState<Item>(null);
    const mottleAbundances: Item[] = [
        {name: 'None', value: 0},
        {name: 'Low', value: 1},
        {name: 'Moderate', value: 2},
        {name: 'High', value: 3}
    ];
    const [colourDifference, setColourDifference] = useState<string>('');
    const [irregularPatterns, setIrregularPatterns] = useState<string>('');
    const [mottleSize, setMottleSize] = useState<Item>(null);
    const mottleSizes: Item[] = [
        {name: 'Small', value: 1},
        {name: 'Medium', value: 2},
        {name: 'Large', value: 3}
    ];

    const [resultTexture,setResultTexture] = useState('');    
    const calculateTexture = ()=> {
        if(ribbonLength){
            if(ribbonLength.value === 1){
                if(grittiness.value === 1)
                    setResultTexture("Sandy loam");
                else if(grittiness.value === 2)
                    setResultTexture("Loam");
                else if(smoothness.value === 1)
                    setResultTexture("Silt loam");
                else
                    setResultTexture("Unknown Texture");
            }            
            else if(ribbonLength.value === 2){
                if(grittiness.value === 1)
                    setResultTexture("Sandy clay loam");
                else if(stickiness.value === 1)
                    setResultTexture("Clay loam");
                else if(smoothness.value === 1)
                    setResultTexture("Silty clay loam");
                else
                    setResultTexture("Unknown Texture");
            }
            else if(ribbonLength.value === 3){
                if(stickiness.value === 1 && smoothness.value === 1)
                    setResultTexture("Clay");
                else if(smoothness.value === 1)
                    setResultTexture("Silty clay");
                else
                    setResultTexture("Unknown Texture");
            }
            else
                setResultTexture("Unknown Texture");
        }
        else
            setResultTexture("Unknown Texture");
    }
    const [resultCoarseFragments,setCoarseFragments] = useState('');
    const calculateCoarseFragments = ()=> {
        if(rocksPebblesGravel){
            if(rocksPebblesGravel === 'No')
                setCoarseFragments("None");
            else{
                if(coarseFragmentPercent.value === 1)
                    setCoarseFragments("None");
                else if(coarseFragmentPercent.value === 2)
                    setCoarseFragments("Low");
                else if(coarseFragmentPercent.value === 3)
                    setCoarseFragments("High");
                else
                    setCoarseFragments("Unknown Coarse Fragments");
            }
        }
        else
            setCoarseFragments("Unknown Coarse Fragments");
    }
    
    const getKeyByValue = (object, value)=> {
        return Object.keys(object).find(key => object[key] === value);
    }

    interface SoilEntry {
        ID: string;
        HWSD2_SMU_ID?: string;
        SHARE?: string;
        WRB2?: string;
        ROOT_DEPTH?: string;
        DRAINAGE?: string;
        LAYER?: string;
        COARSE?: string;
        SAND?: string;
        SILT?: string;
        CLAY?: string;
        TEXTURE_USDA?: string;
        isCentre?: boolean;
        COLOUR?: string;
        TEXTURE?: string;
        DRAINAGE_CLASS?: string;
        minCoarse?: string;
        maxCoarse?: string;
        Count?: number;
        Percentage?: string;
    }

    function calculateSoil(
            soilSummary: SoilEntry[],
            texture: string,
            drainage: string,
            coarse: string,
            colour: string
        ): SoilEntry[] {
        // Step 1: Filter objects matching the combination of variables
        const soilFiltered = soilSummary.filter((entry)=>
            entry.TEXTURE === texture
        );
        const drainageFiltered = soilFiltered.filter(
            (entry) =>
                entry.DRAINAGE_CLASS === drainage
        );
        const coarseFiltered = drainageFiltered.filter(
            (entry) =>
                entry.minCoarse === coarse || entry.maxCoarse === coarse
        );
        const colourFiltered = coarseFiltered.filter(
            (entry) =>
                entry.COLOUR === colour
        );
        const soilAlternateFiltered = soilSummary.filter(
            (entry) =>(
                (entry.DRAINAGE_CLASS === drainage && (entry.minCoarse === coarse ||entry.maxCoarse === coarse) && entry.COLOUR === colour) ||
                (entry.DRAINAGE_CLASS === drainage && (entry.minCoarse === coarse ||entry.maxCoarse === coarse)) ||
                ((entry.minCoarse === coarse ||entry.maxCoarse === coarse) && entry.COLOUR === colour) ||
                (entry.DRAINAGE_CLASS === drainage && entry.COLOUR === colour)
            )
        );
    
        // Step 2: If matches are found, return them
        if (soilFiltered.length > 0) {
            if(drainageFiltered.length > 0){
                if(coarseFiltered.length > 0){
                    if(colourFiltered.length > 0){
                        return colourFiltered;
                    }
                    else
                        return coarseFiltered;
                }
                else
                    return drainageFiltered
            }
            else               
                return soilFiltered;            
        }
        else{
            if(soilAlternateFiltered.length > 0)                
                return soilAlternateFiltered;            
            else{
                /*// Step 3: Find the largest isCentre object based on Percentage if no matches are found
                const largestIsCentre = soilSummary
                .filter((entry) => entry.isCentre)
                .reduce((largest, current) =>
                    parseFloat(current.SHARE || "0") > parseFloat(largest.SHARE|| "0")
                        ? current
                        : largest,
                    {} as SoilEntry
                );

                // Return the largest isCentre object if it exists
                if (Object.keys(largestIsCentre).length > 0) {
                    return [largestIsCentre];
                }*/
                // Step 3: Find the largest object based on Share if no matches are found
                const largest = soilSummary
                .filter((entry) => entry.TEXTURE !== "Unknown")
                .reduce((largest, current) =>
                    parseFloat(current.SHARE || "0") > parseFloat(largest.SHARE|| "0")
                        ? current
                        : largest,
                    {} as SoilEntry
                );

                // Return the largest object if it exists
                if (Object.keys(largest).length > 0) {
                    return [largest];
                }
                else
                    return [soilSummary[0] as SoilEntry];
            }
        }
    }

    const processSoil = ()=>{
        let Soil = calculateSoil(soilSummary, resultTexture, drainage, resultCoarseFragments, colour)[0];
        setSoil(Soil.ID);
        setSoilCode(Soil.WRB2);
        if(textureEntry && drainageEntry){            
            setCalcultatedSoilMessage("Based on your selections, we estimate that you soil is likely: ");
        } else if (textureEntry || drainageEntry || colourEntry || coarseFragmentsEntry || mottleAbundanceEntry) {
            setCalcultatedSoilMessage("Your selections are insufficient to calculate your soil, the most abudant soil in your area is: ");
        } else {
            setCalcultatedSoilMessage("You have not made any selections, the most abudant soil in your area is: ");
        }
        setCropLayerVisible(true);
        setSoilName(WRB_lookup[Soil.WRB2?.toUpperCase()]?.name||null);
    }
    
    return(
        <>
            <div id="MenuContainer" style={{ display: 'block' }}>
                <div className="card">
                    <div className="m-0 p-0 justify-content-start" style={{ width: '450px' }}><p style={{ fontWeight: 'bold', fontSize: '13pt', padding: 0, margin: 0 }}>Click on the buttons below to start recalculating your soil </p>                  
                    <p style={{ fontSize: '12pt' }}>This evaluation will focus on the topsoil in our area which represents the upper 0 - 20 cm of the soil layer.</p></div>
                </div>
                <Info>
                    <div className="m-3 p-2 flex flex-row justify-content-start align-items-center" style={{ verticalAlign: 'middle', width: '50%', backgroundColor: '#492815', border: '1px solid #fff', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', color: '#fff', fontWeight: 'bolder', fontSize: '13pt' }} 
                        onClick={()=>{
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='block';
                            document.getElementById('DrainageTest').style.display='none';
                            document.getElementById('SoilColourTest').style.display='none';
                            document.getElementById('CoarseFragmentsTest').style.display='none';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            }}
                        ><img src="images/SoilTextureIcon.png" alt="Soil Texture Icon" style={{ height: '40px', marginRight: '10px' }} /> Soil texture test</div>
                    <div className="m-3 p-2 flex flex-row justify-content-start align-items-center" style={{ verticalAlign: 'middle', width: '50%', backgroundColor: '#492815', border: '1px solid #fff', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', color: '#fff', fontWeight: 'bolder', fontSize: '13pt' }}
                        onClick={()=>{
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='none';
                            document.getElementById('DrainageTest').style.display='block';
                            document.getElementById('SoilColourTest').style.display='none';
                            document.getElementById('CoarseFragmentsTest').style.display='none';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            }}
                        ><img src="images/DrainageIcon.png" alt="Drainage Icon" style={{ height: '40px', marginRight: '10px' }} /> Drainage test</div>
                    <div className="m-3 p-2 flex flex-row justify-content-start align-items-center" style={{ verticalAlign: 'middle', width: '50%', backgroundColor: '#492815', border: '1px solid #fff', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', color: '#fff', fontWeight: 'bolder', fontSize: '13pt' }}
                        onClick={()=>{
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='none';
                            document.getElementById('DrainageTest').style.display='none';
                            document.getElementById('SoilColourTest').style.display='block';
                            document.getElementById('CoarseFragmentsTest').style.display='none';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            }}
                        ><img src="images/SoilColourIcon.png" alt="Soil Colour Icon" style={{ height: '40px', marginRight: '10px' }} /> Soil colour</div>
                    <div className="m-3 p-2 flex flex-row justify-content-start align-items-center" style={{ verticalAlign: 'middle', width: '50%', backgroundColor: '#492815', border: '1px solid #fff', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', color: '#fff', fontWeight: 'bolder', fontSize: '13pt' }}
                        onClick={()=>{
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='none';
                            document.getElementById('DrainageTest').style.display='none';
                            document.getElementById('SoilColourTest').style.display='none';
                            document.getElementById('CoarseFragmentsTest').style.display='block';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            }}
                        ><img src="images/CoarseFragmentsIcon.png" alt="Coarse Fragments Icon" style={{ height: '40px', marginRight: '10px' }} /> Coarse fragments</div>
                    <div className="m-3 p-2 flex flex-row justify-content-start align-items-center" style={{ verticalAlign: 'middle', width: '50%', backgroundColor: '#492815', border: '1px solid #fff', borderRadius: '10px', cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', color: '#fff', fontWeight: 'bolder', fontSize: '13pt' }}
                        onClick={()=>{
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='none';
                            document.getElementById('DrainageTest').style.display='none';
                            document.getElementById('SoilColourTest').style.display='none';
                            document.getElementById('CoarseFragmentsTest').style.display='none';
                            document.getElementById('MottleAbundanceTest').style.display='block';
                            }}
                        ><img src="images/MottleAbundanceIcon.png" alt="Mottle Abundance Icon" style={{ height: '40px', marginRight: '10px' }} /> Mottle abundance</div>
                </Info>
                <Divider />
                <SubmitButton
                    style={{ fontSize: '13pt' }}
                    onClick={()=>{{
                        processSoil();
                        setResultTexture('');
                        setCoarseFragments('');
                        document.getElementById('MenuContainer').style.display='none';
                        document.getElementById('SoilTextureTest').style.display='none';
                        document.getElementById('DrainageTest').style.display='none';
                        document.getElementById('SoilColourTest').style.display='none';
                        document.getElementById('CoarseFragmentsTest').style.display='none';
                        document.getElementById('MottleAbundanceTest').style.display='none';
                        setCalcultatedSoil(true);
                        setKnownSoil('Yes');
                        //setShow('Soil');                        
                        }}}
                >Recalculate your soil</SubmitButton>                
            </div>
            <div id="SoilTextureTest" style={{ display: 'none' }}>
                <h2 className="m-0 p-0">
                    <div className="m-0 p-0 flex flex-row justify-content-start" style={{fontSize: '18pt'}}><img src="images/SoilTextureIcon.png" alt="Soil Texture Icon" style={{ height: '25px', marginRight: '10px' }} /> Soil texture test</div>
                </h2>                
                <Divider />
                <div className="card">
                    <div className="flex flex-row p-0 m-0 col-12" >
                        <div className="card p-0 m-0 col-1 align-items-center" style={{ textAlign: 'center' }}>
                            <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('BallTestInfo').style.display='block'}} />
                            <div id="BallTestInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', zIndex: 2,  padding: '5px' }} onClick={()=>{document.getElementById('BallTestInfo').style.display='none'}}>
                                <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('BallTestInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                Assess soil cohesiveness by forming a ball and observing if it holds or crumbles.
                                </div>
                            </div>
                        </div>
                        <div className="card p-1 m-0 col-9"><b>Ball Test: Can you make a ball with the soil when it's moist?</b><hr/></div>
                        <div className="card p-1 m-0 col-2">
                            <div className="flex flex-row p-0 m-0 gap-1">
                                <div key="ballingYes" className="flex align-items-center">
                                    <RadioButton inputId="ballingYes" name="balling" value="Yes" onChange={(e: RadioButtonChangeEvent) => {setBalling(e.value);setRibbon('');setResultTexture('');setTextureEntry(true);}} checked={balling === "Yes"} />
                                    <label htmlFor="ballingYes" className="ml-2">Yes </label>
                                </div>
                                <div key="ballingNo" className="flex align-items-center">
                                    <RadioButton inputId="ballingNo" name="balling" value="No" onChange={(e: RadioButtonChangeEvent) => {setBalling(e.value);setRibbon('');setResultTexture('Sand');setTextureEntry(true);}} checked={balling === "No"} />
                                    <label htmlFor="ballingNo" className="ml-2">No </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {balling === "Yes" && <>
                    <div className="flex flex-row p-0 m-0 col-12" >
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                            <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('RibbonTestInfo').style.display='block'}} />
                            <div id="RibbonTestInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', zIndex: 2,  padding: '5px' }} onClick={()=>{document.getElementById('RibbonTestInfo').style.display='none'}}>
                                <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('RibbonTestInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                Form a ribbon with soil and measure its length before breaking to assess texture. 
                                </div>
                            </div>
                        </div>
                        <div className="card p-1 m-0 col-9"><b>Ribbon Test: Can you make a ribbon by pressing the soil between your thumb and finger?</b><hr/></div>
                        <div className="card p-1 m-0 col-2">
                            <div className="flex flex-row p-0 m-0 gap-1">
                                <div key="ribbonYes" className="flex align-items-center">
                                    <RadioButton inputId="ribbonYes" name="ribbon" value="Yes" onChange={(e: RadioButtonChangeEvent) => {setRibbon(e.value);setResultTexture('')}} checked={ribbon === "Yes"} />
                                    <label htmlFor="ribbonYes" className="ml-2">Yes </label>
                                </div>
                                <div key="ribbonNo" className="flex align-items-center">
                                    <RadioButton inputId="ribbonNo" name="ribbon" value="No" onChange={(e: RadioButtonChangeEvent) => {setRibbon(e.value);setResultTexture('Loamy sand')}} checked={ribbon === "No"} />
                                    <label htmlFor="ribbonNo" className="ml-2">No </label>
                                </div>
                            </div>
                        </div>
                    </div>
                        {ribbon === "Yes" && <>
                        <div className="flex flex-row p-0 m-0 col-12" >
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                                <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('RibbonLengthInfo').style.display='block'}} />
                                <div id="RibbonLengthInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', zIndex: 2,  padding: '5px' }} onClick={()=>{document.getElementById('RibbonLengthInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('RibbonLengthInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                    Measure ribbon length to estimate clay content in soil.
                                    </div>
                                </div>
                            </div>
                            <div className="card p-1 m-0 col-11"><b>Ribbon Length: How long is the ribbon you can make?</b></div>
                            <div></div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12" >
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}></div>
                            <div className="card p-1 m-0 col-11">
                                <div className="flex flex-row p-0 m-0 gap-1" >
                                {ribbonLengths.map((category) => {
                                    return (
                                        <div key={category.name} className="flex align-items-center w-full">
                                            <RadioButton inputId={category.name} name="ribbonLength" value={category} onChange={(e: RadioButtonChangeEvent) => setRibbonLength(e.value)} checked={ribbonLength?.value === category.value} />
                                            <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                        </div>
                                    );
                                })}
                                </div><hr/>
                            </div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12" >
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                                <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('GrittinessInfo').style.display='block'}} />
                                <div id="GrittinessInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', zIndex: 2,  padding: '5px' }} onClick={()=>{document.getElementById('GrittinessInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('GrittinessInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                    Feel for gritty particles in moistened soil to determine sand content. 
                                    </div>
                                </div>
                            </div>
                            <div className="card p-1 m-0 col-11"><b>Grittiness: Does the soil feel gritty?</b></div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12" >
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}></div>
                            <div className="card p-1 m-0 col-11">
                                <div className="flex flex-row p-0 m-0 gap-1">
                                {grittinesses.map((category) => {
                                    return (
                                        <div key={category.name} className="flex align-items-center w-full">
                                            <RadioButton inputId={category.name} name="grittiness" value={category} onChange={(e: RadioButtonChangeEvent) => setGrittiness(e.value)} checked={grittiness?.value === category.value} />
                                            <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                        </div>
                                    );
                                })}
                                </div><hr/>
                            </div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12" >
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                                <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('SmoothnessInfo').style.display='block'}} />
                                <div id="SmoothnessInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', zIndex: 2,  padding: '5px' }} onClick={()=>{document.getElementById('SmoothnessInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('SmoothnessInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                    Assess silt content by evaluating how smooth the soil feels when rubbed.  
                                    </div>
                                </div>
                            </div>
                            <div className="card p-1 m-0 col-11"><b>Smoothness: How smooth is the soil?</b></div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12" >
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}></div>
                            <div className="card p-1 m-0 col-11">
                                <div className="flex flex-row p-0 m-0 gap-1">
                                {smoothnesses.map((category) => {
                                    return (
                                        <div key={category.name} className="flex align-items-center w-full">
                                            <RadioButton inputId={category.name} name="smoothness" value={category} onChange={(e: RadioButtonChangeEvent) => setSmoothness(e.value)} checked={smoothness?.value === category.value} />
                                            <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                        </div>
                                    );
                                })}
                                </div><hr/>
                            </div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12" >
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                                <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('StickinessInfo').style.display='block'}} />
                                <div id="StickinessInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', zIndex: 2,  padding: '5px' }} onClick={()=>{document.getElementById('StickinessInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('StickinessInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                    Test how sticky the soil feels to estimate clay content.
                                    </div>
                                </div>
                            </div>
                            <div className="card p-1 m-0 col-11"><b>Stickiness: How sticky is the soil?</b></div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12" >
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}></div>
                            <div className="card p-1 m-0 col-11">
                                <div className="flex flex-row p-0 m-0 gap-1">
                                {stickinesses.map((category) => {
                                    return (
                                        <div key={category.name} className="flex align-items-center w-full">
                                            <RadioButton inputId={category.name} name="stickiness" value={category} onChange={(e: RadioButtonChangeEvent) => setStickiness(e.value)} checked={stickiness?.value === category.value} />
                                            <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                        </div>
                                    );
                                })}
                                </div><hr/>
                            </div>
                        </div>
                        </>}
                    </>}
                </div>
                <Divider />
                <div className="flex flex-row gap-1">
                    <CancelButton
                        style={{ fontSize: '13pt' }}
                        onClick={()=>{{
                            setResultTexture('');
                            document.getElementById('MenuContainer').style.display='block';
                            document.getElementById('SoilTextureTest').style.display='none';
                            document.getElementById('DrainageTest').style.display='none';
                            document.getElementById('SoilColourTest').style.display='none';
                            document.getElementById('CoarseFragmentsTest').style.display='none';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            }}}
                    >Back to Soil tests</CancelButton>
                    {
                        (
                            (balling === 'No') ||
                            (balling === 'Yes' && ribbon === 'No') ||
                            (balling === 'Yes' && ribbon === 'Yes' && ribbonLength && smoothness && stickiness)
                        ) && <SubmitButton
                        style={{ fontSize: '13pt' }}
                        onClick={()=>{{
                            calculateTexture();
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='none';
                            document.getElementById('DrainageTest').style.display='block';
                            document.getElementById('SoilColourTest').style.display='none';
                            document.getElementById('CoarseFragmentsTest').style.display='none';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            }}}
                        >Next: Drainage test</SubmitButton>
                    }
                </div>
            </div>
            <div id="DrainageTest" style={{ display: 'none' }}>
                <h2 className="m-0 p-0">
                    <div className="m-0 p-0 flex flex-row justify-content-start" style={{fontSize: '18pt'}}><img src="images/DrainageIcon.png" alt="Drainage Icon" style={{ height: '25px', marginRight: '10px' }} /> Drainage test</div>
                </h2>
                <span style={{ fontSize: '10pt' }}>Select one of the characteristics below</span>
                <Divider />
                <div className="card">
                    <div className="flex flex-row p-0 m-0 col-12">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="drainage1" name="drainage" value="Excessively drained" onChange={(e: RadioButtonChangeEvent) => {setDrainage(e.value);setDrainageEntry(true);}} checked={drainage === 'Excessively drained'} /></div>
                        <div className="card p-1 m-0 col-11"><label htmlFor="drainage1" className="ml-2"><b>Excessively Drained: Water moves through your soil very quickly</b></label><hr/></div>                        
                    </div>
                    <div className="flex flex-row p-0 m-0 col-12">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="drainage2" name="drainage" value="Somewhat excessively drained" onChange={(e: RadioButtonChangeEvent) => {setDrainage(e.value);setDrainageEntry(true);}} checked={drainage === 'Somewhat excessively drained'} /></div>
                        <div className="card p-1 m-0 col-11"><label htmlFor="drainage2" className="ml-2"><b>Somewhat Excessively Drained: Water moves quickly through your soil, but not as fast as excessively drained soils</b></label><hr/></div>
                    </div>
                    <div className="flex flex-row p-0 m-0 col-12">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="drainage3" name="drainage" value="Well drained" onChange={(e: RadioButtonChangeEvent) => {setDrainage(e.value);setDrainageEntry(true);}} checked={drainage === 'Well drained'} /></div>
                        <div className="card p-1 m-0 col-11"><label htmlFor="drainage3" className="ml-2"><b>Well Drained: Water moves through your soil at a balanced speed, keeping it from being too wet or too dry.</b></label><hr/></div>
                    </div>
                    <div className="flex flex-row p-0 m-0 col-12">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="drainage4" name="drainage" value="Moderately well drained" onChange={(e: RadioButtonChangeEvent) => {setDrainage(e.value);setDrainageEntry(true);}} checked={drainage === 'Moderately well drained'} /></div>
                        <div className="card p-1 m-0 col-11"><label htmlFor="drainage4" className="ml-2"><b>Moderately Well Drained: Your soil drains slower, but it doesn't stay wet for a long time</b></label><hr/></div>
                    </div>
                    <div className="flex flex-row p-0 m-0 col-12">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="drainage5" name="drainage" value="Imperfectly drained" onChange={(e: RadioButtonChangeEvent) => {setDrainage(e.value);setDrainageEntry(true);}} checked={drainage === 'Imperfectly drained'} /></div>
                        <div className="card p-1 m-0 col-11"><label htmlFor="drainage5" className="ml-2"><b>Imperfectly Drained: Water drains slowly, sometimes causing wet spots in your soil</b></label><hr/></div>
                    </div>
                    <div className="flex flex-row p-0 m-0 col-12">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="drainage6" name="drainage" value="Poorly drained" onChange={(e: RadioButtonChangeEvent) => {setDrainage(e.value);setDrainageEntry(true);}} checked={drainage === 'Poorly drained'} /></div>
                        <div className="card p-1 m-0 col-11"><label htmlFor="drainage6" className="ml-2"><b>Poorly Drained: Does water drain very slowly, leaving the soil waterlogged?</b></label><hr/></div>
                    </div>
                </div>
                <Divider />
                <div className="flex flex-row gap-1">
                    <CancelButton
                        style={{ fontSize: '13pt' }}
                        onClick={()=>{{
                            setResultTexture('');
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='block';
                            document.getElementById('DrainageTest').style.display='none';
                            document.getElementById('SoilColourTest').style.display='none';
                            document.getElementById('CoarseFragmentsTest').style.display='none';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            }}}
                    >Back to Soil texture test</CancelButton>
                    {drainage && <SubmitButton
                            style={{ fontSize: '13pt' }}
                            onClick={()=>{{
                                document.getElementById('MenuContainer').style.display='none';
                                document.getElementById('SoilTextureTest').style.display='none';
                                document.getElementById('DrainageTest').style.display='none';
                                document.getElementById('SoilColourTest').style.display='block';
                                document.getElementById('CoarseFragmentsTest').style.display='none';
                                document.getElementById('MottleAbundanceTest').style.display='none';
                                }}}
                        >Next: Colour test</SubmitButton>
                    }
                </div>
                <CancelButton
                    style={{ fontSize: '13pt' }}
                    onClick={()=>{{
                        setResultTexture('');
                        setCoarseFragments('');
                        document.getElementById('MenuContainer').style.display='block';
                        document.getElementById('SoilTextureTest').style.display='none';
                        document.getElementById('DrainageTest').style.display='none';
                        document.getElementById('SoilColourTest').style.display='none';
                        document.getElementById('CoarseFragmentsTest').style.display='none';
                        document.getElementById('MottleAbundanceTest').style.display='none';
                        }}}
                    >Back to Soil tests</CancelButton>
            </div>
            <div id="SoilColourTest" style={{ display: 'none', minWidth: '600px' }}>
                <h2 className="m-0 p-0">
                    <div className="m-0 p-0 flex flex-row justify-content-start" style={{fontSize: '18pt'}}><img src="images/SoilColourIcon.png" alt="Drainage Icon" style={{ height: '25px', marginRight: '10px' }} />Colour test</div>
                </h2>
                <span style={{ fontSize: '10pt' }}>Select one of the colours below. Click on a colour to see an example photo.</span>
                <Divider />
                    <div className="card">
                        <div className="flex flex-row p-0 m-0 col-12">
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="colour1" name="colour" value="Blackish" onChange={(e: RadioButtonChangeEvent) => {setColour(e.value);setColourEntry(true);}} checked={colour === 'Blackish'} /></div>
                            <div className="card p-1 m-0 col-10"><label htmlFor="colour1" className="ml-2"><b>Blackish</b></label><hr/></div>
                            <div className="card p-1 m-0 col-1 flex flex-row align-items-center justify-content-center"><label htmlFor="colour1" className="ml-2"><div style={{ backgroundColor: '#1c1a1b', width: '40px', height: '30px', border: '1px solid #fff', padding: '0', margin: '5px', cursor: 'pointer' }} onClick={()=>{document.getElementById('BlackishInfo').style.display='block'}}></div></label>
                                <div id="BlackishInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', zIndex: 2 }} onClick={()=>{document.getElementById('BlackishInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('BlackishInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                        <img src="images/blackish.png" alt="Blackish Soil" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12">
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="colour2" name="colour" value="Blueish / Greenish or Grayish" onChange={(e: RadioButtonChangeEvent) => {setColour(e.value);setColourEntry(true);}} checked={colour === 'Blueish / Greenish or Grayish'} /></div>
                            <div className="card p-1 m-0 col-10"><label htmlFor="colour2" className="ml-2"><b>Blueish / Greenish or Grayish</b></label><hr/></div>
                            <div className="card p-1 m-0 col-1 flex flex-row align-items-center justify-content-center"><label htmlFor="colour2" className="ml-2"><div style={{ backgroundColor: '#367588', width: '40px', height: '30px', border: '1px solid #fff', padding: '0', margin: '5px', cursor: 'pointer' }} onClick={()=>{document.getElementById('BlueishInfo').style.display='block'}}></div></label>
                                <div id="BlueishInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', zIndex: 2 }} onClick={()=>{document.getElementById('BlueishInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('BlueishInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                        <img src="images/blueish.png" alt="Blueish / Greenish or Grayish Soil" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12">
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="colour3" name="colour" value="Brownish" onChange={(e: RadioButtonChangeEvent) => {setColour(e.value);setColourEntry(true);}} checked={colour === 'Brownish'} /></div>
                            <div className="card p-1 m-0 col-10"><label htmlFor="colour3" className="ml-2"><b>Brownish</b></label><hr/></div>
                            <div className="card p-1 m-0 col-1 flex flex-row align-items-center justify-content-center"><label htmlFor="colour3" className="ml-2"><div style={{ backgroundColor: '#964B00', width: '40px', height: '30px', border: '1px solid #fff', padding: '0', margin: '5px', cursor: 'pointer' }} onClick={()=>{document.getElementById('BrownishInfo').style.display='block'}}></div></label>
                                <div id="BrownishInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', zIndex: 2 }} onClick={()=>{document.getElementById('BrownishInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('BrownishInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                        <img src="images/brownish.png" alt="Brownish Soil" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12">
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="colour4" name="colour" value="Reddish" onChange={(e: RadioButtonChangeEvent) => {setColour(e.value);setColourEntry(true);}} checked={colour === 'Reddish'} /></div>
                            <div className="card p-1 m-0 col-10"><label htmlFor="colour4" className="ml-2"><b>Reddish</b></label><hr/></div>
                            <div className="card p-1 m-0 col-1 flex flex-row align-items-center justify-content-center"><label htmlFor="colour4" className="ml-2"><div style={{ backgroundColor: '#86391a', width: '40px', height: '30px', border: '1px solid #fff', padding: '0', margin: '5px', cursor: 'pointer' }} onClick={()=>{document.getElementById('ReddishInfo').style.display='block'}}></div></label>
                                <div id="ReddishInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', zIndex: 2 }} onClick={()=>{document.getElementById('ReddishInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('ReddishInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                        <img src="images/reddish.png" alt="Reddish Soil" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12">
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="colour5" name="colour" value="Whitish" onChange={(e: RadioButtonChangeEvent) => {setColour(e.value);setColourEntry(true);}} checked={colour === 'Whitish'} /></div>
                            <div className="card p-1 m-0 col-10"><label htmlFor="colour5" className="ml-2"><b>Whitish</b></label><hr/></div>
                            <div className="card p-1 m-0 col-1 flex flex-row align-items-center justify-content-center"><label htmlFor="colour5" className="ml-2"><div style={{ backgroundColor: '#ccc', width: '40px', height: '30px', border: '1px solid #fff', padding: '0', margin: '5px', cursor: 'pointer' }} onClick={()=>{document.getElementById('WhitishInfo').style.display='block'}}></div></label>
                                <div id="WhitishInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', zIndex: 2 }} onClick={()=>{document.getElementById('WhitishInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('WhitishInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                        <img src="images/whitish.png" alt="Whitish Soil" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-row p-0 m-0 col-12">
                            <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}><RadioButton inputId="colour6" name="colour" value="Yellowish" onChange={(e: RadioButtonChangeEvent) => {setColour(e.value);setColourEntry(true);}} checked={colour === 'Yellowish'} /></div>
                            <div className="card p-1 m-0 col-10"><label htmlFor="colour6" className="ml-2"><b>Yellowish</b><hr/></label></div>
                            <div className="card p-1 m-0 col-1 flex flex-row align-items-center justify-content-center"><label htmlFor="colour6" className="ml-2"><div style={{ backgroundColor: '#8d8d35', width: '40px', height: '30px', border: '1px solid #fff', padding: '0', margin: '5px', cursor: 'pointer' }} onClick={()=>{document.getElementById('YellowishInfo').style.display='block'}}></div></label>
                                <div id="YellowishInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', zIndex: 2 }} onClick={()=>{document.getElementById('YellowishInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('YellowishInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                        <img src="images/yellowish.png" alt="Yellowish Soil" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                <Divider />
                <div className="flex flex-row gap-1">
                    <CancelButton
                        style={{ fontSize: '13pt' }}
                        onClick={()=>{{
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='none';
                            document.getElementById('DrainageTest').style.display='block';
                            document.getElementById('SoilColourTest').style.display='none';
                            document.getElementById('CoarseFragmentsTest').style.display='none';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            }}}
                    >Back to Drainage test</CancelButton>
                    {colour && <SubmitButton
                            style={{ fontSize: '13pt' }}
                            onClick={()=>{{
                                document.getElementById('MenuContainer').style.display='none';
                                document.getElementById('SoilTextureTest').style.display='none';
                                document.getElementById('DrainageTest').style.display='none';
                                document.getElementById('SoilColourTest').style.display='none';
                                document.getElementById('CoarseFragmentsTest').style.display='block';
                                document.getElementById('MottleAbundanceTest').style.display='none';
                                }}}
                            
                        >Next: Coarse fragments</SubmitButton>
                    }
                </div>
                <CancelButton
                    style={{ fontSize: '13pt' }}
                    onClick={()=>{{                        
                        setResultTexture('');
                        setCoarseFragments('');
                        document.getElementById('MenuContainer').style.display='block';
                        document.getElementById('SoilTextureTest').style.display='none';
                        document.getElementById('DrainageTest').style.display='none';
                        document.getElementById('SoilColourTest').style.display='none';
                        document.getElementById('CoarseFragmentsTest').style.display='none';
                        document.getElementById('MottleAbundanceTest').style.display='none';
                        }}}
                    >Back to Soil tests</CancelButton>
            </div>
            <div id="CoarseFragmentsTest" style={{ display: 'none' }}>
                <h2 className="m-0 p-0">
                    <div className="m-0 p-0 flex flex-row justify-content-start" style={{fontSize: '18pt'}}><img src="images/CoarseFragmentsIcon.png" alt="Coarse Fragments Icon" style={{ height: '25px', marginRight: '10px' }} /> Coarse fragments</div>
                </h2>
                <Divider />
                <div className="card">                    
                    <div className="flex flex-row p-0 m-0">
                        {/*}-<div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                            <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('CoarseFragments1Info').style.display='block'}} />
                            <div id="CoarseFragments1Info" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', zIndex: 2,  padding: '5px' }} onClick={()=>{document.getElementById('CoarseFragments1Info').style.display='none'}}>
                                <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('CoarseFragments1Info').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                <img src="images/coarsefragments.png" alt="Coarse fragments" />
                                </div>
                            </div>
                        </div>*/}
                        <div className="card p-1 m-0 col-9"><b>Are there any rocks, pebbles, or gravel in your soil?</b><hr/></div>
                        <div className="card p-1 m-0 col-2">
                            <div className="flex flex-row p-0 m-0 gap-1">
                                <div key="rocksPebblesGravelYes" className="flex align-items-center">
                                    <RadioButton inputId="rocksPebblesGravelYes" name="rocksPebblesGravel" value="Yes" onChange={(e: RadioButtonChangeEvent) => {setRocksPebblesGravel(e.value);setCoarseFragmentsEntry(true);}} checked={rocksPebblesGravel === "Yes"} />
                                    <label htmlFor="rocksPebblesGravelYes" className="ml-2">Yes </label>
                                </div>
                                <div key="rocksPebblesGravelNo" className="flex align-items-center">
                                    <RadioButton inputId="rocksPebblesGravelNo" name="rocksPebblesGravel" value="No" onChange={(e: RadioButtonChangeEvent) => {setRocksPebblesGravel(e.value);setCoarseFragmentsEntry(true);}} checked={rocksPebblesGravel === "No"} />
                                    <label htmlFor="rocksPebblesGravelNo" className="ml-2">No </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    {rocksPebblesGravel == 'Yes' && <>                        
                        <div className="flex flex-row p-0 m-0">
                            {/*<div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}></div>*/}
                            <div className="card p-1 m-0 col-10"><b>Size: What size are the coarse fragments?</b></div>
                            <div></div>
                        </div>
                        <div className="flex flex-row p-0 m-0">
                            {/*<div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}></div>*/}
                            <div className="card p-1 m-0 col-11">
                                <div className="p-0 m-0 flex flex-row gap-4">
                                {coarseFragmentSizes.map((category) => {
                                    return (
                                        <div key={category.name} className="flex align-items-center w-full">
                                            <RadioButton inputId={category.name} name="coarseFragmentSize" value={category} onChange={(e: RadioButtonChangeEvent) => {setCoarseFragmentSize(e.value);setCoarseFragmentsEntry(true);}} checked={coarseFragmentSize?.value === category.value} />
                                            <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                        </div>
                                    );
                                })}
                                </div><hr/>
                            </div>
                        </div>
                        <div className="flex flex-row p-0 m-0">
                            {/*<div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                                <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('CoarseFragmentsPercentageInfo').style.display='block'}} />
                                <div id="CoarseFragmentsPercentageInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', zIndex: 2,  padding: '5px' }} onClick={()=>{document.getElementById('CoarseFragmentsPercentageInfo').style.display='none'}}>
                                    <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('CoarseFragmentsPercentageInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                    <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                    <img src="images/info/CoarseFragmentsPercentage.png" alt="Coarse Fragments Percentages" />
                                    </div>
                                </div>
                            </div>*/}
                            <div className="card p-1 m-0 col-10"><b>What percentage of your soil contains rocks, pebbles, or gravel?</b></div>
                            <div></div>
                        </div>
                        <div className="flex flex-row p-0 m-0">
                            {/*<div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}></div>*/}
                            <div className="card p-1 m-0 col-11">
                                <div className="p-0 m-0 flex flex-row gap-4">
                                {coarseFragmentPercents.map((category) => {
                                    let coarseFragment = '';
                                    if (category.value === 1)
                                        coarseFragment="None"
                                    else if (category.value === 2)
                                        coarseFragment="Low"
                                    else if (category.value === 3)
                                        coarseFragment="High"
                                    else
                                        coarseFragment = "Unknown Coarse Fragments";
                                    return (
                                        <div key={category.name} className="flex align-items-center w-full">
                                            <RadioButton inputId={category.name} name="coarseFragmentPercent" value={category} onChange={(e: RadioButtonChangeEvent) => {setCoarseFragmentPercent(e.value);setCoarseFragments(coarseFragment);setCoarseFragmentsEntry(true);}} checked={coarseFragmentPercent?.value === category.value} />
                                            <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                        </div>
                                    );
                                })}
                                </div><hr/>
                            </div>
                        </div>
                    </>}
                    <div className="flex flex-row p-0 m-0">
                        {/*<div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}></div>*/}
                        <div className="card p-1 m-0 col-9"><b>Is the soil difficult to dig?</b><hr/></div>
                        <div className="card p-1 m-0 col-2">
                            <div className="flex flex-row p-0 m-0 gap-1">
                                <div key="digDifficultYes" className="flex align-items-center">
                                    <RadioButton inputId="digDifficultYes" name="digDifficult" value="Yes" onChange={(e: RadioButtonChangeEvent) => {setDigDifficult(e.value);setCoarseFragmentsEntry(true);}} checked={digDifficult === "Yes"} />
                                    <label htmlFor="digDifficultYes" className="ml-2">Yes </label>
                                </div>
                                <div key="digDifficultNo" className="flex align-items-center">
                                    <RadioButton inputId="digDifficultNo" name="digDifficult" value="No" onChange={(e: RadioButtonChangeEvent) => {setDigDifficult(e.value);setCoarseFragmentsEntry(true);}} checked={digDifficult === "No"} />
                                    <label htmlFor="digDifficultNo" className="ml-2">No </label>
                                </div>
                            </div>
                        </div>
                    </div>                    
                    <div className="flex flex-row p-0 m-0">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                            <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('CoarseFragments2Info').style.display='block'}} />
                            <div id="CoarseFragments2Info" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', zIndex: 2,  padding: '5px' }} onClick={()=>{document.getElementById('CoarseFragments2Info').style.display='none'}}>
                                <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('CoarseFragments2Info').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                <img src="images/coarsefragments.png" alt="Coarse fragments" style={{ height: '125px' }} />
                                </div>
                            </div>
                        </div>
                        <div className="card p-1 m-0 col-11"><b>Does your soil contain one or more of the following (click more than one if evident)?</b></div>
                    </div>
                    <div className="flex flex-row p-0 m-0">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}></div>
                        <div className="card p-1 m-0 col-9"><div className="flex" style={{ width: '100%', alignItems: 'center' }}></div><SelectButton value={whichRocksPebblesGravels} onChange={(e: SelectButtonChangeEvent) => {setWhichRocksPebblesGravels(e.value);setCoarseFragmentsEntry(true);}} optionLabel="name" options={rocksPebblesGravels} multiple/><hr/></div>
                        <div></div>
                    </div>
                </div>
                <Divider />
                <div className="flex flex-row gap-1">
                    <CancelButton
                        style={{ fontSize: '13pt' }}
                        onClick={()=>{{
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='none';
                            document.getElementById('DrainageTest').style.display='none';
                            document.getElementById('SoilColourTest').style.display='block';
                            document.getElementById('CoarseFragmentsTest').style.display='none';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            }}}
                    >Back to Colour test</CancelButton>
                    {
                        (
                            (
                                (rocksPebblesGravel === 'No') ||
                                (rocksPebblesGravel === 'Yes' && coarseFragmentSize && coarseFragmentPercent)
                            ) && digDifficult
                        ) && <SubmitButton
                            style={{ fontSize: '13pt' }}
                            onClick={()=>{{
                                calculateCoarseFragments();
                                document.getElementById('MenuContainer').style.display='none';
                                document.getElementById('SoilTextureTest').style.display='none';
                                document.getElementById('DrainageTest').style.display='none';
                                document.getElementById('SoilColourTest').style.display='none';
                                document.getElementById('CoarseFragmentsTest').style.display='none';
                                document.getElementById('MottleAbundanceTest').style.display='block';
                                }}}
                        >Next: Mottle abundance</SubmitButton>
                    }
                </div>
                <CancelButton
                    style={{ fontSize: '13pt' }} 
                    onClick={()=>{{
                        setResultTexture('');
                        setCoarseFragments('');
                        document.getElementById('MenuContainer').style.display='block';
                        document.getElementById('SoilTextureTest').style.display='none';
                        document.getElementById('DrainageTest').style.display='none';
                        document.getElementById('SoilColourTest').style.display='none';
                        document.getElementById('CoarseFragmentsTest').style.display='none';
                        document.getElementById('MottleAbundanceTest').style.display='none';
                        }}}
                    >Back to Soil tests</CancelButton>
            </div>
            <div id="MottleAbundanceTest" style={{ display: 'none' }}>
                <h2 className="m-0 p-0">
                    <div className="m-0 p-0 flex flex-row justify-content-start" style={{fontSize: '18pt'}}><img src="images/MottleAbundanceIcon.png" alt="Mottle Abundance Icon" style={{ height: '25px', marginRight: '10px' }} /> Mottle abundance</div>
                </h2>
                <Divider />
                <div className="card">
                    <div className="flex flex-row p-0 m-0">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                            <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('MottleAbundance1Info').style.display='block'}} />
                            <div id="MottleAbundance1Info" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', zIndex: 2 }} onClick={()=>{document.getElementById('MottleAbundance1Info').style.display='none'}}>
                                <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('MottleAbundance1Info').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                <div style={{ textAlign: 'left', fontSize: '0.75vw' }}>
                                <img src="images/mottleabundance.png" alt="Mottle Abundance" style={{ height: '175px' }}/>
                                </div>
                            </div>
                        </div>
                        <div className="card p-1 m-0 col-10"><b>Look for variations in color. Check for irregular patterns and observe the size and quantity of mottles.</b></div>
                        <div>&nbsp;</div>
                    </div>
                    <div className="flex flex-row p-0 m-0">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>&nbsp;</div>
                        <div className="card p-1 m-0 col-11">
                            <div className="p-0 m-0 flex flex-row gap-6">
                            {mottleAbundances.map((category) => {
                                return (
                                    <div key={category.name} className="flex align-items-center w-full">
                                        <RadioButton inputId={category.name} name="mottleAbundance" value={category} onChange={(e: RadioButtonChangeEvent) => {setMottleAbundance(e.value);setMottleAbundanceEntry(true);}} checked={mottleAbundance?.value === category.value} />
                                        <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                    </div>
                                );
                            })}
                            </div><hr/>
                        </div>
                    </div>
                    <div className="flex flex-row p-0 m-0">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                            <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('MottleAbundance1Info').style.display='block'}} />                            
                        </div>
                        <div className="card p-1 m-0 col-9"><b>Are there differences in the colour of your soil?</b><hr/></div>
                        <div className="card p-1 m-0 col-2">
                            <div className="flex flex-row p-0 m-0 gap-1">
                                <div key="colourDifferenceYes" className="flex align-items-center">
                                    <RadioButton inputId="colourDifferenceYes" name="colourDifference" value="Yes" onChange={(e: RadioButtonChangeEvent) => {setColourDifference(e.value);setMottleAbundanceEntry(true);}} checked={colourDifference === "Yes"} />
                                    <label htmlFor="colourDifferenceYes" className="ml-2">Yes </label>
                                </div>
                                <div key="colourDifferenceNo" className="flex align-items-center">
                                    <RadioButton inputId="colourDifferenceNo" name="colourDifference" value="No" onChange={(e: RadioButtonChangeEvent) => {setColourDifference(e.value);setMottleAbundanceEntry(true);}} checked={colourDifference === "No"} />
                                    <label htmlFor="colourDifferenceNo" className="ml-2">No </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row p-0 m-0">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                            <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('MottleAbundance1Info').style.display='block'}} />                            
                        </div>
                        <div className="card p-1 m-0 col-9"><b>Are there irregular patterns in your soil?</b><hr/></div>
                        <div className="card p-1 m-0 col-2">
                            <div className="flex flex-row p-0 m-0 gap-1">
                                <div key="irregularPatternsYes" className="flex align-items-center">
                                    <RadioButton inputId="irregularPatternsYes" name="irregularPatterns" value="Yes" onChange={(e: RadioButtonChangeEvent) => {setIrregularPatterns(e.value);setMottleAbundanceEntry(true);}} checked={irregularPatterns === "Yes"} />
                                    <label htmlFor="irregularPatternsYes" className="ml-2">Yes </label>
                                </div>
                                <div key="irregularPatternsNo" className="flex align-items-center">
                                    <RadioButton inputId="irregularPatternsNo" name="irregularPatterns" value="No" onChange={(e: RadioButtonChangeEvent) => {setIrregularPatterns(e.value);setMottleAbundanceEntry(true);}} checked={irregularPatterns === "No"} />
                                    <label htmlFor="irregularPatternsNo" className="ml-2">No </label>
                                </div>
                            </div>&nbsp;
                        </div>
                    </div>
                    <div className="flex flex-row p-0 m-0">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>
                            <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', alignContent: 'center', justifyContent: 'center' }} onClick={()=>{document.getElementById('MottleAbundance1Info').style.display='block'}} />                            
                        </div>
                        <div className="card p-1 m-0 col-11"><b>What size are the Mottles?</b></div>
                        <div>&nbsp;</div>
                    </div>                    
                    <div className="flex flex-row p-0 m-0">
                        <div className="card p-1 m-0 col-1 align-item-center" style={{ textAlign: 'center' }}>&nbsp;</div>
                        <div className="card p-1 m-0 col-11">
                            <div className="p-0 m-0 flex flex-row gap-6">
                            {mottleSizes.map((category) => {
                                return (
                                    <div key={category.name} className="flex align-items-center w-full">
                                        <RadioButton inputId={category.name} name="mottleSize" value={category} onChange={(e: RadioButtonChangeEvent) => {setMottleSize(e.value);setMottleAbundanceEntry(true);}} checked={mottleSize?.value === category.value} />
                                        <label htmlFor={category.name} className="ml-2">{category.name} </label>
                                    </div>
                                );
                            })}
                            </div><hr/>
                        </div>
                    </div>
                </div>
                <Divider />
                <div className="flex flex-row gap-1">
                    <CancelButton
                        style={{ fontSize: '13pt' }}
                        onClick={()=>{{
                            setCoarseFragments('');
                            setRocksPebblesGravel('');
                            setWhichRocksPebblesGravels(null);
                            setCoarseFragmentSize(null);
                            setCoarseFragmentPercent(null);
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='none';
                            document.getElementById('DrainageTest').style.display='none';
                            document.getElementById('SoilColourTest').style.display='none';
                            document.getElementById('CoarseFragmentsTest').style.display='block';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            }}}
                        >Back to Coarse fragments</CancelButton>
                    <CancelButton
                    style={{ fontSize: '13pt' }} 
                    onClick={()=>{{
                        setResultTexture('');
                        setCoarseFragments('');
                        document.getElementById('MenuContainer').style.display='block';
                        document.getElementById('SoilTextureTest').style.display='none';
                        document.getElementById('DrainageTest').style.display='none';
                        document.getElementById('SoilColourTest').style.display='none';
                        document.getElementById('CoarseFragmentsTest').style.display='none';
                        document.getElementById('MottleAbundanceTest').style.display='none';
                        }}}
                    >Back to Soil tests</CancelButton>
                </div>
                {(colourDifference && irregularPatterns && mottleSize) && <SubmitButton
                        style={{ fontSize: '13pt' }}
                        onClick={()=>{{                            
                            processSoil();
                            setResultTexture('');
                            setCoarseFragments('');
                            document.getElementById('MenuContainer').style.display='none';
                            document.getElementById('SoilTextureTest').style.display='none';
                            document.getElementById('DrainageTest').style.display='none';
                            document.getElementById('SoilColourTest').style.display='none';
                            document.getElementById('CoarseFragmentsTest').style.display='none';
                            document.getElementById('MottleAbundanceTest').style.display='none';
                            setCalcultatedSoil(true);
                            setKnownSoil('Yes');
                            //setShow('Soil');
                            }}}
                    >Recalculate your soil</SubmitButton>
                }                
            </div>
        </>
    )
};
