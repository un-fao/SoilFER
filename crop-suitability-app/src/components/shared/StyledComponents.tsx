import styled from 'styled-components';
import { theme } from '../../theme/theme';

export const Panel = styled.div`
  background-color: ${theme.colors.background.panel};
  color: #fff;
  padding: 12px;
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.panel};
  font-weight: bold;
  font-size: 9pt;
`;

export const Info = styled.div`
  width: 100%;
  color: #fff;
`;

export const SubmitButton = styled.button`
  background-color: ${theme.colors.accent};
  color: #333;
  border: none;
  padding: 10px;
  width: 100%;
  cursor: pointer;
  font-weight: bold;
  border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSizeBase};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled.button`
  background-color: ${theme.colors.primaryDark};
  color: #fff;
  border: none;
  padding: 10px;
  width: 100%;
  cursor: pointer;
  font-weight: bold;
  border-radius: ${theme.borderRadius.sm};
  margin-top: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSizeBase};
`;