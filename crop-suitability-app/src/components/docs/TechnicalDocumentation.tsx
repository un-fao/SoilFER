import React from 'react';
import { useTranslation } from 'react-i18next';

export const TechnicalDocumentation: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="card" style={{ height: 'calc(100vh - 350px)' }}>
      <object
        data={`${process.env.PUBLIC_URL}/SoilFerApp_UserGuide.v2.pdf`}
        type="application/pdf"
        width="100%"
        height="100%"
      >
        <p>
          <a href={`${process.env.PUBLIC_URL}/SoilFerApp_UserGuide.v2.pdf`}>
            {t('docs.downloadGuide')}
          </a>
        </p>
      </object>
    </div>
  );
};
