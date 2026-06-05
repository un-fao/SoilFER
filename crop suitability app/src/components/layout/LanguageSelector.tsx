import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { SUPPORTED_LANGUAGES, RTL_LANGUAGES } from '../../i18n';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const Wrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const Trigger = styled.button`
  background: rgba(200, 174, 141, 0.9);
  border: 1px solid ${({ theme }) => theme.colors.primaryDark};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  color: ${({ theme }) => theme.colors.primaryDark};
  cursor: pointer;
  font-size: 11pt;
  font-weight: bold;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 5px;
  &:hover { background: ${({ theme }) => theme.colors.accent}; }
`;

const Dropdown = styled.ul<{ $dropUp: boolean }>`
  position: absolute;
  ${({ $dropUp }) => $dropUp ? 'bottom: calc(100% + 4px);' : 'top: calc(100% + 4px);'}
  right: 0;
  background: white;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  list-style: none;
  margin: 0;
  padding: 4px 0;
  min-width: 140px;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
  box-shadow: ${({ $dropUp }) => $dropUp ? '0 -4px 12px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.15)'};
`;

const Option = styled.li<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 10pt;
  font-weight: ${({ $active }) => ($active ? 'bold' : 'normal')};
  background: ${({ $active, theme }) => ($active ? theme.colors.background.cardAlt : 'transparent')};
  &:hover { background: ${({ theme }) => theme.colors.background.cardAlt}; }
`;

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { isTablet, isMobile } = useBreakpoint();
  const dropUp = isTablet || isMobile;

  const currentLang = i18n.language?.split('-')[0] ?? 'en';
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ?? SUPPORTED_LANGUAGES[0];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    document.dir = RTL_LANGUAGES.includes(code) ? 'rtl' : 'ltr';
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <Wrapper ref={ref}>
      <Trigger onClick={() => setOpen((o) => !o)}>
        <span className={`fi fi-${current.flag}`} />
        {current.code.toUpperCase()}
      </Trigger>
      {open && (
        <Dropdown $dropUp={dropUp}>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <Option
              key={lang.code}
              $active={lang.code === currentLang}
              onClick={() => changeLanguage(lang.code)}
            >
              <span className={`fi fi-${lang.flag}`} />
              {lang.label}
            </Option>
          ))}
        </Dropdown>
      )}
    </Wrapper>
  );
};
