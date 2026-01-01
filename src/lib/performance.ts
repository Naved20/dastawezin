// Performance optimization utilities

export const preloadImage = (src: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};

export const prefetchResource = (href: string, as: 'script' | 'style' | 'font' = 'script') => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = as;
  link.href = href;
  document.head.appendChild(link);
};

export const preconnect = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = href;
  document.head.appendChild(link);
};

// Report Web Vitals
export const reportWebVitals = (metric: any) => {
  if (window.location.hostname !== 'localhost') {
    // Send to analytics service
    console.log('Web Vital:', metric);
  }
};

// Lazy load images
export const lazyLoadImages = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img.lazy').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};
