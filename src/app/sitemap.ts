import { db } from '@/lib/db'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://alltimetrader.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/disclaimer`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
  ]

  // Learn pages from all published nodes
  const nodes = await db.node.findMany({
    where: { status: 'published', slug: { not: '' } },
    select: {
      slug: true,
      updatedAt: true,
      difficulty: true,
      contentType: true,
      realm: {
        select: { realmNumber: true },
      },
    },
    orderBy: { realm: { realmNumber: 'asc' } },
  })

  const learnPages: MetadataRoute.Sitemap = nodes.map((node) => {
    // Higher priority for Beginner and Genesis realm content
    let priority = 0.7
    if (node.difficulty === 'Beginner') priority = 0.8
    if (node.realm.realmNumber === 1) priority = Math.max(priority, 0.8)
    if (node.contentType === 'Certification') priority = 0.6

    return {
      url: `${baseUrl}/learn/${node.slug}`,
      lastModified: node.updatedAt,
      changeFrequency: 'monthly' as const,
      priority,
    }
  })

  return [...staticPages, ...learnPages]
}
