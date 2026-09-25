import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nyaysaathi.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/features', '/pilot', '/ask', '/compare', '/understand', '/analytics', '/privacy', '/terms', '/login', '/thank-you'],
        disallow: ['/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

