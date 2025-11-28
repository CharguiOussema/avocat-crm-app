/**
 * Format bytes to human-readable storage size
 * @param bytes - Size in bytes
 * @returns Formatted string with appropriate unit (KB, MB, GB)
 */
export function formatStorageSize(bytes: number): string {
  if (bytes === 0) return '0 KB';

  const units = ['KB', 'MB', 'GB', 'TB'];
  const k = 1024;

  // Start from KB (bytes / 1024)
  let size = bytes / k;
  let unitIndex = 0;

  // Find the appropriate unit
  while (size >= k && unitIndex < units.length - 1) {
    size /= k;
    unitIndex++;
  }

  // Format to 2 decimal places, but remove trailing zeros
  const formattedSize = Number(size.toFixed(2));

  return `${formattedSize} ${units[unitIndex]}`;
}

/**
 * Format number as TND currency
 * @param value - Numeric value
 * @returns Formatted currency string
 */
export function formatTND(value: number): string {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
}

/**
 * Format number as TND without currency symbol
 * @param value - Numeric value
 * @returns Formatted number string
 */
export function formatTNDNumber(value: number): string {
  return new Intl.NumberFormat('fr-TN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
}
