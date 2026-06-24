
import React, { useState, useEffect } from 'react';
import SyncLoader from "react-spinners/SyncLoader";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { nFormat } from '../App';

interface Product {
    id: string;
    code: string;
    name: string;   
    image: string;
    suitability: string;
    suitabilityIndex: string;
    attainableYield: string;
}

export const ResultTable = (props)=> {
    const {crops, cropSuitablilityScale, allCropSuitability, allCropDataError, cropCode} = props;
    const getAllCropSuitability = ()=> {
        allCropSuitability.sort((a, b) => a.cropSuitability - b.cropSuitability);
        let filteredArray = allCropSuitability.filter(item => item.cropSuitability < 8)
        filteredArray = filteredArray.filter(item => item.cropCode !== cropCode);
        let ProductService = [];
        filteredArray.map((crop)=>{
            let suitabilityIndex = cropSuitablilityScale[crop['suitability']][2]+" < SI < "+cropSuitablilityScale[crop['suitability']][3];
            let attainableYield = nFormat.format(crop['attainableYield'].toFixed(0)).replace(/,/g, " ")+" kg/ha";
            ProductService.push({
                id: crops[crop['cropName']]['ecocropID'],
                code: crops[crop['cropName']]['ecocropID'],
                name: crop['cropName']+" ("+crops[crop['cropName']]['scientificName']+")",
                image: crop['cropName']+'.jpg',
                suitability: crop['suitability'],
                suitabilityIndex: suitabilityIndex,
                attainableYield: attainableYield
            });
        });
        return ProductService;
    }

    const [products, setProducts] = useState<Product[]>([]);    
    useEffect(() => {
        setProducts(getAllCropSuitability());
    }, [allCropDataError]);

    return (
        <div className="card">
            {(allCropDataError && <div className="flex w-full flex-column align-items-center justify-content-center p-2 m-2">
                <p style={{ color: '#555', fontSize: '11pt' }}>Please wait while we retrieve the alternate crop suitability and attainable yield...</p>
                <SyncLoader
                    size={5}
                    color="#555"
                    aria-label="Loading Spinner"
                    data-testid="loader"
                />
            </div>
            )}
            {!allCropDataError && <div className="border-1 p-1 surface-border border-round text-center m-1 align-items-center">
                {
                    products.length > 0 ?<DataTable value={products} size="small" stripedRows sortMode="multiple" removableSort selectionMode="single" tableStyle={{ maxWidth: '900px', fontSize: '11pt' }}>
                        <Column field="name" sortable header="Name"></Column>
                        <Column field="suitability" sortable header="Suitability"></Column>
                        <Column field="suitabilityIndex" sortable header="Index"></Column>                    
                    </DataTable>:<p style={{ color: '#7e5134', fontSize: '11pt' }}>All crops are unsuitable for the selected combination of soil, water supply and input management.</p>
                }
            </div>}
        </div>
    );
}