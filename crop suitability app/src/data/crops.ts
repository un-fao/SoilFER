export interface CropInfo {
  scientificName: string;
  ecocropID: number;
  SoilFERCode: string;
  maxYield: number;
  GAEZCode: string;
}

export type CropDictionary = Record<string, CropInfo>;

export const CROPS: CropDictionary = {
  "Banana":        { scientificName: "Musa spp.",                   ecocropID: 2483,     SoilFERCode: "BAN",      maxYield: 10000,    GAEZCode: 'BANA'      },
  "Cashew":        { scientificName: "Anacardium occidentale",      ecocropID: 401,      SoilFERCode: "CSH",      maxYield: 2000,     GAEZCode: 'CASH'      },
  "Cassava":       { scientificName: "Manihot esculenta",           ecocropID: 1420,     SoilFERCode: "CSV",      maxYield: 12000,    GAEZCode: 'CASV'      },
  "Cowpea":        { scientificName: "Vigna unguiculata",           ecocropID: 2153,     SoilFERCode: "COW",      maxYield: 3000,     GAEZCode: 'COWP'      },
  "Finger millet": { scientificName: "Eleusine coracana",           ecocropID: 5657,     SoilFERCode: "FIML",     maxYield: 4000,     GAEZCode: 'FIMLT'     },
  "Fonio":         { scientificName: "Digitaria exilis",            ecocropID: 5329,     SoilFERCode: "FONIO",    maxYield: 2000,     GAEZCode: 'FONIO'     },
  "Gram":          { scientificName: "Cicer arietinum",             ecocropID: 2479,     SoilFERCode: "GRM",      maxYield: 3000,     GAEZCode: 'GRAM'      },
  "Groundnut":     { scientificName: "Arachis hypogaea",            ecocropID: 2199,     SoilFERCode: "GRD",      maxYield: 4000,     GAEZCode: 'GRND'      },
  "Maize":         { scientificName: "Zea mays",                    ecocropID: 2175,     SoilFERCode: "MZE",      maxYield: 10000,    GAEZCode: 'MAIZ'      },
  "Okra":          { scientificName: "Abelmoschus esculentus",      ecocropID: 289,      SoilFERCode: "OKRA",     maxYield: 4000,     GAEZCode: 'OKRA'      },
  "Pigeon pea":    { scientificName: "Cajanus cajan",               ecocropID: 576,      SoilFERCode: "PIG",      maxYield: 3000,     GAEZCode: 'PIGP'      },
  "Pearl millet":  { scientificName: "Pennisetum glaucum",          ecocropID: 8418,     SoilFERCode: "PML",      maxYield: 5000,     GAEZCode: 'PMLT'      },
  "Sesame":        { scientificName: "Sesamum indicum",             ecocropID: 1937,     SoilFERCode: "SES",      maxYield: 2000,     GAEZCode: 'SESA'      },
  "Sorghum":       { scientificName: "Sorghum bicolor",             ecocropID: 48747,    SoilFERCode: "SRG",      maxYield: 6000,     GAEZCode: 'SORG'      },
  "Soybean":       { scientificName: "Glycine max",                 ecocropID: 1150,     SoilFERCode: "SOY",      maxYield: 2700,     GAEZCode: 'SOYB'      },
  "Sweet potato":  { scientificName: "Ipomoea batatas",             ecocropID: 1265,     SoilFERCode: "SPO",      maxYield: 9000,     GAEZCode: 'SPOT'      },
  "Tannia":        { scientificName: "Xanthosoma sagittifolium",    ecocropID: 2168,     SoilFERCode: "TANN",     maxYield: 10000,    GAEZCode: 'TANN'      },
  "Taro, dryland": { scientificName: "Colocasia esculenta",         ecocropID: 758,      SoilFERCode: "TAROD",    maxYield: 8000,     GAEZCode: 'TARODL'    },
  "Taro, wetland": { scientificName: "Colocasia esculenta",         ecocropID: 758,      SoilFERCode: "TAROW",    maxYield: 10000,    GAEZCode: 'TAROWL'    },
  "Tef":           { scientificName: "Eragrostis tef",              ecocropID: 5746,     SoilFERCode: "TEF",      maxYield: 3000,     GAEZCode: 'TEFF'      },
  "Watermelon":    { scientificName: "Citrullus lanatus",           ecocropID: 708,      SoilFERCode: "WMEL",     maxYield: 4000,     GAEZCode: 'WMEL'      },
  "Tomato":        { scientificName: "Solanum lycopersicum",        ecocropID: 1379,     SoilFERCode: "TOM",      maxYield: 5000,     GAEZCode: 'TOMA'      },
  "Yam":           { scientificName: "Dioscorea spp.",              ecocropID: 936,      SoilFERCode: "YAM",      maxYield: 11000,    GAEZCode: 'YAMS'      },
};

export const OPPORTUNITY_CROP_NAMES = new Set([
  'Banana','Cashew','Cowpea','Finger millet','Fonio','Gram','Groundnut',
  'Okra','Pigeon pea','Pearl millet','Sesame','Sorghum','Sweet potato',
  'Tannia','Taro, dryland','Taro, wetland','Tef','Watermelon','Yam',
]);

export const BENCHMARK_CROP_NAMES = new Set(['Cassava','Maize','Soybean','Tomato']);

export const getCropCategory = (name: string): 'Opportunity' | 'Benchmark' | null => {
  if (OPPORTUNITY_CROP_NAMES.has(name)) return 'Opportunity';
  if (BENCHMARK_CROP_NAMES.has(name)) return 'Benchmark';
  return null;
};

export const OPPORTUNITY_CROPS = Array.from(OPPORTUNITY_CROP_NAMES).map(name => ({
  name,
  sci: CROPS[name].scientificName,
}));

export const BENCHMARK_CROPS = Array.from(BENCHMARK_CROP_NAMES).map(name => ({
  name,
  sci: CROPS[name].scientificName,
}));
