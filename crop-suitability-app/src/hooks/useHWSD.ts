import { useAppContext } from '../store/AppContext';
import * as GeoTIFF from 'geotiff';

export interface HWSDStatistics {
  centre: { ID: number };
  classes: Array<{ ID: number; Count: number; Percentage: string }>;
}

export const useHWSD = () => {
  const { dispatch } = useAppContext();

  const fetchHWSDStatistics = async (lat: number, lng: number, radius: number) => {
    dispatch({ type: 'SET_HWSD', payload: null });
    try {
      const url = `https://data.apps.fao.org/soilfer/cropsuit/clip/clip?action=geotiff&latitude=${lat}&longitude=${lng}&buffer_km=${radius / 1000}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      const rasters = await image.readRasters();
      const [originX, originY] = image.getOrigin();
      const [resolutionX] = image.getResolution();

      const centerX = Math.round((lng - originX) / resolutionX);
      const centerY = Math.round((lat - originY) / resolutionX);
      const bufferPixels = Math.round(radius / resolutionX);
      const uniqueValues = new Map<number, number>();
      const centerPointValue = rasters[0][centerY * image.getWidth() + centerX];

      const startY = Math.max(centerY - bufferPixels, 0);
      const endY = Math.min(centerY + bufferPixels, image.getHeight() - 1);
      const startX = Math.max(centerX - bufferPixels, 0);
      const endX = Math.min(centerX + bufferPixels, image.getWidth() - 1);

      for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
          const value = rasters[0][y * image.getWidth() + x];
          uniqueValues.set(value, (uniqueValues.get(value) ?? 0) + 1);
        }
      }

      const totalBufferPixels = Array.from(uniqueValues.values()).reduce((a, b) => a + b, 0);
      const sortedClasses = Array.from(uniqueValues.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({
          ID: value,
          Count: count,
          Percentage: ((count / totalBufferPixels) * 100).toFixed(2),
        }));

      dispatch({ type: 'SET_HWSD', payload: { centre: { ID: centerPointValue as number }, classes: sortedClasses } });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to extract HWSD data: ' + msg);
    }
  };

  return { fetchHWSDStatistics };
};
