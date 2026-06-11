import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme/theme';
import { GlobalStyle } from './theme/GlobalStyle';
import { AppProvider } from './store/AppContext';
import App from './App';
import './i18n';

import 'primereact/resources/themes/saga-orange/theme.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
//import 'fontawesome/css/all.css';
import 'flag-icons/css/flag-icons.min.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppProvider>
        <App />
      </AppProvider>
    </ThemeProvider>
  </React.StrictMode>
);
