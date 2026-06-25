import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Divider } from 'primereact/divider';
import { useAppContext } from '../../store/AppContext';
import { SoilStep } from '../wizard/SoilStep';
import { CropStep } from '../wizard/CropStep';
import { IrrigationStep } from '../wizard/IrrigationStep';
import { ManagementStep } from '../wizard/ManagementStep';
import { ResultsPanel } from '../results/ResultsPanel';
import { TechnicalDocumentation } from '../docs/TechnicalDocumentation';
import { LocationSearch } from '../location/LocationSearch';
import { theme } from '../../theme/theme';
import { mq } from '../../theme/mediaQuery';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { WizardNav } from './WizardNav';

const PanelHeader = styled.div<{ $minimized: boolean }>`
  ${mq.tablet} {
    ${(p) => !p.$minimized && `
      position: sticky;
      top: 0;
      margin: -15px -15px 0;
      padding: 15px 15px 8px;
      z-index: 1;
    `}
    background-color: ${theme.colors.background.panel};
  }
  ${mq.mobile} {
    ${(p) => !p.$minimized && `
      margin: -8px -8px 0;
      padding: 8px 8px 6px;
    `}
  }
`;

const WizardNavContainer = styled.div`
      background: #fff;
      padding: 6px 10px;
      border-radius: ${theme.borderRadius.sm};
      margin-bottom: 8px;
      `;

const Panel = styled.div`
  background-color: ${theme.colors.background.panel};
  color: #fff;
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  min-height: 100%;
  ${mq.tablet} {
    border-radius: 0;
    padding: ${theme.spacing.md};
  }
  ${mq.mobile} {
    padding: ${theme.spacing.sm};
  }
`;

const Container = styled.div<{ $minimized: boolean }>`
  position: absolute;
  top: 80px;
  right: 20px;
  max-height: 80vh;
  overflow-y: auto;
  overflow-x: auto;
  width: clamp(800px, 33vw, calc(100vw - 100px));
  z-index: ${theme.zIndex.panel};
  border-radius: ${theme.borderRadius.md};

  ${mq.tablet} {
    position: fixed;
    top: ${(p) => (p.$minimized ? 'auto' : '38vh')};
    bottom: 44px;
    left: 0;
    right: 0;
    width: 100%;
    max-height: ${(p) => (p.$minimized ? '56px' : 'none')};
    overflow: ${(p) => (p.$minimized ? 'hidden' : 'auto')};
    border-radius: 0;
    transition: max-height 0.25s ease;
  }
  ${mq.mobile} {
    overflow-x: hidden;
  }
`;

const ICONS: Record<string, string> = {
  'Location': 'LocationIconYellow',
  'Soil': 'SoilIcon',
  'Crop': 'CropIcon',
  'Irrigation & Farm Management': 'IrrigationIcon',
  'Results & Report': 'ResultsIcon',
  'Technical Documentation': 'ResultsIcon',
};

const PANEL_TITLE_KEYS: Record<string, string> = {
  'Location': 'nav.panels.location',
  'Soil': 'nav.panels.soil',
  'Crop': 'nav.panels.crop',
  'Irrigation & Farm Management': 'nav.panels.irrigation',
  'Results & Report': 'nav.panels.results',
  'Technical Documentation': 'nav.panels.docs',
};

export const WizardPanel: React.FC = () => {
  const { t } = useTranslation();
  const { state } = useAppContext();
  const { activePanel, crop, wizardExpandCount } = state;
  const [minimized, setMinimized] = useState(false);
  const { isTablet, isMobile } = useBreakpoint();
  const isFirstMount = useRef(true);
  const prevActivePanel = useRef(activePanel);

  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    if (isTablet || isMobile) setMinimized(true);
  }, [isTablet, isMobile]);

  useEffect(() => {
    if (prevActivePanel.current !== activePanel) {
      prevActivePanel.current = activePanel;
      setMinimized(false);
    }
  }, [activePanel]);

  useEffect(() => {
    if (wizardExpandCount > 0) setMinimized(false);
  }, [wizardExpandCount]);

  if (!activePanel) return null;

  const icon = ICONS[activePanel as string];
  const title = activePanel === 'Results & Report'
    ? `${crop.toUpperCase()} ${t('nav.panels.results')}`
    : t(PANEL_TITLE_KEYS[activePanel as string] || 'nav.panels.location');

  return (
    <Container $minimized={minimized}>
      <Panel>
        <WizardNavContainer>
          { activePanel !== 'Location' && <WizardNav /> }
        </WizardNavContainer>
        <PanelHeader $minimized={minimized}>
          <h2 className="p-0 m-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'clamp(10pt, 2vw, 18pt)', display: 'inline-flex', alignItems: 'center', color: '#ffba00' }}>
              <img src={`${process.env.PUBLIC_URL}/images/${icon}.png`} alt={activePanel as string} style={{ height: '20px', marginRight: '10px' }} />
              {title}
            </span>
            <button
              onClick={() => setMinimized(m => !m)}
              title={minimized ? t('wizard.expand') : t('wizard.minimise')}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '4px',
                color: '#fff', cursor: 'pointer', fontSize: '18px', lineHeight: 1,
                padding: '2px 10px', marginLeft: '12px', flexShrink: 0,
              }}
            >
              {minimized ? '+' : '−'}
            </button>
          </h2>
        </PanelHeader>
        {!minimized && (
          <>
            <Divider />
            {activePanel === 'Location' && <LocationSearch />}
            {activePanel === 'Soil' && <SoilStep />}
            {activePanel === 'Crop' && <CropStep />}
            {activePanel === 'Irrigation & Farm Management' && (
              <>
                <IrrigationStep />
                <Divider />
                <ManagementStep />
              </>
            )}
            {activePanel === 'Results & Report' && <ResultsPanel />}
            {activePanel === 'Technical Documentation' && <TechnicalDocumentation />}
          </>
        )}
      </Panel>
    </Container>
  );
};