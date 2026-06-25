import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  html {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
    min-width: 900px;
    overflow-x: auto;
    overflow-y: hidden;
    font-family: 'Open Sans', 'Roboto', 'Helvetica', 'Arial', 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    font-size: ${({ theme }) => theme.typography.fontSizeBase};
  }

  body, #root {
    height: 100%;
    width: 100%;
    min-width: 900px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    position: relative;
  }

  code { font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace; }

  /* PrimeReact padding resets */
  .p-card-body, .p-card-content, .p-tabview-panels,
  .p-accordion-header, .p-dataview-header, .p-dataview-content,
  .p-datatable-header, .p-datatable-table, .p-datatable-thead,
  th, tr { margin: 0; padding: 0; }

  .p-carousel { flex: auto; flex-shrink: inherit; max-width: 700px; }

  /* Leaflet popup — strip default chrome so content controls its own appearance */
  .leaflet-popup-content-wrapper {
    background: transparent;
    box-shadow: 0 3px 14px rgba(0,0,0,0.4);
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: 0;
  }
  .leaflet-popup-content {
    margin: auto !important;
    width: auto !important;
  }

  /* Suitability color classes */
  .si-very-high { background-color: ${({ theme }) => theme.colors.suitability.veryHigh}; }
  .si-high { background-color: ${({ theme }) => theme.colors.suitability.high}; }
  .si-good { background-color: ${({ theme }) => theme.colors.suitability.good}; }
  .si-medium { background-color: ${({ theme }) => theme.colors.suitability.medium}; }
  .si-moderate { background-color: ${({ theme }) => theme.colors.suitability.moderate}; }
  .si-marginal { background-color: ${({ theme }) => theme.colors.suitability.marginal}; }
  .si-very-marginal { background-color: ${({ theme }) => theme.colors.suitability.veryMarginal}; }
  .si-not-suitable { background-color: ${({ theme }) => theme.colors.suitability.notSuitable}; }
  .si-soil-not-present { background-color: ${({ theme }) => theme.colors.suitability.soilNotPresent}; }
  .si-water { background-color: ${({ theme }) => theme.colors.suitability.water}; }

  /* Stats color classes */
  .st-very-high { background-color: ${({ theme }) => theme.colors.stats.veryHigh}; }
  .st-high { background-color: ${({ theme }) => theme.colors.stats.high}; }
  .st-good { background-color: ${({ theme }) => theme.colors.stats.good}; }
  .st-medium { background-color: ${({ theme }) => theme.colors.stats.medium}; }
  .st-moderate { background-color: ${({ theme }) => theme.colors.stats.moderate}; }
  .st-marginal { background-color: ${({ theme }) => theme.colors.stats.marginal}; }
  .st-very-marginal { background-color: ${({ theme }) => theme.colors.stats.veryMarginal}; }
  .st-not-suitable { background-color: ${({ theme }) => theme.colors.stats.notSuitable}; }
  .st-no-data { background-color: ${({ theme }) => theme.colors.stats.noData}; }

  /* Button download link style (from Result.css) */
  .button {
    background-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.text.onLight};
    border: none;
    padding: 10px;
    cursor: pointer;
    font-weight: bold;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    text-decoration: none;
    display: inline-block;
  }

  /* Table layout classes (was table.css) */
  .table {
    display: table;
    width: 100%;
    border-collapse: collapse;
    overflow-y: auto;
    max-height: calc(100vh - 260px);
  }

  @media (max-width: 767px) {
    .table { min-width: 600px; }
  }
  .table-header {
    display: table-header-group;
    font-weight: bold;
    background-color: ${({ theme }) => theme.colors.background.tableHeader};
    color: ${({ theme }) => theme.colors.text.onPrimary};
  }
  .table-row {
    display: table-row;
    background-color: ${({ theme }) => theme.colors.background.tableRow};
    color: ${({ theme }) => theme.colors.text.onLight};
  }
  .table-row:hover { background-color: ${({ theme }) => theme.colors.primaryLight} !important; }
  .table-cell {
    display: table-cell;
    padding: 2px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    vertical-align: middle;
    font-weight: bold;
  }
`;
