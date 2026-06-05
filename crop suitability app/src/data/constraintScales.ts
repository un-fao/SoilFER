export type ConstraintLevel =
  | 'High or significant constraint'
  | 'Moderate constraint'
  | 'Low constraint'
  | 'No or very low constraint'
  | 'No constraint data';

// [percentMin, percentMax) — value falls into category when min <= value < max
export const constraintScale: Record<ConstraintLevel, [number, number]> = {
  'No constraint data':              [ -10,  0 ],
  'No or very low constraint':       [ 0,  26 ],
  'Low constraint':                  [ 26, 50 ],
  'Moderate constraint':             [ 50, 75 ],
  'High or significant constraint':  [ 75, 101],
};

export const getConstraintLevel = (value: number | null): ConstraintLevel | null => {
  if (value === null) return null;
  for (const [label, [min, max]] of Object.entries(constraintScale) as [ConstraintLevel, [number, number]][]) {
    if (value >= min && value < max) return label;
  }
  return null;
};
