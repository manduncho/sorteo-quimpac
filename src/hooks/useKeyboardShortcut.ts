'use client';

import { useEffect, useCallback } from 'react';

type KeyHandler = () => void;

export function useKeyboardShortcut(key: string, callback: KeyHandler, enabled: boolean = true) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === key && enabled) {
        event.preventDefault();
        callback();
      }
    },
    [key, callback, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown, enabled]);
}
