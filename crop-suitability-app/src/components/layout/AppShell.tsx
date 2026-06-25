import React, { useState, useEffect } from 'react';
import { Divider } from 'primereact/divider';
import styled from 'styled-components';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../../store/AppContext';
import { MapView } from './MapView';
import { WizardNav } from './WizardNav';
import { WizardPanel } from './WizardPanel';
import { LocationCard } from '../location/LocationCard';
import { LocationSearch } from '../location/LocationSearch';
import { MiniMap } from '../location/MiniMap';
import { useGeocoding } from '../../hooks/useGeocoding';
import { useGeolocation } from '../../hooks/useGeolocation';
import { theme } from '../../theme/theme';
import { mq } from '../../theme/mediaQuery';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { Header } from '../header/header';

const Shell = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  ${mq.mobile} {
    overflow-x: hidden;
  }
`;

/** Left panel — dark when searching, light when location confirmed */
const LeftPanel = styled.div<{ $confirmed: boolean; $minimized: boolean }>`
  position: absolute;
  left: 55px;
  top: clamp(65px, 15vh, 195px);
  width: clamp(200px, 22vw, 350px);
  max-height: ${(p) => p.$minimized ? '52px' : p.$confirmed ? '80vh' : 'calc(100vh - 30px)'};
  overflow: hidden;
  z-index: ${theme.zIndex.panel};
  background-color: ${(p) => (p.$confirmed ? '#fefffb' : theme.colors.background.panel)};
  color: ${(p) => (p.$confirmed ? theme.colors.primary : '#fff')};
  border-radius: ${theme.borderRadius.md};
  border: 2px solid ${theme.colors.primary};
  padding: ${theme.spacing.md};
  box-shadow: 3px 5px 8px rgba(0, 0, 0, 0.3);
  transition: max-height 0.3s ease;

  ${mq.tablet} {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    width: 100%;
    max-height: ${(p) => p.$minimized ? '52px' : '38vh'};
    border-radius: 0 0 16px 16px;
    border-left: none;
    border-right: none;
    border-top: none;
    overflow-y: auto;
  }
`;

const MobileLogo = styled.div<{ $minimized: boolean }>`
  display: none;
  ${mq.tablet} {
    display: ${(p) => (p.$minimized ? 'none' : 'flex')};
    align-items: center;
    justify-content: center;
    padding-bottom: 8px;
  }
`;

const PanelTitle = styled.div<{ $confirmed: boolean; $minimized: boolean }>`
  color: ${(p) => (p.$confirmed ? theme.colors.primary : theme.colors.accent)};
  font-weight: ${(p) => (p.$confirmed ? 'normal' : 'bold')};
  font-size: clamp(9pt, 1.2vw, 11pt);
  letter-spacing: ${(p) => (p.$confirmed ? 'normal' : '0.05em')};
  margin-bottom: 8px;
  ${mq.tablet} {
    ${(p) => !p.$minimized && `
      position: sticky;
      top: 0;
      margin: -15px -15px 0;
      padding: 15px 15px 8px;
      z-index: 1;
    `}
    background-color: ${(p) => p.$confirmed ? '#fefffb' : theme.colors.background.panel};
  }
`;

const Logo = styled.div`
  position: absolute;
  left: 55px;
  top: 0px;
  z-index: ${theme.zIndex.nav};
  ${mq.tablet} {
    display: none;
  }
`;

const NavContainer = styled.div`
  position: absolute;
  top: 0px;
  right: 120px;
  z-index: ${theme.zIndex.nav};
  display: flex;
  align-items: center;
  gap: 6px;
  ${mq.tablet} {
    position: static;
  }
`;

/** Overlay shown on portrait orientation for tablet/small screens */
const PortraitOverlay = styled.div<{ $dismissed: boolean }>`
  display: none;
  @media (max-width: 1023px) and (orientation: portrait) {
    display: ${p => p.$dismissed ? 'none' : 'flex'};
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: ${theme.colors.background.panel};
    color: #fff;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 20px;
    text-align: center;
    padding: clamp(16px, 5vw, 30px);
  }
`;

/** Click handler rendered inside MiniMap's MapContainer to allow re-picking location */
const MiniMapClickHandler: React.FC = () => {
  const { dispatch } = useAppContext();
  const { fetchGeocodeWithElevation } = useGeocoding();

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const location = await fetchGeocodeWithElevation('', lat, lng);
        dispatch({
          type: 'SET_LOCATION',
          payload: {
            positionnew: new L.LatLng(lat, lng),
            administrativeInfo: location,
            position: [lat, lng],
            zoomLevel: 13,
          },
        });
      } catch {
        // silent — user can re-try on the main map
      }
    },
  });
  return null;
};

export const AppShell: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppContext();
  const { locationConfirmed, activePanel, positionnew, position, zoomLevel, wizardVisible } = state;
  const [locationMinimized, setLocationMinimized] = useState(false);
  const [portraitDismissed, setPortraitDismissed] = useState(false);
  const { isTablet, isMobile } = useBreakpoint();

  useEffect(() => {
    if (isTablet || isMobile) setLocationMinimized(true);
  }, [isTablet, isMobile]);

  useGeolocation();

  const mapPosition: [number, number] = positionnew
    ? [positionnew.lat, positionnew.lng]
    : (position as [number, number]);

  const showWizard = locationConfirmed && activePanel && activePanel !== 'Location';

  return (
    <Shell>
      <Header />
      <PortraitOverlay $dismissed={portraitDismissed}>
        <button
          onClick={() => setPortraitDismissed(true)}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none',
            border: '1px solid rgba(255,255,255,0.5)', borderRadius: '4px',
            color: '#fff', fontSize: '20px', cursor: 'pointer', padding: '2px 10px' }}
        >×</button>
        <i className="pi pi-mobile" style={{ fontSize: '64px', transform: 'rotate(90deg)' }} />
        <p style={{ fontSize: theme.typography.fontSizeLg, fontWeight: 'bold', margin: 0 }}>
          Please rotate your device to landscape for the best experience.
        </p>
      </PortraitOverlay>

      <MapView />

      {/* LEFT: location panel — interchanges between search and confirmed */}
      <LeftPanel $confirmed={locationConfirmed} $minimized={locationMinimized}>        
        <PanelTitle $confirmed={locationConfirmed} $minimized={locationMinimized}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {locationConfirmed ? (
              <>                
         
                <b><i className="pi pi-map-marker" /> {t('wizard.selectedLocation')}</b>
              </>
            ) : (
              <>
                <MobileLogo $minimized={false}>
                  <img
                    src={`${process.env.PUBLIC_URL}/SoilFERlogoBk.jpg`}
                    alt="SoilFER App"
                    style={{ height: '28px', padding: 0, margin: 0 }}
                  />
                </MobileLogo>
                <span
                  style={{
                    fontSize: 'clamp(10pt, 2vw, 18pt)',
                    color: '#ffba00',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <img src={`${process.env.PUBLIC_URL}/images/LocationIconYellow.png`} alt="Location Icon" style={{ height: '20px', marginRight: '5px' }} />
                  LOCATION
                </span>                
                <LanguageSelector />
              </>
            )}
            <button
              onClick={() => setLocationMinimized((m) => !m)}
              title={locationMinimized ? t('wizard.expand') : t('wizard.minimise')}
              style={{
                background: 'none',
                border: `1px solid ${locationConfirmed ? theme.colors.primary : 'rgba(255,255,255,0.4)'}`,
                borderRadius: '4px',
                color: locationConfirmed ? theme.colors.primary : '#fff',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: '2px 10px',
                marginLeft: '12px',
                flexShrink: 0,
              }}
            >
              {locationMinimized ? '+' : '−'}
            </button>
          </div>
          {!locationConfirmed && !locationMinimized && <Divider />}
        </PanelTitle>

        {!locationMinimized && (!locationConfirmed ? (
          <LocationSearch />
        ) : (
          <>
            <MiniMap
              position={mapPosition}
              MapClickHandler={MiniMapClickHandler}
            />
            <LocationCard />
          </>
        ))}
      </LeftPanel>

      {/* RIGHT: logo always, nav + wizard only after location confirmed */}
      {/* <Logo>
        <img
          src={`${process.env.PUBLIC_URL}/SoilFERlogo.png`}
          alt="SoilFER App"
          style={{ height: 'clamp(40px, 8vh, 80px)' }}
        />
      </Logo> */}

      {showWizard && wizardVisible && (
        <NavContainer>
          <WizardNav />
        </NavContainer>
      )}

      {showWizard && wizardVisible && <WizardPanel />}

      {showWizard && !wizardVisible && (
        <div style={{ position: 'absolute', top: 'clamp(10px, 3.75vh, 10px)', right: '20px', zIndex: theme.zIndex.nav }}>
          <i
            className="pi pi-window-maximize cursor-pointer"
            title={t('nav.showWizard')}
            onClick={() => dispatch({ type: 'TOGGLE_WIZARD_VISIBLE' })}
            style={{ color: '#6e431d', fontSize: '20px', background: 'rgba(200,174,141,0.9)', borderRadius: '4px', padding: '6px' }}
          />
        </div>
      )}
    </Shell>
  );
};
