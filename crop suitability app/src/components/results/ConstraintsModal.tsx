import React from 'react';
import styled from 'styled-components';
import SyncLoader from 'react-spinners/SyncLoader';
import { ConstraintSlider } from './ConstraintSlider';
import { InfoTooltip } from '../shared/InfoTooltip';
import { theme } from '../../theme/theme';
import { useTranslation } from 'react-i18next';

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: ${({ theme }) => theme.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: #fff;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  max-width: 750px;
  min-width: min(550px, 92vw);
  width: clamp(300px, 92vw, 750px);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  border: 10px solid ${({ theme }) => theme.colors.primaryDark};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h2`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSizeBase};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.onLight};
`;

const CloseBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
  &:hover { background-color: ${({ theme }) => theme.colors.primaryDark}; }
`;

export const Body = styled.div`
  padding: 15px 25px 5px;
`;

export const Subtitle = styled.p`
  margin: 0 0 16px 0;
`;

export const Section = styled.div`
  margin-bottom: 15px;
`;

export const SectionHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.typography.fontSizeMd};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text.onLight};
  margin-bottom: 10px;
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  gap: 6px;
  color: ${({ theme }) => theme.colors.text.onLight};
`;

const Footer = styled.div`
  padding: 10px 25px;
  display: flex;
  justify-content: center;
`;

const CloseButton = styled.button`
  background-color: ${({ theme }) => theme.colors.accent};
  width: 90%;
  font-weight: bold;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 5px 20px;
  font-size: ${({ theme }) => theme.typography.fontSizeLg};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.button};
  &:hover { background-color: ${({ theme }) => theme.colors.accentHover}; }
`;

interface ConstraintsModalProps {
  open: boolean;
  onClose: () => void;
  thermalConstraint: number;
  moistureConstraint: number;
  agroClimaticConstraint: number;
  crop: string;
  loading?: boolean;
}

export const ConstraintsModal: React.FC<ConstraintsModalProps> = ({
  open, onClose, thermalConstraint, moistureConstraint, agroClimaticConstraint, crop, loading = false
}) => {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <Backdrop onClick={onClose}>
      <Card onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>{t('constraints.title')}</Title>
          <CloseBtn onClick={onClose} aria-label="Close">
            <i className="pi pi-times" style={{ fontSize: '12px' }} />
          </CloseBtn>
        </Header>

        <Body>
          <Subtitle>
            {t('constraints.subtitle')} <strong>{crop}</strong> {t('constraints.atLocation')}
          </Subtitle>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px 0' }}>
              <SyncLoader size={5} color="#555" />
              <span>{t('constraints.calculating')}</span>
            </div>
          ) : (
            <>
              <Section>
                <SectionHeading>
                  {t('constraints.thermal')}
                  <InfoTooltip content={t('constraints.thermalTooltip')} />
                </SectionHeading>
                <ConstraintSlider value={thermalConstraint} />
              </Section>

              <Section>
                <SectionHeading>
                  {t('constraints.moisture')}
                  <InfoTooltip content={t('constraints.moistureTooltip')} />
                </SectionHeading>
                <ConstraintSlider value={moistureConstraint} />
              </Section>

              {/*<Section>
                <SectionHeading>
                  Agro-Climatic Constraint:
                  <InfoTooltip content="Agro-Climatic constraint reflects the degree to which agro-climatic properties limit crop growth and yield at this location." />
                </SectionHeading>
                <ConstraintSlider value={agroClimaticConstraint} />
              </Section>*/}
            </>
          )}

          <Subtitle>
            <strong>{t('constraints.whatMean')}</strong>
            <div>{t('constraints.explanation')}
              <ul>
                <li><b>{t('constraints.lowerValues')}</b> {t('constraints.lowerValuesDesc')}</li>
                <li><b>{t('constraints.higherValues')}</b> {t('constraints.higherValuesDesc')}</li>
              </ul>
            </div>
            <div style={{ fontSize: theme.typography.fontSizeXs, textAlign: 'center' }}>
              <b>{t('constraints.source')}</b> {t('constraints.sourceLink')} (<a href='https://data.apps.fao.org/gaez/?lang=en&share=f-9edad236-277e-449f-a563-72ba30ea5507' target='_blank' rel="noreferrer">FAO and IIASA, 2025</a>)
            </div>
          </Subtitle>
          
        </Body>

        <Footer>
          <CloseButton onClick={onClose}>{t('constraints.close')}</CloseButton>
        </Footer>
      </Card>
    </Backdrop>
  );
};
