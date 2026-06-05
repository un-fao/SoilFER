import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell } from './components/layout/AppShell';
import { RTL_LANGUAGES } from './i18n';

const App: React.FC = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language?.split('-')[0] ?? 'en';
    document.dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return <AppShell />;
};

export default App;
