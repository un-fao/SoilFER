import React, { useState, ReactNode } from 'react';
import styled from 'styled-components';

const TooltipBox = styled.div<{ $align: 'left' | 'right' }>`
  position: absolute;
  top: calc(100% + 4px);
  ${({ $align }) => $align === 'right' ? 'right: 0;' : 'left: 0;'}
  color: ${({ theme }) => theme.colors.text.muted};
  border: 1px solid ${({ theme }) => theme.colors.text.muted};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background-color: ${({ theme }) => theme.colors.background.tooltip};
  padding: 5px;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  font-size: 9pt;
  font-weight: normal;
  min-width: 200px;
  width: fit-contents;
  line-height: 1.4;
`;

const CloseBtn = styled.i`
  float: right;
  cursor: pointer;
  color: #999;
`;

interface InfoTooltipProps {
  content: ReactNode;
  label?: string;
  iconOnly?: boolean;
  iconStyle?: React.CSSProperties;
  align?: 'left' | 'right';
}

export const InfoTooltip = ({ content, label, iconStyle, align = 'left' }: InfoTooltipProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {label && <span>{label}</span>}
      <i
        className="pi pi-info-circle"
        style={{ cursor: 'pointer', ...iconStyle }}
        onClick={() => setVisible(true)}
      />
      {visible && (
        <TooltipBox $align={align}>
          <div><CloseBtn className="pi pi-times-circle" onClick={() => setVisible(false)} /></div>
          {content}
        </TooltipBox>
      )}
    </span>
  );
};
