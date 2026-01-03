# Quick Start: AI-Friendly Website

## What's Been Done

Your Dastawez website is now fully optimized for AI systems and LLMs:

✅ AI metadata configuration
✅ Structured data (JSON-LD) schemas
✅ AI-friendly meta tags
✅ Accessibility compliance
✅ AI crawler support
✅ Semantic HTML markup

## Key Files

| File | Purpose |
|------|---------|
| `/.well-known/ai.json` | AI metadata and policy |
| `/ai-robots.txt` | AI crawler rules |
| `src/lib/seo.ts` | SEO and schema utilities |
| `src/lib/accessibility.ts` | Accessibility helpers |
| `src/hooks/useSEO.ts` | SEO React hook |
| `src/hooks/useAccessibility.ts` | Accessibility React hook |

## Common Tasks

### Add SEO to a New Page
```typescript
import { useSEO } from '@/hooks/useSEO';

const MyPage = () => {
  useSEO({
    title: 'Page Title',
    description: 'Page description',
    keywords: 'keyword1, keyword2',
  });
  return <div>Content</div>;
};
```

### Add Schema to a Page
```typescript
import { useSEOWithSchema } from '@/hooks/useSEO';
import { getServiceSchema } from '@/lib/seo';

const ServicePage = () => {
  useSEOWithSchema(
    { title: 'Service', description: 'Description' },
    getServiceSchema({ name: 'Service', description: 'Desc' })
  );
  return <div>Content</div>;
};
```

### Add Accessibility
```typescript
import { useKeyboardNavigation } from '@/hooks/useAccessibility';

const MyComponent = () => {
  useKeyboardNavigation({
    enter: () => handleAction(),
    escape: () => handleClose(),
  });
  return <div>Content</div>;
};
```

## Supported AI Systems

- GPTBot (OpenAI)
- Claude (Anthropic)
- Googlebot-Extended
- PerplexityBot
- Bard
- Copilot
- And more...

## Verification

### Check AI Metadata
```bash
curl https://dastawez.vercel.app/.well-known/ai.json
```

### Validate Schemas
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Validator](https://validator.schema.org/)

### Test Accessibility
- [WAVE Extension](https://wave.webaim.org/extension/)
- [Axe DevTools](https://www.deque.com/axe/devtools/)

## Documentation

- **Full AI Guide:** `AI_FRIENDLY_GUIDE.md`
- **Checklist:** `AI_OPTIMIZATION_CHECKLIST.md`
- **SEO Guide:** `SEO_GUIDE.md`

## Next Steps

1. ✅ AI optimization complete
2. Submit sitemap to Google Search Console
3. Monitor AI crawler access in analytics
4. Add more schemas as you create new pages
5. Test with Google Rich Results Test

## Support

- Check the guides above
- Review code comments
- Contact: support@dastawez.com

---

**Your site is now AI-friendly and ready for search engines!** 🚀
