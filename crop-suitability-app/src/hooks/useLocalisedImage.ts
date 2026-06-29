import { useTranslation } from 'react-i18next';

export const useLocalisedImage = (filename: string): string => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] ?? 'en';
  const localised = `${process.env.PUBLIC_URL}/locales/${lang}/images/${filename}`;
  const fallback = `${process.env.PUBLIC_URL}/images/${filename}`;
  // Return localised path; components can handle 404 via onError fallback
  return lang === 'en' ? fallback : localised;
};
