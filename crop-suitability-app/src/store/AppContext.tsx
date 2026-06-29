import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import L from 'leaflet';
import { GeocodedLocation } from '../hooks/useGeocoding';
import { HWSDStatistics } from '../hooks/useHWSD';

export type ActivePanel =
  | 'Location' | 'Soil' | 'Crop' | 'Irrigation & Farm Management'
  | 'Results & Report' | 'Technical Documentation' | null;

export interface AppState {
  position: [number, number];
  positionnew: L.LatLng | null;
  administrativeInfo: GeocodedLocation | null;
  zoomLevel: number;
  rerender: any;
  locationConfirmed: boolean;
  HWSDStatistics: HWSDStatistics | null;
  bufferRadius: number;
  activePanel: ActivePanel;
  historicalClimate: boolean;
  details: boolean;
  soil: string;
  soilCode: string;
  soilName: string;
  crop: string;
  cropCode: string;
  irrigation: string;
  waterCode: string;
  input: string;
  inputCode: string;
  cropLayerVisible: boolean;
  wizardVisible: boolean;
  wizardExpandCount: number;
}

const initialState: AppState = {
  position: [1.5, 24.5],
  positionnew: null,
  administrativeInfo: null,
  zoomLevel: 3,
  rerender: null,
  locationConfirmed: false,
  HWSDStatistics: null,
  bufferRadius: 10000,
  activePanel: 'Location',
  historicalClimate: false,
  details: false,
  soil: '',
  soilCode: '',
  soilName: '',
  crop: '',
  cropCode: '',
  irrigation: '',
  waterCode: '',
  input: '',
  inputCode: '',
  cropLayerVisible: false,
  wizardVisible: true,
  wizardExpandCount: 0,
};

type Action =
  | { type: 'SET_LOCATION'; payload: { positionnew: L.LatLng; administrativeInfo: GeocodedLocation; position: [number, number]; zoomLevel?: number } }
  | { type: 'CONFIRM_LOCATION' }
  | { type: 'RESET_LOCATION' }
  | { type: 'SET_HWSD'; payload: HWSDStatistics | null }
  | { type: 'SET_SOIL'; payload: { soil: string; soilCode: string; soilName: string } }
  | { type: 'SET_CROP'; payload: { crop: string; cropCode: string } }
  | { type: 'SET_IRRIGATION'; payload: { irrigation: string; waterCode: string } }
  | { type: 'SET_INPUT'; payload: { input: string; inputCode: string } }
  | { type: 'SET_ACTIVE_PANEL'; payload: ActivePanel }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_RERENDER'; payload: any }
  | { type: 'SET_CROP_LAYER_VISIBLE'; payload: boolean }
  | { type: 'RESET_WIZARD_SELECTIONS' }
  | { type: 'TOGGLE_WIZARD_VISIBLE' }
  | { type: 'MAXIMIZE_WIZARD' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOCATION':
      return {
        ...state,
        positionnew: action.payload.positionnew,
        administrativeInfo: action.payload.administrativeInfo,
        position: action.payload.position,
        zoomLevel: action.payload.zoomLevel ?? state.zoomLevel,
        locationConfirmed: true,
        activePanel: 'Soil',
        HWSDStatistics: null,
        soil: '', soilCode: '', soilName: '', crop: '', cropCode: '', irrigation: '', waterCode: '', input: '', inputCode: '', cropLayerVisible: false
      };
    case 'CONFIRM_LOCATION':
      return { ...state, locationConfirmed: true };
    case 'RESET_LOCATION':
      return {
        ...initialState,
        position: [1.5, 24.5],
        zoomLevel: 4,
        positionnew: null,
      };
    case 'SET_HWSD':
      return { ...state, HWSDStatistics: action.payload };
    case 'SET_SOIL':
      return { ...state, ...action.payload };
    case 'SET_CROP':
      return { ...state, ...action.payload };
    case 'SET_IRRIGATION':
      return { ...state, ...action.payload };
    case 'SET_INPUT':
      return { ...state, ...action.payload };
    case 'SET_ACTIVE_PANEL':
      return { ...state, activePanel: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoomLevel: action.payload };
    case 'SET_RERENDER':
      return { ...state, rerender: action.payload };
    case 'SET_CROP_LAYER_VISIBLE':
      return { ...state, cropLayerVisible: action.payload };
    case 'RESET_WIZARD_SELECTIONS':
      return { ...state, soil: '', soilCode: '', soilName: '', crop: '', cropCode: '', irrigation: '', waterCode: '', input: '', inputCode: '', cropLayerVisible: false };
    case 'TOGGLE_WIZARD_VISIBLE':
      return { ...state, wizardVisible: !state.wizardVisible };
    case 'MAXIMIZE_WIZARD':
      return { ...state, wizardExpandCount: state.wizardExpandCount + 1 };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue>(null!);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);