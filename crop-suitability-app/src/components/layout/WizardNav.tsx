import React from 'react';
import styled from 'styled-components';
import { useAppContext } from '../../store/AppContext';
import { ActivePanel } from '../../store/AppContext';
import { theme } from '../../theme/theme';
import { mq } from '../../theme/mediaQuery';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';

const NavPanel = styled.div`
  display: flex;
  padding: 5px 10px;
  width: fit-content;
  min-width: 0;
  max-width: 700px;
  margin: 0;

  ${mq.tablet} {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    justify-content: space-around;
    background: rgba(200, 174, 141, 0.97);
    border-top: 2px solid ${theme.colors.primaryDark};
    border-radius: 0;
    white-space: nowrap;
    padding: 4px 8px;
    z-index: ${theme.zIndex.nav + 1};
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const NavButton = styled.button<{ $active: boolean; $done: boolean }>`
  background-color: ${(p) => p.$active ? '#fbb615' : p.$done ? '#c8ae8d' : 'rgb(235, 235, 235)'};
  color: ${(p) => (p.$active || p.$done ? '#6e431d' : '#6e431d')};
  font-weight: bold;
  border: 1px solid #6e431d;
  padding: 0;
  margin: 0 3px;
  border-radius: ${theme.borderRadius.sm};
  cursor: ${(p) => (p.disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  font-size: ${theme.typography.fontSizeSm};
  box-shadow: ${theme.shadows.button};
  filter: ${(p) => (p.disabled ? 'grayscale(1) contrast(0.5)' : 'none')};
  &:hover:not(:disabled) { background-color: orange; color: #fff; }
`;

const TechnicalDocumentationLink = styled.a`
  background-color: #444;
  color: #fff;
  padding: 6px;
  font-weight: bold;
  border: 1px solid #444;
  margin: 0 3px;
  border-radius: ${theme.borderRadius.sm};
  transition: all 0.3s ease;
  font-size: ${theme.typography.fontSizeSm};
  box-shadow: ${theme.shadows.button};
  text-decoration: none;
  transition: all 0.3s ease;
  white-space: nowrap;
  &:hover:not(:disabled) { background-color: #222 }
`;

const TABS: ActivePanel[] = ['Soil', 'Crop', 'Irrigation & Farm Management', 'Results & Report'];

export const WizardNav: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useAppContext();
  const { activePanel, soil, crop, irrigation, input } = state;

  const soilDone    = soil !== '';
  const cropDone    = crop !== '';
  const mgmtDone    = irrigation !== '' && input !== '';
  const allDone     = soilDone && cropDone && mgmtDone;

  // Each tab is enabled when its prerequisite step is complete (or it has no prereq)
  const isEnabled = (tab: ActivePanel): boolean => {
    switch (tab) {
      case 'Soil':                      return true;          // always accessible
      case 'Crop':                      return soilDone;
      case 'Irrigation & Farm Management': return cropDone;
      case 'Results & Report':          return allDone;
      default:                          return false;
    }
  };

  const isDone = (tab: ActivePanel): boolean => {
    switch (tab) {
      case 'Soil':                      return soilDone;
      case 'Crop':                      return cropDone;
      case 'Irrigation & Farm Management': return mgmtDone;
      case 'Results & Report':          return allDone;
      default:                          return false;
    }
  };

  return (
    <>
      <NavPanel>
        <i
          className="pi pi-window-minimize cursor-pointer"
          title={t('nav.hideWizard')}
          onClick={() => dispatch({ type: 'TOGGLE_WIZARD_VISIBLE' })}
          style={{ color: '#fff', fontSize: '14px', padding: '0 6px', alignSelf: 'center' }}
        />        
        {TABS.map((tab) => (
          <NavButton
            key={tab}
            $active={activePanel === tab}
            $done={isDone(tab)}
            disabled={!isEnabled(tab)}
            onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: tab })}
          >
            <img src={`${process.env.PUBLIC_URL}/images/${tab}Button.png`} alt={tab as string} style={{ height: '25px', verticalAlign: 'middle' }} />
          </NavButton>
        ))}

        <TechnicalDocumentationLink
          href="https://openknowledge.fao.org/items/3a59c618-8f32-4724-b536-633a9cecd743"
          target="_blank"
          rel="noopener noreferrer"
        >
          Technical Documentation ↗
        </TechnicalDocumentationLink>

        <LanguageSelector />
      </NavPanel>
    </>
  );
};
