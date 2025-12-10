/**
 * Utility functions for number formatting
 */

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string (e.g., "1,234,567")
 */
export const formatNumber = (value: number | string, decimals: number = 0): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Format currency (VND)
 * @param value - Amount in VND
 * @returns Formatted string (e.g., "1,234,567đ")
 */
export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0đ';
  
  return `${formatNumber(num)}đ`;
};

/**
 * Format currency with decimals
 * @param value - Amount in VND
 * @param decimals - Number of decimal places
 * @returns Formatted string (e.g., "1,234,567.50đ")
 */
export const formatCurrencyWithDecimals = (value: number | string, decimals: number = 2): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0đ';
  
  return `${formatNumber(num, decimals)}đ`;
};

/**
 * Format percentage
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "45.5%")
 */
export const formatPercentage = (value: number | string, decimals: number = 1): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';
  
  return `${num.toFixed(decimals)}%`;
};

/**
 * Format quantity with unit
 * @param value - Quantity value
 * @param unit - Unit of measurement
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string (e.g., "1,234.5 kg")
 */
export const formatQuantity = (value: number | string, unit: string, decimals: number = 0): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `0 ${unit}`;
  
  return `${formatNumber(num, decimals)} ${unit}`;
};

/**
 * Parse formatted number back to number
 * Removes thousand separators and converts to number
 * @param value - Formatted string (e.g., "1,234,567")
 * @returns Number
 */
export const parseFormattedNumber = (value: string): number => {
  if (!value) return 0;
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Format input value while typing (for number inputs)
 * @param value - Input value
 * @returns Formatted string for display
 */
export const formatInputNumber = (value: string): string => {
  if (!value) return '';
  // Remove all non-digit characters
  const cleaned = value.replace(/\D/g, '');
  if (!cleaned) return '';
  // Format with thousand separators
  return formatNumber(parseInt(cleaned));
};

