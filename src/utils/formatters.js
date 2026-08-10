/**
 * Formatting helpers for numbers, weights, dates, and stock status.
 */

export const formatKgOrTon = (kgValue) => {
  const kg = Number(kgValue || 0);
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} Tons`;
  }
  return `${kg.toLocaleString()} kg`;
};

export const formatKgOrTonForRange = (kgValue, timeRange = 'today') => {
  const kg = Number(kgValue || 0);
  if (timeRange === 'today') {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)} Tons`;
    }
    return `${kg.toLocaleString()} kg`;
  } else {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)}`;
    }
    return `${kg.toLocaleString()}`;
  }
};

export const formatNumber = (val, decimals = 0) => {
  return Number(val || 0).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const formatDateDisplay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatSingleSize = (sizeStr) => {
  if (!sizeStr) return '';
  const str = String(sizeStr).trim();
  const match = str.match(/^(\d+)\s*x\s*\d+\s*(cm|mm)?$/i);
  if (match) {
    const unit = match[2] ? match[2].toLowerCase() : 'cm';
    return `${match[1]}${unit}`;
  }
  const singleMatch = str.match(/^(\d+)\s*(cm|mm)$/i);
  if (singleMatch) {
    return `${singleMatch[1]}${singleMatch[2].toLowerCase()}`;
  }
  return str;
};
