import React, { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../layout/LanguageSelector';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff; /* FAO Primary Blue */
  color: #333;
  padding: 0 20px;
  height: 60px;
  font-family: 'Open Sans', sans-serif;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1000;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const LogoImage = styled.img`
  height: 60px;
  object-fit: contain;
  background-color: white;
  padding: 4px 0;
  border-radius: 4px;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  line-height: 1;
  display: none;
  
  @media (min-width: 768px) {
    display: block;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NavLinks = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 767px) {
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    flex-direction: column;
    background-color: #333;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
`;

const NavLink = styled.a`
  color: #444;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s;

  &:hover {
    color: #222;
    text-decoration: underline;
  }
`;

const MenuButton = styled.button`
  background: transparent;
  border: none;
  color: #444;
  font-size: 1.5rem;
  cursor: pointer;
  display: none;
  padding: 0;
  line-height: 1;

  @media (max-width: 767px) {
    display: block;
  }
`;

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <HeaderContainer>
      <LeftSection>
        <LogoImage
          src={`${process.env.PUBLIC_URL}/fao-logo-three-lines.svg`}
          alt="FAO Logo"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `${process.env.PUBLIC_URL}/fao-logo.png`;
          }}
        />
        <Title>SoilFER CropSuit App </Title>
      </LeftSection>

      <RightSection>

        <NavLinks $isOpen={menuOpen}>
          {/* <NavLink href="#home">{t('nav.home', 'Home')}</NavLink> */}
          <LanguageSelector />
          <NavLink target="_blank" rel="noopener noreferrer" href="https://www.fao.org/in-action/soilfer/en">{t('nav.about', 'About')}</NavLink>
          {/* <NavLink href="#contact">{t('nav.contact', 'Contact')}</NavLink> */}
        </NavLinks>



        <MenuButton onClick={toggleMenu} aria-label="Toggle navigation">
          <i className={menuOpen ? 'pi pi-times' : 'pi pi-bars'} />
        </MenuButton>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header;