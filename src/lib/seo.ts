// SEO utilities for managing meta tags and structured data

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedDate?: string;
  modifiedDate?: string;
}

export const updateMetaTags = (config: SEOConfig) => {
  // Update title
  document.title = config.title;
  updateMetaTag('og:title', config.title);
  updateMetaTag('twitter:title', config.title);

  // Update description
  updateMetaTag('description', config.description);
  updateMetaTag('og:description', config.description);
  updateMetaTag('twitter:description', config.description);

  // Update keywords
  if (config.keywords) {
    updateMetaTag('keywords', config.keywords);
  }

  // Update image
  if (config.image) {
    updateMetaTag('og:image', config.image);
    updateMetaTag('twitter:image', config.image);
  }

  // Update URL
  if (config.url) {
    updateMetaTag('og:url', config.url);
  }

  // Update type
  if (config.type) {
    updateMetaTag('og:type', config.type);
  }

  // Update author
  if (config.author) {
    updateMetaTag('author', config.author);
  }

  // Update published date
  if (config.publishedDate) {
    updateMetaTag('article:published_time', config.publishedDate);
  }

  // Update modified date
  if (config.modifiedDate) {
    updateMetaTag('article:modified_time', config.modifiedDate);
  }
};

const updateMetaTag = (name: string, content: string) => {
  let element = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    if (name.startsWith('og:') || name.startsWith('article:')) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  
  element.content = content;
};

export const addStructuredData = (data: any) => {
  let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
  
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  
  script.textContent = JSON.stringify(data);
};

export const getOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Dastawez',
  url: 'https://dastawez.vercel.app',
  logo: 'https://dastawez.vercel.app/pwa-512x512.png',
  description: 'Professional document printing, certificates, bill payments, and government services',
  sameAs: [
    'https://www.facebook.com/dastawez',
    'https://www.twitter.com/dastawez',
    'https://www.instagram.com/dastawez',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'Customer Service',
    email: 'support@dastawez.com',
  },
});

export const getLocalBusinessSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Dastawez',
  image: 'https://dastawez.vercel.app/pwa-512x512.png',
  description: 'Professional document printing and government services',
  url: 'https://dastawez.vercel.app',
  telephone: '+91-XXXXXXXXXX',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
    addressRegion: 'MP',
  },
  priceRange: '₹₹',
});

export const getServiceSchema = (service: { name: string; description: string; price?: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.description,
  provider: {
    '@type': 'Organization',
    name: 'Dastawez',
  },
  ...(service.price && {
    offers: {
      '@type': 'Offer',
      price: service.price,
      priceCurrency: 'INR',
    },
  }),
});

export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const getArticleSchema = (article: {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.headline,
  description: article.description,
  image: article.image,
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  author: {
    '@type': 'Organization',
    name: article.author || 'Dastawez',
  },
});
