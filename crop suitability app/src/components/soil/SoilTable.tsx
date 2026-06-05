import React, { useState, useEffect } from 'react';
import { RadioButton, RadioButtonChangeEvent } from 'primereact/radiobutton';
import Papa from 'papaparse';
import SyncLoader from 'react-spinners/SyncLoader';
import { InfoTooltip } from '../shared/InfoTooltip';
import { theme } from '../../theme/theme';
import { useTranslation } from 'react-i18next';

interface CSVRowType {
  ID?: number; HWSD2_SMU_ID?: number; SHARE?: number; WRB2?: string;
  ROOT_DEPTH?: number; DRAINAGE?: string; COARSE?: number;
  SAND?: number; SILT?: number; CLAY?: number; TEXTURE_USDA?: number;
}
interface EnrichedDataType extends CSVRowType {
  Percentage?: number; isCentre: boolean; backgroundColor?: string;
}

export const SoilTable = (props: any) => {
  const { t } = useTranslation();
  const { soil, onSoilSelect, HWSDStatistics, setCropLayerVisible, soilSummary, setSoilSummary, texture_lookup, drainage_lookup, WRB_lookup } = props;
  const [enrichedData, setEnrichedData] = useState<EnrichedDataType[]>([]);

  const getWRBData = (wrb: string | undefined) => {
    if (!wrb) return { color: 'N/A', name: 'N/A', mottle: 'N/A' };
    return WRB_lookup[wrb.toUpperCase()] || { color: 'N/A', name: 'N/A', mottle: 'N/A' };
  };

  const getCoarseCategory = (coarse: number | undefined) => {
    if (coarse === undefined) return 'N/A';
    if (coarse <= 15) return 'None';
    if (coarse <= 30) return 'Low';
    if (coarse <= 60) return 'Moderate';
    return 'High';
  };

  const fetchSoilCSV = async (id: string | number): Promise<CSVRowType[]> => {
    try {
      const url = `https://data.apps.fao.org/soilfer/cropsuit/clip/clip?action=csv&soil_id=${id}`;
      const response = await fetch(url);
      const csvText = await response.text();
      return new Promise((resolve) => {
        Papa.parse(csvText, {
          header: true, skipEmptyLines: true,
          complete: (result) => resolve(result.data as CSVRowType[]),
          error: () => resolve([]),
        });
      });
    } catch { return []; }
  };

  const enrichData = async () => {
    setEnrichedData([]);
    if (!HWSDStatistics) return;
    const { centre, classes } = HWSDStatistics;
    const centreMatches = await fetchSoilCSV(centre.ID);
    const enrichedCentre = centreMatches.map((match) => ({ ...centre, ...match, isCentre: true }));
    const classMatches = await Promise.all(
      classes.map(async (clss: any) => {
        const matches = await fetchSoilCSV(clss.ID);
        return matches.map((match) => ({ ...clss, ...match, isCentre: false }));
      })
    );
    setEnrichedData([...enrichedCentre, ...classMatches.flat()]);
  };

  const summarizeTable = (data: EnrichedDataType[]) => {
    const classData = data.filter((d) => !d.isCentre);
    let SoilID = 1;
    const grouped = classData.reduce((acc, curr) => {
      const wrb = (curr.WRB2 || '').toUpperCase() || 'Unknown';
      const texture = curr.TEXTURE_USDA || 'Unknown';
      const drainage = curr.DRAINAGE || 'Unknown';
      const key = `${wrb}|${texture}|${drainage}`;
      const share = curr.SHARE || 0;
      const percentage = (curr as any).Percentage || 0;
      const coarse = Number(curr.COARSE) || 0;
      SoilID += 1;
      if (!acc[key]) {
        acc[key] = { ID: SoilID, HWSD2_SMU_ID: SoilID, WRB2: wrb, TEXTURE_USDA: texture, DRAINAGE: drainage, SHARE: 0, minCoarse: coarse, maxCoarse: coarse, totalCoarse: 0, rowCount: 0, isCentre: false, rows: [] };
      }
      acc[key].SHARE += share * percentage / 100;
      acc[key].totalCoarse += coarse;
      if (acc[key].minCoarse >= coarse) acc[key].minCoarse = coarse;
      if (acc[key].maxCoarse <= coarse) acc[key].maxCoarse = coarse;
      acc[key].rowCount += 1;
      acc[key].ID = SoilID;
      acc[key].HWSD2_SMU_ID = SoilID;
      acc[key].rows.push(curr);
      return acc;
    }, {} as any);
    return Object.values(grouped).sort((a: any, b: any) => b.SHARE - a.SHARE);
  };

  useEffect(() => { enrichData(); }, [HWSDStatistics]);

  useEffect(() => {
    if (enrichedData.length > 0) {
      const summary = summarizeTable(enrichedData);
      const enrichedWithDetails = summary.map((data: any) => ({
        ...data,
        COLOUR: getWRBData(data.WRB2).color,
        TEXTURE: data.TEXTURE_USDA ? texture_lookup[data.TEXTURE_USDA] || 'Unknown' : 'Unknown',
        DRAINAGE_CLASS: data.DRAINAGE ? drainage_lookup[data.DRAINAGE] || 'Unknown' : 'Unknown',
        COARSE_FRAGMENTS: getCoarseCategory(data.minCoarse) + ' - ' + getCoarseCategory(data.maxCoarse),
        minCoarse: getCoarseCategory(data.minCoarse),
        maxCoarse: getCoarseCategory(data.maxCoarse),
      }));
      setSoilSummary(enrichedWithDetails);
    }
  }, [enrichedData]);


  return (
    <>
      {(!soilSummary || soilSummary.length < 1) && (
        <div className="flex w-full flex-column align-items-center justify-content-center">
          <p>{t('soil.table.loading')}</p>
          <SyncLoader size={5} color="white" aria-label="Loading Spinner" data-testid="loader" />
        </div>
      )}
      {soilSummary?.length > 0 && (
        <div style={{ overflowX: 'auto', width: '100%' }}>
        <div className="table">
          <div className="table-header">
            <div className="table-cell" style={{ textAlign: 'center' }}>{t('soil.table.select')}</div>
            <div className="table-cell"><InfoTooltip label={t('soil.table.texture')} content={t('soil.table.textureTooltip')} /></div>
            <div className="table-cell"><InfoTooltip label={t('soil.table.drainage')} content={t('soil.table.drainageTooltip')} /></div>
            <div className="table-cell"><InfoTooltip label={t('soil.table.colour')} content={t('soil.table.colourTooltip')} /></div>
            <div className="table-cell"><InfoTooltip label={t('soil.table.coarse')} content={t('soil.table.coarseTooltip')} /></div>
            <div className="table-cell"><InfoTooltip label={t('soil.table.mottle')} content={t('soil.table.mottleTooltip')} /></div>
            <div className="table-cell"><InfoTooltip label={t('soil.table.wrb')} content={t('soil.table.wrbTooltip')} align="right" /></div>
            <div className="table-cell"><InfoTooltip label={t('soil.table.share')} content={t('soil.table.shareTooltip')} align="right" /></div>
          </div>
          {soilSummary.map((data: any, index: number) => {
            const wrbData = getWRBData(data.WRB2);
            return (
              <div className="table-row" key={`${data.ID}-${index}`} style={{ backgroundColor: '#fff', fontSize: theme.typography.fontSizeSm }}>
                <div className="table-cell" style={{ textAlign: 'center' }}>
                  <RadioButton name="soil" value={data.ID}
                    onChange={() => {
                      onSoilSelect(data.ID, data.WRB2?.toUpperCase() ?? '', wrbData.name);
                      setCropLayerVisible(true);
                    }}
                    checked={soil === data.ID}
                    disabled={!texture_lookup[data.TEXTURE_USDA] || wrbData.name === 'N/A'}
                  />
                </div>
                <div className="table-cell">{texture_lookup[data.TEXTURE_USDA] || 'N/A'}</div>
                <div className="table-cell">{drainage_lookup[data.DRAINAGE] || 'N/A'}</div>
                <div className="table-cell">{wrbData.color}</div>
                <div className="table-cell">{data.minCoarse === data.maxCoarse ? data.minCoarse : `${data.minCoarse} - ${data.maxCoarse}`}</div>
                <div className="table-cell">{wrbData.mottle}</div>
                <div className="table-cell">{wrbData.name}</div>
                <div className="table-cell">{Number(data.SHARE).toFixed(2)}%</div>
              </div>
            );
          })}
        </div>
        </div>
      )}
    </>
  );
};
