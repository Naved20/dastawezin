# SEO Optimization Guide for Dastawez

## Overview
This document outlines all SEO optimizations implemented for the Dastawez website.

## Implemented SEO Features

### 1. Meta Tags & Open Graph
- ✅ Descriptive title tags (60 characters)
- ✅ Meta descriptions (160 characters)
- ✅ Keywords optimization
- ✅ Open Graph tags for social sharing
- ✅ Twitter Card tags
- ✅ Canonical URLs
- ✅ Language and locale tags

### 2. Structured Data (JSON-LD)
- ✅ Organization schema
- ✅ LocalBusiness schema
- ✅ Service schema (ready to use)
- ✅ ContactPoint schema

### 3. Technical SEO
- ✅ robots.txt file
- ✅ sitemap.xml file
- ✅ Mobile-friendly viewport
- ✅ Fast loading with preconnect/prefetch
- ✅ Proper heading hierarchy
- ✅ Alt text for images

### 4. Performance Optimization
- ✅ Preconnect to external domains
- ✅ DNS prefetch for Supabase
- ✅ Image lazy loading utilities
- ✅ Resource prefetching

### 5. PWA SEO
- ✅ Manifest.json linked
- ✅ App name and description
- ✅ Theme color optimization

## Files Created/Modified

### New Files
- `src/lib/seo.ts` - SEO utilities and schema generators
- `src/hooks/useSEO.ts` - React hook for managing SEO
- `src/lib/performance.ts` - Performance optimization utilities
- `public/robots.txt` - Search engine crawling rules
- `public/sitemap.xml` - URL sitemap for search engines

### Modified Files
- `index.html` - Enhanced meta tags and structured data
- `src/pages/Index.tsx` - Added SEO hook
- `src/pages/Auth.tsx` - Added SEO hook

## Usage Examples

### Update Meta Tags on Page Load
```typescript
import { useSEO } from '@/hooks/useSEO';

const MyPage = () => {
  useSEO({
    title: 'Page Title',
    description: 'Page description',
    keywords: 'keyword1, keyword2',
    image: 'https://example.com/image.png',
  });

  return <div>Content</div>;
};
```

### Add Structured Data
```typescript
import { useSEOWithSchema } from '@/hooks/useSEO';
import { getServiceSchema } from '@/lib/seo';

const ServicePage = () => {
  useSEOWithSchema(
    {
      title: 'Service Name',
      description: 'Service description',
    },
    getServiceSchema({
      name: 'Document Printing',
      description: 'Professional document printing services',
      price: '50',
    })
  );

  return <div>Service content</div>;
};
```

## SEO Checklist

### On-Page SEO
- [ ] Each page has unique title (50-60 characters)
- [ ] Each page has unique meta description (150-160 characters)
- [ ] Proper heading hierarchy (H1, H2, H3)
- [ ] Internal linking strategy
- [ ] Image alt text
- [ ] Mobile responsive design
- [ ] Fast page load speed

### Technical SEO
- [ ] XML sitemap submitted to Google Search Console
- [ ] robots.txt properly configured
- [ ] Canonical URLs set
- [ ] HTTPS enabled
- [ ] Mobile-friendly
- [ ] Structured data validation
- [ ] Core Web Vitals optimized

### Off-Page SEO
- [ ] Social media links in footer
- [ ] Business listings (Google My Business)
- [ ] Backlink strategy
- [ ] Social sharing optimization

## Next Steps

### 1. Submit to Search Engines
```
Google Search Console: https://search.google.com/search-console
Bing Webmaster Tools: https://www.bing.com/webmasters
```

### 2. Update Sitemap
Update `public/sitemap.xml` with all important pages:
- Service pages
- Blog posts (if applicable)
- Landing pages

### 3. Add More Structured Data
For each service, add service schema:
```typescript
const serviceSchema = getServiceSchema({
  name: 'Document Printing',
  description: 'Professional document printing',
  price: '50',
});
```

### 4. Monitor Performance
- Google Search Console for indexing
- Google Analytics for traffic
- Core Web Vitals monitoring
- Keyword ranking tracking

### 5. Content Optimization
- Create high-quality, unique content
- Target long-tail keywords
- Add FAQ schema for FAQ sections
- Create blog content for organic traffic

## SEO Best Practices

### Content
- Write for users first, search engines second
- Use keywords naturally
- Create comprehensive content (2000+ words for main pages)
- Update content regularly
- Use clear, descriptive headings

### Technical
- Keep site speed under 3 seconds
- Ensure mobile responsiveness
- Use HTTPS
- Fix broken links
- Optimize images

### Links
- Build internal linking structure
- Get quality backlinks
- Avoid link schemes
- Use descriptive anchor text

## Monitoring & Maintenance

### Monthly Tasks
- Check Google Search Console for errors
- Monitor keyword rankings
- Review analytics for traffic patterns
- Update sitemap if new pages added

### Quarterly Tasks
- Audit content for freshness
- Check for broken links
- Review and update meta descriptions
- Analyze competitor strategies

### Annually
- Comprehensive SEO audit
- Update structured data
- Review and update robots.txt
- Assess overall SEO strategy

## AI-Friendly Features

Your site is also optimized for AI systems:
- ✅ AI metadata file (/.well-known/ai.json)
- ✅ AI robots configuration (/ai-robots.txt)
- ✅ AI-friendly meta tags
- ✅ Comprehensive structured data
- ✅ Accessibility compliance (WCAG 2.1)
- ✅ Semantic HTML markup

See `AI_FRIENDLY_GUIDE.md` for detailed AI optimization information.

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org)
- [Web.dev SEO Guide](https://web.dev/lighthouse-seo/)
- [Moz SEO Guide](https://moz.com/beginners-guide-to-seo)
- [AI Friendly Web Guide](./AI_FRIENDLY_GUIDE.md)

## Support

For questions or issues with SEO implementation, refer to the code comments in:
- `src/lib/seo.ts`
- `src/hooks/useSEO.ts`
- `index.html`
