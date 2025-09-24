/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export const capitalize = (str?: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};