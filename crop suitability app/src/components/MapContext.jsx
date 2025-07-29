import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, WMSTileLayer, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for missing marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = (props) => {
  const {position,zoomLevel,rerender,setRerender} = props;
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, zoomLevel);
  }, [position,rerender]);

  return position === null ? null : (
    <Marker position={position}>
    </Marker>
  );
};

const MapContext = (props) => {
  const [layers, setLayers] = useState([]);
  const [selectedLayers, setSelectedLayers] = useState([]);
  const { BaseLayer, Overlay } = LayersControl;

  // Fetch WMS layer information
  useEffect(() => {
    async function fetchLayers() {
      try {
        const response = await fetch("https://geoservices.un.org/arcgis/rest/services/ClearMap_webtopo/MapServer?f=json");
        const data = await response.json();
        const availableLayers = data.layers.map(layer => ({ id: layer.id, name: layer.name }));
        setLayers(availableLayers);
      } catch (error) {
        console.error("Failed to fetch layers:", error);
      }
    }

    fetchLayers();
  }, []);

  // Handle layer selection
  const handleLayerChange = (layerId) => {
    setSelectedLayers(prevSelected =>
      prevSelected.includes(layerId)
        ? prevSelected.filter(id => id !== layerId)
        : [...prevSelected, layerId]
    );
  };
  const {zoomLevel, MapClickHandler,rerender,setRerender,positionnew,setPositionNew,administrativeInfo,setAdministrativeInfo} = props;
  const position = [positionnew.lat, positionnew.lng];
  return (
    <div style={{ borderStyle: 'solid',  borderColor: '#7e5134', borderWidth: '1px' }}>
    <MapContainer center={position} zoom={zoomLevel} zoomControl={false} style={{ height: '250px', width: '100%' }}>
        <TileLayer
          url="https://geoservices.un.org/arcgis/rest/services/ClearMap_WebTopo/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; <a href="https://geoportal.un.org/arcgis/home/item.html?id=541557fd0d4d42efb24449be614e6887">UN Clear Map</a>'
        />
      <LocationMarker position={position} zoomLevel={zoomLevel} rerender={rerender} setRerender={setRerender} />
      <MapClickHandler />
    </MapContainer>
    </div>
  );
};

export default MapContext;