import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const FooterContainer = styled.footer`
  background-color: #fff; /* FAO Primary Blue */
  color: #333;
  padding: 10px 20px;
  font-family: 'Open Sans', sans-serif;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  z-index: 1000;
  position: relative;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  height: 50px
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    padding: 20px 40px;
  }
`;

const FooterLinks = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: left;

  @media (min-width: 768px) {
    gap: 25px;
  }
`;

const FooterLink = styled.a`
  color: #333;
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
    color: #222;
    text-decoration: underline;
  }
`;

const Copyright = styled.div`
  font-size: 0.85rem;
  
  a {
    color: #333;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterLinks>
        <FooterLink href="mailto:soilfer@fao.org" target="_blank" rel="noopener noreferrer">
          {t('footer.contactUs', 'Contact Us')}
        </FooterLink>
        <FooterLink href="http://fao.org/contact-us/terms/en/" target="_blank" rel="noopener noreferrer">
          {t('footer.terms', 'Terms and Conditions')}
        </FooterLink>
        <FooterLink href="http://fao.org/contact-us/data-protection-and-privacy/en/" target="_blank" rel="noopener noreferrer">
          {t('footer.privacy', 'Data Protection and Privacy')}
        </FooterLink>
        <FooterLink href="http://fao.org/contact-us/scam-alert/en/" target="_blank" rel="noopener noreferrer">
          {t('footer.scamAlert', 'Scam Alert')}
        </FooterLink>
        <FooterLink href="https://www.fao.org/audit-and-investigations/reporting-misconduct/en/" target="_blank" rel="noopener noreferrer">
          {t('footer.reportMisconduct', 'Report Misconduct')}
        </FooterLink>
      </FooterLinks>
      
      <Copyright>
        <a href="https://www.fao.org/contact-us/terms/en/" target="_blank" rel="noopener noreferrer">
          &copy; FAO {currentYear}
        </a>
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
