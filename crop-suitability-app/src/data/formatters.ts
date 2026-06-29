export const nFormat = new Intl.NumberFormat(undefined, { minimumFractionDigits: 0 });

export const formatCoord = (val: number): string => val.toFixed(6);

export const formatYield = (val: number): string =>
  nFormat.format(Math.round(val)).replace(/,/g, ' ');
