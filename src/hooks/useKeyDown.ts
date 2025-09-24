/*
 * Developer: Claude Code
 * Company: Avocat Project
 * Date: 22/9/2024
 */

import { useEffect } from 'react';

/**
 * Hook to listen for specific key down events
 * @param key - The key to listen for (e.g., 'Escape', 'Enter')
 * @param callback - Function to call when the key is pressed
 */
const useKeyDown = (key: string, callback: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        callback();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback]);
};

export default useKeyDown;