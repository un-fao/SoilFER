import { useState, useEffect } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1200px)';

export const useBreakpoint = () => {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches);
  const [isTablet, setIsTablet] = useState(() => window.matchMedia(TABLET_QUERY).matches);

  useEffect(() => {
    const mobileMq = window.matchMedia(MOBILE_QUERY);
    const tabletMq = window.matchMedia(TABLET_QUERY);
    const onMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const onTablet = (e: MediaQueryListEvent) => setIsTablet(e.matches);
    mobileMq.addEventListener('change', onMobile);
    tabletMq.addEventListener('change', onTablet);
    return () => {
      mobileMq.removeEventListener('change', onMobile);
      tabletMq.removeEventListener('change', onTablet);
    };
  }, []);

  return { isMobile, isTablet, isDesktop: !isMobile && !isTablet };
};
