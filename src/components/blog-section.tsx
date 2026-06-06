'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Newspaper,
  ExternalLink,
  Clock,
  ArrowRight,
  Calendar,
  BookOpen,
  RefreshCw,
} from 'lucide-react'

interface WordPressPost {
  id: number
  title: { rendered: string }
  excerpt: { rendered: string }
  link: string
  date: string
  featured_media: number
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string
      alt_text: string
    }>
    author?: Array<{
      name: string
    }>
  }
}

// Configure your WordPress site URL here
// Example: 'https://blog.alltimetrader.com/wp-json/wp/v2'
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || ''

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Fallback posts when WordPress is not connected yet
const FALLBACK_POSTS = [
  {
    id: 1,
    title: { rendered: 'How to Choose the Best Demat Account in India 2025' },
    excerpt: { rendered: 'A comprehensive guide comparing top demat accounts including Zerodha, Angel One, Upstox, Groww, and more. Learn about brokerage charges, AMC, and key features to consider before opening your account.' },
    link: '#',
    date: new Date().toISOString(),
    featured_media: 0,
    category: 'Demat Guide',
  },
  {
    id: 2,
    title: { rendered: 'Understanding Stock Average Down Strategy: When to Average Down' },
    excerpt: { rendered: 'Learn when averaging down makes sense and when it doesn\'t. This guide covers the mathematical framework behind stock averaging, risk management principles, and real examples from Indian markets.' },
    link: '#',
    date: new Date(Date.now() - 86400000).toISOString(),
    featured_media: 0,
    category: 'Trading Strategy',
  },
  {
    id: 3,
    title: { rendered: 'SIP vs Lumpsum: Which Investment Strategy Works Better in 2025?' },
    excerpt: { rendered: 'Compare Systematic Investment Plans against lumpsum investing with real data from Nifty 50 and Sensex. Find out which approach suits your risk profile and financial goals.' },
    link: '#',
    date: new Date(Date.now() - 172800000).toISOString(),
    featured_media: 0,
    category: 'Investing',
  },
  {
    id: 4,
    title: { rendered: 'FII & DII Data: How Institutional Flows Impact Indian Markets' },
    excerpt: { rendered: 'Foreign Institutional Investors and Domestic Institutional Investors drive market trends. Learn how to read FII/DII data and use it to make better trading and investment decisions.' },
    link: '#',
    date: new Date(Date.now() - 259200000).toISOString(),
    featured_media: 0,
    category: 'Market Analysis',
  },
  {
    id: 5,
    title: { rendered: 'Option Chain Analysis: Reading Nifty & Bank Nifty Option Data' },
    excerpt: { rendered: 'Master the art of reading option chain data to identify support, resistance, and probable market direction. A practical guide for Indian options traders.' },
    link: '#',
    date: new Date(Date.now() - 345600000).toISOString(),
    featured_media: 0,
    category: 'Options',
  },
  {
    id: 6,
    title: { rendered: 'Top 5 Trading Journals to Track Your Performance in 2025' },
    excerpt: { rendered: 'Review of the best trading journal tools available for Indian traders. From free spreadsheet templates to premium platforms, find the right journal for your trading style.' },
    link: '#',
    date: new Date(Date.now() - 432000000).toISOString(),
    featured_media: 0,
    category: 'Tools',
  },
]

export function BlogSection() {
  const [posts, setPosts] = useState<WordPressPost[] | typeof FALLBACK_POSTS>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isWordpressConnected, setIsWordpressConnected] = useState(false)

  useEffect(() => {
    if (!WORDPRESS_API_URL) {
      // No WordPress URL configured, use fallback
      setPosts(FALLBACK_POSTS)
      setIsLoading(false)
      return
    }

    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(
          `${WORDPRESS_API_URL}/posts?per_page=6&_embed=1`,
          { next: { revalidate: 300 } } // Cache for 5 minutes
        )
        if (!res.ok) throw new Error('Failed to fetch posts')
        const data: WordPressPost[] = await res.json()
        setPosts(data)
        setIsWordpressConnected(true)
        setError(null)
      } catch (err) {
        console.error('WordPress fetch error:', err)
        setPosts(FALLBACK_POSTS)
        setError('Could not connect to WordPress. Showing sample posts.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const featuredPost = posts[0]
  const otherPosts = posts.slice(1)

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Latest Stock Market <span className="text-primary">News</span>
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Stay updated with the latest insights, analysis, and market trends
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {isWordpressConnected && (
            <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Live from WordPress
            </Badge>
          )}
          {!isWordpressConnected && WORDPRESS_API_URL && (
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/30 bg-card animate-pulse">
              <CardContent className="p-5">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-full mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Featured Post + Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Featured Post */}
            {featuredPost && (
              <Card className="border-primary/30 bg-card overflow-hidden group hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  {/* Featured image area */}
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                    {isWordpressConnected && featuredPost._embedded?.['wp:featuredmedia']?.[0]?.source_url ? (
                      <Image
                        src={featuredPost._embedded['wp:featuredmedia'][0].source_url}
                        alt={featuredPost._embedded['wp:featuredmedia'][0].alt_text || featuredPost.title.rendered}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-primary/20" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-primary/90 text-primary-foreground text-[10px]">
                        Featured
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatDate(featuredPost.date)}
                      </span>
                      {'category' in featuredPost && featuredPost.category && (
                        <Badge variant="outline" className="text-[9px] ml-auto">
                          {featuredPost.category}
                        </Badge>
                      )}
                    </div>
                    <h3
                      className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: featuredPost.title.rendered }}
                    />
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                      {stripHtml(featuredPost.excerpt.rendered)}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary text-xs gap-1 p-0 hover:bg-transparent"
                      asChild
                    >
                      <a href={featuredPost.link} target="_blank" rel="noopener noreferrer">
                        Read Full Article
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Right side posts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherPosts.slice(0, 4).map((post) => (
                <Card
                  key={post.id}
                  className="border-border/30 bg-card group hover:border-border/60 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(post.date)}
                      </span>
                      {'category' in post && post.category && (
                        <Badge variant="outline" className="text-[8px] ml-auto">
                          {post.category}
                        </Badge>
                      )}
                    </div>
                    <h4
                      className="font-semibold text-sm mb-1.5 group-hover:text-primary transition-colors line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {stripHtml(post.excerpt.rendered)}
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-primary text-[10px] gap-0.5 p-0 h-auto mt-2"
                      asChild
                    >
                      <a href={post.link} target="_blank" rel="noopener noreferrer">
                        Read more <ArrowRight className="h-2.5 w-2.5" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom row - remaining posts */}
          {otherPosts.length > 4 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherPosts.slice(4).map((post) => (
                <Card
                  key={post.id}
                  className="border-border/30 bg-card group hover:border-border/60 transition-colors"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(post.date)}
                      </span>
                    </div>
                    <h4
                      className="font-semibold text-sm mb-1.5 group-hover:text-primary transition-colors line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                    />
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {stripHtml(post.excerpt.rendered)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* View All / WordPress notice */}
          <div className="mt-6 text-center">
            {isWordpressConnected ? (
              <Button
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/10 gap-1"
                asChild
              >
                <a href={WORDPRESS_API_URL.replace('/wp-json/wp/v2', '')} target="_blank" rel="noopener noreferrer">
                  View All Articles on Blog
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <div className="inline-flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Connect your WordPress blog to display live posts here
                </p>
                <code className="text-[10px] bg-muted/50 px-3 py-1 rounded-md border border-border/30">
                  NEXT_PUBLIC_WORDPRESS_API_URL=https://yourblog.com/wp-json/wp/v2
                </code>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  )
}
