import React, { useState, useEffect } from "react";
import { RadioButton, RadioButtonChangeEvent } from "primereact/radiobutton";
import Papa from "papaparse";
import SyncLoader from "react-spinners/SyncLoader";

// Define types for HWSDStatistics and enriched data

interface CSVRowType {
    ID?: number;
    HWSD2_SMU_ID?: number;
    SHARE?: number;
    WRB2?: string;
    ROOT_DEPTH?: number;
    DRAINAGE?: string;
    COARSE?: number;
    SAND?: number;
    SILT?: number;
    CLAY?: number;
    TEXTURE_USDA?: number;
}

interface EnrichedDataType extends CSVRowType {
    Percentage?: number; // Only for class entries
    isCentre: boolean;
    backgroundColor?: string; // Add backgroundColor property
}

export const SoilTable = (props) => {
    const { soil, setSoil, HWSDStatistics, setSoilCode, setCropLayerVisible, setSoilName, soilSummary, setSoilSummary, texture_lookup, drainage_lookup, WRB_lookup } = props;
    const [enrichedData, setEnrichedData] = useState<EnrichedDataType[]>([]);
    const [summarizedData, setSummarizedData] = useState<any>();

    // Helper function to safely get WRB lookup data
    const getWRBData = (wrb: string | undefined) => {
        if (!wrb) return { color: "N/A", name: "N/A" };
        
        const lookupKey = wrb.toUpperCase();
        const lookupData = WRB_lookup[lookupKey];
        
        return lookupData || { color: "N/A", name: "N/A" };
    };
    // Helper function to get coarse fragments category
    const getCoarseCategory = (coarse: number | undefined) => {
        if (coarse === undefined) return "N/A";
        if (coarse <= 15) return "None";
        if (coarse <= 30) return "Low";
        if (coarse <= 60) return "Moderate";
        return "High";
    };

    // Fetch and parse CSV, ensuring a consistent object return type
    const fetchSoilCSV = async (id: string | number): Promise<CSVRowType[]> => {
        try {
            const url = `http://34.78.39.234:5000/clip?action=csv&soil_id=${id}`;
            const response = await fetch(url);
            const csvText = await response.text();
    
            return new Promise((resolve) => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (result) => {                        
                        resolve(result.data as CSVRowType[]); // Directly return all rows
                    },
                    error: (error) => {
                        console.error("Error parsing CSV:", error);
                        resolve([]);
                    },
                });
            });
        } catch (error) {
            console.error("Error fetching CSV file:", error);
            return [];
        }
    };    

    // Enrich HWSDStatistics data with CSV data
    const enrichData = async () => {
        setEnrichedData([]);
        if (!HWSDStatistics) return;
    
        const { centre, classes } = HWSDStatistics;
    
        // Fetch and enrich centre data
        const centreMatches = await fetchSoilCSV(centre.ID);
        const enrichedCentre = centreMatches.map((match) => ({
            ...centre,
            ...match,
            isCentre: true,
        }));
    
        // Fetch and enrich class data
        const classMatches = await Promise.all(
            classes.map(async (clss) => {
                const matches = await fetchSoilCSV(clss.ID);
                return matches.map((match) => ({
                    ...clss,
                    ...match,
                    isCentre: false,
                }));
            })
        );
    
        // Flatten class data and combine
        const flattenedClasses = classMatches.flat();
        setEnrichedData([...enrichedCentre, ...flattenedClasses]);
    };
    
    const summarizeTable = (enrichedData: EnrichedDataType[]) => {
        const centreData = enrichedData.filter((data) => data.isCentre);
        const classData = enrichedData.filter((data) => !data.isCentre);
    
        // Group by WRB2, TEXTURE_USDA, and DRAINAGE
        let SoilID = 1;
        const groupedClasses = classData.reduce((acc, curr) => {
            const wrb = curr.WRB2.toUpperCase() || "Unknown";
            const texture = curr.TEXTURE_USDA || "Unknown";
            const drainage = curr.DRAINAGE || "Unknown";
            const key = `${wrb}|${texture}|${drainage}`;
    
            const share = curr.SHARE || 0;
            const percentage = curr.Percentage || 0;
            const coarse = Number(curr.COARSE) || 0;

            SoilID += 1;
    
            if (!acc[key]) {
                acc[key] = {
                    ID: SoilID,
                    HWSD2_SMU_ID: SoilID,
                    WRB2: wrb,
                    TEXTURE_USDA: texture,
                    DRAINAGE: drainage,
                    SHARE: 0,
                    minCoarse: coarse,
                    maxCoarse: coarse,
                    totalCoarse: 0,
                    rowCount: 0,
                    isCentre: false,
                    rows: [],
                };
            }
    
            acc[key].SHARE += share * percentage / 100;
            acc[key].totalCoarse += coarse;            
            if(acc[key].minCoarse >= coarse)
                acc[key].minCoarse = coarse;
            if(acc[key].maxCoarse <= coarse)
                acc[key].maxCoarse = coarse;            
            acc[key].rowCount += 1;
            acc[key].ID = SoilID;
            acc[key].HWSD2_SMU_ID = SoilID;
            acc[key].rows.push(curr);
    
            return acc;
        }, {} as Record<string, {
            ID: number,
            HWSD2_SMU_ID: number;
            WRB2: string;
            TEXTURE_USDA: any;
            DRAINAGE: string;
            SHARE: number;
            minCoarse: number;
            maxCoarse: number;
            totalCoarse: number;
            rowCount: number;
            isCentre: false;
            rows: EnrichedDataType[];
        }>);
    
        // Calculate the average COARSE for each group
        const sortedGroupedClasses = Object.values(groupedClasses)
            .map((group) => ({
                ...group,
                averageCoarse: group.rowCount > 0 ? group.totalCoarse / group.rowCount : 0,
            }))
            .sort((a, b) => b.SHARE - a.SHARE);
    
        return { centreData, sortedGroupedClasses };
    };    
    
    // Fetch data when HWSDStatistics changes
    useEffect(() => {
        const enrichAndSummarize = async () => {
            await enrichData(); // Enrich data            
        };        
        enrichAndSummarize();
    }, [HWSDStatistics]);

    //Create the table for displaying statistics
    //Without Filtering
    /*useEffect(() => {
        if (enrichedData.length > 0) {
            const summary = summarizeTable(enrichedData); // Summarize data
            setSummarizedData(summary); // Update state if needed for rendering
            const enrichedWithDetails = enrichedData.map((data) => ({
                ...data,
                COLOUR: getWRBData(data.WRB2).color,
                TEXTURE: data.TEXTURE_USDA ? texture_lookup[data.TEXTURE_USDA] || "Unknown" : "Unknown",
                DRAINAGE_CLASS: data.DRAINAGE ? drainage_lookup[data.DRAINAGE] || "Unknown" : "Unknown",
                COARSE_FRAGMENTS: getCoarseCategory(data.COARSE),
            }));
            setSoilSummary(enrichedWithDetails);
        }
    }, [enrichedData]);*/
    //With Filtering
    useEffect(() => {
        if (enrichedData.length > 0) {
            const summary = summarizeTable(enrichedData); // Summarize data
            setSummarizedData(summary); // Update state if needed for rendering
            const enrichedWithDetails = summary.sortedGroupedClasses.map((data) => ({
                ...data,
                COLOUR: getWRBData(data.WRB2).color,
                TEXTURE: data.TEXTURE_USDA ? texture_lookup[data.TEXTURE_USDA] || "Unknown" : "Unknown",
                DRAINAGE_CLASS: data.DRAINAGE ? drainage_lookup[data.DRAINAGE] || "Unknown" : "Unknown",
                COARSE_FRAGMENTS: getCoarseCategory(data.minCoarse)+" - "+getCoarseCategory(data.maxCoarse),
                minCoarse: getCoarseCategory(data.minCoarse),
                maxCoarse: getCoarseCategory(data.maxCoarse)
            }));
            setSoilSummary(enrichedWithDetails);
        }
    }, [enrichedData]);

    let lastSMU = null; // Keep track of the last SMU
    let currentBackgroundColor = "#e0f7fa"; // Initial background color

    return (
        <>
            {soilSummary?.length < 1 && (
                <div className="flex w-full flex-column align-items-center justify-content-center">
                    <p>Please wait while we retrieve the area soils...</p>
                    <SyncLoader
                        size={5}
                        color="white"
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>
            )}
            {soilSummary?.length > 0 && (
                <div className="table">
                    <div className="table-header">
                        <div className="table-cell" style={{ textAlign: 'center' }}>Select</div>
                        <div className="table-cell" style={{ textAlign: 'left' }}>
                            <div className="flex flex-row">
                                <div className="p-0 m-0">Soil Texture</div>
                                <div className="p-0 m-0">
                                    <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', marginTop: '40%' }} onClick={()=>{document.getElementById('SoilTextureInfo').style.display='block'}} />                                    
                                    <div id="SoilTextureInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px' }}>
                                        <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('SoilTextureInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                        <div style={{ textAlign: 'left' }}>
                                            Soil texture refers to the mix of different particle sizes in soil, classified into textural classes based on their proportions. These classes use standard terms similar to those of the USDA system. There are 13 texture classes categorized by the USDA - 
                                            <ul>
                                                <li>Clay (heavy)</li>
                                                <li>Silty clay</li>
                                                <li>Clay (light)</li>
                                                <li>Silty clay loam</li>
                                                <li>Clay loam</li>
                                                <li>Silt</li>
                                                <li>Silt loam</li>
                                                <li>Sandy clay</li>
                                                <li>Loam</li>
                                                <li>Sandy clay loam</li>
                                                <li>Sandy loam</li>
                                                <li>Loamy sand</li>
                                                <li>Sand</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>       
                        </div>
                        <div className="table-cell" style={{ textAlign: 'left' }}>
                            <div className="flex flex-row">
                                <div className="p-0 m-0">Drainage Class</div>
                                <div className="p-0 m-0">
                                    <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', marginTop: '40%' }} onClick={()=>{document.getElementById('DrainageClassInfo').style.display='block'}} />
                                    <div id="DrainageClassInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px' }}>
                                        <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('DrainageClassInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                        <div style={{ textAlign: 'left' }}>
                                            Drainage class describes how often and for how long soil stays wet under natural conditions. Human changes, like drainage or irrigation, are only considered if they significantly alter the soil's characteristics. The classes are:
                                            <p style={{ marginLeft: '20px' }}>
                                                E: Excessively drained<br/>
                                                SE: Somewhat excessively drained<br/>
                                                W: Well drained<br/>
                                                MW: Moderately well drained<br/>
                                                I: Imperfectly drained<br/>
                                                P: Poorly drained<br/>
                                                VP: Very poorly drained
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="table-cell" style={{ textAlign: 'left' }}>
                            <div className="flex flex-row">
                                <div className="p-0 m-0">Colour</div>
                                <div className="p-0 m-0">
                                    <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', marginTop: '40%' }} onClick={()=>{document.getElementById('ColourInfo').style.display='block'}} />
                                    <div id="ColourInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px' }}>
                                        <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('ColourInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                        <div style={{ textAlign: 'left' }}>
                                        Soil colour refers to the visual appearance of soil as determined by its hue (colour type), value (lightness or darkness), and chroma (intensity or purity). It is influenced by factors like organic matter content, mineral composition, and moisture. Soil colour is often described using the Munsell soil colour system for consistency and precision. The soil colours used are -  
                                        <ul>
                                            <li>Blackish,</li>
                                            <li>Blueish / greenish or grayish,</li>
                                            <li>Brownish,</li>
                                            <li>Reddish,</li>
                                            <li>Whitish,</li>
                                            <li>Yellowish.</li>
                                        </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="table-cell" style={{ textAlign: 'left' }}>
                            <div className="flex flex-row">
                                <div className="p-0 m-0">Coarse Fragments</div>
                                <div className="p-0 m-0">
                                    <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', marginTop: '40%' }} onClick={()=>{document.getElementById('CoarseFragementsInfo').style.display='block'}} />
                                    <div id="CoarseFragementsInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', right: '-50px', zIndex: '1' }}>
                                        <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('CoarseFragementsInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                        <div style={{ textAlign: 'left' }}>
                                        Coarse fragments are solid particles in soil larger than 2 mm, including materials like gravel, cobbles, stones, and boulders. They are described based on their size, shape, abundance, and type (e.g., rounded gravel or angular stones). Coarse fragments affect soil properties like water retention, drainage, and root penetration. 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="table-cell" style={{ textAlign: 'left' }}>
                            <div className="flex flex-row">
                                <div className="p-0 m-0">Mottle Abundance</div>
                                <div className="p-0 m-0">
                                    <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', marginTop: '40%' }} onClick={()=>{document.getElementById('MottleAbundanceInfo').style.display='block'}} />
                                    <div id="MottleAbundanceInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', right: '-50px', zIndex: '1' }}>
                                        <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('MottleAbundanceInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                        <div style={{ textAlign: 'left' }}>
                                        Mottles are spots of different colors within the dominant soil color, indicating alternating wet and dry conditions. They are described by their abundance, size, contrast, boundary, and color, with additional details like shape or position noted if relevant. 
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="table-cell" style={{ textAlign: 'left' }}>
                            <div className="flex flex-row">
                                <div className="p-0 m-0">WRB Name</div>
                                <div className="p-0 m-0">
                                    <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', marginTop: '40%' }} onClick={()=>{document.getElementById('WRBInfo').style.display='block'}} />
                                    <div id="WRBInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', right: '-50px', zIndex: '1' }}>
                                        <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('WRBInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                        <div style={{ textAlign: 'left', width: '200px' }}>
                                            CODE&emsp;Value<br/>
                                            AC&emsp;Acrisols<br/>
                                            AL&emsp;Alisols<br/>
                                            AN&emsp;Andosols<br/>
                                            AR&emsp;Arenosols<br/>
                                            AT&emsp;Anthrosols<br/>
                                            CH&emsp;Chernozems<br/>
                                            CL&emsp;Calcisols<br/>
                                            CM&emsp;Cambisols<br/>
                                            CR&emsp;Cryosols<br/>
                                            FL&emsp;Fluvisols<br/>
                                            FR&emsp;Ferralsols<br/>
                                            GG&emsp;Glaciers<br/>
                                            GL&emsp;Gleysols<br/>
                                            GY&emsp;Gypsisols<br/>
                                            HS&emsp;Histosols<br/>
                                            IS&emsp;Islands<br/>
                                            KS&emsp;Kastanozems<br/>
                                            LP&emsp;Leptosols<br/>
                                            LV&emsp;Luvisols<br/>
                                            LX&emsp;Lixisols<br/>
                                            ND&emsp;No Data<br/>
                                            NT&emsp;Nitisols<br/>
                                            PH&emsp;Phaeozems<br/>
                                            PL&emsp;Planosols<br/>
                                            PT&emsp;Plinthosols<br/>
                                            PZ&emsp;Podzols<br/>
                                            RG&emsp;Regosols<br/>
                                            RT&emsp;Retisols<br/>
                                            SC&emsp;Solonchaks<br/>
                                            SN&emsp;Solonetz<br/>
                                            ST&emsp;Stagnosols<br/>
                                            TC&emsp;Technosols<br/>
                                            UM&emsp;Umbrisols<br/>
                                            VR&emsp;Vertisols<br/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="table-cell" style={{ textAlign: 'left' }}>
                            <div className="flex flex-row">
                                <div className="p-0 m-0">Share at Location</div>
                                <div className="p-0 m-0">
                                    <img src="images/i.png" alt="Info Icon" style={{ height: '20px', cursor: 'pointer', marginTop: '40%' }} onClick={()=>{document.getElementById('ShareInfo').style.display='block'}} />
                                    <div id="ShareInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px', right: '-50px', zIndex: '1' }}>
                                        <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('ShareInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                        <div style={{ textAlign: 'left' }}>
                                            Share at location refers to the percentage of soil present within the soil mapping unit at the selected location.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/*<div className="table-cell" style={{ textAlign: 'center' }}>
                            <i className="pi pi-info-circle mr-1" style={{ height: '10px', cursor: 'pointer' }} onClick={()=>{document.getElementById('AreaShareInfo').style.display='block'}} />
                            <div id="AreaShareInfo" style={{ display: 'none', position: 'absolute', color: '#555', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#ffeecc', padding: '5px' }}>
                                <div><i className="pi pi-times-circle p-0 m-1 cursor-pointer" onClick={()=>{document.getElementById('AreaShareInfo').style.display='none'}} style={{ color: '#999', float: 'right' }}></i></div>
                                <div style={{ textAlign: 'left' }}>
                                Share in the area refers to the percentage of soil present within a 10 km circular buffer.
                                </div>
                            </div>
                            Share in the <br/>Area
                        </div>*/}
                    </div>

                    {soilSummary?.map((data, index) => {
                        const wrbData = getWRBData(data.WRB2);
                        
                        if (data.isCentre) {
                            currentBackgroundColor = "#7ed578";
                        } else if (data.HWSD2_SMU_ID !== lastSMU) {
                            currentBackgroundColor = currentBackgroundColor === "#fff" ? "#fff" : "#fff";
                            lastSMU = data.HWSD2_SMU_ID;
                        }

                        return (
                            <div
                                className="table-row"
                                key={`${data.ID}-${index}`}
                                style={{ backgroundColor: currentBackgroundColor }}
                            >
                                <div className="table-cell" style={{ textAlign: 'center' }}>
                                    <RadioButton
                                        name="soil"
                                        value={data.ID}
                                        onChange={(e: RadioButtonChangeEvent) => {
                                            setSoil(e.value);
                                            setSoilCode(data.WRB2?.toUpperCase());
                                            setCropLayerVisible(true);
                                            setSoilName(wrbData.name);
                                        }}
                                        checked={soil === data.ID}
                                        disabled={(!texture_lookup[data.TEXTURE_USDA] || wrbData.name === "N/A")}
                                    />
                                </div>
                                <div className="table-cell">{texture_lookup[data.TEXTURE_USDA] || "N/A"}</div>
                                <div className="table-cell">{drainage_lookup[data.DRAINAGE] || "N/A"}</div>
                                <div className="table-cell">{wrbData.color}</div>
                                {/*<div className="table-cell">{getCoarseCategory(data.COARSE)}</div>*/}
                                <div className="table-cell">{data.minCoarse === data.maxCoarse?data.minCoarse:data.minCoarse+" - "+data.maxCoarse}</div>
                                <div className="table-cell">{wrbData.mottle}</div>
                                <div className="table-cell">{wrbData.name}</div>
                                <div className="table-cell">{data.SHARE.toFixed(2) || "N/A"}%</div>
                                {/*<div className="table-cell">
                                    {data.isCentre ? "Soil at Location" : `${data.Percentage}%`}
                                </div>*/}
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};