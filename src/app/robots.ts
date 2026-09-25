import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nyaysaathi.in';

  return {
    rules: [
      // 1. General Search Crawlers (Google, Bing, DuckDuckGo)
      {
        userAgent: '*',
        allow: [
          '/',
          '/features',
          '/understand',
          '/compare',
          '/ask',
          '/pilot',
          '/analytics',
          '/privacy',
          '/terms',
          '/login',
          '/thank-you',
          '/llms.txt',
          '/llms-full.txt'
        ],
        disallow: ['/api/', '/matters/new', '/account'],
      },
      // 2. Answer Engine & LLM Search Crawlers (ChatGPT, Perplexity, Claude, Gemini AI Overviews)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
          'OAI-SearchBot'
        ],
        allow: [
          '/',
          '/features',
          '/understand',
          '/compare',
          '/ask',
          '/pilot',
          '/analytics',
          '/privacy',
          '/terms',
          '/llms.txt',
          '/llms-full.txt'
        ],
        disallow: ['/api/', '/account'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
