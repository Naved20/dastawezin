# AI-Friendly Website Guide for Dastawez

## Overview
This guide explains how Dastawez is optimized for AI systems, LLMs, and machine learning models.

## AI Accessibility Features

### 1. AI Metadata Files
- **Location:** `/.well-known/ai.json`
- **Purpose:** Provides AI systems with information about content policies and training permissions
- **Content:** Specifies whether AI can train on content, use commercially, and requires attribution

### 2. AI Robots Configuration
- **Location:** `/ai-robots.txt`
- **Purpose:** Specific rules for AI crawlers and LLM systems
- **Supported AI Systems:**
  - GPTBot (OpenAI)
  - CCBot (Common Crawl)
  - anthropic-ai (Anthropic/Claude)
  - Googlebot-Extended (Google)
  - PerplexityBot (Perplexity AI)
  - Bard (Google Bard)
  - Copilot (Microsoft)
  - ChatGPT-User
  - OAI-SearchBot

### 3. AI-Friendly Meta Tags
```html
<meta name="ai-content-type" content="business-service" />
<meta name="ai-training-allowed" content="true" />
<meta name="ai-commercial-use" content="false" />
<meta name="ai-attribution-required" content="true" />
<meta name="ai-robots" content="index, follow, allow-training, allow-summarization" />
```

### 4. Structured Data (JSON-LD)
All pages include comprehensive structured data:
- Organization schema
- LocalBusiness schema
- Service schema
- FAQ schema
- Breadcrumb schema
- Article schema

## AI Training & Usage Policy

### What AI Systems Can Do:
✅ Index and cache content
✅ Train on public content
✅ Summarize content
✅ Create citations
✅ Use for research
✅ Generate summaries

### What AI Systems Cannot Do:
❌ Use content for commercial purposes
❌ Claim content as their own
❌ Modify content without attribution
❌ Access admin/dashboard areas
❌ Access authentication pages

## Implementation Details

### Schema Types Supported

#### 1. Organization Schema
```json
{
  "@type": "Organization",
  "name": "Dastawez",
  "url": "https://dastawez.vercel.app",
  "logo": "https://dastawez.vercel.app/pwa-512x512.png"
}
```

#### 2. LocalBusiness Schema
```json
{
  "@type": "LocalBusiness",
  "name": "Dastawez",
  "address": {
    "addressCountry": "IN",
    "addressRegion": "MP"
  }
}
```

#### 3. Service Schema
```typescript
getServiceSchema({
  name: 'Document Printing',
  description: 'Professional document printing services',
  price: '50'
})
```

#### 4. FAQ Schema
```typescript
getFAQSchema([
  {
    question: 'How long does printing take?',
    answer: 'Usually 24-48 hours'
  }
])
```

#### 5. Breadcrumb Schema
```typescript
getBreadcrumbSchema([
  { name: 'Home', url: 'https://dastawez.vercel.app' },
  { name: 'Services', url: 'https://dastawez.vercel.app/services' }
])
```

#### 6. Article Schema
```typescript
getArticleSchema({
  headline: 'How to Print Documents',
  description: 'A guide to printing documents',
  datePublished: '2025-01-01'
})
```

## Usage Examples

### Adding AI-Friendly Content to Pages

```typescript
import { useSEOWithSchema } from '@/hooks/useSEO';
import { getServiceSchema, getFAQSchema } from '@/lib/seo';

const ServicesPage = () => {
  useSEOWithSchema(
    {
      title: 'Our Services - Dastawez',
      description: 'Professional document printing and government services',
      keywords: 'document printing, certificates, bill payment',
    },
    getServiceSchema({
      name: 'Document Printing',
      description: 'Professional document printing services',
      price: '50'
    })
  );

  return <div>Services content</div>;
};
```

### Adding FAQ Schema

```typescript
const FAQPage = () => {
  const faqSchema = getFAQSchema([
    {
      question: 'What services do you offer?',
      answer: 'We offer document printing, certificates, bill payments, and government services.'
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery typically takes 24-48 hours depending on the service.'
    }
  ]);

  useSEOWithSchema(
    {
      title: 'FAQ - Dastawez',
      description: 'Frequently asked questions about Dastawez services'
    },
    faqSchema
  );

  return <div>FAQ content</div>;
};
```

## AI Crawler Behavior

### What AI Systems Will See:
1. **Public Pages:** Full access to index and cache
2. **Meta Tags:** All AI-friendly meta tags
3. **Structured Data:** Complete JSON-LD schemas
4. **Content:** All public content
5. **Images:** All public images with alt text

### What AI Systems Won't See:
1. **Admin Pages:** Blocked by robots.txt
2. **Dashboard:** Blocked by robots.txt
3. **Auth Pages:** Blocked by robots.txt
4. **API Endpoints:** Blocked by robots.txt
5. **User Data:** Protected by authentication

## Best Practices for AI Friendliness

### 1. Content Structure
- Use semantic HTML
- Include proper headings (H1, H2, H3)
- Use descriptive alt text for images
- Include meta descriptions
- Use structured data

### 2. Accessibility
- Ensure WCAG 2.1 AA compliance
- Use semantic HTML elements
- Provide alt text for all images
- Use proper color contrast
- Support keyboard navigation

### 3. Performance
- Fast page load times
- Optimized images
- Minified CSS/JS
- Proper caching headers
- Mobile responsive

### 4. Content Quality
- Original, unique content
- Well-organized information
- Clear and concise writing
- Proper citations
- Updated regularly

## Monitoring AI Access

### Check AI Crawler Access:
1. Google Search Console - Check for Googlebot-Extended
2. Server logs - Look for AI bot user agents
3. Analytics - Track traffic from AI systems
4. Structured data testing - Use Google's Rich Results Test

### Tools to Validate:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)
- [JSON-LD Playground](https://json-ld.org/playground/)

## Future Enhancements

### Planned AI Features:
- [ ] Add more schema types (Event, Product, Review)
- [ ] Implement knowledge graph markup
- [ ] Add AMP (Accelerated Mobile Pages)
- [ ] Implement Web Vitals monitoring
- [ ] Add AI-specific analytics

### Recommended Additions:
- [ ] Blog with article schema
- [ ] Product reviews with rating schema
- [ ] Event listings with event schema
- [ ] Video content with video schema
- [ ] Podcast with audio schema

## Support & Questions

For questions about AI-friendly implementation:
1. Check this guide
2. Review code comments in `src/lib/seo.ts`
3. Check `/.well-known/ai.json`
4. Contact: support@dastawez.com

## References

- [Schema.org Documentation](https://schema.org)
- [Google Search Central](https://developers.google.com/search)
- [OpenAI GPTBot](https://openai.com/gptbot)
- [Anthropic Claude](https://www.anthropic.com)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
