import React, { useEffect, useRef, useState } from 'react';
import { Divider } from 'primereact/divider';
import { usePDF } from 'react-to-pdf';
import SyncLoader from 'react-spinners/SyncLoader';
import { useAppContext } from '../../store/AppContext';
import { useCropSuitability } from '../../hooks/useCropSuitability';
import { cropSuitabilityScale } from '../../data/suitabilityScales';
import { nFormat } from '../../data/formatters';
import { SuitabilityGauge } from './SuitabilityGauge';
import { SuitabilityLegend } from './SuitabilityLegend';
import { AlternateCropsCarousel } from './AlternateCropsCarousel';
import { AlternateCropsTable } from './AlternateCropsTable';
import { ClimateDataLoader } from '../climate/ClimateDataLoader';
import { ConstraintsModal, Body, Subtitle, Section, SectionHeading } from './ConstraintsModal';
import { ConstraintSlider } from './ConstraintSlider';
import { InfoTooltip } from '../shared/InfoTooltip';
import { useConstraints } from '../../hooks/useConstraints';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { theme } from '../../theme/theme';

const DownloadLink = styled.a`
  display: block; text-align: center; padding: 10px; width: 100%;
  background-color: ${theme.colors.accent};
  font-weight: bold; border-radius: ${theme.borderRadius.sm};
  text-decoration: none; cursor: pointer;
  font-size: ${theme.typography.fontSizeLg}; color: ${theme.colors.primaryDark};
`;

const ConstraintsButton = styled.button`
  display: inline-block;
  background-color: ${theme.colors.primary};
  color: #fff;
  font-weight: bold;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  padding: 10px 18px;
  font-size: ${theme.typography.fontSizeBase};
  cursor: pointer;
  box-shadow: ${theme.shadows.button};
  &:hover { background-color: ${theme.colors.primaryDark}; }
`;

interface Props {
  publishReport?: boolean;
  onReady?: () => void;
}

export const ResultsPanel: React.FC<Props> = ({ publishReport = false, onReady }) => {
  const { state } = useAppContext();
  const { positionnew, bufferRadius, soilCode, soilName, crop, cropCode, waterCode, inputCode, administrativeInfo, soil, irrigation, input } = state;

  const {
    cropSuitability, averageSuitability, attainableYield,
    dataError, allCropDataError, generalSuitability, allCropSuitability,
  } = useCropSuitability();

  const { thermalConstraint, moistureConstraint, agroClimaticConstraint, isLoading: constraintsLoading } = useConstraints();
  const { t } = useTranslation();
  const { isMobile } = useBreakpoint();

  const { toPDF, targetRef } = usePDF({ filename: 'SoilFER Crop Suitability.pdf' });
  const [showReport, setShowReport] = useState(false);
  const [publishResults, setPublishResults] = useState(publishReport);
  const [resultVisible, setResultVisible] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);

  const year = new Date().getFullYear();

  useEffect(() => {
    if (!dataError) {
      const timer = setTimeout(() => setResultVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setResultVisible(false);
    }
  }, [dataError]);

  useEffect(() => {
    if (!dataError && !allCropDataError && onReady) onReady();
  }, [dataError, allCropDataError]);

  useEffect(() => { if (showReport) setReportReady(false); }, [showReport]);
  useEffect(() => { if (publishReport) toPDF(); }, [publishReport]);

  if (!positionnew) return null;

  const scale = generalSuitability?.crop ? cropSuitabilityScale[generalSuitability.crop] : null;

  return (
    <div style={{ background: '#fff', width: '100%', padding: 0, margin: 0, color: theme.colors.primary }}>
      {dataError && !cropSuitability && !averageSuitability && !attainableYield && (
        <div className="flex w-full flex-column align-items-center justify-content-center p-2 m-2">
          {soilCode && cropCode && inputCode && waterCode
            ? <p style={{ fontSize: theme.typography.fontSizeMd }}>{t('results.loading')}</p>
            : <p style={{ fontSize: theme.typography.fontSizeMd }}>{t('results.selectParams')}</p>
          }
          <SyncLoader size={5} color="#555" aria-label="Loading Spinner" data-testid="loader" />
        </div>
      )}
      {!dataError && (
        <div style={{ margin: '0 auto', border: '1px solid #ddd', padding: '10px', width: '100%' }}>
          {publishResults && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', width: '100%' }}>
                <img
                  src={`${process.env.PUBLIC_URL}/SoilFERlogo.png`}
                  alt="SoilFER App"
                  style={{
                    width: '700px',
                    marginLeft: 'auto'
                  }}
                />                
              </div>
              <Divider />
              {administrativeInfo && (
                <div className="m-0 p-1 flex flex-row justify-content-start" style={{ width: '100%', minWidth: '700px' }}>
                  <div className="m-0 p-1 flex flex-row justify-content-start" style={{ fontSize: theme.typography.fontSizeLg, fontWeight: 'bold', width: '50%', minWidth: '400px' }}>
                    <img
                      src={`${process.env.PUBLIC_URL}/images/ResultsIcon.png`}
                      alt="Results"
                      style={{ height: '50px', marginRight: '10px' }}
                    />

                    <div>
                      {crop.toUpperCase()} SUITABILITY <br />
                      SUMMARY
                    </div>
                  </div>
                  <div className="m-0 p-1 flex flex-row justify-content-start" style={{ width: '50%', minWidth: '300px' }}>
                    <img src={`${process.env.PUBLIC_URL}/images/LocationIconYellow.png`} alt="Location" style={{ height: '35px' }} />
                    <div className="flex flex-column p-1" style={{ width: '90%' }}>
                      <b>
                        {administrativeInfo.address?.suburb && administrativeInfo.address.suburb + ', '}
                        {administrativeInfo.address?.village && administrativeInfo.address.village + ', '}
                        {administrativeInfo.address?.town && administrativeInfo.address.town + ', '}
                        {administrativeInfo.address?.city && administrativeInfo.address.city + ', '}
                        {administrativeInfo.address?.region && administrativeInfo.address.region + ', '}
                        {administrativeInfo.address?.state && administrativeInfo.address.state + ', '}
                        {administrativeInfo.address?.country || ''}
                      </b>
                      Coordinates: {administrativeInfo.lat.toFixed(6)}, {administrativeInfo.lng.toFixed(6)}<br />
                      Altitude: {Number(administrativeInfo.elevation ?? 0).toLocaleString().replace(/,/g, ' ')} m<br />
                      <br />
                      {/*<ClimateDataLoader latitude={administrativeInfo.lat} longitude={administrativeInfo.lng} startYear={year - 6} endYear={year - 1} />*/}                      
                    </div>
                  </div>
                </div>
              )}
              <div className="m-0 p-1 flex flex-row align-items-center" style={{ width: '100%', flexWrap: 'nowrap', marginBottom: '5px' }}>
                {soil !== '' && (
                  <div className="m-0 p-1 flex flex-row align-items-center" style={{ flexShrink: 0 }}>
                    <img src={`${process.env.PUBLIC_URL}/images/SoilIcon.png`} alt="Soil" style={{ height: '30px', flexShrink: 0 }} />
                    <div className="m-0 p-1" style={{ whiteSpace: 'nowrap' }}><b>{t('results.soilType')}</b> {soilName} ({soilCode})</div>
                  </div>
                )}
                
                {crop !== '' && (
                  <div className="m-0 p-1 flex flex-row align-items-center" style={{ flexShrink: 0 }}>
                    <img src={`${process.env.PUBLIC_URL}/images/CropIcon.png`} alt="Crop" style={{ height: '30px', flexShrink: 0 }} />
                    <div className="m-0 p-1" style={{ whiteSpace: 'nowrap' }}><b>{t('results.crop')}</b> {crop}</div>
                  </div>
                )}
                
                {irrigation !== undefined && input !== '' && (
                  <div className="m-0 p-1 flex flex-row align-items-center" style={{ flex: 1, minWidth: 0 }}>
                    <img src={`${process.env.PUBLIC_URL}/images/IrrigationIcon.png`} alt="Irrigation" style={{ height: '40px', flexShrink: 0 }} />
                    <div className="flex flex-column m-0 p-1" style={{ minWidth: 0 }}>
                      <div style={{ whiteSpace: 'nowrap' }}><b>{t('results.water')}</b> {irrigation === 'Yes' ? t('results.irrigated') : t('results.rainFed')}</div>
                      <div><b>{t('results.management')}</b> {input === 'High' ? t('results.highInput') : t('results.lowInput')}</div>
                    </div>
                  </div>
                )}
              </div>              
            </>
          )}

          {!showReport && (
            <div className="flex flex-column gap-3">
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                {cropSuitability !== null && averageSuitability !== null && (
                  <>
                    <div style={{ width: isMobile ? '100%' : '75%' }}>
                      <div className="flex align-items-center mb-1 gap-1">
                        <div>
                          <img
                            src={`${process.env.PUBLIC_URL}/images/${cropSuitability <= 3 ? 'Smile' : cropSuitability >= 6 ? 'Frown' : 'Meh'}.png`}
                            alt="Mood" style={{ height: '60px', margin: '5px' }}
                          />
                        </div>
                        <div className="flex align-items-center mb-1">
                          <p style={{ fontWeight: 'bold' }}>
                            {t('results.suitabilityIndex')} <span style={{ color: 'red' }}>{scale?.[2] ?? 'Unknown'} &lt; SI &lt; {scale?.[3] ?? 'Unknown'}</span>.<br />
                            {t('results.meansYourCrop')} {generalSuitability?.crop === 'Not Suitable' ? t('results.is') : t('results.hasa')}{' '}
                            <span style={{ color: 'red' }}>{generalSuitability?.crop ?? 'Unknown'} {generalSuitability?.crop === 'Not Suitable' ? '' : t('results.suitability')}</span> {t('results.underConditions')}
                          </p>
                        </div>
                      </div>
                      <SuitabilityGauge cropLevel={generalSuitability?.crop ?? null} avgLevel={generalSuitability?.average ?? null} />
                      <div className="flex align-items-center mb-1">
                        <p style={{ fontWeight: 'bold' }}>
                          {t('results.avgIndex')} <span style={{ color: 'red' }}>{generalSuitability?.average ?? 'Unknown'}</span>.{' '}
                          {generalSuitability?.average && (
                            <>{t('results.cropSuitabilityIs')}{' '}
                              <span style={{ color: 'red' }}>
                                {cropSuitability < averageSuitability ? t('results.above') : cropSuitability > averageSuitability ? t('results.below') : t('results.sameAs')}
                              </span> {t('results.avgSuitability')}</>
                          )}
                        </p>
                      </div>
                      
                      {attainableYield !== null && (
                        <div className="flex align-items-center mb-1">
                          <p style={{ fontWeight: 'bold' }}>
                            {t('results.attainableYield')}{' '}
                            <span style={{ color: 'red' }}>{nFormat.format(Math.round(Number(attainableYield))).replace(/,/g, ' ')} {t('results.yieldUnit')}</span>.
                            {!publishResults && <InfoTooltip content={t('results.yieldTooltip')} />}
                          </p>
                          {!publishResults && <ConstraintsButton onClick={() => setShowConstraints(true)} style={{ marginLeft: '5px', flexShrink: 0, color: theme.colors.accent, width: '50%', minWidth: '175px' }}>
                              {t('results.constraintsButton')}
                            </ConstraintsButton>
                          }
                        </div>
                      )}
                    </div>
                    <SuitabilityLegend />
                  </>
                )}
                {(cropSuitability === null || averageSuitability === null) && (
                  <p style={{ fontWeight: 'bold' }}>{t('results.noSuitability')}</p>
                )}
              </div>
            </div>
          )}

          {publishResults && (
            <>              
              <div>
                <div style={{ fontSize: theme.typography.fontSizeLg, fontWeight: 'bold', marginBottom: '8px' }}>
                  CONSTRAINTS AFFECTING YOUR CROP YIELD
                </div>
                <Body>
                  <Subtitle>
                    {t('constraints.subtitle')} <strong>{crop}</strong> {t('constraints.atLocation')}
                  </Subtitle>
                  {constraintsLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 0' }}>
                      <SyncLoader size={5} color="#555" />
                      <span>{t('constraints.calculating')}</span>
                    </div>
                  ) : (
                    <>
                      <Section>
                        <SectionHeading>
                          {t('constraints.thermal')}
                          {/*<InfoTooltip content={t('constraints.thermalTooltip')} />*/}
                        </SectionHeading>
                        <ConstraintSlider value={ thermalConstraint != null ? (thermalConstraint >= 0 ? (10000 - thermalConstraint) / 100 : thermalConstraint) : -1 } />
                      </Section>
                      <Section>
                        <SectionHeading>
                          {t('constraints.moisture')}
                          {/*<InfoTooltip content={t('constraints.moistureTooltip')} />*/}
                        </SectionHeading>
                        <ConstraintSlider value={ moistureConstraint != null ? (moistureConstraint >= 0 ? (10000 - moistureConstraint) / 100 : moistureConstraint) : -1 } />
                      </Section>
                      <Section>
                        <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #ccc', width: '100%' }}>
                          {[
                            { value: 'Constraint', cls: 'Class', desc: 'Constraint description', header: true },
                            { value: '0%',       cls: 'No constraint',        desc: 'Conditions do not limit crop yield potential' },
                            { value: '1 - 20%',  cls: 'Low constraint',        desc: 'Conditions may slightly limit crop yield potential' },
                            { value: '21 - 40%', cls: 'Moderate constraint',   desc: 'Conditions moderately limit crop yield potential' },
                            { value: '41 - 60%', cls: 'High constraint',        desc: 'Conditions strongly limit crop yield potential' },
                            { value: '61 - 80%', cls: 'Very high constraint',   desc: 'Conditions severely limit crop yield potential' },
                            { value: '81 - 100%',cls: 'Very high constraint',   desc: 'Conditions are highly limiting to crop yield potential' },
                          ].map(({ value, cls, desc, header }, i, arr) => (
                            <div
                              key={i}
                              style={{
                                display: 'flex',
                                fontWeight: header ? 'bold' : undefined,
                                background: header ? '#f5f5f5' : undefined,
                                borderBottom: `1px solid ${header ? '#ccc' : i < arr.length - 1 ? '#eee' : 'transparent'}`,
                                fontSize: header ? theme.typography.fontSizeBase : theme.typography.fontSizeSm,
                              }}
                            >
                              <div style={{ flex: '0 0 15%', padding: '5px', borderRight: '1px solid #ccc' }}>{value}</div>
                              <div style={{ flex: '0 0 25%', padding: '5px', borderRight: '1px solid #ccc' }}>{cls}</div>
                              <div style={{ flex: '1',       padding: '5px' }}>{desc}</div>
                            </div>
                          ))}
                        </div>
                      </Section>
                      {/*<Section>
                        <SectionHeading>
                          Agro-Climatic Constraint:
                          <InfoTooltip content="Agro-Climatic constraint reflects the degree to which agro-climatic properties limit crop growth and yield at this location." />
                        </SectionHeading>
                        <ConstraintSlider value={ agroClimaticConstraint != null ? (agroClimaticConstraint >= 0 ? (10000 - agroClimaticConstraint) / 100 : agroClimaticConstraint) : -1 } />
                      </Section>*/}
                    </>
                  )}
                </Body>
              </div>
              <Divider />
              <div style={{ pageBreakAfter: 'always' }} />
              <div className="flex flex-column m-0 p-0">
                <div className="m-0 p-0 justify-content-start" style={{ fontSize: theme.typography.fontSizeLg, fontWeight: 'bold' }}>
                  <img src={`${process.env.PUBLIC_URL}/images/ResultsIcon.png`} alt="Results" style={{ height: '30px', marginRight: '10px' }} />
                  {t('results.alternateCrops')}
                </div>
                <div className="m-0 p-0 flex flex-row justify-content-start">
                  {t('results.alternateCropsDesc')}
                </div>
                <div className="m-1 p-0 flex justify-content-center">
                  <AlternateCropsTable allCropSuitability={allCropSuitability} allCropDataError={allCropDataError} cropCode={cropCode} />
                </div>
              </div>
            </>
          )}

          {!publishResults && !showReport && (
            <>
              <div className="flex flex-column m-0 p-0 mt-2">
                <div className="m-0 p-0 flex flex-row justify-content-start" style={{ fontSize: theme.typography.fontSizeXl, fontWeight: 'bold', verticalAlign: 'middle' }}>
                  <img src={`${process.env.PUBLIC_URL}/images/ResultsIcon.png`} alt="Results" style={{ height: '30px', marginRight: '10px' }} />
                  {t('results.alternateCrops')}
                </div>
                <div className="m-1 p-0 flex flex-row justify-content-start" style={{ fontWeight: 'bold' }}>
                  {t('results.alternateCropsDesc')}
                </div>
                <div className="m-1 p-0 flex justify-content-center">
                  <AlternateCropsCarousel allCropSuitability={allCropSuitability} allCropDataError={allCropDataError} cropCode={cropCode} />
                </div>
              </div>
              <div className="m-0" style={{ textAlign: 'center', opacity: resultVisible ? 1 : 0, transform: resultVisible ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.5s ease, transform 0.5s ease', transitionDelay: '0.2s', width: '100%' }}>
                <DownloadLink href="#" onClick={(e) => { e.preventDefault(); setShowReport(true); toPDF(); }} >
                  {t('results.downloadReport')}
                </DownloadLink>
              </div>
            </>
          )}

          {!publishResults && showReport && (
            <>
              <div>
                <i className="pi pi-times-circle p-0 m-0 cursor-pointer" onClick={() => { setPublishResults(false); setShowReport(false); }} style={{ color: '#6e431d', position: 'relative', float: 'left' }}></i>
              </div>
              <div className="flex flex-column align-items-center justify-content-center" style={{ minHeight: '40px', width: '100%' }}>
                {!reportReady && (
                  <div className="flex align-items-center gap-2">
                    <SyncLoader size={5} />
                    <span style={{ marginLeft: '10px' }}>{t('results.preparingReport')}</span>
                  </div>
                )}
                <div style={{ opacity: reportReady ? 1 : 0, transform: reportReady ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.5s ease, transform 0.5s ease', pointerEvents: reportReady ? 'auto' : 'none', width: '100%' }}>
                  <DownloadLink href="#" onClick={(e) => { e.preventDefault(); toPDF(); }}>{t('results.download')}</DownloadLink>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <div ref={targetRef} style={{ width: 'fit-contents', minWidth: '750px', margin: '0 auto', padding: '20px', boxSizing: 'border-box', backgroundColor: 'white' }}>
                  <ResultsPanel publishReport={true} onReady={() => setReportReady(true)} />
                </div>
              </div>
            </>
          )}

          {!showReport && (
            <p style={{ fontSize: theme.typography.fontSizeXs, paddingTop: '5px', textAlign: 'center' }}>
              {t('results.disclaimer')} <a href="https://data.apps.fao.org/soilfer/" target="_blank" rel="noreferrer">https://data.apps.fao.org/soilfer/</a> {t('results.disclaimer2')}
            </p>
          )}

          <ConstraintsModal
            open={showConstraints}
            onClose={() => setShowConstraints(false)}
            thermalConstraint={ thermalConstraint != null ? (thermalConstraint >= 0 ? (10000 - thermalConstraint) / 100 : thermalConstraint) : -1 }
            moistureConstraint={ moistureConstraint != null ? (moistureConstraint >= 0 ? (10000 - moistureConstraint) / 100 : moistureConstraint) : -1 }
            agroClimaticConstraint={ agroClimaticConstraint != null ? (agroClimaticConstraint >= 0 ? (10000 - agroClimaticConstraint) / 100 : agroClimaticConstraint) : -1 }
            crop={crop}
            loading={constraintsLoading}
          />
          
        </div>
      )}
    </div>
  );
};
