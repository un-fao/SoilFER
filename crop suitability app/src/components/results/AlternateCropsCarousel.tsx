import React, { useState, useEffect } from 'react';
import SyncLoader from 'react-spinners/SyncLoader';
import { Carousel } from 'primereact/carousel';
import { nFormat } from '../../data/formatters';
import { CROPS } from '../../data/crops';
import { cropSuitabilityScale } from '../../data/suitabilityScales';
import { theme } from '../../theme/theme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTranslation } from 'react-i18next';

interface Product {
  id: number; code: number; name: string; sci_name: string;
  image: string; suitability: string; suitabilityIndex: string; attainableYield: string;
}

interface Props {
  allCropSuitability: any[];
  allCropDataError: boolean;
  cropCode: string;
}

export const AlternateCropsCarousel: React.FC<Props> = ({ allCropSuitability, allCropDataError, cropCode }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const { isMobile } = useBreakpoint();
  const numVisible = isMobile ? 1 : 3;

  const buildProducts = () => {
    const sorted = [...allCropSuitability].sort((a, b) => a.cropSuitability - b.cropSuitability);
    const filtered = sorted.filter((item) => item.cropSuitability < 8 && item.cropCode !== cropCode);
    return filtered.map((crop) => {
      const scale = cropSuitabilityScale[crop.suitability];
      const suitabilityIndex = scale ? `${scale[2]} < SI < ${scale[3]}` : 'N/A';
      const attainableYield = `${nFormat.format(Math.round(Number(crop.attainableYield))).replace(/,/g, ' ')} kg/ha`;
      return {
        id: CROPS[crop.cropName]?.ecocropID,
        code: CROPS[crop.cropName]?.ecocropID,
        name: crop.cropName,
        sci_name: CROPS[crop.cropName]?.scientificName,
        image: `${crop.cropName}.jpg`,
        suitability: crop.suitability,
        suitabilityIndex,
        attainableYield,
      };
    });
  };

  useEffect(() => { setProducts(buildProducts()); }, [allCropDataError, allCropSuitability]);

  const productTemplate = (product: Product) => (
    <div className="border-1 p-1 surface-border border-round text-center m-1 flex flex-column align-items-center" style={{ minHeight: '200px' }}>
      <div style={{ color: '#7e5134', fontSize: '9pt', fontWeight: 'bold', minHeight: '35px' }}>
        {product.name} <i>({product.sci_name})</i>
      </div>
      <div className={`si-${product.suitability.toLowerCase().replace(/ /g, '-')}`} style={{ color: 'white', fontSize: theme.typography.fontSizeXs, fontWeight: 'bold', width: '100%', padding: '1px' }}>
        {product.suitabilityIndex} ({product.suitability})
      </div>
      <img src={`${process.env.PUBLIC_URL}/images/crops/${product.image}`} alt={product.name} className="shadow-2 mb-1" style={{ width: '160px' }} />
    </div>
  );

  return (
    <div className="m-0 p-0 flex">
      {allCropDataError && (
        <div className="flex w-full flex-column align-items-center justify-content-center p-2 m-2">
          <p style={{ color: '#555', fontSize: '11pt' }}>{t('alternateCrops.loading')}</p>
          <SyncLoader size={5} color="#555" aria-label="Loading Spinner" data-testid="loader" />
        </div>
      )}
      {!allCropDataError && (
        products.length > 0
          ? <Carousel value={products} numVisible={numVisible} numScroll={numVisible} itemTemplate={productTemplate} />
          : <p style={{ color: '#7e5134', fontSize: '11pt' }}>{t('alternateCrops.noSuitable')}</p>
      )}
    </div>
  );
};
