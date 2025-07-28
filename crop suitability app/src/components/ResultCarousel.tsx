
import React, { useState, useEffect } from 'react';
import SyncLoader from "react-spinners/SyncLoader";
import { Carousel, CarouselResponsiveOption } from 'primereact/carousel';
import { nFormat } from '../App';

interface Product {
    id: string;
    code: string;
    name: string;
    sci_name: string;    
    image: string;
    suitability: string;
    suitabilityIndex: string;
    attainableYield: string;
}

export const ResultCarousel = (props)=> {    
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
                name: crop['cropName'],
                sci_name: crops[crop['cropName']]['scientificName'],
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

    const productTemplate = (product: Product) => {
        return (
            <div className="border-1 p-1 surface-border border-round text-center m-1 flex flex-column align-items-center" style={{ minHeight: '200px' }}>  
                <div style={{ color: '#7e5134', fontSize: '9pt', fontWeight: 'bold', minHeight: '37px' }}>{product.name} - <i>{product.sci_name}</i></div>
                <div className={"si-"+product.suitability.toLowerCase().replace(" ", "-")} style={{ color: '#7e5134', fontSize: '9pt', fontWeight: 'bold', width: '100%' }}>{product.suitabilityIndex} ({product.suitability})</div>
                <img src={`images/crops/${product.image}`} alt={product.name} className="shadow-2 mb-1" style={{ width: '160px' }} />
            </div>
        );
    };
    
    return (
        <div className="m-0 p-0 flex">
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
            {!allCropDataError &&  (products.length > 0 ?<Carousel value={products} numVisible={3} numScroll={3} itemTemplate={productTemplate} />:<p style={{ color: '#7e5134', fontSize: '11pt' }}>All crops are unsuitable for the selected combination of soil, water supply and input management.</p>)}
        </div>
    );
}