// Accessibility utilities for AI and human users

export const generateAltText = (context: string, type: 'image' | 'icon' | 'logo' = 'image'): string => {
  const templates = {
    image: `Image: ${context}`,
    icon: `Icon: ${context}`,
    logo: `${context} logo`,
  };
  return templates[type];
};

export const generateAriaLabel = (action: string, context?: string): string => {
  return context ? `${action} - ${context}` : action;
};

export const generateAriaDescription = (description: string): string => {
  return description;
};

// Semantic HTML helpers
export const semanticHeading = (level: 1 | 2 | 3 | 4 | 5 | 6, text: string, id?: string) => {
  return {
    level,
    text,
    id,
    role: 'heading',
    ariaLevel: level,
  };
};

// ARIA live region for dynamic content
export const createLiveRegion = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const region = document.createElement('div');
  region.setAttribute('aria-live', priority);
  region.setAttribute('aria-atomic', 'true');
  region.textContent = message;
  return region;
};

// Skip to main content link
export const createSkipLink = () => {
  const link = document.createElement('a');
  link.href = '#main-content';
  link.textContent = 'Skip to main content';
  link.className = 'sr-only focus:not-sr-only';
  return link;
};

// Focus management
export const manageFocus = (element: HTMLElement) => {
  element.focus();
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Keyboard navigation
export const handleKeyboardNavigation = (event: KeyboardEvent, callbacks: {
  enter?: () => void;
  escape?: () => void;
  arrowUp?: () => void;
  arrowDown?: () => void;
  arrowLeft?: () => void;
  arrowRight?: () => void;
  tab?: () => void;
}) => {
  switch (event.key) {
    case 'Enter':
      callbacks.enter?.();
      break;
    case 'Escape':
      callbacks.escape?.();
      break;
    case 'ArrowUp':
      callbacks.arrowUp?.();
      break;
    case 'ArrowDown':
      callbacks.arrowDown?.();
      break;
    case 'ArrowLeft':
      callbacks.arrowLeft?.();
      break;
    case 'ArrowRight':
      callbacks.arrowRight?.();
      break;
    case 'Tab':
      callbacks.tab?.();
      break;
  }
};

// Color contrast checker
export const checkColorContrast = (foreground: string, background: string): number => {
  const getLuminance = (color: string) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

// Announce to screen readers
export const announceToScreenReaders = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);

  setTimeout(() => {
    announcement.remove();
  }, 1000);
};

// Form accessibility helpers
export const createAccessibleForm = (fields: Array<{
  id: string;
  label: string;
  type: string;
  required?: boolean;
  description?: string;
  error?: string;
}>) => {
  return fields.map((field) => ({
    ...field,
    ariaLabel: field.label,
    ariaDescribedBy: field.description ? `${field.id}-description` : undefined,
    ariaInvalid: !!field.error,
    ariaErrorMessage: field.error ? `${field.id}-error` : undefined,
  }));
};

// Image optimization for AI
export const optimizeImageForAI = (src: string, alt: string, title?: string) => {
  return {
    src,
    alt,
    title: title || alt,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    role: 'img',
  };
};
