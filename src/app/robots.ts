import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nyaysaathi.in';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pilot', '/analytics', '/privacy', '/terms'],
        disallow: ['/api/', '/matters/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
