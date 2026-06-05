export interface GeocodedLocation {
  lat: number;
  lng: number;
  elevation: number | number[];
  address: {
    suburb?: string;
    village?: string;
    town?: string;
    city?: string;
    region?: string;
    state?: string;
    country?: string;
    [key: string]: string | undefined;
  };
}

export const useGeocoding = () => {
  const fetchGeocodeWithElevation = async (
    place: string,
    lat?: number,
    lng?: number
  ): Promise<GeocodedLocation> => {
    try {
      let latLng = { lat, lng };
      let address = null;

      if (place) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(place)}&format=json&addressdetails=1`
        );
        const data = await response.json();
        if (data.length === 0) throw new Error('Location not found.');
        const { lat: rLat, lon, address: addr } = data[0];
        latLng = { lat: parseFloat(rLat), lng: parseFloat(lon) };
        address = addr;
      } else if (lat !== undefined && lng !== undefined) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
        );
        const data = await response.json();
        if (!data.address) throw new Error('Location details not found for given coordinates.');
        address = data.address;
      }

      let elevation: number | number[] = null;
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/elevation?latitude=${latLng.lat}&longitude=${latLng.lng}`
        );
        const d = await res.json();
        if (d.elevation !== undefined) elevation = d.elevation;
        else throw new Error('Open-Meteo elevation not found.');
      } catch {
        console.warn('Open-Meteo failed. Trying Open-Elevation fallback.');
        const res = await fetch(
          `https://api.open-elevation.com/api/v1/lookup?locations=${latLng.lat},${latLng.lng}`
        );
        const d = await res.json();
        if (d.results?.length > 0) elevation = d.results[0].elevation;
        else throw new Error('Elevation data not found.');
      }

      return { lat: latLng.lat, lng: latLng.lng, elevation, address };
    } catch (error) {
      throw new Error(
        `Failed to fetch geocode and elevation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return { fetchGeocodeWithElevation };
};
