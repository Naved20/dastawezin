import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateMetaTags, addStructuredData, SEOConfig } from '@/lib/seo';

export const useSEO = (config: SEOConfig) => {
  const location = useLocation();

  useEffect(() => {
    // Update meta tags
    updateMetaTags({
      ...config,
      url: `${window.location.origin}${location.pathname}`,
    });

    // Scroll to top
    window.scrollTo(0, 0);
  }, [config, location.pathname]);
};

export const useSEOWithSchema = (config: SEOConfig, schema?: any) => {
  useSEO(config);

  useEffect(() => {
    if (schema) {
      addStructuredData(schema);
    }
  }, [schema]);
};
