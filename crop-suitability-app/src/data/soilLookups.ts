export const texture_lookup: Record<string, string> = {
  "1.0": "Clay (heavy)", "2.0": "Silty clay", "3.0": "Clay (light)",
  "4.0": "Silty clay loam", "5.0": "Clay loam", "6.0": "Silt",
  "7.0": "Silt loam", "8.0": "Sandy clay", "9.0": "Loam",
  "10.0": "Sandy clay loam", "11.0": "Sandy loam", "12.0": "Loamy sand", "13.0": "Sand",
};

export const drainage_lookup: Record<string, string> = {
  "E": "Excessively drained", "I": "Imperfectly drained",
  "MW": "Moderately well drained", "P": "Poorly drained",
  "SE": "Somewhat excessively drained", "VP": "Very poorly drained", "W": "Well drained",
};

export interface WRBEntry { name: string; color: string; mottle: string; }

export const WRB_lookup: Record<string, WRBEntry> = {
  "AC": { name: "Acrisols",    color: "Yellowish",                      mottle: "Moderate" },
  "AL": { name: "Alisols",     color: "Yellowish",                      mottle: "Moderate" },
  "AN": { name: "Andosols",    color: "Whitish",                        mottle: "Low"      },
  "AR": { name: "Arenosols",   color: "Yellowish",                      mottle: "None"     },
  "AT": { name: "Anthrosols",  color: "Yellowish",                      mottle: "Low"      },
  "CH": { name: "Chernozems",  color: "Blackish",                       mottle: "None"     },
  "CL": { name: "Calcisols",   color: "Brownish",                       mottle: "Low"      },
  "CM": { name: "Cambisols",   color: "Reddish",                        mottle: "Low"      },
  "CR": { name: "Cryosols",    color: "Blueish / Greenish or Grayish",  mottle: "Moderate" },
  "DU": { name: "Durisols",    color: "Yellowish",                      mottle: "TBD"      },
  "FL": { name: "Fluvisols",   color: "Brownish",                       mottle: "Moderate" },
  "FR": { name: "Ferralsols",  color: "Reddish",                        mottle: "None"     },
  "GL": { name: "Gleysols",    color: "Blueish / Greenish or Grayish",  mottle: "High"     },
  "GY": { name: "Gypsisols",   color: "Whitish",                        mottle: "Low"      },
  "HS": { name: "Histosols",   color: "Blackish",                       mottle: "High"     },
  "KS": { name: "Kastanozems", color: "Brownish",                       mottle: "None"     },
  "LP": { name: "Leptosols",   color: "Whitish",                        mottle: "None"     },
  "LV": { name: "Luvisols",    color: "Brownish",                       mottle: "Low"      },
  "LX": { name: "Lixisols",    color: "Yellowish",                      mottle: "Low"      },
  "NT": { name: "Nitisols",    color: "Brownish",                       mottle: "None"     },
  "PH": { name: "Phaeozems",   color: "Yellowish",                      mottle: "Low"      },
  "PL": { name: "Planosols",   color: "Yellowish",                      mottle: "High"     },
  "PT": { name: "Plinthosols", color: "Whitish",                        mottle: "High"     },
  "PZ": { name: "Podzols",     color: "Reddish",                        mottle: "Moderate" },
  "RG": { name: "Regosols",    color: "Yellowish",                      mottle: "None"     },
  "RT": { name: "Retisols",    color: "Reddish",                        mottle: "Moderate" },
  "SC": { name: "Solonchaks",  color: "Blueish / Greenish or Grayish",  mottle: "Moderate" },
  "SN": { name: "Solonetz",    color: "Whitish",                        mottle: "High"     },
  "ST": { name: "Stagnosols",  color: "Yellowish",                      mottle: "High"     },
  "TC": { name: "Technosols",  color: "Yellowish",                      mottle: "Low"      },
  "UM": { name: "Umbrisols",   color: "Yellowish",                      mottle: "Low"      },
  "VR": { name: "Vertisols",   color: "Blackish",                       mottle: "Low"      },
};
