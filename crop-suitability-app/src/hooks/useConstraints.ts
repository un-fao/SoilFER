import { useState, useEffect } from 'react';
import { useAppContext } from '../store/AppContext';
import { CROPS } from '../data/crops';

export const useConstraints = () => {
  const { state } = useAppContext();
  const { positionnew, bufferRadius, soilCode, cropCode, waterCode, inputCode } = state;

  const [thermalConstraint, setThermalConstraint]   = useState<number | null>(null);
  const [moistureConstraint, setMoistureConstraint] = useState<number | null>(null);
  const [agroClimaticConstraint, setAgroClimaticConstraint]         = useState<number | null>(null);
  const [constraintsError, setConstraintsError]     = useState<boolean>(true);
  const [isLoading, setIsLoading]                   = useState<boolean>(false);

  const buildURL = (GAEZCode: string, type: '1' | '2' | '3', inputCode: string, waterCode: string ) =>
    `https://storage.googleapis.com/fao-gismgr-gaez-v5-data/DATA/GAEZ-V5/MAPSET/RES02-FC${type}/GAEZ-V5.RES02-FC${type}.HP0120.AGERA5.HIST.${GAEZCode}.${inputCode}${waterCode}LM.tif`;

  useEffect(() => {
    if (!soilCode || !cropCode || !waterCode || !inputCode || !positionnew) return;

    const crops = CROPS;
    const GAEZCode = Object.values(crops).find(c => c.SoilFERCode === cropCode)?.GAEZCode;
    if (!GAEZCode) return;

    setThermalConstraint(null);
    setMoistureConstraint(null);
    setAgroClimaticConstraint(null);
    setIsLoading(true);

    const fetchConstraints = async () => {
      try {
        // URL order: FC1 (thermal) → tiff0, FC2 (moisture) → tiff1, FC3 (soil) → tiff2,
        const params = [buildURL(GAEZCode, '1', inputCode, waterCode.charAt(0)), buildURL(GAEZCode, '2', inputCode, waterCode.charAt(0)), buildURL(GAEZCode, '3', inputCode, waterCode.charAt(0))]
          .map(u => `url=${encodeURIComponent(u)}`).join('&');
        
        const url = `https://data.apps.fao.org/soilfer/cropsuit/clip/clip?action=cliptiff&${params}`
          + `&latitude=${positionnew.lat}&longitude=${positionnew.lng}&buffer=${bufferRadius / 1000}&georef=false`;

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const s = await res.json();

        //  tiff0=FC1 thermal, tiff2=FC2 moisture, tiff2=FC3 soil
        const thermal  = s.tiff0?.pixel_value !== 'error' ? s.tiff0.pixel_value : null;
        const moisture = s.tiff1?.pixel_value !== 'error' ? s.tiff1.pixel_value : null;
        const soil     = s.tiff2?.pixel_value !== 'error' ? s.tiff2.pixel_value : null;

        setAgroClimaticConstraint(soil);
        setThermalConstraint(thermal);
        setMoistureConstraint(moisture);
        setConstraintsError(false);
        setIsLoading(false);
      } catch {
        setThermalConstraint(null);
        setMoistureConstraint(null);
        setAgroClimaticConstraint(null);
        setConstraintsError(true);
        setIsLoading(false);
      }
    };

    fetchConstraints();
  }, [positionnew, bufferRadius, soilCode, cropCode, waterCode, inputCode]);

  return { thermalConstraint, moistureConstraint, agroClimaticConstraint, constraintsError, isLoading };
};
