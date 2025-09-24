/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge class names conditionally
 * Uses clsx for conditional class name handling
 * @param inputs - Class values to merge
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}