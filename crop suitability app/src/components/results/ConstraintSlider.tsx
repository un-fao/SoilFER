import React from 'react';
import styled from 'styled-components';
import { getConstraintLevel } from '../../data/constraintScales';

// Gradient stops matching the suitability colour scale (green → yellow → orange → red)
const GRADIENT = 'linear-gradient(to right, #4F9C4F 0%, #C5DE91 25%, #FBE351 45%, #DA9A51 65%, #d32f2f 100%)';

const Wrapper = styled.div`
  width: 100%;
  margin-bottom: 8px;
`;

const BarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const LowLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizeBase};
  font-weight: bold;
  color: #4F9C4F;
  white-space: nowrap;
  min-width: 28px;
`;

const HighLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizeBase};
  font-weight: bold;
  color: #d32f2f;
  white-space: nowrap;
  min-width: 28px;
`;

const BarContainer = styled.div`
  position: relative;
  flex: 1;
  height: 22px;
`;

const GradientBar = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${GRADIENT};
`;

const Badge = styled.div<{ $left: number; $color: string }>`
  position: absolute;
  top: -2px;
  left: ${({ $left }) => Math.min($left, 99)}%;
  transform: translateX(-50%);
  background-color: ${({ $color }) => $color};
  color: #fff;
  font-size: ${({ theme }) => theme.typography.fontSizeSm};
  font-weight: bold;
  padding: 3px 7px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  pointer-events: none;
`;

const ScaleRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 3px;
  padding-left: 44px;
  padding-right: 36px;
`;

const ScaleLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSizeSm};
  color: ${({ theme }) => theme.colors.text.muted};
`;

/** Interpolates a colour for the badge based on the 0–100 value. */
function getBadgeColor(value: number): string {
  if (value < 0) return '#999';
  else if (value <= 25) return '#4F9C4F';
  else if (value <= 50) return '#b8a020';
  else if (value <= 75) return '#c07030';
  else return '#d32f2f';
}

interface ConstraintSliderProps {
  value: number; // 0–100
}

export const ConstraintSlider: React.FC<ConstraintSliderProps> = ({ value }) => {
  const clamped = Math.max(0, Math.min(100, value));
  const badgeColor = getBadgeColor(clamped);
  const label = getConstraintLevel(clamped) ?? 'Percent Constraint';

  return (
    <Wrapper>
      <BarRow>
        <LowLabel>Low</LowLabel>
        <BarContainer>
          <GradientBar />
          <Badge $left={clamped} $color={badgeColor}>
            {Math.round(clamped)}%
          </Badge>
        </BarContainer>
        <HighLabel>High</HighLabel>
      </BarRow>
      <ScaleRow>
        <ScaleLabel>0%</ScaleLabel>
        {/*<ScaleLabel style={{ color: badgeColor, fontWeight: 'bold' }}>{label}</ScaleLabel>*/}
        <ScaleLabel>100%</ScaleLabel>
      </ScaleRow>
    </Wrapper>
  );
};
