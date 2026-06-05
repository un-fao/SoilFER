import React from 'react';
import styled from 'styled-components';
import { theme } from '../../theme/theme';

interface Props {
  level: string;
  size?: 'sm' | 'md';
}

const Badge = styled.div<{ $level: string; $size: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${(p) => (p.$size === 'sm' ? '2px 6px' : '4px 10px')};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${(p) => (p.$size === 'sm' ? theme.typography.fontSizeSm : theme.typography.fontSizeBase)};
  font-weight: bold;
  color: #fff;
  background-color: ${(p) => getSuitabilityColor(p.$level)};
`;

function getSuitabilityColor(level: string): string {
  switch (level) {
    case 'Very High': return theme.colors.suitability.veryHigh;
    case 'High': return theme.colors.suitability.high;
    case 'Good': return theme.colors.suitability.good;
    case 'Medium': return theme.colors.suitability.medium;
    case 'Moderate': return theme.colors.suitability.moderate;
    case 'Marginal': return theme.colors.suitability.marginal;
    case 'Very Marginal': return theme.colors.suitability.veryMarginal;
    default: return theme.colors.suitability.notSuitable;
  }
}

export const SuitabilityBadge: React.FC<Props> = ({ level, size = 'md' }) => (
  <Badge $level={level} $size={size}>{level}</Badge>
);
