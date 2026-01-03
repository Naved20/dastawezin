import { useEffect } from 'react';
import { announceToScreenReaders } from '@/lib/accessibility';

export const useAccessibilityAnnouncement = (message: string, trigger?: any) => {
  useEffect(() => {
    if (message) {
      announceToScreenReaders(message);
    }
  }, [message, trigger]);
};

export const useKeyboardNavigation = (
  callbacks: {
    enter?: () => void;
    escape?: () => void;
    arrowUp?: () => void;
    arrowDown?: () => void;
    arrowLeft?: () => void;
    arrowRight?: () => void;
  },
  enabled = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
          callbacks.enter?.();
          break;
        case 'Escape':
          callbacks.escape?.();
          break;
        case 'ArrowUp':
          event.preventDefault();
          callbacks.arrowUp?.();
          break;
        case 'ArrowDown':
          event.preventDefault();
          callbacks.arrowDown?.();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          callbacks.arrowLeft?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          callbacks.arrowRight?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks, enabled]);
};

export const useFocusManagement = (elementRef: React.RefObject<HTMLElement>, shouldFocus = true) => {
  useEffect(() => {
    if (shouldFocus && elementRef.current) {
      elementRef.current.focus();
      elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [shouldFocus, elementRef]);
};

export const useSkipLink = () => {
  useEffect(() => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only focus:not-sr-only absolute top-0 left-0 z-50 px-4 py-2 bg-primary text-primary-foreground';
    document.body.insertBefore(skipLink, document.body.firstChild);

    return () => skipLink.remove();
  }, []);
};
