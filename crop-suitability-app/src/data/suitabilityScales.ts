export type SuitabilityLevel =
  | 'Unknown' | 'Very High' | 'High' | 'Good' | 'Medium'
  | 'Moderate' | 'Marginal' | 'Very Marginal' | 'Not Suitable';

// [rasterMin, rasterMax, percentageMin, percentageMax]
export const cropSuitabilityScale: Record<SuitabilityLevel, [number, number, number, number]> = {
  "Unknown":      [11, 11, 0,   0  ],
  "Very High":    [1,  2,  85,  100],
  "High":         [2,  3,  70,  85 ],
  "Good":         [3,  4,  55,  70 ],
  "Medium":       [4,  5,  40,  55 ],
  "Moderate":     [5,  6,  25,  40 ],
  "Marginal":     [6,  7,  10,  25 ],
  "Very Marginal":[7,  8,  0,   10 ],
  "Not Suitable": [8,  10, 0,   0  ],
};

// [yieldMin, yieldMax] in kg/ha
export const attainableYieldScale: Record<string, [number, number]> = {
  "Very High":    [8500,  10500],
  "High":         [7000,  8500 ],
  "Good":         [5500,  7000 ],
  "Medium":       [4000,  5500 ],
  "Moderate":     [2500,  4000 ],
  "Marginal":     [1000,  2500 ],
  "Very Marginal":[1,     1000 ],
  "Unknown":      [0,     1    ],
};

export const getSuitabilityLevel = (
  value: number | null,
  scale: Record<string, [number, number, number?, number?]>
): string | null => {
  if (value === null) return null;
  for (const [label, range] of Object.entries(scale)) {
    if (value >= range[0] && value < range[1]) return label;
  }
  const maxCategory = Object.entries(scale).find(e => e[1][1] === 10 || e[1][1] === 10000);
  if (maxCategory && value === maxCategory[1][1]) return maxCategory[0];
  return null;
};

// Ordered list for the gauge display (left to right)
export const SUITABILITY_ORDER: SuitabilityLevel[] = [
  'Not Suitable', 'Very Marginal', 'Marginal', 'Moderate',
  'Medium', 'Good', 'High', 'Very High',
];

export const getSuitabilityClass = (level: string | null): string => {
  if (!level) return '';
  return 'si-' + level.toLowerCase().replace(/ /g, '-');
};
