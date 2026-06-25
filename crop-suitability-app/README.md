# SoilFER v3

A web application for soil fertility assessment and crop suitability analysis. SoilFER helps farmers and agronomists evaluate which crops are best suited to a given location based on soil properties, climate data, and management practices.

## Features

- **Crop Suitability Assessment** — evaluates 23+ crops including maize, cassava, banana, groundnut, sorghum, and more
- **Soil Analysis** — soil questionnaire and lookup tables for fertility and texture data
- **Climate Integration** — loads and visualizes climate data for a selected location
- **Interactive Mapping** — Leaflet-based map with location search and geocoding
- **Geospatial Data** — GeoTIFF raster support and coordinate projection via HWSD soil database
- **Constraint Analysis** — identifies limiting factors and suggests alternate crops
- **PDF Export** — export suitability reports as PDFs
- **Multilingual** — i18n support with language detection and RTL language support

## Tech Stack

- **React 18** with TypeScript
- **PrimeReact** for UI components
- **Leaflet / React-Leaflet** for mapping
- **Chart.js** for data visualization
- **i18next** for internationalization
- **GeoTIFF.js** for raster data processing
- **Styled-components** for theming

## Getting Started

### Prerequisites

- Node.js 16+
- npm

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm start
```

The app runs on [http://localhost:10006](http://localhost:10006) by default.

### Build for production

```bash
npm run build
```

Output is in the `build/` directory.

### Run tests

```bash
npm test
```

## Project Structure

```
src/
├── components/
│   ├── climate/      # Climate data loader and charts
│   ├── docs/         # Technical documentation
│   ├── layout/       # App shell, wizard panel, navigation
│   ├── location/     # Location search, map, geocoding
│   ├── results/      # Suitability reports and constraint analysis
│   ├── shared/       # Reusable UI components
│   ├── soil/         # Soil tables and questionnaires
│   └── wizard/       # Multi-step crop/soil/irrigation wizard
├── data/             # Static crop and soil lookup data
├── hooks/            # Custom React hooks
├── i18n/             # Internationalization config
├── store/            # App context and state
└── theme/            # Styled-components theme and global styles
```
