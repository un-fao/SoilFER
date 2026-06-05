import React, { useState, useEffect } from 'react';
import { RadioButton } from 'primereact/radiobutton';
import styled from 'styled-components';
import { useAppContext } from '../../store/AppContext';
import { CROPS, OPPORTUNITY_CROPS, BENCHMARK_CROPS, OPPORTUNITY_CROP_NAMES, getCropCategory } from '../../data/crops';
import { theme } from '../../theme/theme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTranslation } from 'react-i18next';

const SubmitButton = styled.button`
  background-color: ${theme.colors.accent}; color: #333; border: none; padding: 10px; width: 100%;
  cursor: pointer; font-weight: bold; border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm}; font-size: ${theme.typography.fontSizeBase};
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const CancelButton = styled.button`
  background-color: ${theme.colors.primaryDark}; color: #fff; border: none; padding: 10px; width: 100%;
  cursor: pointer; font-weight: bold; border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm}; font-size: ${theme.typography.fontSizeBase};
`;

const TAB_BASE: React.CSSProperties = {
  flex: 1, padding: '6px 10px', border: 'none', cursor: 'pointer',
  fontWeight: 'bold', fontSize: '10pt', letterSpacing: '0.03em',
  transition: 'background 0.15s, color 0.15s',
};
const TAB_ACTIVE: React.CSSProperties = { ...TAB_BASE, backgroundColor: 'orange', color: '#7e5134' };
const TAB_INACTIVE: React.CSSProperties = { ...TAB_BASE, backgroundColor: '#e8ddd6', color: '#7e5134' };

const CATEGORY_BADGE: React.CSSProperties = {
  display: 'inline-block', fontSize: '8pt', fontWeight: 'bold',
  padding: '1px 6px', borderRadius: '10px', letterSpacing: '0.04em',
  marginLeft: '6px', verticalAlign: 'middle',
};

const CropRow: React.FC<{ cropName: string; sci: string; selected: boolean; onSelect: (name: string) => void }> =
  ({ cropName, sci, selected, onSelect }) => (
    <div
      className="table-row"
      onClick={() => onSelect(cropName)}
      style={{ cursor: 'pointer', backgroundColor: selected ? '#f0e0cc' : undefined }}
    >
      <div className="table-cell" style={{ width: '32px', textAlign: 'center' }}>
        <RadioButton inputId={`crop-${cropName}`} name="crop" value={cropName}
          onChange={() => onSelect(cropName)} checked={selected} />
      </div>
      <div className="table-cell" style={{ fontWeight: selected ? 'bold' : 'normal', color: selected ? '#5a2f00' : undefined }}>
        {cropName} <i>({sci})</i>
      </div>
    </div>
  );

export const CropStep: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { crop } = state;

  const initialTab = crop && !OPPORTUNITY_CROP_NAMES.has(crop) ? 'benchmark' : 'opportunity';
  const [activeTab, setActiveTab] = useState<'opportunity' | 'benchmark'>(initialTab);

  useEffect(() => {
    if (crop && !OPPORTUNITY_CROP_NAMES.has(crop)) setActiveTab('benchmark');
    else if (crop && OPPORTUNITY_CROP_NAMES.has(crop)) setActiveTab('opportunity');
  }, [crop]);

  const handleSelect = (value: string) => {
    const cropCode = CROPS[value]?.SoilFERCode ?? '';
    dispatch({ type: 'SET_CROP', payload: { crop: value, cropCode } });
    dispatch({ type: 'SET_CROP_LAYER_VISIBLE', payload: true });
  };

  const openEcocrop = (id: number) => {
    window.open('https://ecocrop.apps.fao.org/ecocrop/srv/en/cropView?id=' + id);
  };

  const listData = activeTab === 'opportunity' ? OPPORTUNITY_CROPS : BENCHMARK_CROPS;
  const selectedCategory = crop ? getCropCategory(crop) : null;

  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  return (
    <div className="card">
      <span style={{ fontWeight: 'bold' }}>{t('crop.selectTitle')}</span>
      <div className="p-1 m-0 flex" style={{ gap: '12px', alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>

        {/* Tabbed crop list */}
        <div style={{ width: isMobile ? '100%' : '360px', flexShrink: 0 }}>
          <div style={{ display: 'flex', overflow: 'hidden', border: '1px solid #c2b7b5', borderBottom: 'none', borderRadius: '6px 6px 0 0' }}>
            <button style={activeTab === 'opportunity' ? TAB_ACTIVE : TAB_INACTIVE} onClick={() => setActiveTab('opportunity')}>
              {t('crop.opportunityTab')}
            </button>
            <button
              style={{ ...(activeTab === 'benchmark' ? TAB_ACTIVE : TAB_INACTIVE), borderLeft: '1px solid #c2b7b5' }}
              onClick={() => setActiveTab('benchmark')}
            >
              {t('crop.otherTab')}
            </button>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 30px)', border: '1px solid #c2b7b5', borderRadius: '0 0 6px 6px' }}>
            <div className="table" style={{ width: '100%', backgroundColor: '#7e5134' }}>              
              {listData.map(c => (
                <CropRow key={c.name} cropName={c.name} sci={c.sci} selected={crop === c.name} onSelect={handleSelect} />
              ))}
            </div>
          </div>
          {crop && (
            (activeTab === 'benchmark' && OPPORTUNITY_CROP_NAMES.has(crop)) ||
            (activeTab === 'opportunity' && !OPPORTUNITY_CROP_NAMES.has(crop))
          ) && (
            <div style={{ fontSize: '9pt', color: '#e8ddd6', marginTop: '4px', padding: '0 2px' }}>
              {t('crop.selectionInTab', { crop })}{' '}
              <span
                style={{ color: '#c2b7b5', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setActiveTab(OPPORTUNITY_CROP_NAMES.has(crop) ? 'opportunity' : 'benchmark')}
              >
                {OPPORTUNITY_CROP_NAMES.has(crop) ? t('crop.opportunityTabName') : t('crop.otherTabName')} {t('crop.tabSuffix')}
              </span>
            </div>
          )}
        </div>

        {/* Crop detail panel */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {crop !== '' ? (
            <div style={{ border: '1px solid #c2b7b5', borderRadius: '8px', backgroundColor: '#fefffb', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ margin: 0, padding: 0, color: '#5a2f00', fontSize: theme.typography.fontSizeXl }}>
                  {crop}
                  {selectedCategory==='Opportunity' && 
                  <span style={{
                    ...CATEGORY_BADGE,
                    backgroundColor: selectedCategory === 'Opportunity' ? '#f8d394' : '#d4e8d0',
                    color: selectedCategory === 'Opportunity' ? '#7e5134' : '#2d6a4f',
                    fontSize: theme.typography.fontSizeMd
                  }}>
                    {selectedCategory}
                  </span>}
                </h2>
                <div style={{ fontSize: theme.typography.fontSizeSm, color: '#8a7060', fontStyle: 'italic', marginTop: '4px' }}>
                  ({CROPS[crop]?.scientificName})
                </div>
              </div>
              <img
                src={`${process.env.PUBLIC_URL}/images/crops/${CROPS[crop]?.ecocropID}.jpg`}
                alt={crop}
                style={{ objectFit: 'contain', maxWidth: '30vw', maxHeight: '315px', borderRadius: '6px' }}
              />
              <CancelButton onClick={() => openEcocrop(CROPS[crop]?.ecocropID)} style={{ width: '90%', textAlign: 'center', fontSize: theme.typography.fontSizeLg }}>
                {t('crop.ecocropInfo')}
              </CancelButton>
              <SubmitButton
                onClick={() => dispatch({ type: 'SET_ACTIVE_PANEL', payload: 'Irrigation & Farm Management' })}
                disabled={crop === ''}
                style={{ width: '90%', fontSize: theme.typography.fontSizeMd }}
              >
                {t('crop.continue')}
              </SubmitButton>
              <div style={{ fontSize: '9pt', color: '#aaa', textAlign: 'center' }}>
                {t('crop.changeHint')}
              </div>
            </div>
          ) : (
            <div style={{ border: '1px dashed #c2b7b5', borderRadius: '8px', backgroundColor: '#faf7f4', padding: '24px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#b0a090', fontSize: '10pt', gap: '8px', minHeight: '160px' }}>
              <span style={{ fontSize: '50px' }}>🌾</span>
              <span><b>{t('crop.emptyHint')}</b></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
