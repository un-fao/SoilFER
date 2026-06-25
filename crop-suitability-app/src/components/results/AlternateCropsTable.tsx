import React, { useState, useEffect } from 'react';
import SyncLoader from 'react-spinners/SyncLoader';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { nFormat } from '../../data/formatters';
import { CROPS } from '../../data/crops';
import { cropSuitabilityScale } from '../../data/suitabilityScales';
import { theme } from '../../theme/theme';
import { useTranslation } from 'react-i18next';

interface Product {
  id: number; code: number; name: string; image: string;
  suitability: string; suitabilityIndex: string; attainableYield: string;
}

interface Props {
  allCropSuitability: any[];
  allCropDataError: boolean;
  cropCode: string;
}

export const AlternateCropsTable: React.FC<Props> = ({ allCropSuitability, allCropDataError, cropCode }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);

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
        name: `${crop.cropName} (${CROPS[crop.cropName]?.scientificName})`,
        image: `${crop.cropName}.jpg`,
        suitability: crop.suitability,
        suitabilityIndex,
        attainableYield,
      };
    });
  };

  useEffect(() => { setProducts(buildProducts()); }, [allCropDataError]);

  return (
    <div className="card">
      {allCropDataError && (
        <div className="flex w-full flex-column align-items-center justify-content-center p-2 m-2">
          <p>{t('alternateCrops.loading')}</p>
          <SyncLoader size={5} aria-label="Loading Spinner" data-testid="loader" />
        </div>
      )}
      {!allCropDataError && (
        <div className="border-1 p-1 surface-border border-round text-center m-1 align-items-center" style={{ maxWidth: '750px', width: '100%' }}>
          {products.length > 0
            ? <DataTable value={products} size="small" stripedRows sortMode="multiple" removableSort selectionMode="single" style={{ width: '100%' }} tableStyle={{ color: theme.colors.text.onLight }}>
                <Column field="name" sortable header={t('alternateCrops.name')} headerStyle={{ color: theme.colors.text.onLight }}></Column>
                <Column field="suitability" sortable header={t('alternateCrops.suitability')} headerStyle={{ color: theme.colors.text.onLight }}></Column>
                <Column field="suitabilityIndex" sortable header={t('alternateCrops.index')} headerStyle={{ color: theme.colors.text.onLight }}></Column>
              </DataTable>
            : <p>{t('alternateCrops.noSuitable')}</p>
          }
        </div>
      )}
    </div>
  );
};
