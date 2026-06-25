  export const theme = {
  colors: {
    primary: '#7e5134',
    primaryDark: '#492815',
    primaryLight: '#c8ae8d',
    accent: '#ffba00',
    accentHover: 'orange',
    text: {
      onPrimary: '#ffffff',
      onLight: '#6e431d',
      muted: '#555555',
      subtle: '#8a7060',
    },
    background: {
      panel: '#7e5134',
      card: '#fefffb',
      cardAlt: '#faf7f4',
      tooltip: '#ffeecc',
      tableHeader: '#6e431d',
      tableRow: '#fefffb',
      tableRowSelected: '#f0e0cc',
    },
    border: '#c2b7b5',
    suitability: {
      veryHigh: '#4F9C4F',
      high: '#66BE5E',
      good: '#C5DE91',
      medium: '#FBE351',
      moderate: '#DBBB87',
      marginal: '#DA9A51',
      veryMarginal: '#A6A7A7',
      notSuitable: '#DBDCDC',
      soilNotPresent: '#E6E6E5',
      water: '#A9D2DE',
    },
    stats: {
      veryHigh: '#081d58',
      high: '#253494',
      good: '#2c7fb8',
      medium: '#41b6c4',
      moderate: '#7fcdbb',
      marginal: '#c7e9b4',
      veryMarginal: '#ffffcc',
      notSuitable: '#f4fcec',
      noData: '#dddddd',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '15px',
    lg: '20px',
    xl: '30px',
  },
  borderRadius: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
  },
  typography: {
    fontSizeBase: '12pt',
    fontSizeSm: '10pt',
    fontSizeXs: '8pt',
    fontSizeMd: '13pt',
    fontSizeLg: '15pt',
    fontSizeXl: '18pt',
    fontSizeNav: '8pt',
    fontSizeButton: '10pt',
  },
  zIndex: {
    map: 1,
    mapOverlay: 2,
    panel: 999,
    nav: 5,
    modal: 100,
    tooltip: 999,
  },
  panel: {
    leftWidth: '400px',
    rightMinWidth: '725px',
  },
  breakpoints: {
    xs: '360px',
    sm: '600px',
    md: '768px',
    lg: '1024px',
    xl: '1440px',
  },
  shadows: {
    panel: '5px 10px #888888',
    button: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  },
} as const;

export type Theme = typeof theme;

// Declaration merging so styled-components knows our theme shape
declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}
