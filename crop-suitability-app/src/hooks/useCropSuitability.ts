import { useState, useEffect } from 'react';
import { CROPS } from '../data/crops';
import { cropSuitabilityScale, attainableYieldScale, getSuitabilityLevel } from '../data/suitabilityScales';
import { useAppContext } from '../store/AppContext';

export interface GeneralSuitability {
  crop: string | null;
  average: string | null;
  mode: string | null;
  yieldAttainable: string | null;
  yieldRelative: string | null;
}

export interface CropSuitabilityResult {
  cropCode: string;
  cropName: string;
  cropSuitability: number;
  averageSuitability: number;
  modeSuitability: number;
  attainableYield: number;
  relativeYield: number;
  suitability: string | null;
  average: string | null;
  mode: string | null;
  yieldAttainable: string | null;
  yieldRelative: string | null;
}

export const useCropSuitability = () => {
  const { state } = useAppContext();
  const { positionnew, bufferRadius, soilCode, cropCode, waterCode, inputCode } = state;
  const crops = CROPS;
  const [cropSuitability, setCropSuitability] = useState<number | null>(null);
  const [averageSuitability, setAverageSuitability] = useState<number | null>(null);
  const [modeSuitability, setModeSuitability] = useState<number | null>(null);
  const [attainableYield, setAttainableYield] = useState<number | null>(null);
  const [relativeYield, setRelativeYield] = useState<number | null>(null);
  const [dataError, setDataError] = useState<boolean>(true);
  const [allCropDataError, setAllCropDataError] = useState<boolean>(true);
  const [generalSuitability, setGeneralSuitability] = useState<GeneralSuitability>({
    crop: null, average: null, mode: null, yieldAttainable: null, yieldRelative: null,
  });
  const [allCropSuitability, setAllCropSuitability] = useState<CropSuitabilityResult[]>([]);

  const buildURL = (code: string, type: 'SIS' | 'YLS') =>
    `https://storage.googleapis.com/fao-gismgr-soilfer-data/DATA/SOILFER/MAPSET/${type}/SOILFER.${type}.${code}.${soilCode}S.${inputCode + waterCode}.tif`;

  const clipURL = (url1: string, url2: string) =>
    `https://data.apps.fao.org/soilfer/cropsuit/clip/clip?action=cliptiff&url=${encodeURIComponent(url1)}&url=${encodeURIComponent(url2)}&latitude=${positionnew.lat}&longitude=${positionnew.lng}&buffer=${bufferRadius / 1000}`;

  const fetchOneCrop = async (cropName: string, code: string): Promise<CropSuitabilityResult> => {
    try {
      const url = clipURL(buildURL(code, 'SIS'), buildURL(code, 'YLS'));
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const s = await res.json();

      let si = s.tiff0.pixel_value !== 'error' ? s.tiff0.pixel_value : null;
      let avg = s.tiff0.buffer_avg !== 'error' ? Number(s.tiff0.buffer_avg.toFixed(0)) : null;
      let mode = s.tiff0.buffer_mode !== 'error' ? s.tiff0.buffer_mode : null;
      let ay = s.tiff1.pixel_value !== 'error' ? s.tiff1.pixel_value : null;
      let ry = ay !== null ? (ay / crops[cropName].maxYield) * 10000 : null;

      if (si === null) { si = 11; avg = 11; mode = 11; ay = 0; ry = 0; }
      if (ay === null) { ay = 0; ry = 0; }

      return {
        cropCode: code, cropName,
        cropSuitability: si, averageSuitability: avg, modeSuitability: mode,
        attainableYield: ay, relativeYield: ry,
        suitability: getSuitabilityLevel(si, cropSuitabilityScale),
        average: getSuitabilityLevel(avg, cropSuitabilityScale),
        mode: getSuitabilityLevel(mode, cropSuitabilityScale),
        yieldAttainable: getSuitabilityLevel(ay, attainableYieldScale),
        yieldRelative: getSuitabilityLevel(ay, attainableYieldScale),
      };
    } catch {
      return {
        cropCode: code, cropName,
        cropSuitability: 11, averageSuitability: 11, modeSuitability: 11,
        attainableYield: 0, relativeYield: 0,
        suitability: getSuitabilityLevel(0, cropSuitabilityScale),
        average: getSuitabilityLevel(0, cropSuitabilityScale),
        mode: getSuitabilityLevel(0, cropSuitabilityScale),
        yieldAttainable: getSuitabilityLevel(0, attainableYieldScale),
        yieldRelative: getSuitabilityLevel(0, attainableYieldScale),
      };
    }
  };

  useEffect(() => {
    if (!soilCode || !cropCode || !waterCode || !inputCode || !positionnew) return;

    const cropName = Object.keys(crops).find(k => crops[k].SoilFERCode === cropCode);

    const fetchMain = async () => {
      try {
        const url = clipURL(buildURL(cropCode, 'SIS'), buildURL(cropCode, 'YLS'));
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const s = await res.json();

        let si = s.tiff0.pixel_value !== 'error' ? s.tiff0.pixel_value : null;
        let avg = s.tiff0.buffer_avg !== 'error' ? Number(s.tiff0.buffer_avg.toFixed(0)) : null;
        let mode = s.tiff0.buffer_mode !== 'error' ? s.tiff0.buffer_mode : null;
        let ay = s.tiff1.pixel_value !== 'error' ? s.tiff1.pixel_value : null;
        let ry = (ay !== null && cropName) ? (ay / crops[cropName].maxYield) * 10000 : null;

        if (si === null) { si = 11; avg = 11; mode = 11; ay = 0; ry = 0; }
        if (ay === null) { ay = 0; ry = 0; }

        setCropSuitability(si);
        setAverageSuitability(avg);
        setModeSuitability(mode);
        setAttainableYield(ay);
        setRelativeYield(ry);
        setDataError(false);
        setGeneralSuitability({
          crop: getSuitabilityLevel(si, cropSuitabilityScale),
          average: getSuitabilityLevel(avg, cropSuitabilityScale),
          mode: getSuitabilityLevel(mode, cropSuitabilityScale),
          yieldAttainable: getSuitabilityLevel(ay, attainableYieldScale),
          yieldRelative: getSuitabilityLevel(ay, attainableYieldScale),
        });
      } catch {
        setDataError(true);
        setCropSuitability(11); setAverageSuitability(11); setModeSuitability(11);
        setAttainableYield(0); setRelativeYield(0);
        setGeneralSuitability({ crop: 'Unknown', average: 'Unknown', mode: 'Unknown', yieldAttainable: 'Unknown', yieldRelative: 'Unknown' });
      }
    };

    const fetchAll = async () => {
      const results = await Promise.all(
        Object.entries(crops).map(([name, info]) => fetchOneCrop(name, info.SoilFERCode))
      );
      setAllCropSuitability(results);
      setAllCropDataError(false);
    };

    fetchMain();
    fetchAll();
  }, [positionnew, bufferRadius, soilCode, cropCode, waterCode, inputCode]);

  return {
    cropSuitability, averageSuitability, modeSuitability, attainableYield, relativeYield,
    dataError, allCropDataError, generalSuitability, allCropSuitability,
  };
};
