import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://zero.smalltech.in/',
      lastModified: '2026-03-16',
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://zero.smalltech.in/signup',
      lastModified: '2026-03-17',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://zero.smalltech.in/sales',
      lastModified: '2026-03-16',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://zero.smalltech.in/support',
      lastModified: '2026-03-16',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://zero.smalltech.in/industry',
      lastModified: '2026-03-16',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://zero.smalltech.in/pricing',
      lastModified: '2026-03-16',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://zero.smalltech.in/about',
      lastModified: '2026-03-16',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];
}
